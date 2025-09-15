import { SearchEngineType } from 'src/types'

export const AI_PROMPT_ENGINES: SearchEngineType[] = [
  {
    label: 'Chatgpt',
    url: 'https://chatgpt.com/?q=',
    default: true,
  },
  {
    label: 'Claude',
    url: 'https://claude.ai/new?q=',
    default: true,
  },
  {
    label: 'Mistral',
    url: 'https://chat.mistral.ai/chat?q',
    default: true,
  },
  {
    label: 'Perplexity',
    url: 'https://www.perplexity.ai/search?q=',
    default: true,
  },
  {
    label: 'Grok',
    url: 'https://grok.com/?q=',
    default: true,
  },
]
