'use client'

import { AnimatePresence, m } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import { CopyButton } from './copy-button'

import type { AIToolKind, AIToolView } from '@/lib/ai-tools'

/**
 * Sentinel for the unfiltered state. A stable value, not the translated label:
 * the filter state must not change meaning when the visitor switches language.
 */
const ALL = 'all'

/** Filters are ordered by kind, not by first appearance, so they never move. */
const KIND_ORDER: AIToolKind[] = ['skill', 'plugin', 'mcp']

/**
 * Filterable grid of the AI tools.
 *
 * The data arrives already rendered by the server; this component only handles
 * the kind filter and the copy affordance. It never writes: the page is
 * read-only for everyone, additions go through `/admin`.
 */
function ToolGrid({ tools }: { tools: AIToolView[] }) {
  const t = useTranslations('Tools')
  const [activeKind, setActiveKind] = useState<AIToolKind | typeof ALL>(ALL)

  // Only the kinds actually present: a filter that returns nothing is noise.
  const availableKinds = useMemo(
    () => KIND_ORDER.filter((kind) => tools.some((tool) => tool.kind === kind)),
    [tools]
  )

  const visibleTools = useMemo(
    () => (activeKind === ALL ? tools : tools.filter((tool) => tool.kind === activeKind)),
    [tools, activeKind]
  )

  if (tools.length === 0) {
    return <p className="tools-empty">{t('emptyState')}</p>
  }

  return (
    <>
      <div className="filter-row tools-filters" role="group" aria-label={t('filterAriaLabel')}>
        <button
          className={activeKind === ALL ? 'is-active' : undefined}
          onClick={() => setActiveKind(ALL)}
          type="button"
          aria-pressed={activeKind === ALL}
        >
          {t('allKinds')}
        </button>
        {availableKinds.map((kind) => (
          <button
            className={kind === activeKind ? 'is-active' : undefined}
            key={kind}
            onClick={() => setActiveKind(kind)}
            type="button"
            aria-pressed={kind === activeKind}
          >
            {t(`${kind}Label`)}
          </button>
        ))}
      </div>
      <div className="tools-grid">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleTools.map((tool) => (
            <m.article
              className="tool-card"
              key={tool.id}
              layout
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35, ease: EASE_OUT_QUINT }}
            >
              <header className="tool-card-head">
                <span className={`tool-kind tool-kind-${tool.kind}`}>{t(`${tool.kind}Label`)}</span>
                <h2>{tool.name}</h2>
                {tool.description ? <p>{tool.description}</p> : null}
              </header>

              <div className="tool-snippet">
                <div className="tool-snippet-head">
                  <span>{t(`${tool.kind}SnippetLabel`)}</span>
                  <CopyButton label={tool.name} value={tool.snippet} />
                </div>
                {/* Selectable text, not just a copy target: the button is the
                    shortcut, and it can fail outside a secure context. */}
                <pre className={tool.multiline ? 'is-block' : undefined}>
                  <code>{tool.snippet}</code>
                </pre>
              </div>

              {tool.url ? (
                <a className="tool-link" href={tool.url} rel="noreferrer" target="_blank">
                  {t('linkLabel')}
                </a>
              ) : null}
            </m.article>
          ))}
        </AnimatePresence>
      </div>
      {visibleTools.length === 0 ? <p className="tools-empty">{t('emptyFilteredState')}</p> : null}
    </>
  )
}

export { ToolGrid }
