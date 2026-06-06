import * as assert from 'assert';
import {
    ALL_SPECIES,
    FishColor,
    FishSpecies,
    availableColorsForSpecies,
    normalizeColor,
} from '../common/types';
import { randomName } from '../common/names';

describe('availableColorsForSpecies', () => {
    it('returns the species-specific palette', () => {
        const shark = availableColorsForSpecies(FishSpecies.shark);
        assert.ok(shark.includes(FishColor.gray));
        assert.ok(!shark.includes(FishColor.pink));
    });
});

describe('normalizeColor', () => {
    it('keeps a colour that is valid for the species', () => {
        assert.strictEqual(
            normalizeColor(FishColor.gray, FishSpecies.shark),
            FishColor.gray,
        );
    });

    it('falls back to a valid colour for an invalid one', () => {
        const c = normalizeColor(FishColor.pink, FishSpecies.shark);
        assert.notStrictEqual(c, FishColor.pink);
        assert.ok(availableColorsForSpecies(FishSpecies.shark).includes(c));
    });
});

describe('randomName', () => {
    it('returns a non-empty name for every species', () => {
        for (const species of ALL_SPECIES) {
            const name = randomName(species);
            assert.strictEqual(typeof name, 'string');
            assert.ok(name.length > 0);
        }
    });
});
