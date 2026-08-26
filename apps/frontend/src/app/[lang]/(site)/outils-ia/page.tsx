import { listPublicAITools } from '@/lib/ai-tools'
import { buildPageMetadata } from '@/lib/i18n/metadata'
import { resolveLocale } from '@/lib/i18n/server'

import { ToolGrid } from './_components/tool-grid'
import { getToolsContent } from './_content'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/outils-ia'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const { metadata } = getToolsContent(locale)
  return buildPageMetadata({ locale, path: '/outils-ia', ...metadata })
}

async function AIToolsPage({ params }: PageProps<'/[lang]/outils-ia'>) {
  const locale = await resolveLocale(params)
  const tools = await listPublicAITools()
  const { heading } = getToolsContent(locale)

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">{heading.eyebrow}</p>
        <h1>{heading.title}</h1>
        <p>{heading.lead}</p>
      </header>
      <ToolGrid tools={tools} />
    </div>
  )
}

export { AIToolsPage as default }
