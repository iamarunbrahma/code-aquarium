import * as assert from 'assert';
import {
    SWIM_CEILING,
    TANK_FLOOR,
    bandFor,
    chaseClamp,
    isFloorDweller,
    roamClamp,
} from '../panel/movement';
import { FishSpecies } from '../common/types';

describe('vertical bands', () => {
    it('pins the crab to the floor (zero-height band)', () => {
        assert.deepStrictEqual(bandFor(FishSpecies.crab), [
            TANK_FLOOR,
            TANK_FLOOR,
        ]);
        assert.strictEqual(isFloorDweller(FishSpecies.crab), true);
        assert.strictEqual(roamClamp(FishSpecies.crab, 80), TANK_FLOOR);
    });

    it('treats swimming species as non-floor-dwellers', () => {
        assert.strictEqual(isFloorDweller(FishSpecies.shark), false);
        assert.strictEqual(isFloorDweller(FishSpecies.goldfish), false);
    });

    it('roamClamp keeps a fish within its band', () => {
        const [min, max] = bandFor(FishSpecies.shark);
        assert.strictEqual(roamClamp(FishSpecies.shark, 0), min);
        assert.strictEqual(roamClamp(FishSpecies.shark, 100), max);
        const mid = (min + max) / 2;
        assert.strictEqual(roamClamp(FishSpecies.shark, mid), mid);
    });

    it('chaseClamp lets a fish dive to the floor but not above its ceiling', () => {
        const ceiling = bandFor(FishSpecies.shark)[1];
        assert.strictEqual(chaseClamp(FishSpecies.shark, 0), TANK_FLOOR);
        assert.strictEqual(chaseClamp(FishSpecies.shark, 100), ceiling);
    });

    it('layers species by depth: octopus lower than shark, shark below tropical', () => {
        assert.ok(
            bandFor(FishSpecies.octopus)[1] < bandFor(FishSpecies.shark)[1],
        );
        assert.ok(
            bandFor(FishSpecies.shark)[0] < bandFor(FishSpecies.tropical)[0],
        );
    });

    it('falls back to the full swim range for an unknown species', () => {
        const band = bandFor('mystery' as unknown as FishSpecies);
        assert.deepStrictEqual(band, [TANK_FLOOR, SWIM_CEILING]);
    });
});
