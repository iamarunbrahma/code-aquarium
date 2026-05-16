// Shared types used by both extension host and webview runtime.

export const enum FishSpecies {
    goldfish = 'goldfish',
    tropical = 'tropical',
    pufferfish = 'pufferfish',
    shark = 'shark',
    octopus = 'octopus',
    crab = 'crab',
}

export const enum FishColor {
    orange = 'orange',
    white = 'white',
    black = 'black',
    calico = 'calico',
    blue = 'blue',
    yellow = 'yellow',
    red = 'red',
    pink = 'pink',
    gray = 'gray',
}

export const enum FishSize {
    nano = 'nano',
    small = 'small',
    medium = 'medium',
    large = 'large',
}

export const enum TankTheme {
    coralReef = 'coral-reef',
    deepSea = 'deep-sea',
    sunkenShip = 'sunken-ship',
}

export const enum ExtPosition {
    panel = 'panel',
    explorer = 'explorer',
}

export const enum FishMood {
    happy = 'happy',
    content = 'content',
    hungry = 'hungry',
    tired = 'tired',
    grumpy = 'grumpy',
}

export const ALL_SPECIES: ReadonlyArray<FishSpecies> = [
    FishSpecies.goldfish,
    FishSpecies.tropical,
    FishSpecies.pufferfish,
    FishSpecies.shark,
    FishSpecies.octopus,
    FishSpecies.crab,
];

export const ALL_COLORS: ReadonlyArray<FishColor> = [
    FishColor.orange,
    FishColor.white,
    FishColor.black,
    FishColor.calico,
    FishColor.blue,
    FishColor.yellow,
    FishColor.red,
    FishColor.pink,
    FishColor.gray,
];

export const ALL_SIZES: ReadonlyArray<FishSize> = [
    FishSize.nano,
    FishSize.small,
    FishSize.medium,
    FishSize.large,
];

export const ALL_THEMES: ReadonlyArray<TankTheme> = [
    TankTheme.coralReef,
    TankTheme.deepSea,
    TankTheme.sunkenShip,
];

// Colors known to be valid per species. Species without
// an entry fall back to ALL_COLORS.
export const SPECIES_COLORS: Record<string, ReadonlyArray<FishColor>> = {
    [FishSpecies.goldfish]: [
        FishColor.orange,
        FishColor.white,
        FishColor.black,
        FishColor.calico,
    ],
    [FishSpecies.tropical]: [
        FishColor.blue,
        FishColor.yellow,
        FishColor.red,
        FishColor.pink,
    ],
    [FishSpecies.pufferfish]: [FishColor.yellow, FishColor.orange],
    [FishSpecies.shark]: [FishColor.gray, FishColor.white],
    [FishSpecies.octopus]: [FishColor.red, FishColor.pink],
    [FishSpecies.crab]: [FishColor.red, FishColor.orange],
};

export function availableColorsForSpecies(
    species: FishSpecies,
): ReadonlyArray<FishColor> {
    return SPECIES_COLORS[species] ?? ALL_COLORS;
}

export function normalizeColor(
    color: FishColor,
    species: FishSpecies,
): FishColor {
    const available = availableColorsForSpecies(species);
    if (available.includes(color)) {
        return color;
    }
    return available[0];
}

export interface ITankStats {
    totalSaves: number;
    totalCommits: number;
    totalCommitHatches: number;
}
