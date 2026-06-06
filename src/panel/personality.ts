// Per-fish personality, derived deterministically from the fish's name so
// it is stable across reloads without any extra persistence. A trait gives
// each fish a small swim-speed nudge and its own flavour of idle musings.

export const enum FishTrait {
    zoomy = 'zoomy',
    lazy = 'lazy',
    shy = 'shy',
    foodie = 'foodie',
    chatty = 'chatty',
}

const TRAITS: ReadonlyArray<FishTrait> = [
    FishTrait.zoomy,
    FishTrait.lazy,
    FishTrait.shy,
    FishTrait.foodie,
    FishTrait.chatty,
];

/** Stable trait for a name (same name always maps to the same trait). */
export function traitForName(name: string): FishTrait {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return TRAITS[hash % TRAITS.length];
}

/** Swim-speed multiplier so a zoomy fish darts and a lazy one drifts. */
export function traitSpeedMultiplier(trait: FishTrait): number {
    switch (trait) {
        case FishTrait.zoomy:
            return 1.4;
        case FishTrait.lazy:
            return 0.7;
        default:
            return 1;
    }
}

const GENERAL_LINES: ReadonlyArray<string> = [
    'Just vibing.',
    'Another lap, another day.',
    'Bloop.',
    'The water is lovely today.',
    'Swim, snack, repeat.',
    'Pondering the meaning of fish.',
];

const NIGHT_LINES: ReadonlyArray<string> = [
    'Zzz... oh, hi.',
    'Working late too?',
    'The tank is so quiet now.',
    'Stars on the water tonight.',
];

const TRAIT_LINES: Record<FishTrait, ReadonlyArray<string>> = {
    [FishTrait.zoomy]: ['Gotta go fast.', 'Lap number infinity.', 'Zoom zoom.'],
    [FishTrait.lazy]: [
        'Five more minutes.',
        'Effort is for other fish.',
        'I drift, therefore I am.',
    ],
    [FishTrait.shy]: ['Oh, you saw me?', '...hi.', "Don't mind me."],
    [FishTrait.foodie]: [
        'Is that food? Where?',
        'I could eat.',
        "It's snack o'clock somewhere.",
    ],
    [FishTrait.chatty]: [
        'So anyway, as I was saying...',
        'Have I told you about this rock?',
        'Talk to me, I am so bored.',
    ],
};

/** A random idle musing, flavoured by trait and time of day. */
export function ambientLine(trait: FishTrait, isNight: boolean): string {
    const pool = isNight
        ? [...NIGHT_LINES, ...GENERAL_LINES]
        : [...GENERAL_LINES, ...TRAIT_LINES[trait]];
    return pool[Math.floor(Math.random() * pool.length)];
}
