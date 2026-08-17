import { Reveal } from '@/components/motion/primitives'

import type { ExperienceView } from '@/lib/site-content'

/**
 * Parcours professionnel en liste chronologique inversée.
 *
 * Aucun lien n'est proposé : ces missions sont des back-offices internes, sans
 * adresse publique. Prétendre le contraire avec un lien mort desservirait la page.
 */
export function CareerTimeline({ experiences }: { experiences: ExperienceView[] }) {
  return (
    <ol className="career-list">
      {experiences.map((experience) => (
        <li key={experience.id}>
          <Reveal className="career-entry">
            <header className="career-entry-head">
              <p className="eyebrow">{experience.period}</p>
              <h3>
                {experience.role} · {experience.company}
              </h3>
              {experience.location ? (
                <p className="career-location">{experience.location}</p>
              ) : null}
            </header>

            {experience.project ? <p className="career-project">{experience.project}</p> : null}
            {experience.context ? <p>{experience.context}</p> : null}

            {experience.achievements.length > 0 ? (
              <ul className="career-achievements">
                {experience.achievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            ) : null}

            {experience.technologies.length > 0 ? (
              <ul className="skill-chips" aria-label={`Technologies chez ${experience.company}`}>
                {experience.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        </li>
      ))}
    </ol>
  )
}
