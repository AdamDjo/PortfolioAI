function LegalPage() {
  return (
    <div className="page shell legal-page">
      <header className="page-heading">
        <p className="eyebrow">Informations</p>
        <h1>Mentions légales</h1>
      </header>
      <section className="content-section">
        <h2>Éditeur</h2>
        <p>Ce portfolio est édité à titre personnel par Adem, frontend engineer basé en France.</p>
        <h2>Hébergement et données</h2>
        <p>
          Les informations définitives d’hébergement seront précisées avant la mise en production.
          Le formulaire de contact ne transmet encore aucune donnée.
        </p>
      </section>
    </div>
  )
}

export { LegalPage as default }
