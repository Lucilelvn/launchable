import { useState } from 'react';
import { Copy, Check, ExternalLink, Terminal } from 'lucide-react';
import { BUILD_TOOLS } from '../../lib/constants';

interface BuildPromptSectionProps {
  buildTool: string;
  buildPrompt: string;
}

const TOOL_URLS: Record<string, string> = {
  'claude-code': 'https://claude.ai',
  lovable: 'https://lovable.dev',
  bolt: 'https://bolt.new',
  replit: 'https://replit.com',
};

export default function BuildPromptSection({ buildTool, buildPrompt }: BuildPromptSectionProps) {
  const [copied, setCopied] = useState(false);

  const toolKey = buildTool as keyof typeof BUILD_TOOLS;
  const tool = BUILD_TOOLS[toolKey];
  const toolUrl = TOOL_URLS[toolKey];

  async function handleCopy() {
    await navigator.clipboard.writeText(buildPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-orange-400 to-pink-400 p-2.5">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Your build prompt is ready</h3>
            <p className="text-xs text-gray-500">Copy and paste into your tool to start building</p>
          </div>
          {tool ? (
            <span
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: tool.color }}
            >
              {tool.name}
            </span>
          ) : null}
        </div>

        <div className="relative">
          <pre className="rounded-xl bg-white border border-gray-200 p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-72 overflow-y-auto leading-relaxed">
            {buildPrompt}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 rounded-lg bg-white border border-gray-200 px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-500">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CTA */}
      {toolUrl ? (
        <a
          href={toolUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center gap-3 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 px-6 py-4 text-base font-bold text-white hover:from-orange-500 hover:to-pink-500 transition-all shadow-md shadow-orange-200/50 hover:shadow-orange-300/50 hover:scale-[1.01]"
        >
          Open in {tool?.name ?? buildTool}
          <ExternalLink className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
        </a>
      ) : null}
    </section>
  );
}
