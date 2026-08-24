import { listPublicAITools } from '@/lib/ai-tools'

import { ToolGrid } from './_components/tool-grid'
import { OUTILS_IA_CONTENT } from './_content'

import type { Metadata } from 'next'

export const metadata: Metadata = OUTILS_IA_CONTENT.metadata

async function AIToolsPage() {
  const tools = await listPublicAITools()
  const { heading } = OUTILS_IA_CONTENT

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
