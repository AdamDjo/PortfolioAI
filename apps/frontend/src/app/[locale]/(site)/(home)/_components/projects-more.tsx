'use client'

import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'

import type { ReactNode } from 'react'

/**
 * Collapsible region holding the projects beyond the first row.
 *
 * The cards themselves are rendered on the server and passed in as children:
 * only the open state and the toggle ship to the browser. They are in the HTML
 * either way, so every project stays visible to a crawler; the region is
 * `inert` while closed so a keyboard user cannot tab into cards they cannot see.
 */
export function ProjectsMore({
  children,
  showAllLabel,
  showLessLabel,
}: {
  children: ReactNode
  showAllLabel: string
  showLessLabel: string
}) {
  const [expanded, setExpanded] = useState(false)
  const regionId = useId()

  return (
    <>
      <div
        className={expanded ? 'home-projects-more is-open' : 'home-projects-more'}
        id={regionId}
        inert={!expanded}
      >
        <div className="home-projects-more-inner">{children}</div>
      </div>
      <button
        className="home-projects-toggle"
        aria-controls={regionId}
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        {expanded ? showLessLabel : showAllLabel}
        <ChevronDown size={16} aria-hidden="true" />
      </button>
    </>
  )
}
