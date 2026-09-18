import type { Website } from '@/types/knowledge-base';

export const initialWebsites: Website[] = [
  {
    id: 1,
    name: 'Linear',
    url: 'linear.app',
    messages: [
      {
        id: 1,
        role: 'user',
        content: 'What is Linear and who is it for?',
        time: '10:42 AM',
      },
      {
        id: 2,
        role: 'assistant',
        content:
          'Linear is a purpose-built tool for modern product development teams. It brings issues, projects, roadmaps, and product insights into one fast, focused workspace so teams can build with momentum.',
        time: '10:42 AM',
      },
      {
        id: 3,
        role: 'user',
        content: 'Does it integrate with other tools?',
        time: '10:43 AM',
      },
      {
        id: 4,
        role: 'assistant',
        content:
          'Yes. Linear integrates with GitHub, GitLab, Slack, Figma, and many other tools your team already uses. You can also connect your own workflows through the Linear API and webhooks.',
        time: '10:43 AM',
      },
    ],
  },
  {
    id: 2,
    name: 'Vercel',
    url: 'vercel.com',
    messages: [
      {
        id: 1,
        role: 'user',
        content: 'What does Vercel offer?',
        time: 'Yesterday',
      },
      {
        id: 2,
        role: 'assistant',
        content:
          'Vercel provides the developer cloud for building, deploying, and scaling modern web applications. It includes hosting, preview deployments, analytics, and infrastructure for frontend teams.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 3,
    name: 'Stripe',
    url: 'stripe.com',
    messages: [
      {
        id: 1,
        role: 'user',
        content: 'How does Stripe help businesses?',
        time: 'Mon',
      },
      {
        id: 2,
        role: 'assistant',
        content:
          'Stripe provides financial infrastructure for businesses. Its products help companies accept payments, manage subscriptions, issue cards, and automate revenue workflows.',
        time: 'Mon',
      },
    ],
  },
];
