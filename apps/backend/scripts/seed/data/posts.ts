/**
 * Seed post data — pure data, no DB logic.
 *
 * daysAgo controls how far back createdAt is set. Lower = more recent.
 * Posts are inserted in array order but timestamps create a realistic feed.
 *
 * Users with posts: valentina(0), daniel(1), rowan(2), marco(3), hannah(4),
 *                   jay(5), claire(6), nina(7), elena(8), toby(9), ryan(10),
 *                   priya(12), isla(15), yuna(16), kenji(18), leo(19)
 * Users without: sam(11), alex(13), mina(14), nils(17), anya(20)
 */

export interface SeedPost {
  userIndex: number;
  image: string;
  caption: string;
  daysAgo: number;
}

export const SEED_POSTS: SeedPost[] = [
  // --- valentina (0) — 5 posts, most active ---
  {
    userIndex: 0,
    image: 'post-valentina-1.webp',
    caption: 'Plaid season is back and I\'m not mad about it',
    daysAgo: 12,
  },
  {
    userIndex: 0,
    image: 'post-valentina-2.webp',
    caption: 'Golden hour fitting room chronicles',
    daysAgo: 8,
  },
  {
    userIndex: 0,
    image: 'post-valentina-3.webp',
    caption: 'Red lip, no filter. That\'s the whole caption.',
    daysAgo: 5,
  },
  {
    userIndex: 0,
    image: 'post-valentina-4.webp',
    caption: 'Sunday brunch but make it fashion',
    daysAgo: 2,
  },
  {
    userIndex: 0,
    image: 'post-valentina-5.webp',
    caption: 'Front row energy',
    daysAgo: 0.5,
  },

  // --- jay (5) — 4 posts, very active ---
  {
    userIndex: 5,
    image: 'post-jay-1.webp',
    caption: 'London looks different from up here',
    daysAgo: 10,
  },
  {
    userIndex: 5,
    image: 'post-jay-2.webp',
    caption: 'Alley find. The best walls never have addresses.',
    daysAgo: 6,
  },
  {
    userIndex: 5,
    image: 'post-jay-3.webp',
    caption: 'Concrete and copper',
    daysAgo: 3,
  },
  {
    userIndex: 5,
    image: 'post-jay-4.webp',
    caption: 'Fit check before the gallery opening',
    daysAgo: 1,
  },

  // --- daniel (1) — 3 posts ---
  {
    userIndex: 1,
    image: 'post-daniel-1.webp',
    caption: 'New track dropping this week. Studio\'s been home lately.',
    daysAgo: 14,
  },
  {
    userIndex: 1,
    image: 'post-daniel-2.webp',
    caption: 'Vinyl haul. The crackle is the whole point.',
    daysAgo: 7,
  },
  {
    userIndex: 1,
    image: 'post-daniel-3.webp',
    caption: 'Late night jam turned into something real',
    daysAgo: 2.5,
  },

  // --- marco (3) — 3 posts ---
  {
    userIndex: 3,
    image: 'post-marco-1.webp',
    caption: 'Best cortado I\'ve had outside of Lisbon',
    daysAgo: 11,
  },
  {
    userIndex: 3,
    image: 'post-marco-2.webp',
    caption: 'Got lost on purpose. Found this.',
    daysAgo: 6.5,
  },
  {
    userIndex: 3,
    image: 'post-marco-3.webp',
    caption: 'Airport coffee doesn\'t count but here we are',
    daysAgo: 1.5,
  },

  // --- rowan (2) — 3 posts ---
  {
    userIndex: 2,
    image: 'post-rowan-1.webp',
    caption: 'Morning fog, chamomile, no plans',
    daysAgo: 13,
  },
  {
    userIndex: 2,
    image: 'post-rowan-2.webp',
    caption: 'Wildcrafted lavender from the back garden',
    daysAgo: 7.5,
  },
  {
    userIndex: 2,
    image: 'post-rowan-3.webp',
    caption: 'The kind of quiet that actually heals',
    daysAgo: 3.5,
  },

  // --- elena (8) — 3 posts ---
  {
    userIndex: 8,
    image: 'post-elena-1.webp',
    caption: 'Caught the light at 7:42pm exactly',
    daysAgo: 9,
  },
  {
    userIndex: 8,
    image: 'post-elena-2.webp',
    caption: 'Warm tones only. Always.',
    daysAgo: 4,
  },
  {
    userIndex: 8,
    image: 'post-elena-3.webp',
    caption:
      'She didn\'t know I took this one. Turned out to be the best frame.',
    daysAgo: 1,
  },

  // --- isla (15) — 3 posts ---
  {
    userIndex: 15,
    image: 'post-isla-1.webp',
    caption: 'Salt air and no agenda',
    daysAgo: 8.5,
  },
  {
    userIndex: 15,
    image: 'post-isla-2.webp',
    caption: 'Rooftop sunsets never get old',
    daysAgo: 4.5,
  },
  {
    userIndex: 15,
    image: 'post-isla-3.webp',
    caption: 'Woke up on an island, might stay',
    daysAgo: 0.8,
  },

  // --- nina (7) — 2 posts ---
  {
    userIndex: 7,
    image: 'post-nina-1.webp',
    caption: 'Shot on expired Portra 400. Love the grain.',
    daysAgo: 10.5,
  },
  {
    userIndex: 7,
    image: 'post-nina-2.webp',
    caption: 'Flea market find. Somebody\'s 1970s holiday.',
    daysAgo: 5.5,
  },

  // --- hannah (4) — 2 posts ---
  {
    userIndex: 4,
    image: 'post-hannah-1.webp',
    caption: 'New monstera leaf just dropped',
    daysAgo: 9.5,
  },
  {
    userIndex: 4,
    image: 'post-hannah-2.webp',
    caption: 'The propagation station is getting out of hand',
    daysAgo: 3,
  },

  // --- yuna (16) — 2 posts ---
  {
    userIndex: 16,
    image: 'post-yuna-1.webp',
    caption: '10-step routine but worth every layer',
    daysAgo: 7,
  },
  {
    userIndex: 16,
    image: 'post-yuna-2.webp',
    caption: 'Sheet mask Sunday. Do not disturb.',
    daysAgo: 2,
  },

  // --- claire (6) — 2 posts ---
  {
    userIndex: 6,
    image: 'post-claire-1.webp',
    caption: 'Shipped it. Finally.',
    daysAgo: 11.5,
  },
  {
    userIndex: 6,
    image: 'post-claire-2.webp',
    caption: 'Whiteboard ideas that actually made it to prod',
    daysAgo: 4,
  },

  // --- toby (9) — 2 posts ---
  {
    userIndex: 9,
    image: 'post-toby-1.webp',
    caption: 'New keycaps came in. The thock is unreal.',
    daysAgo: 8,
  },
  {
    userIndex: 9,
    image: 'post-toby-2.webp',
    caption: 'Home lab v3. Added a rack and it changed everything.',
    daysAgo: 3,
  },

  // --- ryan (10) — 2 posts ---
  {
    userIndex: 10,
    image: 'post-ryan-1.webp',
    caption: 'Mile 14 and the view was worth every blister',
    daysAgo: 12.5,
  },
  {
    userIndex: 10,
    image: 'post-ryan-2.webp',
    caption: 'Campfire cooking > everything',
    daysAgo: 5,
  },

  // --- kenji (18) — 2 posts ---
  {
    userIndex: 18,
    image: 'post-kenji-1.webp',
    caption:
      'Figma at 2am. The side project is becoming the main project.',
    daysAgo: 6,
  },
  {
    userIndex: 18,
    image: 'post-kenji-2.webp',
    caption: 'Best ramen in Shibuya. No debate.',
    daysAgo: 1.5,
  },

  // --- priya (12) — 1 post ---
  {
    userIndex: 12,
    image: 'post-priyah-1.webp',
    caption: 'First attempt at sourdough. Not bad?',
    daysAgo: 4,
  },

  // --- leo (19) — 1 post ---
  {
    userIndex: 19,
    image: 'post-leo-1.webp',
    caption: 'Concrete poetry',
    daysAgo: 6.5,
  },
];
