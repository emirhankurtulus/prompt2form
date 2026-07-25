export const siteConfig = {
  name: 'Prompt2Form',
  tagline: 'Create forms with AI. Instantly.',
  description:
    'Prompt2Form is an AI-powered form builder that lets you create, customize, and publish professional forms using natural language. No drag-and-drop required.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000',
  ogImage: '/og.png',
  links: {
    twitter: 'https://twitter.com/prompt2form',
    github: 'https://github.com/prompt2form',
  },
};

export type SiteConfig = typeof siteConfig;
