import { Folder, Gauge, Link2, MessageSquare, Pencil, Settings } from 'lucide-react'

const metrics = [
  { label: 'Projets', value: '12', delta: '↑ 20%' },
  { label: 'Liens', value: '248', delta: '↑ 15%' },
  { label: 'Vues', value: '12.4K', delta: '↑ 8%' },
  { label: 'Messages', value: '32', delta: '↑ 12%' },
]

function AdminPage() {
  return (
    <div className="workspace admin-workspace shell">
      <aside className="workspace-sidebar">
        <span className="wordmark">
          ADEM<span>.</span>
        </span>
        <nav>
          <span className="workspace-nav-item is-active">
            <Gauge size={16} />
            Tableau de bord
          </span>
        </nav>
        <p>Contenu</p>
        <nav>
          <span className="workspace-nav-item">
            <Folder size={16} />
            Projets
          </span>
          <span className="workspace-nav-item">
            <Link2 size={16} />
            Liens
          </span>
          <span className="workspace-nav-item">
            <MessageSquare size={16} />
            Messages
          </span>
        </nav>
        <p>Paramètres</p>
        <nav>
          <span className="workspace-nav-item">
            <Settings size={16} />
            Général
          </span>
        </nav>
      </aside>
      <section className="workspace-content">
        <header>
          <p className="eyebrow">Accueil / Admin</p>
          <h1>Admin Dashboard</h1>
        </header>
        <div className="metric-grid">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.delta}</small>
            </article>
          ))}
        </div>
        <div className="admin-panels">
          <article className="panel">
            <h2>Projets récents</h2>
            {['Nexora Dashboard', 'SaaS Landing Page', 'Mobile Banking App', 'Portfolio v2'].map(
              (name) => (
                <div className="admin-row" key={name}>
                  <span className="mini-cover" />
                  <div>
                    <strong>{name}</strong>
                    <small>Mis à jour récemment</small>
                  </div>
                  <button type="button" aria-label={`Modifier ${name}`}>
                    <Pencil size={14} />
                  </button>
                </div>
              )
            )}
          </article>
          <article className="panel">
            <h2>Activité récente</h2>
            {['Nouveau lien ajouté', 'Projet mis à jour', 'Message reçu', 'Nouveau dossier'].map(
              (name) => (
                <div className="admin-row" key={name}>
                  <span className="activity-dot" />
                  <div>
                    <strong>{name}</strong>
                    <small>Il y a quelques heures</small>
                  </div>
                </div>
              )
            )}
          </article>
        </div>
      </section>
    </div>
  )
}

export { AdminPage as default }
