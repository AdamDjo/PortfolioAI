import { getTranslations, setRequestLocale } from 'next-intl/server'

import { buildAlternates } from '@/i18n/metadata'
import { getPageLocale } from '@/i18n/params'
import { listPublicAITools } from '@/lib/ai-tools'

import { ToolGrid } from './_components/tool-grid'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/outils-ia'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'Tools' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates(locale, '/outils-ia'),
  }
}

async function AIToolsPage({ params }: PageProps<'/[locale]/outils-ia'>) {
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
      <ToolGrid tools={tools} />
    </div>
  )
}

export { AIToolsPage as default }
