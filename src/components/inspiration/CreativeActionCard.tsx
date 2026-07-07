import type { CreativeAction } from '../../data/inspiration/types'

export function CreativeActionCard({ action }: { action: CreativeAction }) {
  return (
    <section className="action-card" aria-labelledby="creative-action-heading">
      <p className="section-kicker" id="creative-action-heading">
        A creative action · under 15 minutes
      </p>
      <h3 className="action-card__title">{action.title}</h3>
      <p className="action-card__description">{action.description}</p>
      <p className="action-card__time">
        <span aria-hidden="true">⏱</span> about {action.minutes} minutes
      </p>
    </section>
  )
}
