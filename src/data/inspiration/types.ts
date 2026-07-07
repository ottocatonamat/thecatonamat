/**
 * Domain model for the Daily Inspiration Feed.
 *
 * These types are the contract between the UI and any content backend.
 * The bundled seed data satisfies them today; a CMS, RSS aggregator or
 * database can replace it later by implementing `InspirationSource`
 * (see provider.ts) against the same shapes.
 */

export type Category =
  | 'Essay'
  | 'Book'
  | 'Interview'
  | 'Poetry'
  | 'Philosophy'
  | 'Science'
  | 'Art'
  | 'History'
  | 'Design'
  | 'Business'
  | 'Culture'

/** How the reader consumes the item — drives the "N min read/watch/listen" label. */
export type MediaType = 'read' | 'watch' | 'listen'

export interface FeedItem {
  id: string
  title: string
  /** Author or publication. */
  author: string
  category: Category
  /** One- or two-sentence description of what the piece is. */
  summary: string
  /** Editorial note: why this might inspire the reader today. */
  whyItMayInspireYou: string
  /** Estimated reading / viewing / listening time in minutes. */
  minutes: number
  mediaType: MediaType
  sourceUrl: string
  /** Optional artwork; cards fall back to a category-tinted motif when absent. */
  imageUrl?: string
  /** Long-form pieces eligible for the "Save for the weekend" shelf. */
  weekendPick?: boolean
}

/** A short thought to hold onto through the day. */
export interface CarryIdea {
  id: string
  text: string
  attribution: string
}

/** A creative exercise doable in under 15 minutes. */
export interface CreativeAction {
  id: string
  title: string
  description: string
  minutes: number
}

/** Everything the Daily Inspiration page needs for one calendar day. */
export interface DailyDigest {
  /** ISO date (YYYY-MM-DD) the digest was composed for. */
  date: string
  featured: FeedItem
  feed: FeedItem[]
  carryIdea: CarryIdea
  creativeAction: CreativeAction
  weekend: FeedItem[]
}
