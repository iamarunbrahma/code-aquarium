// Random name pools per species. Pure functions only — safe to
// import from both the extension host and the webview runtime.

import { FishSpecies } from './types';

export const GOLDFISH_NAMES: ReadonlyArray<string> = [
    'Goldie',
    'Nemo',
    'Bubbles',
    'Splash',
    'Finley',
    'Sushi',
    'Pebble',
    'Marina',
    'Coral',
    'Wave',
    'Mango',
    'Tangerine',
    'Sunny',
    'Tigress',
    'Comet',
    'Dorothy',
    'Fishstick',
    'Caviar',
    'Reef',
    'Pearl',
];

export const TROPICAL_NAMES: ReadonlyArray<string> = [
    'Azure',
    'Tango',
    'Mango',
    'Rainbow',
    'Skittle',
    'Pixel',
    'Neon',
    'Lagoon',
    'Tropic',
    'Indigo',
    'Sherbet',
    'Punch',
    'Mango',
    'Maui',
    'Calypso',
];

export const PUFFERFISH_NAMES: ReadonlyArray<string> = [
    'Puffin',
    'Spike',
    'Balloon',
    'Tofu',
    'Chubs',
    'Marshmallow',
    'Beanie',
    'Mochi',
    'Pumpkin',
    'Yuzu',
];

export const SHARK_NAMES: ReadonlyArray<string> = [
    'Bruce',
    'Chompers',
    'Jaws',
    'Megalo',
    'Tiger',
    'Bane',
    'Ripper',
    'Bigsby',
    'Reef',
    'Stormy',
];

export const OCTOPUS_NAMES: ReadonlyArray<string> = [
    'Octavia',
    'Inky',
    'Tentacles',
    'Squidward',
    'Eight',
    'Sucker',
    'Paula',
    'Limber',
    'Noodle',
    'Marbles',
];

export const CRAB_NAMES: ReadonlyArray<string> = [
    'Sebastian',
    'Pinchy',
    'Clawde',
    'Sideswipe',
    'Krusty',
    'Brick',
    'Hermit',
    'Cancer',
    'Cap',
    'Pippa',
];

export function randomName(species: FishSpecies): string {
    const collection =
        (
            {
                [FishSpecies.goldfish]: GOLDFISH_NAMES,
                [FishSpecies.tropical]: TROPICAL_NAMES,
                [FishSpecies.pufferfish]: PUFFERFISH_NAMES,
                [FishSpecies.shark]: SHARK_NAMES,
                [FishSpecies.octopus]: OCTOPUS_NAMES,
                [FishSpecies.crab]: CRAB_NAMES,
            } as Record<FishSpecies, ReadonlyArray<string>>
        )[species] ?? GOLDFISH_NAMES;
    return collection[Math.floor(Math.random() * collection.length)] ?? 'Fishy';
}
