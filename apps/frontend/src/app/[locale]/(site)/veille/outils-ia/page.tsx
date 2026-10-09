import { getTranslations, setRequestLocale } from 'next-intl/server'

import { buildAlternates } from '@/i18n/metadata'
import { getPageLocale } from '@/i18n/params'
import { listPublicAITools } from '@/lib/ai-tools'

import { ToolGrid } from '../_components/tool-grid'
import { VeilleTabs } from '../_components/veille-tabs'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/veille/outils-ia'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'Tools' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates(locale, '/veille/outils-ia'),
  }
}

/** Second tab of the reading list. Prerendered: it changes only on publish. */
async function AIToolsPage({ params }: PageProps<'/[locale]/veille/outils-ia'>) {
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  const [t, tools] = await Promise.all([getTranslations('Tools'), listPublicAITools(locale)])

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
        <p>{t('lead')}</p>
      </header>
      <VeilleTabs active="/veille/outils-ia" />
      <ToolGrid tools={tools} />
    </div>
  )
}

export { AIToolsPage as default }
