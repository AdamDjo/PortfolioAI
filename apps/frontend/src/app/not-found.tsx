import Link from 'next/link'

function NotFoundPage() {
  return (
    <div className="page shell not-found">
      <p className="eyebrow">Erreur 404</p>
      <h1>Cette page n’existe pas.</h1>
      <p>Le lien a peut-être changé, mais l’accueil est toujours au même endroit.</p>
      <Link className="button button-primary" href="/">
        Retour à l’accueil
      </Link>
    </div>
  )
}

export { NotFoundPage as default }
