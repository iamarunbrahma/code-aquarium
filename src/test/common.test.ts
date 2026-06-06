import * as assert from 'assert';
import {
    ALL_SPECIES,
    FishColor,
    FishSpecies,
    availableColorsForSpecies,
    normalizeColor,
} from '../common/types';
import { namesFor, randomName, uniqueName, uniquify } from '../common/names';

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

describe('uniquify', () => {
    it('returns the base name when it is free', () => {
        assert.strictEqual(uniquify('Nemo', []), 'Nemo');
        assert.strictEqual(uniquify('Nemo', ['Goldie']), 'Nemo');
    });

    it('appends the lowest free numeric suffix on collision', () => {
        assert.strictEqual(uniquify('Nemo', ['Nemo']), 'Nemo 2');
        assert.strictEqual(uniquify('Nemo', ['Nemo', 'Nemo 2']), 'Nemo 3');
    });
});

describe('uniqueName', () => {
    it('returns a free name from the species pool when one is available', () => {
        const pool = namesFor(FishSpecies.goldfish);
        // Take every pool name except the first, so it is the only one free.
        const name = uniqueName(FishSpecies.goldfish, pool.slice(1));
        assert.strictEqual(name, pool[0]);
    });

    it('appends a numeric suffix only when the whole species pool is taken', () => {
        const pool = namesFor(FishSpecies.goldfish);
        const name = uniqueName(FishSpecies.goldfish, pool);
        assert.ok(name.length > 0);
        assert.ok(/ \d+$/.test(name));
    });
});

describe('name pools', () => {
    it('have no duplicates and cover the maximum tank size', () => {
        // Each pool must hold at least `maxFish` maximum (50) distinct names so
        // even an all-one-species tank gets a real same-species name without
        // borrowing from other species or appending a numeric suffix.
        for (const species of ALL_SPECIES) {
            const pool = namesFor(species);
            assert.strictEqual(
                new Set(pool).size,
                pool.length,
                `${species} pool has duplicate names`,
            );
            assert.ok(
                pool.length >= 50,
                `${species} pool has only ${pool.length} names`,
            );
        }
    });
});
