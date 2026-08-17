'use client'

import { Bookmark, Folder, Github, LayoutGrid, Search } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useMemo, useState } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

const links = [
  { name: 'Awwwards', domain: 'awwwards.com', category: 'Inspiration', tone: 'green' },
  { name: 'Tailwind CSS', domain: 'tailwindcss.com', category: 'Outils Dev', tone: 'cyan' },
  { name: 'Vercel', domain: 'vercel.com', category: 'Outils Dev', tone: 'mono' },
  { name: 'Framer', domain: 'framer.com', category: 'Outils Dev', tone: 'violet' },
  { name: 'Typewolf', domain: 'typewolf.com', category: 'Design', tone: 'coral' },
  { name: 'GitHub', domain: 'github.com', category: 'Outils Dev', tone: 'blue' },
]

function LinksPage() {
  const [search, setSearch] = useState('')
  const visibleLinks = useMemo(
    () =>
      links.filter((link) =>
        `${link.name} ${link.domain}`.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  )
  return (
    <div className="workspace shell">
      <aside className="workspace-sidebar">
        <span className="wordmark">
          ADEM<span>.</span>
        </span>
        <nav>
          <span className="workspace-nav-item">
            <LayoutGrid size={16} />
            Accueil
          </span>
          <span className="workspace-nav-item is-active">
            <Bookmark size={16} />
            Mes liens
          </span>
          <span className="workspace-nav-item">
            <Folder size={16} />
            Dossiers
          </span>
        </nav>
        <p>Dossiers</p>
        <nav>
          <span className="workspace-nav-item">Inspiration</span>
          <span className="workspace-nav-item">Outils Dev</span>
          <span className="workspace-nav-item">Design</span>
        </nav>
      </aside>
      <section className="workspace-content">
        <header>
          <p className="eyebrow">Accueil / Mes liens</p>
          <h1>Mes liens</h1>
        </header>
        <div className="search-bar">
          <Search size={17} />
          <label className="sr-only" htmlFor="link-search">
            Rechercher
          </label>
          <input
            id="link-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Collez votre lien ici…"
          />
          <button type="button">Enregistrer</button>
        </div>
        <div className="filter-row">
          <span className="is-active">Tous</span>
          <span>Inspiration</span>
          <span>Outils Dev</span>
          <span>Design</span>
        </div>
        <div className="bookmark-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleLinks.map((link) => (
              <m.article
                className="bookmark-card"
                key={link.domain}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.32, ease: EASE_OUT_QUINT }}
              >
                <div className={`bookmark-cover link-${link.tone}`}>
                  {link.name === 'GitHub' ? <Github size={42} /> : link.name.slice(0, 1)}
                </div>
                <p>{link.domain}</p>
                <h2>{link.name}</h2>
                <span>{link.category}</span>
              </m.article>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}

export { LinksPage as default }
