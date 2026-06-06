import { ALL_SPECIES, FishColor, FishSize } from '../common/types';
import { uniqueName } from '../common/names';
import { FishSpecification } from './persistence';

/**
 * A random fish spec used when the tank hatches one on its own - after
 * commits and as an achievement-unlock reward. `taken` are the names
 * already in the tank, so the new fish gets a name that won't collide.
 */
export function randomFishSpec(
    size: FishSize,
    taken: ReadonlyArray<string> = [],
): FishSpecification {
    const species = ALL_SPECIES[Math.floor(Math.random() * ALL_SPECIES.length)];
    const colors = [
        FishColor.orange,
        FishColor.white,
        FishColor.blue,
        FishColor.yellow,
        FishColor.red,
        FishColor.pink,
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return new FishSpecification(
        species,
        color,
        size,
        uniqueName(species, taken),
    );
}
