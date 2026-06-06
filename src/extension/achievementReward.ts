// Pure decision for what an achievement unlock does in the tank.
export type RewardAction = 'hatch' | 'celebrate';

/**
 * Hatch a reward fish when there is room, otherwise just celebrate with a
 * sparkle so the population cap (maxFish) is never exceeded.
 */
export function rewardAction(
    currentFishCount: number,
    maxFish: number,
): RewardAction {
    return currentFishCount < maxFish ? 'hatch' : 'celebrate';
}
