import { Heart, Search, Smartphone, Zap } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Stagger, StaggerItem } from '@/components/motion/primitives'

/**
 * Icons pair with the copy by position; the keys name which pair they belong to,
 * so a reordering of the catalogue cannot silently mismatch icon and text.
 */
const ITEMS = [
  { icon: Zap, label: 'fastLabel', detail: 'fastDetail' },
  { icon: Smartphone, label: 'responsiveLabel', detail: 'responsiveDetail' },
  { icon: Heart, label: 'accessibleLabel', detail: 'accessibleDetail' },
  { icon: Search, label: 'seoLabel', detail: 'seoDetail' },
] as const

export async function QualityStrip() {
  const t = await getTranslations('Home.quality')

  return (
    <section className="quality-strip">
      <Stagger className="shell quality-grid" stagger={0.08}>
        {ITEMS.map(({ icon: Icon, label, detail }) => (
          <StaggerItem key={label}>
            <span className="quality-icon">
              <Icon size={24} />
            </span>
            <span className="quality-copy">
              <strong>{t(label)}</strong>
              <small>{t(detail)}</small>
            </span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
