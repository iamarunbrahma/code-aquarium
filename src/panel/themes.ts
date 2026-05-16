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
}

const CORAL_REEF: TankThemeInfo = {
    name: TankTheme.coralReef,
    backgroundUrl: (uri) =>
        `${uri}/backgrounds/coral-reef/background-light.svg`,
    // Corals clustered into three reef outcrops rather than an even row:
    // overlapping leftPct and varied widths give reef density. Every
    // decoration shares one bottomPct so all bases root on the same sand
    // line instead of floating at different heights.
    decorations: [
        // Left outcrop
        { asset: 'seaweed_green.svg', leftPct: 7, bottomPct: 6, widthPx: 38 },
        { asset: 'coral_purple.svg', leftPct: 3, bottomPct: 6, widthPx: 74 },
        { asset: 'coral_red.svg', leftPct: 11, bottomPct: 6, widthPx: 96 },
        { asset: 'coral_pink.svg', leftPct: 20, bottomPct: 6, widthPx: 60 },
        // Open sand
        { asset: 'starfish.svg', leftPct: 33, bottomPct: 6, widthPx: 30 },
        // Centre outcrop
        { asset: 'seaweed_green.svg', leftPct: 56, bottomPct: 6, widthPx: 40 },
        { asset: 'coral_red.svg', leftPct: 42, bottomPct: 6, widthPx: 84 },
        { asset: 'coral_pink.svg', leftPct: 48, bottomPct: 6, widthPx: 94 },
        { asset: 'coral_purple.svg', leftPct: 54, bottomPct: 6, widthPx: 56 },
        // Open sand
        { asset: 'pearl.svg', leftPct: 70, bottomPct: 6, widthPx: 20 },
        // Right outcrop
        { asset: 'seaweed_green.svg', leftPct: 88, bottomPct: 6, widthPx: 36 },
        { asset: 'coral_purple.svg', leftPct: 78, bottomPct: 6, widthPx: 80 },
        { asset: 'coral_red.svg', leftPct: 85, bottomPct: 6, widthPx: 90 },
        { asset: 'coral_pink.svg', leftPct: 93, bottomPct: 6, widthPx: 68 },
    ],
    bubbleDensity: 0.45,
};

const DEEP_SEA: TankThemeInfo = {
    name: TankTheme.deepSea,
    backgroundUrl: (uri) => `${uri}/backgrounds/deep-sea/background-light.svg`,
    decorations: [
        { asset: 'seaweed_green.svg', leftPct: 10, bottomPct: 6, widthPx: 44 },
        { asset: 'pearl.svg', leftPct: 26, bottomPct: 6, widthPx: 22 },
        { asset: 'seaweed_green.svg', leftPct: 42, bottomPct: 6, widthPx: 40 },
        { asset: 'starfish.svg', leftPct: 56, bottomPct: 6, widthPx: 30 },
        { asset: 'pearl.svg', leftPct: 68, bottomPct: 6, widthPx: 20 },
        { asset: 'seaweed_green.svg', leftPct: 84, bottomPct: 6, widthPx: 44 },
    ],
    bubbleDensity: 0.3,
};

const SUNKEN_SHIP: TankThemeInfo = {
    name: TankTheme.sunkenShip,
    backgroundUrl: (uri) =>
        `${uri}/backgrounds/sunken-ship/background-light.svg`,
    decorations: [
        { asset: 'seaweed_green.svg', leftPct: 8, bottomPct: 6, widthPx: 40 },
        { asset: 'treasure_chest.svg', leftPct: 20, bottomPct: 6, widthPx: 64 },
        { asset: 'sunken_ship.svg', leftPct: 36, bottomPct: 4, widthPx: 240 },
        { asset: 'pearl.svg', leftPct: 74, bottomPct: 6, widthPx: 22 },
        { asset: 'seaweed_green.svg', leftPct: 84, bottomPct: 6, widthPx: 42 },
        { asset: 'starfish.svg', leftPct: 92, bottomPct: 6, widthPx: 30 },
    ],
    bubbleDensity: 0.4,
};

const REGISTRY: Record<TankTheme, TankThemeInfo> = {
    [TankTheme.coralReef]: CORAL_REEF,
    [TankTheme.deepSea]: DEEP_SEA,
    [TankTheme.sunkenShip]: SUNKEN_SHIP,
};

export function getThemeInfo(theme: TankTheme): TankThemeInfo {
    return REGISTRY[theme] ?? CORAL_REEF;
}
