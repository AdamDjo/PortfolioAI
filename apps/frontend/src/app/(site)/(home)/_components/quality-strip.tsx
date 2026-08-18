import { Gauge, MessageSquare, ShieldCheck, Smartphone } from 'lucide-react'

import { HOME_CONTENT } from '@/app/(site)/(home)/_content'
import { Stagger, StaggerItem } from '@/components/motion/primitives'

const ICONS = [Gauge, Smartphone, ShieldCheck, MessageSquare]

export function QualityStrip() {
  return (
    <section className="quality-strip">
      <Stagger className="shell quality-grid" stagger={0.08}>
        {HOME_CONTENT.quality.map((label, index) => {
          const Icon = ICONS[index]
          return (
            <StaggerItem key={label}>
              <span>
                <Icon size={17} />
                {label}
              </span>
            </StaggerItem>
          )
        })}
      </Stagger>
    </section>
  )
}
