export const FREE_ASSESSMENT_LIMIT = 3;
export const STORAGE_KEY_USAGE = 'launchable_usage_count';
export const STORAGE_KEY_HISTORY = 'launchable_idea_history';
export const STORAGE_KEY_PREMIUM = 'launchable_premium';

export const BUILD_TOOLS = {
  'claude-code': {
    name: 'Claude Code',
    description: 'Best for full-stack apps, complex logic, and developers comfortable with a terminal.',
    color: '#d97706',
    url: 'https://claude.ai',
  },
  codex: {
    name: 'Codex',
    description: 'Best for autonomous coding tasks with OpenAI models.',
    color: '#10a37f',
    url: 'https://chatgpt.com',
  },
  lovable: {
    name: 'Lovable',
    description: 'Best for landing pages, simple SaaS apps, and visual-first builders.',
    color: '#ec4899',
    url: 'https://lovable.dev',
  },
  bolt: {
    name: 'Bolt',
    description: 'Best for quick prototypes and simple web apps with a visual editor.',
    color: '#3b82f6',
    url: 'https://bolt.new',
  },
  replit: {
    name: 'Replit',
    description: 'Best for learning, experimentation, and collaborative building.',
    color: '#f97316',
    url: 'https://replit.com',
  },
} as const;
