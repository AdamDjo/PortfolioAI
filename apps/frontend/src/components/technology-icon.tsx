import { Code2 } from 'lucide-react'
import {
  siDocker,
  siEthers,
  siFigma,
  siGit,
  siHtml5,
  siJavascript,
  siJest,
  siMui,
  siNextdotjs,
  siNodedotjs,
  siPayloadcms,
  siPnpm,
  siPostgresql,
  siReact,
  siReactquery,
  siRedux,
  siSass,
  siSolidity,
  siStorybook,
  siSupabase,
  siTailwindcss,
  siTestinglibrary,
  siTurborepo,
  siTypescript,
  siVercel,
  siVitest,
  siZod,
} from 'simple-icons'

import type { CSSProperties } from 'react'
import type { SimpleIcon } from 'simple-icons'

const ICON_MATCHERS: readonly (readonly [RegExp, SimpleIcon])[] = [
  [/react\s*query|tanstack\s*query/i, siReactquery],
  [/next\.?js/i, siNextdotjs],
  [/typescript|\bts\b/i, siTypescript],
  [/tailwind/i, siTailwindcss],
  [/node\.?js/i, siNodedotjs],
  [/html/i, siHtml5],
  [/redux/i, siRedux],
  [/react/i, siReact],
  [/javascript|\bjs\b/i, siJavascript],
  [/material\s*ui|\bmui\b/i, siMui],
  [/storybook/i, siStorybook],
  [/testing\s*library/i, siTestinglibrary],
  [/vitest/i, siVitest],
  [/jest/i, siJest],
  [/postgres/i, siPostgresql],
  [/supabase/i, siSupabase],
  [/payload/i, siPayloadcms],
  [/solidity/i, siSolidity],
  [/ethers/i, siEthers],
  [/docker/i, siDocker],
  [/turborepo|\bturbo\b/i, siTurborepo],
  [/pnpm/i, siPnpm],
  [/vercel/i, siVercel],
  [/figma/i, siFigma],
  [/sass|scss/i, siSass],
  [/zod/i, siZod],
  [/\bgit\b/i, siGit],
] as const

const MONOCHROME_HEXES = new Set(['000000', '181717', '363636'])

interface TechnologyIconProps {
  name: string
  size?: number
}

export function TechnologyIcon({ name, size = 16 }: TechnologyIconProps) {
  if (/zustand/i.test(name)) {
    return (
      <span
        className="technology-icon technology-icon-zustand"
        style={{ width: size, height: size, fontSize: size }}
        aria-hidden="true"
      >
        🐻
      </span>
    )
  }

  const icon = ICON_MATCHERS.find(([pattern]) => pattern.test(name))?.[1]

  if (!icon) {
    return <Code2 className="technology-icon technology-icon-fallback" size={size} aria-hidden />
  }

  return (
    <svg
      className="technology-icon technology-brand-icon"
      data-monochrome={MONOCHROME_HEXES.has(icon.hex) ? 'true' : undefined}
      style={{ '--technology-brand': `#${icon.hex}` } as CSSProperties}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  )
}
