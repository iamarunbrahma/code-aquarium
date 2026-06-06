import * as assert from 'assert';
import { ACHIEVEMENTS } from '../extension/achievementDefs';
import { ITankStats } from '../common/types';
import type { FishSpecification } from '../extension/persistence';

const SEVEN_DAYS = 7 * 24 * 36000;

function zero(): ITankStats {
    return {
        totalSaves: 0,
        totalCommits: 0,
        totalCommitHatches: 0,
        totalPushes: 0,
        totalBranchesPublished: 0,
        totalDebugSessions: 0,
        totalTasksPassed: 0,
        totalTasksFailed: 0,
    };
}

// Duck-typed fish; the checks only read length/species/age.
const fish = (n: number, species = 'goldfish', age = 0): FishSpecification[] =>
    Array.from(
        { length: n },
        () => ({ species, age } as unknown as FishSpecification),
    );

interface Case {
    stats?: Partial<ITankStats>;
    fish?: FishSpecification[];
}

// id -> the exact input that should unlock it. A Map keeps the kebab-case
// achievement ids as plain string keys (no naming-convention noise).
const cases = new Map<string, Case>([
    ['first-splash', { fish: fish(1) }],
    ['schools-in', { fish: fish(5) }],
    ['feeder', { stats: { totalSaves: 50 } }],
    ['centurion', { stats: { totalSaves: 100 } }],
    ['commit-hatch', { stats: { totalCommitHatches: 1 } }],
    ['old-timer', { fish: fish(1, 'goldfish', SEVEN_DAYS + 1) }],
    [
        'diverse',
        {
            fish: [
                { species: 'goldfish' },
                { species: 'tropical' },
                { species: 'shark' },
            ] as unknown as FishSpecification[],
        },
    ],
    ['apex', { fish: fish(1, 'shark') }],
    ['octogarden', { fish: fish(1, 'octopus') }],
    ['committed', { stats: { totalCommits: 50 } }],
    ['century-commits', { stats: { totalCommits: 100 } }],
    ['liftoff', { stats: { totalPushes: 1 } }],
    ['shipping-it', { stats: { totalPushes: 25 } }],
    ['branch-out', { stats: { totalBranchesPublished: 1 } }],
    ['keyboard-warrior', { stats: { totalSaves: 250 } }],
    ['save-scummer', { stats: { totalSaves: 500 } }],
    ['prolific', { stats: { totalCommits: 250 } }],
    ['commit-legend', { stats: { totalCommits: 500 } }],
    ['hatchery', { stats: { totalCommitHatches: 10 } }],
    ['deploy-machine', { stats: { totalPushes: 100 } }],
    ['branch-manager', { stats: { totalBranchesPublished: 10 } }],
    ['debugger', { stats: { totalDebugSessions: 1 } }],
    ['bug-hunter', { stats: { totalDebugSessions: 25 } }],
    ['exterminator', { stats: { totalDebugSessions: 100 } }],
    ['it-compiles', { stats: { totalTasksPassed: 1 } }],
    ['all-green', { stats: { totalTasksPassed: 50 } }],
    ['embrace-failure', { stats: { totalTasksFailed: 1 } }],
]);

describe('achievements', () => {
    it('defines 27 achievements with unique ids', () => {
        assert.strictEqual(ACHIEVEMENTS.length, 27);
        assert.strictEqual(
            new Set(ACHIEVEMENTS.map((a) => a.id)).size,
            ACHIEVEMENTS.length,
        );
    });

    for (const a of ACHIEVEMENTS) {
        it(`${a.id}: fires with its input, silent at baseline`, () => {
            const c = cases.get(a.id);
            if (!c) {
                throw new Error(`no test case defined for "${a.id}"`);
            }
            const stats = { ...zero(), ...(c.stats || {}) };
            const fishArr = c.fish || [];

            assert.strictEqual(a.check(stats, fishArr), true, 'should fire');
            assert.strictEqual(
                a.check(zero(), []),
                false,
                'should be silent at baseline',
            );

            // Boundary check for single-field numeric thresholds.
            const keys = Object.keys(c.stats || {}) as (keyof ITankStats)[];
            if (keys.length === 1 && !c.fish) {
                const k = keys[0];
                const v = (c.stats as ITankStats)[k];
                if (v > 1) {
                    assert.strictEqual(
                        a.check({ ...zero(), [k]: v - 1 }, []),
                        false,
                        `should stay locked just below the ${k} threshold`,
                    );
                }
            }
        });
    }
});
