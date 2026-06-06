import { FishSpecies } from '../common/types';

// The tank floor (fish never sink below this) and the general swim ceiling,
// as a percentage of tank height measured from the bottom.
export const TANK_FLOOR = 10;
export const SWIM_CEILING = 85;

/**
 * Per-species vertical roaming band `[minBottom, maxBottom]`. Grounded in
 * real aquarium swimming levels: crabs and octopuses are benthic (bottom
 * dwellers), sharks patrol mid-water, and community fish roam mid-to-upper.
 * Fish swim/idle/dart within this band; while chasing food they may still
 * descend to the floor to reach a sunken pellet (see chaseClamp).
 */
export const SPECIES_BAND: Record<FishSpecies, readonly [number, number]> = {
    [FishSpecies.crab]: [TANK_FLOOR, TANK_FLOOR], // floor-dweller
    [FishSpecies.octopus]: [TANK_FLOOR, 42], // benthic / lower half
    [FishSpecies.shark]: [28, 70], // mid-water patrol
    [FishSpecies.pufferfish]: [18, 78], // mid
    [FishSpecies.goldfish]: [15, 82], // broad mid
    [FishSpecies.tropical]: [30, SWIM_CEILING], // mid-to-top
};

export function bandFor(species: FishSpecies): readonly [number, number] {
    return SPECIES_BAND[species] ?? [TANK_FLOOR, SWIM_CEILING];
}

function clampRange(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/** Keep a fish within its roaming band (swim / idle / dart / float). */
export function roamClamp(species: FishSpecies, bottom: number): number {
    const [min, max] = bandFor(species);
    return clampRange(bottom, min, max);
}

/**
 * While chasing food a fish may descend all the way to the floor to reach a
 * sunken pellet, but still won't rise above its band ceiling.
 */
export function chaseClamp(species: FishSpecies, bottom: number): number {
    return clampRange(bottom, TANK_FLOOR, bandFor(species)[1]);
}

/**
 * A floor-dweller has a zero-height band (the crab): it stays on the sand
 * and pursues food horizontally instead of swimming up to it.
 */
export function isFloorDweller(species: FishSpecies): boolean {
    const [min, max] = bandFor(species);
    return min === max;
}
