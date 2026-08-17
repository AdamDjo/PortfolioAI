'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * Visuel d'une carte projet : l'aperçu distant quand il existe, sinon un repli
 * typographique.
 *
 * L'image vient du site déployé du projet et peut disparaître après coup ; en cas
 * d'erreur de chargement on retombe sur le repli plutôt que de laisser un cadre
 * vide. Même raisonnement que pour les cartes de veille.
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
          // Les domaines distants ne sont pas connus à l'avance : l'optimiseur
          // Next exigerait une liste blanche que l'on ne peut pas maintenir.
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
