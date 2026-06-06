import * as vscode from 'vscode';
import {
    FishColor,
    FishSize,
    FishSpecies,
    ITankStats,
    normalizeColor,
} from '../common/types';
import { randomName } from '../common/names';
import { DEFAULT_COLOR, DEFAULT_SPECIES } from './utils';

const KEY_BASE = 'codeAquarium.fish';
const KEY_SPECIES = `${KEY_BASE}.species`;
const KEY_COLORS = `${KEY_BASE}.colors`;
const KEY_NAMES = `${KEY_BASE}.names`;
const KEY_HUNGER = `${KEY_BASE}.hunger`;
const KEY_HAPPINESS = `${KEY_BASE}.happiness`;
const KEY_ENERGY = `${KEY_BASE}.energy`;
const KEY_AGE = `${KEY_BASE}.age`;

const KEY_STATS_BASE = 'codeAquarium.stats';
const KEY_STAT_SAVES = `${KEY_STATS_BASE}.totalSaves`;
const KEY_STAT_COMMITS = `${KEY_STATS_BASE}.totalCommits`;
const KEY_STAT_HATCHES = `${KEY_STATS_BASE}.totalCommitHatches`;
const KEY_STAT_PUSHES = `${KEY_STATS_BASE}.totalPushes`;
const KEY_STAT_PUBLISHES = `${KEY_STATS_BASE}.totalBranchesPublished`;
const KEY_STAT_DEBUG = `${KEY_STATS_BASE}.totalDebugSessions`;
const KEY_STAT_TASKS_PASSED = `${KEY_STATS_BASE}.totalTasksPassed`;
const KEY_STAT_TASKS_FAILED = `${KEY_STATS_BASE}.totalTasksFailed`;

export const KEY_ACHIEVEMENTS = 'codeAquarium.achievements';

export class FishSpecification {
    /**
     * Optional spawn-position hint, expressed as % of tank width/height
     * from the left/bottom. Transient — not persisted via the memento.
     * Used only on first-run seeding so starter fish appear at
     * predictable positions instead of falling behind decorations.
     */
    public initialLeft?: number;
    public initialBottom?: number;

    constructor(
        public species: FishSpecies,
        public color: FishColor,
        public size: FishSize,
        public name: string = randomName(species),
        public hunger: number = 80,
        public happiness: number = 80,
        public energy: number = 80,
        public age: number = 0,
    ) {
        this.color = normalizeColor(color, species);
    }

    static collectionFromMemento(
        context: vscode.ExtensionContext,
        size: FishSize,
    ): FishSpecification[] {
        const species = context.globalState.get<FishSpecies[]>(KEY_SPECIES, []);
        const colors = context.globalState.get<FishColor[]>(KEY_COLORS, []);
        const names = context.globalState.get<string[]>(KEY_NAMES, []);
        const hunger = context.globalState.get<number[]>(KEY_HUNGER, []);
        const happiness = context.globalState.get<number[]>(KEY_HAPPINESS, []);
        const energy = context.globalState.get<number[]>(KEY_ENERGY, []);
        const age = context.globalState.get<number[]>(KEY_AGE, []);

        // Identity arrays (species/colors/names) sync across machines; the
        // stat arrays do not. After a sync the local stat arrays can
        // describe a different fish population, so they are only trusted
        // when their lengths still line up with the identity count —
        // otherwise stats positionally belong to the wrong fish.
        const count = species.length;
        const statsAligned =
            hunger.length === count &&
            happiness.length === count &&
            energy.length === count &&
            age.length === count;

        const result: FishSpecification[] = [];
        for (let i = 0; i < count; i++) {
            result.push(
                new FishSpecification(
                    species[i] ?? DEFAULT_SPECIES,
                    colors[i] ?? DEFAULT_COLOR,
                    size,
                    names[i],
                    statsAligned ? hunger[i] : 80,
                    statsAligned ? happiness[i] : 80,
                    statsAligned ? energy[i] : 80,
                    statsAligned ? age[i] : 0,
                ),
            );
        }
        return result;
    }
}

export async function storeCollectionAsMemento(
    context: vscode.ExtensionContext,
    collection: FishSpecification[],
): Promise<void> {
    const species = collection.map((f) => f.species);
    const colors = collection.map((f) => f.color);
    const names = collection.map((f) => f.name);
    const hunger = collection.map((f) => f.hunger);
    const happiness = collection.map((f) => f.happiness);
    const energy = collection.map((f) => f.energy);
    const age = collection.map((f) => f.age);
    await context.globalState.update(KEY_SPECIES, species);
    await context.globalState.update(KEY_COLORS, colors);
    await context.globalState.update(KEY_NAMES, names);
    await context.globalState.update(KEY_HUNGER, hunger);
    await context.globalState.update(KEY_HAPPINESS, happiness);
    await context.globalState.update(KEY_ENERGY, energy);
    await context.globalState.update(KEY_AGE, age);
    // Only identity arrays sync across machines — stats stay local.
    context.globalState.setKeysForSync([
        KEY_SPECIES,
        KEY_COLORS,
        KEY_NAMES,
        KEY_ACHIEVEMENTS,
    ]);
}

export function readStats(context: vscode.ExtensionContext): ITankStats {
    return {
        totalSaves: context.globalState.get<number>(KEY_STAT_SAVES, 0),
        totalCommits: context.globalState.get<number>(KEY_STAT_COMMITS, 0),
        totalCommitHatches: context.globalState.get<number>(
            KEY_STAT_HATCHES,
            0,
        ),
        totalPushes: context.globalState.get<number>(KEY_STAT_PUSHES, 0),
        totalBranchesPublished: context.globalState.get<number>(
            KEY_STAT_PUBLISHES,
            0,
        ),
        totalDebugSessions: context.globalState.get<number>(KEY_STAT_DEBUG, 0),
        totalTasksPassed: context.globalState.get<number>(
            KEY_STAT_TASKS_PASSED,
            0,
        ),
        totalTasksFailed: context.globalState.get<number>(
            KEY_STAT_TASKS_FAILED,
            0,
        ),
    };
}

export async function writeStats(
    context: vscode.ExtensionContext,
    stats: ITankStats,
): Promise<void> {
    await context.globalState.update(KEY_STAT_SAVES, stats.totalSaves);
    await context.globalState.update(KEY_STAT_COMMITS, stats.totalCommits);
    await context.globalState.update(
        KEY_STAT_HATCHES,
        stats.totalCommitHatches,
    );
    await context.globalState.update(KEY_STAT_PUSHES, stats.totalPushes);
    await context.globalState.update(
        KEY_STAT_PUBLISHES,
        stats.totalBranchesPublished,
    );
    await context.globalState.update(KEY_STAT_DEBUG, stats.totalDebugSessions);
    await context.globalState.update(
        KEY_STAT_TASKS_PASSED,
        stats.totalTasksPassed,
    );
    await context.globalState.update(
        KEY_STAT_TASKS_FAILED,
        stats.totalTasksFailed,
    );
}
