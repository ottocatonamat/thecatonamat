import { carryIdeaPool, creativeActionPool, feedPool } from './seed'
import type { DailyDigest, FeedItem } from './types'

/**
 * Content backend contract for the Daily Inspiration page.
 *
 * The page depends only on this interface. To move from seed data to a real
 * backend (CMS, RSS aggregator, database, API), implement `getDailyDigest`
 * against that source and point `inspirationSource` at the new implementation.
 */
export interface InspirationSource {
  getDailyDigest(date: Date): Promise<DailyDigest>
}

/** How many feed items a daily digest contains (inclusive bounds). */
const FEED_MIN = 8
const FEED_MAX = 12
const WEEKEND_COUNT = 3

/** xmur3 string hash — seeds the PRNG from a date key like "2026-07-07". */
function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (h ^= h >>> 16) >>> 0
}

/** mulberry32 PRNG — deterministic, so a given date always composes the same digest. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Composes one day's digest from the pools, deterministically per date.
 * Feed selection round-robins across categories so a single digest stays
 * varied even when the pool is category-heavy in places.
 */
export function composeDigest(date: Date): DailyDigest {
  const dateKey = toDateKey(date)
  const rng = mulberry32(hashSeed(dateKey))

  // Weekend shelf: long-form picks, chosen first so the daily feed doesn't repeat them.
  const weekend = shuffle(
    feedPool.filter((item) => item.weekendPick),
    rng,
  ).slice(0, WEEKEND_COUNT)
  const weekendIds = new Set(weekend.map((item) => item.id))

  const dayPool = feedPool.filter((item) => !weekendIds.has(item.id))

  // Group by category, then round-robin across shuffled categories for variety.
  const byCategory = new Map<string, FeedItem[]>()
  for (const item of shuffle(dayPool, rng)) {
    const bucket = byCategory.get(item.category) ?? []
    bucket.push(item)
    byCategory.set(item.category, bucket)
  }
  const categories = shuffle([...byCategory.keys()], rng)

  const targetCount = Math.min(
    dayPool.length,
    FEED_MIN + Math.floor(rng() * (FEED_MAX - FEED_MIN + 1)),
  )
  const selected: FeedItem[] = []
  while (selected.length < targetCount) {
    let picked = false
    for (const category of categories) {
      if (selected.length >= targetCount) break
      const bucket = byCategory.get(category)
      const next = bucket?.shift()
      if (next) {
        selected.push(next)
        picked = true
      }
    }
    if (!picked) break
  }

  const [featured, ...feed] = selected

  return {
    date: dateKey,
    featured,
    feed,
    carryIdea: carryIdeaPool[hashSeed(`${dateKey}:carry`) % carryIdeaPool.length],
    creativeAction:
      creativeActionPool[hashSeed(`${dateKey}:action`) % creativeActionPool.length],
    weekend,
  }
}

/** Mimics a network round-trip so the UI's loading state stays honest. */
const SIMULATED_LATENCY_MS = 350

export const seedInspirationSource: InspirationSource = {
  async getDailyDigest(date: Date): Promise<DailyDigest> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
    const digest = composeDigest(date)
    if (!digest.featured || digest.feed.length === 0) {
      throw new Error('No inspiration content available for this date.')
    }
    return digest
  },
}

/** Swap point: replace with an API/CMS-backed implementation when one exists. */
export const inspirationSource: InspirationSource = seedInspirationSource
