'use client'

import { m } from 'motion/react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

interface Skill {
  label: string
  level: number
  note: string
}

const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' }

export function SkillBars({ skills }: { skills: Skill[] }) {
  return (
    <div className="skill-list">
      {skills.map((skill, index) => (
        <div className="skill-row" key={skill.label}>
          <span>
            <strong>{skill.label}</strong>
            <em>{skill.note}</em>
          </span>
          <div
            className="skill-track"
            role="meter"
            aria-valuenow={skill.level}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={skill.label}
          >
            <m.div
              className="skill-fill"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: skill.level / 100 }}
              viewport={VIEWPORT}
              transition={{ duration: 1, delay: index * 0.09, ease: EASE_OUT_QUINT }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
