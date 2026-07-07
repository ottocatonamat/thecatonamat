/** Loading, error and empty states for the Daily Inspiration page. */

export function FeedSkeleton() {
  return (
    <div className="feed-skeleton" role="status" aria-live="polite">
      <span className="visually-hidden">Loading today’s inspiration…</span>
      <div className="skeleton skeleton--hero" aria-hidden="true" />
      <div className="skeleton-row" aria-hidden="true">
        <div className="skeleton skeleton--card" />
        <div className="skeleton skeleton--card" />
      </div>
      <div className="skeleton-row" aria-hidden="true">
        <div className="skeleton skeleton--card" />
        <div className="skeleton skeleton--card" />
        <div className="skeleton skeleton--card" />
      </div>
    </div>
  )
}

export function FeedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="feed-message" role="alert">
      <h2 className="feed-message__title">The muse is running late</h2>
      <p className="feed-message__body">
        We couldn’t load today’s inspiration. It’s us, not you — please try again.
      </p>
      <button type="button" className="feed-message__button" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}

export function FeedEmpty() {
  return (
    <div className="feed-message">
      <h2 className="feed-message__title">Nothing curated for today — yet</h2>
      <p className="feed-message__body">
        Today’s digest hasn’t been composed. Check back shortly, or revisit yesterday’s picks.
      </p>
    </div>
  )
}
