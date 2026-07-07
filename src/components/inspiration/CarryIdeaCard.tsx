import type { CarryIdea } from '../../data/inspiration/types'

export function CarryIdeaCard({ idea }: { idea: CarryIdea }) {
  return (
    <section className="carry-card" aria-labelledby="carry-idea-heading">
      <p className="section-kicker" id="carry-idea-heading">
        One idea to carry today
      </p>
      <blockquote className="carry-card__quote">
        <p>“{idea.text}”</p>
        <footer className="carry-card__attribution">— {idea.attribution}</footer>
      </blockquote>
    </section>
  )
}
