import http from 'node:http';
import { spawn } from 'node:child_process';

const PORT = 3141;

function runClaude(prompt, systemPrompt) {
  return new Promise((resolve, reject) => {
    const args = ['--print', '--output-format', 'text', '--max-turns', '1'];
    if (systemPrompt) {
      args.push('--system-prompt', systemPrompt);
    }
    // Pass prompt via stdin using "-" to avoid arg length issues
    args.push('-');

    const child = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `claude exited with code ${code}`));
      } else {
        resolve(stdout.trim());
      }
    });

    child.on('error', reject);

    // Write prompt to stdin and close
    child.stdin.write(prompt);
    child.stdin.end();

    // 5 minute timeout
    setTimeout(() => {
      child.kill();
      reject(new Error('Claude CLI timed out after 5 minutes'));
    }, 300_000);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/llm') {
    send(res, 404, { error: 'Not found' });
    return;
  }

  try {
    const { prompt, systemPrompt, jsonMode } = await parseBody(req);

    const finalPrompt = jsonMode
      ? `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown fences, no extra text.`
      : prompt;

    console.log(`[dev-proxy] Processing request (${prompt.length} chars)...`);
    const result = await runClaude(finalPrompt, systemPrompt);
    console.log(`[dev-proxy] Done (${result.length} chars response)`);

    // Try to extract JSON if jsonMode requested
    if (jsonMode) {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          send(res, 200, { result: JSON.stringify(parsed) });
          return;
        } catch { /* fall through to raw */ }
      }
    }

    send(res, 200, { result });
  } catch (err) {
    console.error(`[dev-proxy] Error:`, err.message);
    send(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`[dev-proxy] Claude Code proxy running on http://localhost:${PORT}`);
  console.log(`[dev-proxy] Using local Claude CLI for LLM requests (no API costs)`);
});
