import * as vscode from 'vscode';
import { FishSpecies, ITankStats } from '../common/types';
import { FishSpecification, KEY_ACHIEVEMENTS } from './persistence';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    emoji: string;
    check: (stats: ITankStats, fish: FishSpecification[]) => boolean;
}

// One tick = 100 ms. 7 days in ticks = 7 * 24 * 36000.
const SEVEN_DAYS_TICKS = 7 * 24 * 36000;

export const ACHIEVEMENTS: ReadonlyArray<Achievement> = [
    {
        id: 'first-splash',
        title: 'First Splash',
        emoji: '\uD83D\uDCA6',
        description: 'Add your first fish',
        check: (_s, f) => f.length >= 1,
    },
    {
        id: 'schools-in',
        title: "School's In",
        emoji: '\uD83D\uDC1F',
        description: 'Have 5 fish in the tank at once',
        check: (_s, f) => f.length >= 5,
    },
    {
        id: 'feeder',
        title: 'Feeder Frenzy',
        emoji: '\uD83C\uDF64',
        description: 'Save files 50 times',
        check: (s) => s.totalSaves >= 50,
    },
    {
        id: 'centurion',
        title: 'Centurion',
        emoji: '\uD83D\uDCAF',
        description: 'Save files 100 times',
        check: (s) => s.totalSaves >= 100,
    },
    {
        id: 'commit-hatch',
        title: 'Commit Hatcher',
        emoji: '\uD83E\uDD5A',
        description: 'Hatch a fish via git commit',
        check: (s) => s.totalCommitHatches >= 1,
    },
    {
        id: 'old-timer',
        title: 'Old Timer',
        emoji: '\u23F3',
        description: 'Keep a fish alive 7 days',
        check: (_s, f) => f.some((x) => x.age > SEVEN_DAYS_TICKS),
    },
    {
        id: 'diverse',
        title: 'Diverse Tank',
        emoji: '\uD83C\uDF08',
        description: 'Three different species at once',
        check: (_s, f) => new Set(f.map((x) => x.species)).size >= 3,
    },
    {
        id: 'apex',
        title: 'Apex Predator',
        emoji: '\uD83E\uDD88',
        description: 'Own a shark',
        check: (_s, f) => f.some((x) => x.species === FishSpecies.shark),
    },
    {
        id: 'octogarden',
        title: 'Octogarden',
        emoji: '\uD83D\uDC19',
        description: 'Own an octopus',
        check: (_s, f) => f.some((x) => x.species === FishSpecies.octopus),
    },
];

export class AchievementTracker {
    private unlocked: Set<string>;

    constructor(private context: vscode.ExtensionContext) {
        this.unlocked = new Set(
            context.globalState.get<string[]>(KEY_ACHIEVEMENTS, []),
        );
    }

    public isUnlocked(id: string): boolean {
        return this.unlocked.has(id);
    }

    public async checkAndUnlock(
        stats: ITankStats,
        fish: FishSpecification[],
    ): Promise<Achievement[]> {
        const newlyUnlocked: Achievement[] = [];
        for (const a of ACHIEVEMENTS) {
            if (!this.unlocked.has(a.id) && a.check(stats, fish)) {
                this.unlocked.add(a.id);
                newlyUnlocked.push(a);
            }
        }
        if (newlyUnlocked.length === 0) {
            return [];
        }
        await this.context.globalState.update(
            KEY_ACHIEVEMENTS,
            Array.from(this.unlocked),
        );
        for (const a of newlyUnlocked) {
            void vscode.window.showInformationMessage(
                `${a.emoji} ${vscode.l10n.t('Achievement unlocked')}: ${
                    a.title
                } \u2014 ${a.description}`,
            );
        }
        return newlyUnlocked;
    }
}
