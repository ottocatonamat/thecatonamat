import type { FeedItem } from '../../data/inspiration/types'
import { formatDuration } from '../../lib/format'
import { CategoryBadge } from './CategoryBadge'

export function FeaturedCard({ item }: { item: FeedItem }) {
  return (
    <article className="featured-card" data-category={item.category} aria-label="Today’s featured idea">
      <div className="featured-card__body">
        <p className="section-kicker">Today’s featured idea</p>
        <div className="featured-card__meta">
          <CategoryBadge category={item.category} />
          <span className="feed-card__duration">{formatDuration(item)}</span>
        </div>
        <h2 className="featured-card__title">
          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        </h2>
        <p className="featured-card__author">{item.author}</p>
        <p className="featured-card__summary">{item.summary}</p>
        <p className="feed-card__why">
          <span className="feed-card__why-label">Why it may inspire you</span>
          {item.whyItMayInspireYou}
        </p>
      </div>
      {item.imageUrl ? (
        <img className="featured-card__image" src={item.imageUrl} alt="" loading="lazy" />
      ) : (
        <div className="featured-card__motif" aria-hidden="true" />
      )}
    </article>
  )
}
