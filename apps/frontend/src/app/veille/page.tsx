import { articles } from '@/data/portfolio'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Veille',
  description: 'Notes sur le frontend, le design et les interfaces IA.',
}

function WatchPage() {
  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">Veille active</p>
        <h1>Comprendre ce qui change, garder ce qui compte.</h1>
        <p>
          Des notes courtes sur l’ingénierie frontend, les produits IA et les pratiques qui
          résistent aux effets de mode.
        </p>
      </header>
      <div className="article-list">
        {articles.map((article, index) => (
          <article className="article-row" key={article.title}>
            <span className="article-number">0{index + 1}</span>
            <div>
              <p className="eyebrow">
                {article.category} · {article.date} · {article.readingTime}
              </p>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
            </div>
            <span aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </div>
  )
}

export { WatchPage as default }
