import { useCallback, useEffect, useState } from 'react'
import { CarryIdeaCard } from '../components/inspiration/CarryIdeaCard'
import { CreativeActionCard } from '../components/inspiration/CreativeActionCard'
import { FeaturedCard } from '../components/inspiration/FeaturedCard'
import { FeedCard } from '../components/inspiration/FeedCard'
import { FeedEmpty, FeedError, FeedSkeleton } from '../components/inspiration/FeedStates'
import { WeekendShelf } from '../components/inspiration/WeekendShelf'
import { inspirationSource } from '../data/inspiration/provider'
import type { DailyDigest } from '../data/inspiration/types'
import { formatDisplayDate } from '../lib/format'

type FeedState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; digest: DailyDigest }

export function DailyInspirationPage() {
  const [state, setState] = useState<FeedState>({ status: 'loading' })

  const load = useCallback(() => {
    let cancelled = false
    setState({ status: 'loading' })
    inspirationSource
      .getDailyDigest(new Date())
      .then((digest) => {
        if (!cancelled) setState({ status: 'ready', digest })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => load(), [load])

  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead__brand">the cat on a mat</p>
        <h1 className="masthead__title">Daily Inspiration</h1>
        {state.status === 'ready' && (
          <p className="masthead__date">{formatDisplayDate(state.digest.date)}</p>
        )}
        <p className="masthead__tagline">
          A small, hand-curated stack of essays, poems, films and ideas — enough to spark
          something, never enough to overwhelm.
        </p>
      </header>

      <main className="page__main">
        {state.status === 'loading' && <FeedSkeleton />}
        {state.status === 'error' && <FeedError onRetry={load} />}
        {state.status === 'ready' &&
          (state.digest.feed.length === 0 ? (
            <FeedEmpty />
          ) : (
            <>
              <FeaturedCard item={state.digest.featured} />

              <div className="daily-pair">
                <CarryIdeaCard idea={state.digest.carryIdea} />
                <CreativeActionCard action={state.digest.creativeAction} />
              </div>

              <section className="feed" aria-labelledby="feed-heading">
                <h2 className="section-title" id="feed-heading">
                  Today’s feed
                </h2>
                <p className="section-subtitle">
                  {state.digest.feed.length} pieces across essays, books, poetry, science,
                  art and more — rotated fresh each day.
                </p>
                <div className="feed__grid">
                  {state.digest.feed.map((item) => (
                    <FeedCard key={item.id} item={item} />
                  ))}
                </div>
              </section>

              <WeekendShelf items={state.digest.weekend} />
            </>
          ))}
      </main>

      <footer className="page__footer">
        <p>
          Curated by hand, rotated daily. Links open at their original source — support the
          writers, publishers and archives that keep this work available.
        </p>
      </footer>
    </div>
  )
}
