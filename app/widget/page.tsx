import OharaWidget from '@/components/ohara-widget'

export default function WidgetPage() {
  return <OharaWidget />
}

export const metadata = {
  title: 'Ohara — AI support widget',
  description: 'A clear, helpful AI assistant for your website visitors.',
}

export const viewport = {
  colorScheme: 'light' as const,
  themeColor: '#232322',
}

export const dynamic = 'force-dynamic'

// The widget route is intentionally chrome-free so it can be mounted inside an iframe.
