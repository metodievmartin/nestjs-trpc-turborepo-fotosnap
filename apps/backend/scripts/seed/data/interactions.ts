/**
 * Seed likes and comments — pure data, no DB logic.
 *
 * All indexes reference SEED_USERS (userIndex) and SEED_POSTS (postIndex).
 * Interactions follow the follow graph and user personas for realism.
 *
 * Post index reference (from posts.ts):
 *   0–4:   valentina    5–8:   jay         9–11:  daniel
 *  12–14:  marco       15–17:  rowan       18–20: elena
 *  21–23:  isla        24–25:  nina        26–27: hannah
 *  28–29:  yuna        30–31:  claire      32–33: toby
 *  34–35:  ryan        36–37:  kenji       38:    priya
 *  39:     leo
 */

// ---------------------------------------------------------------------------
// Likes — [userIndex, postIndex]
//
// Popular posts (valentina, jay) get many likes. Lurkers (sam) like but
// don't post. Isolated users (alex, mina) mostly like popular posts.
// ---------------------------------------------------------------------------

export interface SeedLike {
  userIndex: number;
  postIndex: number;
}

export const SEED_LIKES: SeedLike[] = [
  // --- valentina's posts (0–4) — most liked ---
  // post 0: "Plaid season"
  { userIndex: 1, postIndex: 0 }, // daniel
  { userIndex: 3, postIndex: 0 }, // marco
  { userIndex: 5, postIndex: 0 }, // jay
  { userIndex: 7, postIndex: 0 }, // nina
  { userIndex: 8, postIndex: 0 }, // elena
  { userIndex: 15, postIndex: 0 }, // isla
  { userIndex: 16, postIndex: 0 }, // yuna
  { userIndex: 11, postIndex: 0 }, // sam (lurker)
  // post 1: "Golden hour fitting room"
  { userIndex: 1, postIndex: 1 }, // daniel
  { userIndex: 8, postIndex: 1 }, // elena
  { userIndex: 15, postIndex: 1 }, // isla
  { userIndex: 16, postIndex: 1 }, // yuna
  { userIndex: 7, postIndex: 1 }, // nina
  { userIndex: 14, postIndex: 1 }, // mina
  // post 2: "Red lip, no filter"
  { userIndex: 16, postIndex: 2 }, // yuna (beauty connection)
  { userIndex: 8, postIndex: 2 }, // elena
  { userIndex: 5, postIndex: 2 }, // jay
  { userIndex: 3, postIndex: 2 }, // marco
  { userIndex: 15, postIndex: 2 }, // isla
  { userIndex: 20, postIndex: 2 }, // anya
  { userIndex: 12, postIndex: 2 }, // priya
  // post 3: "Sunday brunch"
  { userIndex: 5, postIndex: 3 }, // jay
  { userIndex: 7, postIndex: 3 }, // nina
  { userIndex: 16, postIndex: 3 }, // yuna
  { userIndex: 11, postIndex: 3 }, // sam
  // post 4: "Front row energy"
  { userIndex: 1, postIndex: 4 }, // daniel
  { userIndex: 3, postIndex: 4 }, // marco
  { userIndex: 5, postIndex: 4 }, // jay
  { userIndex: 8, postIndex: 4 }, // elena
  { userIndex: 16, postIndex: 4 }, // yuna
  { userIndex: 15, postIndex: 4 }, // isla
  { userIndex: 7, postIndex: 4 }, // nina
  { userIndex: 9, postIndex: 4 }, // toby
  { userIndex: 11, postIndex: 4 }, // sam

  // --- jay's posts (5–8) — second most liked ---
  // post 5: "London looks different"
  { userIndex: 0, postIndex: 5 }, // valentina
  { userIndex: 1, postIndex: 5 }, // daniel
  { userIndex: 7, postIndex: 5 }, // nina
  { userIndex: 8, postIndex: 5 }, // elena
  { userIndex: 18, postIndex: 5 }, // kenji
  { userIndex: 19, postIndex: 5 }, // leo
  { userIndex: 11, postIndex: 5 }, // sam
  // post 6: "Alley find"
  { userIndex: 7, postIndex: 6 }, // nina
  { userIndex: 8, postIndex: 6 }, // elena
  { userIndex: 19, postIndex: 6 }, // leo (architecture)
  { userIndex: 18, postIndex: 6 }, // kenji
  { userIndex: 0, postIndex: 6 }, // valentina
  // post 7: "Concrete and copper"
  { userIndex: 19, postIndex: 7 }, // leo (architecture)
  { userIndex: 7, postIndex: 7 }, // nina
  { userIndex: 9, postIndex: 7 }, // toby
  { userIndex: 18, postIndex: 7 }, // kenji
  // post 8: "Fit check"
  { userIndex: 0, postIndex: 8 }, // valentina
  { userIndex: 1, postIndex: 8 }, // daniel
  { userIndex: 15, postIndex: 8 }, // isla
  { userIndex: 8, postIndex: 8 }, // elena
  { userIndex: 16, postIndex: 8 }, // yuna
  { userIndex: 11, postIndex: 8 }, // sam

  // --- daniel's posts (9–11) ---
  // post 9: "New track dropping"
  { userIndex: 0, postIndex: 9 }, // valentina
  { userIndex: 5, postIndex: 9 }, // jay
  { userIndex: 3, postIndex: 9 }, // marco
  // post 10: "Vinyl haul"
  { userIndex: 0, postIndex: 10 }, // valentina
  { userIndex: 5, postIndex: 10 }, // jay
  { userIndex: 7, postIndex: 10 }, // nina (indie connection)
  // post 11: "Late night jam"
  { userIndex: 5, postIndex: 11 }, // jay
  { userIndex: 0, postIndex: 11 }, // valentina
  { userIndex: 3, postIndex: 11 }, // marco

  // --- marco's posts (12–14) ---
  // post 12: "Best cortado"
  { userIndex: 0, postIndex: 12 }, // valentina
  { userIndex: 1, postIndex: 12 }, // daniel
  { userIndex: 15, postIndex: 12 }, // isla (travel connection)
  { userIndex: 5, postIndex: 12 }, // jay
  // post 13: "Got lost on purpose"
  { userIndex: 15, postIndex: 13 }, // isla
  { userIndex: 0, postIndex: 13 }, // valentina
  { userIndex: 5, postIndex: 13 }, // jay
  // post 14: "Airport coffee"
  { userIndex: 15, postIndex: 14 }, // isla
  { userIndex: 1, postIndex: 14 }, // daniel

  // --- rowan's posts (15–17) ---
  // post 15: "Morning fog"
  { userIndex: 4, postIndex: 15 }, // hannah (nature connection)
  { userIndex: 20, postIndex: 15 }, // anya (wellness)
  { userIndex: 12, postIndex: 15 }, // priya
  // post 16: "Wildcrafted lavender"
  { userIndex: 4, postIndex: 16 }, // hannah
  { userIndex: 20, postIndex: 16 }, // anya
  // post 17: "The kind of quiet"
  { userIndex: 4, postIndex: 17 }, // hannah
  { userIndex: 20, postIndex: 17 }, // anya
  { userIndex: 8, postIndex: 17 }, // elena

  // --- elena's posts (18–20) ---
  // post 18: "Caught the light"
  { userIndex: 0, postIndex: 18 }, // valentina
  { userIndex: 5, postIndex: 18 }, // jay
  { userIndex: 7, postIndex: 18 }, // nina
  { userIndex: 4, postIndex: 18 }, // hannah
  // post 19: "Warm tones only"
  { userIndex: 0, postIndex: 19 }, // valentina
  { userIndex: 7, postIndex: 19 }, // nina
  { userIndex: 16, postIndex: 19 }, // yuna
  // post 20: "She didn't know"
  { userIndex: 5, postIndex: 20 }, // jay
  { userIndex: 7, postIndex: 20 }, // nina
  { userIndex: 0, postIndex: 20 }, // valentina
  { userIndex: 15, postIndex: 20 }, // isla

  // --- isla's posts (21–23) ---
  // post 21: "Salt air"
  { userIndex: 3, postIndex: 21 }, // marco (travel)
  { userIndex: 0, postIndex: 21 }, // valentina
  { userIndex: 5, postIndex: 21 }, // jay
  // post 22: "Rooftop sunsets"
  { userIndex: 3, postIndex: 22 }, // marco
  { userIndex: 0, postIndex: 22 }, // valentina
  { userIndex: 17, postIndex: 22 }, // nils
  // post 23: "Woke up on an island"
  { userIndex: 3, postIndex: 23 }, // marco
  { userIndex: 0, postIndex: 23 }, // valentina
  { userIndex: 5, postIndex: 23 }, // jay
  { userIndex: 17, postIndex: 23 }, // nils
  { userIndex: 16, postIndex: 23 }, // yuna

  // --- nina's posts (24–25) ---
  { userIndex: 5, postIndex: 24 }, // jay
  { userIndex: 8, postIndex: 24 }, // elena
  { userIndex: 5, postIndex: 25 }, // jay
  { userIndex: 8, postIndex: 25 }, // elena

  // --- hannah's posts (26–27) ---
  { userIndex: 2, postIndex: 26 }, // rowan
  { userIndex: 8, postIndex: 26 }, // elena
  { userIndex: 2, postIndex: 27 }, // rowan
  { userIndex: 20, postIndex: 27 }, // anya

  // --- yuna's posts (28–29) ---
  { userIndex: 0, postIndex: 28 }, // valentina
  { userIndex: 8, postIndex: 28 }, // elena
  { userIndex: 0, postIndex: 29 }, // valentina
  { userIndex: 15, postIndex: 29 }, // isla

  // --- claire's posts (30–31) ---
  { userIndex: 9, postIndex: 30 }, // toby (tech duo)
  { userIndex: 18, postIndex: 30 }, // kenji
  { userIndex: 9, postIndex: 31 }, // toby
  { userIndex: 18, postIndex: 31 }, // kenji
  { userIndex: 5, postIndex: 31 }, // jay

  // --- toby's posts (32–33) ---
  { userIndex: 6, postIndex: 32 }, // claire
  { userIndex: 18, postIndex: 32 }, // kenji
  { userIndex: 6, postIndex: 33 }, // claire
  { userIndex: 5, postIndex: 33 }, // jay

  // --- ryan's posts (34–35) ---
  { userIndex: 2, postIndex: 34 }, // rowan
  { userIndex: 4, postIndex: 34 }, // hannah
  { userIndex: 17, postIndex: 34 }, // nils
  { userIndex: 2, postIndex: 35 }, // rowan
  { userIndex: 4, postIndex: 35 }, // hannah

  // --- kenji's posts (36–37) ---
  { userIndex: 6, postIndex: 36 }, // claire
  { userIndex: 5, postIndex: 36 }, // jay
  { userIndex: 6, postIndex: 37 }, // claire
  { userIndex: 5, postIndex: 37 }, // jay
  { userIndex: 15, postIndex: 37 }, // isla (ramen = travel food)

  // --- priya's post (38) ---
  { userIndex: 2, postIndex: 38 }, // rowan
  { userIndex: 4, postIndex: 38 }, // hannah

  // --- leo's post (39) ---
  { userIndex: 5, postIndex: 39 }, // jay (urban)
  { userIndex: 7, postIndex: 39 }, // nina
  { userIndex: 18, postIndex: 39 }, // kenji
];

// ---------------------------------------------------------------------------
// Comments — [userIndex, postIndex, text, hoursAfterPost]
//
// hoursAfterPost is how many hours after the post was created the comment
// was left. Keeps comment timestamps after the post but before "now".
// ---------------------------------------------------------------------------

export interface SeedComment {
  userIndex: number;
  postIndex: number;
  text: string;
  hoursAfterPost: number;
}

export const SEED_COMMENTS: SeedComment[] = [
  // --- valentina's posts ---
  // post 0: "Plaid season"
  {
    userIndex: 16,
    postIndex: 0,
    text: 'obsessed with this look',
    hoursAfterPost: 2,
  },
  { userIndex: 5, postIndex: 0, text: 'plaid done right', hoursAfterPost: 4 },
  {
    userIndex: 8,
    postIndex: 0,
    text: 'the blazer is everything',
    hoursAfterPost: 6,
  },
  // post 1: "Golden hour fitting room"
  {
    userIndex: 15,
    postIndex: 1,
    text: 'golden hour + fashion = perfection',
    hoursAfterPost: 3,
  },
  {
    userIndex: 1,
    postIndex: 1,
    text: 'how is this a fitting room pic',
    hoursAfterPost: 5,
  },
  // post 2: "Red lip, no filter"
  {
    userIndex: 16,
    postIndex: 2,
    text: 'what shade is that??',
    hoursAfterPost: 1,
  },
  {
    userIndex: 8,
    postIndex: 2,
    text: 'no filter needed honestly',
    hoursAfterPost: 3,
  },
  // post 4: "Front row energy"
  { userIndex: 3, postIndex: 4, text: 'was this Milan??', hoursAfterPost: 1 },
  {
    userIndex: 5,
    postIndex: 4,
    text: 'main character energy',
    hoursAfterPost: 2,
  },
  { userIndex: 16, postIndex: 4, text: 'need that jacket', hoursAfterPost: 4 },

  // --- jay's posts ---
  // post 5: "London looks different"
  {
    userIndex: 0,
    postIndex: 5,
    text: 'love this perspective',
    hoursAfterPost: 3,
  },
  {
    userIndex: 19,
    postIndex: 5,
    text: 'which rooftop is this?',
    hoursAfterPost: 5,
  },
  {
    userIndex: 18,
    postIndex: 5,
    text: 'London through your lens hits different',
    hoursAfterPost: 8,
  },
  // post 6: "Alley find"
  {
    userIndex: 7,
    postIndex: 6,
    text: 'the details in this',
    hoursAfterPost: 2,
  },
  {
    userIndex: 19,
    postIndex: 6,
    text: 'the textures are wild',
    hoursAfterPost: 6,
  },
  // post 7: "Concrete and copper"
  {
    userIndex: 19,
    postIndex: 7,
    text: 'this is gorgeous. brutalist vibes',
    hoursAfterPost: 3,
  },
  {
    userIndex: 7,
    postIndex: 7,
    text: 'could be an album cover',
    hoursAfterPost: 7,
  },
  // post 8: "Fit check"
  {
    userIndex: 0,
    postIndex: 8,
    text: 'the fit is immaculate',
    hoursAfterPost: 2,
  },
  {
    userIndex: 15,
    postIndex: 8,
    text: 'gallery drop some pics after!',
    hoursAfterPost: 4,
  },

  // --- daniel's posts ---
  // post 9: "New track dropping"
  {
    userIndex: 5,
    postIndex: 9,
    text: 'been waiting for this one',
    hoursAfterPost: 3,
  },
  { userIndex: 0, postIndex: 9, text: 'studio looks cozy', hoursAfterPost: 8 },
  // post 10: "Vinyl haul"
  {
    userIndex: 7,
    postIndex: 10,
    text: 'what did you grab??',
    hoursAfterPost: 2,
  },
  {
    userIndex: 5,
    postIndex: 10,
    text: 'the crackle IS the point',
    hoursAfterPost: 5,
  },

  // --- marco's posts ---
  // post 12: "Best cortado"
  {
    userIndex: 15,
    postIndex: 12,
    text: 'where is this? I need to go',
    hoursAfterPost: 2,
  },
  {
    userIndex: 0,
    postIndex: 12,
    text: 'adding this to the list',
    hoursAfterPost: 6,
  },
  // post 13: "Got lost on purpose"
  {
    userIndex: 15,
    postIndex: 13,
    text: 'best way to travel honestly',
    hoursAfterPost: 4,
  },
  // post 14: "Airport coffee"
  {
    userIndex: 15,
    postIndex: 14,
    text: 'it counts when it has to',
    hoursAfterPost: 1,
  },

  // --- rowan's posts ---
  // post 15: "Morning fog"
  {
    userIndex: 20,
    postIndex: 15,
    text: 'this is so peaceful',
    hoursAfterPost: 5,
  },
  { userIndex: 4, postIndex: 15, text: 'the dream morning', hoursAfterPost: 8 },
  // post 17: "The kind of quiet"
  {
    userIndex: 20,
    postIndex: 17,
    text: 'felt this in my soul',
    hoursAfterPost: 3,
  },

  // --- elena's posts ---
  // post 18: "Caught the light"
  {
    userIndex: 7,
    postIndex: 18,
    text: 'you always find the best light',
    hoursAfterPost: 4,
  },
  { userIndex: 0, postIndex: 18, text: '7:42pm magic', hoursAfterPost: 6 },
  // post 20: "She didn't know"
  {
    userIndex: 7,
    postIndex: 20,
    text: 'candid is always the best',
    hoursAfterPost: 3,
  },
  {
    userIndex: 5,
    postIndex: 20,
    text: 'this frame is perfect',
    hoursAfterPost: 5,
  },

  // --- isla's posts ---
  // post 21: "Salt air"
  { userIndex: 3, postIndex: 21, text: 'living the dream', hoursAfterPost: 4 },
  // post 23: "Woke up on an island"
  {
    userIndex: 3,
    postIndex: 23,
    text: 'stay. definitely stay.',
    hoursAfterPost: 2,
  },
  {
    userIndex: 0,
    postIndex: 23,
    text: 'take me with you next time',
    hoursAfterPost: 5,
  },
  { userIndex: 17, postIndex: 23, text: 'which island??', hoursAfterPost: 7 },

  // --- claire's posts ---
  // post 30: "Shipped it"
  {
    userIndex: 9,
    postIndex: 30,
    text: 'congrats! what was it?',
    hoursAfterPost: 2,
  },
  { userIndex: 18, postIndex: 30, text: 'the best feeling', hoursAfterPost: 5 },

  // --- kenji's posts ---
  // post 36: "Figma at 2am"
  {
    userIndex: 6,
    postIndex: 36,
    text: 'the side project trap is real',
    hoursAfterPost: 3,
  },
  {
    userIndex: 5,
    postIndex: 36,
    text: 'shipping > sleeping',
    hoursAfterPost: 6,
  },
  // post 37: "Best ramen in Shibuya"
  {
    userIndex: 15,
    postIndex: 37,
    text: 'noted. going next month',
    hoursAfterPost: 2,
  },
  { userIndex: 6, postIndex: 37, text: 'jealous', hoursAfterPost: 4 },

  // --- ryan's posts ---
  // post 34: "Mile 14"
  { userIndex: 2, postIndex: 34, text: 'worth every step', hoursAfterPost: 5 },
  { userIndex: 17, postIndex: 34, text: 'which trail?', hoursAfterPost: 8 },

  // --- priya's post ---
  // post 38: "First attempt at sourdough"
  {
    userIndex: 2,
    postIndex: 38,
    text: 'looks great for a first attempt!',
    hoursAfterPost: 3,
  },
];
