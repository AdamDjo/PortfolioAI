import { Heart, Search, Smartphone, Zap } from 'lucide-react'

import { HOME_CONTENT } from '@/app/(site)/(home)/_content'
import { Stagger, StaggerItem } from '@/components/motion/primitives'

const ICONS = [Zap, Smartphone, Heart, Search]

export function QualityStrip() {
  return (
    <section className="quality-strip">
      <Stagger className="shell quality-grid" stagger={0.08}>
        {HOME_CONTENT.quality.map((item, index) => {
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
