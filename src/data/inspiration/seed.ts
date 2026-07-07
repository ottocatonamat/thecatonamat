import type { CarryIdea, CreativeAction, FeedItem } from './types'

/**
 * Curated seed content for the Daily Inspiration Feed.
 *
 * This is realistic editorial data — real works, real authors, real links —
 * kept deliberately flat and serializable so it can be replaced 1:1 by rows
 * from a CMS, RSS pipeline or database without touching the UI.
 */

export const feedPool: FeedItem[] = [
  {
    id: 'essay-solitude-leadership',
    title: 'Solitude and Leadership',
    author: 'William Deresiewicz · The American Scholar',
    category: 'Essay',
    summary:
      'A lecture delivered at West Point arguing that real leadership grows out of solitude — the unfashionable work of thinking slowly, alone, until you reach your own first-hand ideas.',
    whyItMayInspireYou:
      'A bracing antidote to a reactive, notification-driven day. It reframes concentration itself as a form of courage.',
    minutes: 30,
    mediaType: 'read',
    sourceUrl: 'https://theamericanscholar.org/solitude-and-leadership/',
  },
  {
    id: 'essay-death-of-the-moth',
    title: 'The Death of the Moth',
    author: 'Virginia Woolf',
    category: 'Essay',
    summary:
      'Woolf watches a small moth struggle against a windowpane and, in fewer than two thousand words, turns the scene into a meditation on the strangeness and dignity of being alive.',
    whyItMayInspireYou:
      'Proof that scale is a choice: the smallest observable thing can hold the largest subject, if you pay close enough attention.',
    minutes: 8,
    mediaType: 'read',
    sourceUrl: 'https://gutenberg.net.au/ebooks12/1203811h.html',
  },
  {
    id: 'essay-this-is-water',
    title: 'This Is Water',
    author: 'David Foster Wallace · Kenyon College commencement',
    category: 'Essay',
    summary:
      'Wallace’s 2005 commencement address on the discipline of choosing what to think about — how ordinary, boring, frustrating moments are exactly where awareness matters most.',
    whyItMayInspireYou:
      'A twenty-minute recalibration of attention. You will notice the checkout line differently for the rest of the week.',
    minutes: 22,
    mediaType: 'listen',
    sourceUrl: 'https://fs.blog/david-foster-wallace-this-is-water/',
  },
  {
    id: 'essay-how-to-do-great-work',
    title: 'How to Do Great Work',
    author: 'Paul Graham',
    category: 'Essay',
    summary:
      'A long, systematic essay that tries to merge the advice of every field into one recipe: pick something you have a natural aptitude for, work hard at the frontier, and notice the gaps.',
    whyItMayInspireYou:
      'Reads like a field manual for ambition. Even where you disagree, it forces you to articulate your own theory of good work.',
    minutes: 50,
    mediaType: 'read',
    sourceUrl: 'https://paulgraham.com/greatwork.html',
    weekendPick: true,
  },
  {
    id: 'essay-baldwin-region-in-my-mind',
    title: 'Letter from a Region in My Mind',
    author: 'James Baldwin · The New Yorker',
    category: 'Essay',
    summary:
      'Baldwin’s 1962 essay on race, religion and America — part memoir of a Harlem boyhood, part prophecy — written with a moral clarity that has barely aged a day.',
    whyItMayInspireYou:
      'A masterclass in turning personal experience into public argument without losing either honesty or grace.',
    minutes: 55,
    mediaType: 'read',
    sourceUrl: 'https://www.newyorker.com/magazine/1962/11/17/letter-from-a-region-in-my-mind',
    weekendPick: true,
  },
  {
    id: 'book-war-of-art',
    title: 'The War of Art',
    author: 'Steven Pressfield',
    category: 'Book',
    summary:
      'A short, blunt book that names the enemy of every creative project — Resistance — and describes the professional habits that beat it, one working day at a time.',
    whyItMayInspireYou:
      'If a project of yours has been stalled for weeks, this book has an uncomfortable and useful theory about why.',
    minutes: 180,
    mediaType: 'read',
    sourceUrl: 'https://stevenpressfield.com/books/the-war-of-art/',
    weekendPick: true,
  },
  {
    id: 'book-field-guide-getting-lost',
    title: 'A Field Guide to Getting Lost',
    author: 'Rebecca Solnit',
    category: 'Book',
    summary:
      'Nine essays that circle the value of the unknown — in navigation, in art, in memory — arguing that being lost is not a failure state but a way of being fully present.',
    whyItMayInspireYou:
      'Permission to wander. Solnit makes uncertainty feel like a place worth visiting on purpose.',
    minutes: 240,
    mediaType: 'read',
    sourceUrl: 'https://www.penguinrandomhouse.com/books/292379/a-field-guide-to-getting-lost-by-rebecca-solnit/',
    weekendPick: true,
  },
  {
    id: 'book-creative-act',
    title: 'The Creative Act: A Way of Being',
    author: 'Rick Rubin',
    category: 'Book',
    summary:
      'The producer behind four decades of era-defining records distills what he has learned about creativity into 78 short meditations on awareness, taste and beginning.',
    whyItMayInspireYou:
      'Designed to be opened anywhere. One two-page chapter over coffee can reset how you approach the day’s work.',
    minutes: 240,
    mediaType: 'read',
    sourceUrl: 'https://www.penguinrandomhouse.com/books/717356/the-creative-act-by-rick-rubin/',
    weekendPick: true,
  },
  {
    id: 'interview-leguin-paris-review',
    title: 'The Art of Fiction No. 221',
    author: 'Ursula K. Le Guin · The Paris Review',
    category: 'Interview',
    summary:
      'Le Guin on invented worlds, anarchism, the sound of sentences, and why she never accepted the wall between “genre” and “literature.”',
    whyItMayInspireYou:
      'She treats imagination as a rigorous discipline, not an escape — a useful posture for any kind of maker.',
    minutes: 35,
    mediaType: 'read',
    sourceUrl: 'https://www.theparisreview.org/interviews/6253/the-art-of-fiction-no-221-ursula-k-le-guin',
  },
  {
    id: 'interview-ira-glass-taste-gap',
    title: 'Ira Glass on the Creative Process (“The Gap”)',
    author: 'Ira Glass · Current TV',
    category: 'Interview',
    summary:
      'The famous two minutes in which Glass explains why beginners’ work disappoints them: your taste develops years ahead of your ability, and the only fix is volume.',
    whyItMayInspireYou:
      'The kindest possible framing of early-stage frustration. Worth rewatching every time you start something new.',
    minutes: 5,
    mediaType: 'watch',
    sourceUrl: 'https://vimeo.com/85040589',
  },
  {
    id: 'interview-eno-edge',
    title: 'A Big Theory of Culture',
    author: 'Brian Eno · Edge.org',
    category: 'Interview',
    summary:
      'Eno sketches his idea of culture as “everything we don’t have to do” — and why style, play and scenius (the genius of scenes) matter more than lone heroes.',
    whyItMayInspireYou:
      'Shifts credit from talent to environment. You’ll start asking what scene you’re part of, and what it rewards.',
    minutes: 25,
    mediaType: 'read',
    sourceUrl: 'https://www.edge.org/conversation/brian_eno-a-big-theory-of-culture',
  },
  {
    id: 'poetry-wild-geese',
    title: 'Wild Geese',
    author: 'Mary Oliver',
    category: 'Poetry',
    summary:
      '“You do not have to be good.” Eighteen lines that move from self-forgiveness to the wide, indifferent, consoling world of rain, prairies and geese heading home.',
    whyItMayInspireYou:
      'A two-minute reprieve from perfectionism, and one of the most quoted openings in modern poetry for a reason.',
    minutes: 2,
    mediaType: 'read',
    sourceUrl: 'https://onbeing.org/poetry/wild-geese/',
  },
  {
    id: 'poetry-peace-of-wild-things',
    title: 'The Peace of Wild Things',
    author: 'Wendell Berry',
    category: 'Poetry',
    summary:
      'When despair for the world grows, Berry lies down “where the wood drake rests” — a small, exact poem about borrowing stillness from nature.',
    whyItMayInspireYou:
      'A pocket-sized practice for anxious days: the poem itself performs the calm it describes.',
    minutes: 1,
    mediaType: 'read',
    sourceUrl: 'https://onbeing.org/poetry/the-peace-of-wild-things/',
  },
  {
    id: 'philosophy-seneca-shortness',
    title: 'On the Shortness of Life',
    author: 'Seneca',
    category: 'Philosophy',
    summary:
      'The Stoic classic arguing that life is long enough — we just spend most of it distracted, deferring living to a future that isn’t promised.',
    whyItMayInspireYou:
      'Two thousand years old and still the sharpest productivity essay ever written, because it’s about meaning, not efficiency.',
    minutes: 60,
    mediaType: 'read',
    sourceUrl: 'https://en.wikisource.org/wiki/On_the_shortness_of_life',
    weekendPick: true,
  },
  {
    id: 'philosophy-meditations',
    title: 'Meditations, Book V',
    author: 'Marcus Aurelius',
    category: 'Philosophy',
    summary:
      'The Roman emperor’s private notes to himself, opening with the struggle everyone recognizes: getting out of bed to do “the work of a human being.”',
    whyItMayInspireYou:
      'Reading a world leader coach himself through ordinary reluctance makes discipline feel humane rather than heroic.',
    minutes: 15,
    mediaType: 'read',
    sourceUrl: 'https://classics.mit.edu/Antoninus/meditations.5.five.html',
  },
  {
    id: 'science-pale-blue-dot',
    title: 'Pale Blue Dot',
    author: 'Carl Sagan · The Planetary Society',
    category: 'Science',
    summary:
      'Sagan’s reflection on the 1990 Voyager photograph of Earth from six billion kilometers away — “a mote of dust suspended in a sunbeam.”',
    whyItMayInspireYou:
      'Four minutes of cosmic perspective that quietly reorders your priorities for the day.',
    minutes: 4,
    mediaType: 'read',
    sourceUrl: 'https://www.planetary.org/worlds/pale-blue-dot',
  },
  {
    id: 'science-hamming-research',
    title: 'You and Your Research',
    author: 'Richard Hamming · Bell Labs colloquium',
    category: 'Science',
    summary:
      'The Turing Award winner’s famously candid talk on why some scientists do important work and most don’t: courage, open doors, and working on problems that matter.',
    whyItMayInspireYou:
      '“What are the important problems of your field, and why aren’t you working on them?” is a question that transfers to any career.',
    minutes: 40,
    mediaType: 'read',
    sourceUrl: 'https://www.cs.virginia.edu/~robins/YouAndYourResearch.html',
    weekendPick: true,
  },
  {
    id: 'science-powers-of-ten',
    title: 'Powers of Ten',
    author: 'Charles & Ray Eames',
    category: 'Science',
    summary:
      'The 1977 short film that zooms from a Chicago picnic blanket to the edge of the observable universe and back down into a carbon atom, one order of magnitude at a time.',
    whyItMayInspireYou:
      'Nine minutes that permanently install a sense of scale — and a reminder that great explanation is a design problem.',
    minutes: 9,
    mediaType: 'watch',
    sourceUrl: 'https://www.youtube.com/watch?v=0fKBhvDjuy0',
  },
  {
    id: 'art-ways-of-seeing',
    title: 'Ways of Seeing, Episode 1',
    author: 'John Berger · BBC',
    category: 'Art',
    summary:
      'Berger’s 1972 television essay on how reproduction changed the meaning of paintings — and how the way we see is never innocent.',
    whyItMayInspireYou:
      'After thirty minutes you’ll look at every image on your screen — ads, thumbnails, museum posts — with new suspicion and pleasure.',
    minutes: 30,
    mediaType: 'watch',
    sourceUrl: 'https://www.youtube.com/watch?v=0pDE4VX_9Kk',
  },
  {
    id: 'art-steal-like-an-artist',
    title: 'Steal Like an Artist',
    author: 'Austin Kleon',
    category: 'Art',
    summary:
      'Ten short, illustrated principles on creativity as remix: nothing is original, so collect good influences, keep a swipe file, and make things for yourself first.',
    whyItMayInspireYou:
      'Lowers the stakes of starting. Its central move — trace your influences honestly — is doable this afternoon.',
    minutes: 90,
    mediaType: 'read',
    sourceUrl: 'https://austinkleon.com/steal/',
  },
  {
    id: 'history-lessons-of-history',
    title: 'The Lessons of History',
    author: 'Will & Ariel Durant',
    category: 'History',
    summary:
      'After forty years and eleven volumes of world history, the Durants compressed what they had learned into a hundred pages of patterns: geography, character, economics, war.',
    whyItMayInspireYou:
      'A crash course in long-term thinking — the view from five thousand years makes this quarter’s worries look survivable.',
    minutes: 150,
    mediaType: 'read',
    sourceUrl: 'https://en.wikipedia.org/wiki/The_Lessons_of_History',
    weekendPick: true,
  },
  {
    id: 'history-feynman-pleasure',
    title: 'The Pleasure of Finding Things Out',
    author: 'Richard Feynman · BBC Horizon',
    category: 'History',
    summary:
      'The 1981 documentary interview in which Feynman talks about his father, doubt, the Manhattan Project, and why knowing a flower’s science adds to its beauty.',
    whyItMayInspireYou:
      'Fifty minutes with someone visibly delighted by thinking. Curiosity this unguarded is contagious.',
    minutes: 50,
    mediaType: 'watch',
    sourceUrl: 'https://archive.org/details/ThePleasureOfFindingThingsOut',
    weekendPick: true,
  },
  {
    id: 'design-rams-ten-principles',
    title: 'Ten Principles for Good Design',
    author: 'Dieter Rams · Vitsœ',
    category: 'Design',
    summary:
      'The Braun designer’s canonical checklist — good design is innovative, useful, aesthetic, understandable, honest, unobtrusive, long-lasting, thorough, environmentally friendly, and as little design as possible.',
    whyItMayInspireYou:
      'Five minutes that double as a review rubric for whatever you’re making — software, writing, or a kitchen shelf.',
    minutes: 5,
    mediaType: 'read',
    sourceUrl: 'https://www.vitsoe.com/us/about/good-design',
  },
  {
    id: 'design-eames-design-qa',
    title: 'Design Q&A',
    author: 'Charles Eames · Eames Office',
    category: 'Design',
    summary:
      'In 1972, Madame L’Amic asked Charles Eames 29 questions — “What is design?”, “Is design an expression of art?” — and his answers remain the tightest definition of the craft on record.',
    whyItMayInspireYou:
      '“Does design imply the idea of products that are necessarily useful?” — “Yes, even though the use might be very subtle.” Every answer is a design lesson in one sentence.',
    minutes: 6,
    mediaType: 'read',
    sourceUrl: 'https://www.eamesoffice.com/the-work/design-q-a-text/',
  },
  {
    id: 'business-1000-true-fans',
    title: '1,000 True Fans',
    author: 'Kevin Kelly · The Technium',
    category: 'Business',
    summary:
      'The 2008 essay that reframed creative careers: you don’t need millions of customers, just a thousand people who will buy anything you make.',
    whyItMayInspireYou:
      'Turns “making a living from your work” from a lottery into an arithmetic problem — one you could start solving this week.',
    minutes: 12,
    mediaType: 'read',
    sourceUrl: 'https://kk.org/thetechnium/1000-true-fans/',
  },
  {
    id: 'business-watterson-kenyon',
    title: 'Some Thoughts on the Real World by One Who Glimpsed It and Fled',
    author: 'Bill Watterson · Kenyon College commencement',
    category: 'Business',
    summary:
      'The creator of Calvin and Hobbes on refusing to license his characters, painting with his father, and inventing your own definition of success before someone assigns you one.',
    whyItMayInspireYou:
      'A rare, funny argument that ambition can mean saying no — from someone who left millions on the table and doesn’t regret it.',
    minutes: 15,
    mediaType: 'read',
    sourceUrl: 'https://web.mit.edu/jmorzins/www/C-H-speech.html',
  },
  {
    id: 'culture-in-praise-of-shadows',
    title: 'In Praise of Shadows',
    author: 'Jun’ichirō Tanizaki',
    category: 'Culture',
    summary:
      'A 1933 essay on Japanese aesthetics — lacquerware by candlelight, the gloom of temple corridors — and what is lost when everything is brightly, uniformly lit.',
    whyItMayInspireYou:
      'Trains you to notice atmosphere: light, texture and shadow as materials you can design with, at your desk or in a room.',
    minutes: 75,
    mediaType: 'read',
    sourceUrl: 'https://en.wikipedia.org/wiki/In_Praise_of_Shadows',
    weekendPick: true,
  },
  {
    id: 'culture-how-to-do-nothing',
    title: 'How to Do Nothing',
    author: 'Jenny Odell',
    category: 'Culture',
    summary:
      'Part manifesto, part birdwatching diary: a case for reclaiming attention from the attention economy — not by quitting the world, but by attending to the one nearby.',
    whyItMayInspireYou:
      'Reframes rest and observation as productive acts of resistance. The chapter on bioregionalism alone will change your walks.',
    minutes: 240,
    mediaType: 'read',
    sourceUrl: 'https://www.penguinrandomhouse.com/books/600671/how-to-do-nothing-by-jenny-odell/',
    weekendPick: true,
  },
]

export const carryIdeaPool: CarryIdea[] = [
  {
    id: 'carry-picasso-working',
    text: 'Inspiration exists, but it has to find you working.',
    attribution: 'Pablo Picasso',
  },
  {
    id: 'carry-aurelius-obstacle',
    text: 'The impediment to action advances action. What stands in the way becomes the way.',
    attribution: 'Marcus Aurelius, Meditations',
  },
  {
    id: 'carry-oliver-attention',
    text: 'Attention is the beginning of devotion.',
    attribution: 'Mary Oliver, Upstream',
  },
  {
    id: 'carry-angelou-creativity',
    text: 'You can’t use up creativity. The more you use, the more you have.',
    attribution: 'Maya Angelou',
  },
  {
    id: 'carry-seneca-time',
    text: 'It is not that we have a short time to live, but that we waste a great deal of it.',
    attribution: 'Seneca, On the Shortness of Life',
  },
  {
    id: 'carry-murphy-complain',
    text: 'The best way to complain is to make things.',
    attribution: 'James Murphy',
  },
  {
    id: 'carry-gaiman-art',
    text: 'Make good art.',
    attribution: 'Neil Gaiman, University of the Arts commencement',
  },
  {
    id: 'carry-glass-volume',
    text: 'It is only by going through a volume of work that you will close the gap between your taste and your ability.',
    attribution: 'Ira Glass',
  },
  {
    id: 'carry-cage-boring',
    text: 'If something is boring after two minutes, try it for four. If still boring, then eight. Eventually one discovers that it is not boring at all.',
    attribution: 'John Cage',
  },
]

export const creativeActionPool: CreativeAction[] = [
  {
    id: 'action-six-word-memoir',
    title: 'Write a six-word memoir of your week',
    description:
      'Legend says Hemingway did it in six words. Distill the last seven days into exactly six. Write five versions, keep the truest one somewhere you’ll find it later.',
    minutes: 10,
  },
  {
    id: 'action-light-walk',
    title: 'Take a ten-minute light hunt',
    description:
      'Walk one block with your phone. Photograph a single thing where the light or texture is doing something interesting, then write one sentence about why it caught you.',
    minutes: 12,
  },
  {
    id: 'action-copywork',
    title: 'Copy a paragraph you love, by hand',
    description:
      'Pick a paragraph from a writer you admire and transcribe it with a pen. Then note one choice — a verb, a rhythm, a cut — you would never have made yourself.',
    minutes: 15,
  },
  {
    id: 'action-blind-contour',
    title: 'Blind-contour the nearest object',
    description:
      'Draw your mug, your keys, your own hand — without looking at the paper and without lifting the pen. The result will be wrong and alive. That’s the point.',
    minutes: 5,
  },
  {
    id: 'action-gratitude-note',
    title: 'Write to someone whose work shaped you',
    description:
      'Three sentences to an author, teacher, or maker whose work mattered to you: what it was, when it landed, what it changed. Send it before you can edit it into silence.',
    minutes: 10,
  },
  {
    id: 'action-ten-bad-ideas',
    title: 'List ten bad ideas on purpose',
    description:
      'Take a problem you’re stuck on and write ten deliberately terrible solutions. Quantity kills the censor — and idea #7 is usually secretly good.',
    minutes: 10,
  },
  {
    id: 'action-mini-playlist',
    title: 'Score the afternoon',
    description:
      'Build a five-song playlist for exactly the mood you want your next work session to have. Give it a title as if it were an album. Press play, begin.',
    minutes: 12,
  },
  {
    id: 'action-free-write',
    title: 'Free-write for ten unbroken minutes',
    description:
      'Set a timer. Keep the pen or cursor moving no matter what comes out — no deleting, no rereading. Stop when the timer stops. Read it tomorrow, not today.',
    minutes: 10,
  },
]
