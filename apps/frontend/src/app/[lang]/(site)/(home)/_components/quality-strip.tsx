import { Heart, Search, Smartphone, Zap } from 'lucide-react'

import { getHomeContent } from '@/app/[lang]/(site)/(home)/_content'
import { Stagger, StaggerItem } from '@/components/motion/primitives'

import type { Locale } from '@/lib/i18n/config'

const ICONS = [Zap, Smartphone, Heart, Search]

export function QualityStrip({ locale }: { locale: Locale }) {
  const { quality } = getHomeContent(locale)

  return (
    <section className="quality-strip">
      <Stagger className="shell quality-grid" stagger={0.08}>
        {quality.map((item, index) => {
          const Icon = ICONS[index]
          return (
            <StaggerItem key={item.label}>
              <span className="quality-icon">
                <Icon size={24} />
              </span>
              <span className="quality-copy">
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
            </StaggerItem>
          )
        })}
      </Stagger>
    </section>
  )
}
