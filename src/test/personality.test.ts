import * as assert from 'assert';
import {
    FishTrait,
    ambientLine,
    traitForName,
    traitSpeedMultiplier,
} from '../panel/personality';

const ALL_TRAITS = [
    FishTrait.zoomy,
    FishTrait.lazy,
    FishTrait.shy,
    FishTrait.foodie,
    FishTrait.chatty,
];

describe('personality', () => {
    it('derives a stable trait from a name', () => {
        assert.strictEqual(traitForName('Bubbles'), traitForName('Bubbles'));
    });

    it('maps any name to one of the known traits', () => {
        for (const name of ['Nemo', 'Bruce', 'Goldie', 'Inky', 'Spike', 'Z']) {
            assert.ok(ALL_TRAITS.includes(traitForName(name)));
        }
    });

    it('a zoomy fish swims faster than a lazy one', () => {
        assert.ok(
            traitSpeedMultiplier(FishTrait.zoomy) >
                traitSpeedMultiplier(FishTrait.lazy),
        );
    });

    it('returns a non-empty ambient line for any trait, day or night', () => {
        for (const t of ALL_TRAITS) {
            assert.ok(ambientLine(t, false).length > 0);
            assert.ok(ambientLine(t, true).length > 0);
        }
    });
});
