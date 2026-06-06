import { FishMood, FishSpecies } from '../common/types';
import { FishTrait } from './personality';
import { FishState } from './states';

export interface Needs {
    hunger: number;
    energy: number;
    happiness: number;
}

/** How hard a fish is working, which sets how fast it burns energy. */
export type Exertion = 'rest' | 'idle' | 'active';

// Baseline drains applied per decay step (~10s of tick time). Hunger is the
// primary need; energy is spent by activity and recovered by sleeping.
const BASE_HUNGER_DRAIN = 2;
const ENERGY_ACTIVE_DRAIN = 2;
const ENERGY_IDLE_DRAIN = 0.5;
// How fast happiness chases its wellbeing target each step.
const HAPPINESS_STEP = 3;
// Below this, a need is "critical" and drags wellbeing down extra.
const CRITICAL = 20;

// Bigger fish get hungry faster.
const SPECIES_HUNGER: Record<FishSpecies, number> = {
    [FishSpecies.shark]: 1.6,
    [FishSpecies.octopus]: 1.3,
    [FishSpecies.pufferfish]: 1.1,
    [FishSpecies.crab]: 1,
    [FishSpecies.goldfish]: 1,
    [FishSpecies.tropical]: 1,
};

function traitHungerMultiplier(trait: FishTrait): number {
    return trait === FishTrait.foodie ? 1.4 : 1;
}

function traitEnergyMultiplier(trait: FishTrait): number {
    switch (trait) {
        case FishTrait.lazy:
            return 0.6;
        case FishTrait.zoomy:
            return 1.3;
        default:
            return 1;
    }
}

/** Maps a behaviour state onto how much energy it costs. */
export function exertionForState(state: FishState): Exertion {
    switch (state) {
        case FishState.sleep:
            return 'rest';
        case FishState.swimLeft:
        case FishState.swimRight:
        case FishState.walkLeft:
        case FishState.walkRight:
        case FishState.dart:
        case FishState.chaseFood:
        case FishState.float:
            return 'active';
        default:
            return 'idle';
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function clampMagnitude(value: number, max: number): number {
    return Math.max(-max, Math.min(max, value));
}

/**
 * Advances a fish's needs by one decay step.
 *
 * - Hunger drains steadily, faster for bigger species and foodies, and a
 *   little faster while active.
 * - Energy is spent by activity (a zoomy fish burns more, a lazy one less)
 *   and left untouched while resting, so sleep is what restores it.
 * - Happiness is emergent: it drifts toward a wellbeing target set by how
 *   well hunger and energy are met, so a hungry or exhausted fish grows
 *   unhappy and a fed, rested one thrives. Direct joys (petting, cleaning)
 *   are applied elsewhere on top of this baseline.
 */
export function decayNeeds(
    needs: Needs,
    ctx: { species: FishSpecies; trait: FishTrait; exertion: Exertion },
): Needs {
    const hungerDrain =
        BASE_HUNGER_DRAIN *
        SPECIES_HUNGER[ctx.species] *
        traitHungerMultiplier(ctx.trait) *
        (ctx.exertion === 'active' ? 1.2 : 1);
    const hunger = clamp(needs.hunger - hungerDrain, 0, 100);

    let energyDrain = 0;
    if (ctx.exertion === 'active') {
        energyDrain = ENERGY_ACTIVE_DRAIN * traitEnergyMultiplier(ctx.trait);
    } else if (ctx.exertion === 'idle') {
        energyDrain = ENERGY_IDLE_DRAIN * traitEnergyMultiplier(ctx.trait);
    }
    const energy = clamp(needs.energy - energyDrain, 0, 100);

    let target = 0.5 * hunger + 0.5 * energy;
    if (hunger < CRITICAL || energy < CRITICAL) {
        target = Math.max(0, target - 15);
    }
    const happiness = clamp(
        needs.happiness +
            clampMagnitude(target - needs.happiness, HAPPINESS_STEP),
        0,
        100,
    );

    return { hunger, energy, happiness };
}

/**
 * Derives a fish's mood from its needs: the most pressing unmet need wins,
 * then overall wellbeing decides between happy and content.
 */
export function moodFor(needs: Needs): FishMood {
    const avg = (needs.hunger + needs.happiness + needs.energy) / 3;
    if (needs.hunger < 25) {
        return FishMood.hungry;
    }
    if (needs.energy < 20) {
        return FishMood.tired;
    }
    if (needs.happiness < 30) {
        return FishMood.grumpy;
    }
    if (avg >= 70) {
        return FishMood.happy;
    }
    return FishMood.content;
}
