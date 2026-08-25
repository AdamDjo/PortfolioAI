import { PRIVACY_CONTENT } from './_content'

import type { Metadata } from 'next'

export const metadata: Metadata = PRIVACY_CONTENT.metadata

function PrivacyPage() {
  const { heading, sections } = PRIVACY_CONTENT

  return (
    <div className="page shell legal-page">
      <header className="page-heading">
        <p className="eyebrow">{heading.eyebrow}</p>
        <h1>{heading.title}</h1>
        <p>{heading.lead}</p>
      </header>
      {sections.map((section) => (
        <section className="content-section" key={section.title}>
          <h2>{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  )
}

export { PrivacyPage as default }
