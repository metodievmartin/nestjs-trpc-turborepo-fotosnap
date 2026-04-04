/**
 * Seed user profiles and follow graph — pure data, no DB logic.
 */

// ---------------------------------------------------------------------------
// User profiles
// ---------------------------------------------------------------------------

export interface SeedUser {
  username: string;
  email: string;
  displayName: string;
  bio: string;
  website?: string;
  avatar: string; // filename in avatars/ directory, empty string for no photo
}

export const SEED_USERS: SeedUser[] = [
  // ---- f-1: Glam blonde, plaid blazer — fashion & beauty ----
  {
    username: 'valentina.style',
    email: 'valentina.style@fotosnap.dev',
    displayName: 'Valentina Reyes',
    bio: 'Fashion & beauty. Outfit inspo, runway recaps, and glam tutorials.',
    website: 'https://valentinastyle.co',
    avatar: 'user-profile-f-1.webp',
  },
  // ---- m-2: Curly hair, beard, B&W artistic shot — musician ----
  {
    username: 'daniel.crvz',
    email: 'daniel.crvz@fotosnap.dev',
    displayName: 'Daniel Cruz',
    bio: 'Songwriter & producer. Studio sessions, late-night jams, vinyl finds.',
    website: 'https://danielcrvz.music',
    avatar: 'user-profile-m-2.webp',
  },
  // ---- f-3: Red curls, meadow, eyes closed — wellness & nature ----
  {
    username: 'rowan.wild',
    email: 'rowan.wild@fotosnap.dev',
    displayName: 'Rowan Gallagher',
    bio: 'Herbal tea, forest bathing, slow mornings. Wellness through nature.',
    avatar: 'user-profile-f-3.webp',
  },
  // ---- m-4: Clean-cut, warm smile, travel mug — travel & lifestyle ----
  {
    username: 'marco.ventures',
    email: 'marco.ventures@fotosnap.dev',
    displayName: 'Marco Silva',
    bio: 'Coffee shops around the world. City guides, hidden gems, travel diaries.',
    website: 'https://marcoventures.com',
    avatar: 'user-profile-m-4.webp',
  },
  // ---- f-5: Blonde among tropical plants — botany & green living ----
  {
    username: 'hannah.bloom',
    email: 'hannah.bloom@fotosnap.dev',
    displayName: 'Hannah Lindqvist',
    bio: 'Plant mom. Botanical gardens, indoor jungles, propagation tips.',
    avatar: 'user-profile-f-5.webp',
  },
  // ---- m-6: Orange beanie, turtleneck, rooftop city view — urban creative ----
  {
    username: 'jay.onthe.roof',
    email: 'jay.onthe.roof@fotosnap.dev',
    displayName: 'Jay Okonkwo',
    bio: 'Rooftop views, street style, city textures. London creative.',
    website: 'https://jayontheroof.com',
    avatar: 'user-profile-m-6.webp',
  },
  // ---- f-7: Brunette, grey blazer, office building — career & tech ----
  {
    username: 'claire.builds',
    email: 'claire.builds@fotosnap.dev',
    displayName: 'Claire Nakamura',
    bio: 'Building things on the internet. Startup life, design thinking, side projects.',
    avatar: 'user-profile-f-7.webp',
  },
  // ---- f-8: Brunette, brick wall, natural look — film & indie ----
  {
    username: 'nina.analog',
    email: 'nina.analog@fotosnap.dev',
    displayName: 'Nina Kowalski',
    bio: 'Film photography, zines, thrift finds, indie playlists.',
    avatar: 'user-profile-f-8.webp',
  },
  // ---- f-9: Striped shirt, golden hour, direct gaze — portrait & light ----
  {
    username: 'elena.dusk',
    email: 'elena.dusk@fotosnap.dev',
    displayName: 'Elena Vasquez',
    bio: 'Chasing golden hour. Portraits, warm tones, magic-hour landscapes.',
    website: 'https://elenadusk.photo',
    avatar: 'user-profile-f-9.webp',
  },
  // ---- m-10: Blonde, glasses, reddish beard — tech & gaming ----
  {
    username: 'toby.codes',
    email: 'toby.codes@fotosnap.dev',
    displayName: 'Toby Engstr\u00f6m',
    bio: 'Developer by day, gamer by night. Mechanical keyboards, home-lab setups.',
    website: 'https://tobycodes.dev',
    avatar: 'user-profile-m-10.webp',
  },
  // ---- m-11: Dark hair, beard, night road, warm smile — outdoors & adventure ----
  {
    username: 'ryan.trails',
    email: 'ryan.trails@fotosnap.dev',
    displayName: 'Ryan Beckett',
    bio: 'Hiking, camping, campfire cooking. National parks and backroads.',
    avatar: 'user-profile-m-11.webp',
  },
  // ---- No avatar: lurker / new account ----
  {
    username: 'sam.quiet',
    email: 'sam.quiet@fotosnap.dev',
    displayName: 'Sam Almeida',
    bio: 'Just here to scroll.',
    avatar: '',
  },
  // ---- No avatar: foodie who hasn't set up profile yet ----
  {
    username: 'priya.eats',
    email: 'priya.eats@fotosnap.dev',
    displayName: 'Priya Sharma',
    bio: 'Home cook. Recipe experiments, farmers market hauls, weekend bakes.',
    avatar: '',
  },
  // ---- No avatar: fitness, hasn't uploaded a pic ----
  {
    username: 'alex.lifts',
    email: 'alex.lifts@fotosnap.dev',
    displayName: 'Alex Petrov',
    bio: 'Calisthenics, meal prep, recovery routines.',
    avatar: '',
  },
  // ---- No avatar: bookworm ----
  {
    username: 'mina.reads',
    email: 'mina.reads@fotosnap.dev',
    displayName: 'Mina Torres',
    bio: 'Book reviews, reading nooks, annotated pages.',
    avatar: '',
  },
  // ---- f-12: Dark wavy hair, tropical urban setting, casual — travel & lifestyle ----
  {
    username: 'isla.drifts',
    email: 'isla.drifts@fotosnap.dev',
    displayName: 'Isla Moreno',
    bio: 'Island hopping, rooftop sunsets, city-to-coast living.',
    website: 'https://isladrifts.com',
    avatar: 'user-profile-f-12.webp',
  },
  // ---- f-13: Elegant studio portrait, black off-shoulder — beauty & skincare ----
  {
    username: 'yuna.glow',
    email: 'yuna.glow@fotosnap.dev',
    displayName: 'Yuna Park',
    bio: 'Skincare routines, glass-skin tutorials, K-beauty hauls.',
    website: 'https://yunaglow.kr',
    avatar: 'user-profile-f-13.webp',
  },
  // ---- m-14: Red beard, beanie, sunglasses, snowy mountains — winter sports ----
  {
    username: 'nils.summit',
    email: 'nils.summit@fotosnap.dev',
    displayName: 'Nils Eriksen',
    bio: 'Backcountry skiing, splitboarding, mountain weather nerd.',
    avatar: 'user-profile-m-14.webp',
  },
  // ---- m-15: Dark hair, denim shirt, co-working space — design & startups ----
  {
    username: 'kenji.makes',
    email: 'kenji.makes@fotosnap.dev',
    displayName: 'Kenji Tanaka',
    bio: 'Product designer. Figma files, side projects, ramen reviews.',
    website: 'https://kenjimakes.design',
    avatar: 'user-profile-m-15.webp',
  },
  // ---- No avatar: architecture & interiors enthusiast ----
  {
    username: 'leo.frames',
    email: 'leo.frames@fotosnap.dev',
    displayName: 'Leo Marchetti',
    bio: 'Brutalist buildings, mid-century interiors, design history.',
    avatar: '',
  },
  // ---- No avatar: yoga & mindfulness ----
  {
    username: 'anya.breathes',
    email: 'anya.breathes@fotosnap.dev',
    displayName: 'Anya Rai',
    bio: 'Yoga teacher. Morning flows, breathwork, retreat diaries.',
    avatar: '',
  },
];

// ---------------------------------------------------------------------------
// Follow graph — sparse on purpose so suggested users works.
// Each entry: [followerIndex, followingIndex] (indexes into SEED_USERS)
//
// Cluster 1 (fashion/music/lifestyle): valentina, daniel, marco — tight-knit
// Cluster 2 (nature/outdoors): rowan, hannah, ryan — some overlap
// Cluster 3 (urban/creative): jay, nina, elena — loose ties
// Isolated-ish: claire, toby, sam, priya, alex.lifts, mina — few connections
// ---------------------------------------------------------------------------

export const FOLLOW_PAIRS: [number, number][] = [
  // Cluster 1: valentina(0), daniel(1), marco(3)
  [0, 1],
  [1, 0],
  [0, 3],
  [3, 0],
  [1, 3],
  // Cluster 2: rowan(2), hannah(4), ryan(10)
  [2, 4],
  [4, 2],
  [10, 2],
  [10, 4],
  // Cluster 3: jay(5), nina(7), elena(8)
  [5, 7],
  [7, 5],
  [8, 5],
  [8, 7],
  // Cross-cluster bridges
  [0, 8], // valentina follows elena (fashion meets golden-hour portraits)
  [1, 5], // daniel follows jay (music meets urban creative)
  [4, 8], // hannah follows elena (plants meets golden hour)
  // claire(6) and toby(9) — tech duo, few connections
  [6, 9],
  [9, 6],
  // sam(11) follows a handful but nobody follows back (lurker)
  [11, 0],
  [11, 3],
  [11, 8],
  // priya(12) — one mutual with rowan
  [12, 2],
  [2, 12],
  // alex.lifts(13) and mina(14) — completely isolated, zero follows
  // isla(15) — travel/lifestyle, bridges with marco and valentina
  [15, 3],
  [3, 15],
  [15, 0],
  // yuna(16) — beauty, connects with valentina and elena
  [16, 0],
  [0, 16],
  [16, 8],
  // nils(17) — winter sports, connects with ryan (outdoors) and isla (travel)
  [17, 10],
  [10, 17],
  [17, 15],
  // kenji(18) — design/startups, connects with claire (tech) and jay (creative)
  [18, 6],
  [6, 18],
  [18, 5],
  // leo(19) — architecture, connects with jay (urban) and nina (indie/aesthetic)
  [19, 5],
  [19, 7],
  // anya(20) — yoga/mindfulness, connects with rowan (wellness)
  [20, 2],
  [2, 20],

  // --- Popular accounts: valentina(0) and jay(5) ---
  // valentina — fashion influencer, followed by most of the community
  [2, 0], // rowan follows valentina
  [4, 0], // hannah follows valentina
  [5, 0], // jay follows valentina
  [7, 0], // nina follows valentina
  [8, 0], // elena follows valentina
  [9, 0], // toby follows valentina
  [10, 0], // ryan follows valentina
  [12, 0], // priya follows valentina
  [14, 0], // mina follows valentina
  [17, 0], // nils follows valentina
  [18, 0], // kenji follows valentina
  [19, 0], // leo follows valentina
  [20, 0], // anya follows valentina
  // valentina follows back a handful (she's selective)
  [0, 5], // valentina follows jay
  [0, 7], // valentina follows nina
  [0, 15], // valentina follows isla
  // jay — urban creative, big following across clusters
  [0, 5], // (already above, deduped by onConflictDoNothing)
  [2, 5], // rowan follows jay
  [3, 5], // marco follows jay
  [4, 5], // hannah follows jay
  [9, 5], // toby follows jay
  [10, 5], // ryan follows jay
  [11, 5], // sam follows jay
  [15, 5], // isla follows jay
  [16, 5], // yuna follows jay
  [17, 5], // nils follows jay
  [19, 5], // (already above, deduped)
  [20, 5], // anya follows jay
  // jay follows back selectively
  [5, 0], // (already above, deduped)
  [5, 1], // jay follows daniel
  [5, 8], // jay follows elena
  [5, 15], // jay follows isla
  [5, 18], // jay follows kenji
];
