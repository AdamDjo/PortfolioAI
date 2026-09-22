import { ArrowRight } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Reveal } from '@/components/motion/primitives'
import { buildAlternates } from '@/i18n/metadata'
import { Link, redirect } from '@/i18n/navigation'
import { getPageLocale } from '@/i18n/params'
import { getProfile, getServicesSettings } from '@/lib/site-content'

import { SkillGroups } from './_components/skill-groups'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/services'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'Services' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates(locale, '/services'),
  }
}

async function ServicesPage({ params }: PageProps<'/[locale]/services'>) {
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  // Independent reads: they go out in parallel rather than in series.
  const [t, settings, profile] = await Promise.all([
    getTranslations('Services'),
    getServicesSettings(locale),
    getProfile(locale),
  ])

  // The owner can pull this page from `/admin` without a redeploy — see
  // `cms/globals/services-settings.ts`.
  if (!settings.enabled) redirect({ href: '/', locale })

  const offers = [
    {
      key: 'frontend',
      titleKey: 'offers.frontend.title',
      descriptionKey: 'offers.frontend.description',
    },
    {
      key: 'ai',
      titleKey: 'offers.ai.title',
      descriptionKey: 'offers.ai.description',
    },
    {
      key: 'audit',
      titleKey: 'offers.audit.title',
      descriptionKey: 'offers.audit.description',
    },
  ] as const

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
        <p>{t('lead')}</p>
      </header>

      {offers.map((offer) => (
        <section className="content-section" key={offer.key}>
          <Reveal>
            <h2>{t(offer.titleKey)}</h2>
            <p>{t(offer.descriptionKey)}</p>
          </Reveal>
          {profile.skillGroups.length > 0 ? <SkillGroups groups={profile.skillGroups} /> : null}
        </section>
      ))}

      <section className="content-section">
        <Reveal>
          <Link className="button button-primary" href="/contact">
            {t('cta')} <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>
    </div>
  )
}

export { ServicesPage as default }
