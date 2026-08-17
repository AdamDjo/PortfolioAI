'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * Visual for a project card: the remote preview when there is one, a
 * typographic fallback otherwise.
 *
 * The image comes from the project's deployed site and can disappear later, so a
 * load error falls back rather than leaving an empty frame — same reasoning as
 * the veille cards.
 */
export function ProjectVisual({
  imageUrl,
  title,
  index,
}: {
  imageUrl: string | null
  title: string
  index: number
}) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(imageUrl) && !failed

  return (
    <span className="project-visual">
      {showImage ? (
        <Image
          src={imageUrl!}
          alt={`Aperçu de ${title}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={() => setFailed(true)}
          // Remote domains are not known in advance: Next's optimiser would
          // require an allowlist that cannot be maintained.
          unoptimized
        />
      ) : (
        <span>
          0{index + 1} · {title}
        </span>
      )}
    </span>
  )
}
