import * as assert from 'assert';
import {
    Exertion,
    Needs,
    decayNeeds,
    exertionForState,
    moodFor,
} from '../panel/needs';
import { FishMood, FishSpecies } from '../common/types';
import { FishTrait } from '../panel/personality';
import { FishState } from '../panel/states';

const base = (): Needs => ({ hunger: 80, energy: 80, happiness: 80 });
const ctx = (
    over: Partial<{
        species: FishSpecies;
        trait: FishTrait;
        exertion: Exertion;
    }> = {},
) => ({
    species: FishSpecies.goldfish,
    trait: FishTrait.chatty,
    exertion: 'idle' as Exertion,
    ...over,
});

describe('decayNeeds', () => {
    it('drains hunger every step', () => {
        assert.ok(decayNeeds(base(), ctx()).hunger < 80);
    });

    it('leaves energy untouched while resting, drains it while active', () => {
        assert.strictEqual(
            decayNeeds(base(), ctx({ exertion: 'rest' })).energy,
            80,
        );
        assert.ok(decayNeeds(base(), ctx({ exertion: 'active' })).energy < 80);
    });

    it('a zoomy fish burns more energy than a lazy one', () => {
        const zoomy = decayNeeds(
            base(),
            ctx({ trait: FishTrait.zoomy, exertion: 'active' }),
        );
        const lazy = decayNeeds(
            base(),
            ctx({ trait: FishTrait.lazy, exertion: 'active' }),
        );
        assert.ok(zoomy.energy < lazy.energy);
    });

    it('a shark gets hungry faster than a goldfish', () => {
        const shark = decayNeeds(base(), ctx({ species: FishSpecies.shark }));
        const gold = decayNeeds(base(), ctx({ species: FishSpecies.goldfish }));
        assert.ok(shark.hunger < gold.hunger);
    });

    it('happiness drifts down when needs are low and rises when met', () => {
        assert.ok(
            decayNeeds({ hunger: 5, energy: 5, happiness: 80 }, ctx())
                .happiness < 80,
        );
        assert.ok(
            decayNeeds(
                { hunger: 100, energy: 100, happiness: 10 },
                ctx({ exertion: 'rest' }),
            ).happiness > 10,
        );
    });

    it('clamps every need to the 0..100 range', () => {
        const n = decayNeeds(
            { hunger: 0, energy: 0, happiness: 0 },
            ctx({ exertion: 'active' }),
        );
        for (const v of [n.hunger, n.energy, n.happiness]) {
            assert.ok(v >= 0 && v <= 100);
        }
    });
});

describe('exertionForState', () => {
    it('maps sleep to rest, swimming to active, and idle to idle', () => {
        assert.strictEqual(exertionForState(FishState.sleep), 'rest');
        assert.strictEqual(exertionForState(FishState.swimRight), 'active');
        assert.strictEqual(exertionForState(FishState.idle), 'idle');
    });
});

describe('moodFor', () => {
    it('is hungry when hunger is very low', () => {
        assert.strictEqual(
            moodFor({ hunger: 10, energy: 80, happiness: 80 }),
            FishMood.hungry,
        );
    });

    it('is tired when energy is very low', () => {
        assert.strictEqual(
            moodFor({ hunger: 80, energy: 10, happiness: 80 }),
            FishMood.tired,
        );
    });

    it('is grumpy when only happiness is low', () => {
        assert.strictEqual(
            moodFor({ hunger: 80, energy: 80, happiness: 10 }),
            FishMood.grumpy,
        );
    });

    it('is happy when all needs are high', () => {
        assert.strictEqual(
            moodFor({ hunger: 90, energy: 90, happiness: 90 }),
            FishMood.happy,
        );
    });

    it('is content in the middle', () => {
        assert.strictEqual(
            moodFor({ hunger: 50, energy: 50, happiness: 50 }),
            FishMood.content,
        );
    });
});
