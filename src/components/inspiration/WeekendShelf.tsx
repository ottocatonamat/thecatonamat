import type { FeedItem } from '../../data/inspiration/types'
import { formatDuration } from '../../lib/format'
import { CategoryBadge } from './CategoryBadge'

export function WeekendShelf({ items }: { items: FeedItem[] }) {
  if (items.length === 0) return null
  return (
    <section className="weekend-shelf" aria-labelledby="weekend-heading">
      <h2 className="section-title" id="weekend-heading">
        Save for the weekend
      </h2>
      <p className="section-subtitle">
        Longer works worth an unhurried hour — set them aside for Saturday morning.
      </p>
      <ul className="weekend-shelf__list">
        {items.map((item) => (
          <li key={item.id} className="weekend-shelf__item" data-category={item.category}>
            <div className="feed-card__meta">
              <CategoryBadge category={item.category} />
              <span className="feed-card__duration">{formatDuration(item)}</span>
            </div>
            <h3 className="weekend-shelf__title">
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </h3>
            <p className="feed-card__author">{item.author}</p>
            <p className="weekend-shelf__why">{item.whyItMayInspireYou}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
