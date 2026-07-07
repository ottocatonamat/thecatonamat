import type { FeedItem, MediaType } from '../data/inspiration/types'

const MEDIA_VERB: Record<MediaType, string> = {
  read: 'read',
  watch: 'watch',
  listen: 'listen',
}

/** "8 min read", "50 min watch", "≈4 h read" for long-form works. */
export function formatDuration(item: Pick<FeedItem, 'minutes' | 'mediaType'>): string {
  const verb = MEDIA_VERB[item.mediaType]
  if (item.minutes >= 60) {
    const hours = Math.round(item.minutes / 30) / 2
    return `≈${hours} h ${verb}`
  }
  return `${item.minutes} min ${verb}`
}

export function formatDisplayDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
}
