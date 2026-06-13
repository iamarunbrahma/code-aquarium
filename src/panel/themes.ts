import { TankTheme } from '../common/types';

export interface DecorationSpec {
    asset: string; // file under media/decorations
    leftPct: number;
    bottomPct: number;
    widthPx: number;
}

export interface TankThemeInfo {
    name: TankTheme;
    backgroundUrl(baseAssetUri: string): string;
    decorations: DecorationSpec[];
    bubbleDensity: number;
    // Solid fill behind the backdrop image. The backdrop is sized to the tank
    // width and anchored to the bottom, so in tall/narrow tanks open water sits
    // above it — this color (matching the backdrop's top row) fills that space
    // seamlessly. Keeps the scene fit-to-width responsive without side-cropping.
    waterColor: string;
}

// Each background is a painted backdrop (water + sand/floor + scenery). The
// decorations below are foreground props strung along the sand line in front
// of that backdrop, all rooted near the same bottomPct so they sit on the floor.
const CORAL_REEF: TankThemeInfo = {
    name: TankTheme.coralReef,
    backgroundUrl: (uri) => `${uri}/backgrounds/coral-reef/background.webp`,
    // Foreground props strung along the sand in front of the painted reef:
    // the full coral set (red, purple, pink, sea_fan) plus accents (seaweed,
    // clam, pearl, anemone, urchin) and two starfish at different spots/heights.
    decorations: [
        { asset: 'seaweed_green.webp', leftPct: 2, bottomPct: 8, widthPx: 42 },
        { asset: 'coral_red.webp', leftPct: 12, bottomPct: 7, widthPx: 52 },
        { asset: 'coral_purple.webp', leftPct: 22, bottomPct: 7, widthPx: 54 },
        { asset: 'starfish.webp', leftPct: 32, bottomPct: 7, widthPx: 40 },
        { asset: 'giant_clam.webp', leftPct: 43, bottomPct: 6, widthPx: 58 },
        { asset: 'sea_fan.webp', leftPct: 53, bottomPct: 7, widthPx: 58 },
        { asset: 'coral_pink.webp', leftPct: 63, bottomPct: 7, widthPx: 56 },
        { asset: 'starfish.webp', leftPct: 68, bottomPct: 12, widthPx: 32 },
        { asset: 'pearl.webp', leftPct: 72, bottomPct: 6, widthPx: 32 },
        { asset: 'anemone.webp', leftPct: 81, bottomPct: 7, widthPx: 46 },
        { asset: 'sea_urchin.webp', leftPct: 91, bottomPct: 7, widthPx: 42 },
    ],
    bubbleDensity: 0.45,
    waterColor: '#ddf4fa',
};

const DEEP_OCEAN: TankThemeInfo = {
    name: TankTheme.deepOcean,
    backgroundUrl: (uri) => `${uri}/backgrounds/deep-ocean/background.webp`,
    // The painted abyss already has a sea-pen, coral, sea-whip, two anemones, a
    // starfish and a sea cucumber, so foreground props stay minimal and dark:
    // two sea urchins (the only tonally-matched sprite) in the empty mid-floor.
    // The bright sea_fan was dropped — it clashed with the muted palette.
    decorations: [
        { asset: 'sea_urchin.webp', leftPct: 42, bottomPct: 7, widthPx: 48 },
        { asset: 'sea_urchin.webp', leftPct: 55, bottomPct: 7, widthPx: 34 },
    ],
    bubbleDensity: 0.3,
    waterColor: '#7996df',
};

const SUNKEN_SHIP: TankThemeInfo = {
    name: TankTheme.sunkenShip,
    backgroundUrl: (uri) => `${uri}/backgrounds/sunken-ship/background.webp`,
    // Wreck is the centrepiece, so props cluster naturally on the sand to either
    // side at varied heights rather than in an even row: debris spilled by the
    // bow on the left (seaweed, anchor, starfish, chest), sea life on the right
    // (coral at the mound, urchin, seaweed, pearl) staggered in depth. The wreck
    // itself is left uncluttered.
    decorations: [
        { asset: 'seaweed_green.webp', leftPct: 5, bottomPct: 9, widthPx: 44 },
        { asset: 'anchor.webp', leftPct: 14, bottomPct: 5, widthPx: 64 },
        { asset: 'starfish.webp', leftPct: 23, bottomPct: 12, widthPx: 32 },
        {
            asset: 'treasure_chest.webp',
            leftPct: 29,
            bottomPct: 6,
            widthPx: 74,
        },
        { asset: 'coral_red.webp', leftPct: 69, bottomPct: 9, widthPx: 52 },
        { asset: 'sea_urchin.webp', leftPct: 76, bottomPct: 6, widthPx: 44 },
        {
            asset: 'seaweed_green.webp',
            leftPct: 82,
            bottomPct: 12,
            widthPx: 40,
        },
        { asset: 'pearl.webp', leftPct: 88, bottomPct: 7, widthPx: 30 },
    ],
    bubbleDensity: 0.4,
    waterColor: '#799cb0',
};

const REGISTRY: Record<TankTheme, TankThemeInfo> = {
    [TankTheme.coralReef]: CORAL_REEF,
    [TankTheme.deepOcean]: DEEP_OCEAN,
    [TankTheme.sunkenShip]: SUNKEN_SHIP,
};

export function getThemeInfo(theme: TankTheme): TankThemeInfo {
    return REGISTRY[theme] ?? CORAL_REEF;
}
