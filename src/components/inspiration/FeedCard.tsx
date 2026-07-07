import type { FeedItem } from '../../data/inspiration/types'
import { formatDuration } from '../../lib/format'
import { CategoryBadge } from './CategoryBadge'

export function FeedCard({ item }: { item: FeedItem }) {
  return (
    <article className="feed-card" data-category={item.category}>
      {item.imageUrl && (
        <img className="feed-card__image" src={item.imageUrl} alt="" loading="lazy" />
      )}
      <div className="feed-card__meta">
        <CategoryBadge category={item.category} />
        <span className="feed-card__duration">{formatDuration(item)}</span>
      </div>
      <h3 className="feed-card__title">
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h3>
      <p className="feed-card__author">{item.author}</p>
      <p className="feed-card__summary">{item.summary}</p>
      <p className="feed-card__why">
        <span className="feed-card__why-label">Why it may inspire you</span>
        {item.whyItMayInspireYou}
      </p>
    </article>
  )
}
