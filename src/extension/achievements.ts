import * as vscode from 'vscode';
import { ITankStats } from '../common/types';
import { FishSpecification, KEY_ACHIEVEMENTS } from './persistence';
import { ACHIEVEMENTS, Achievement } from './achievementDefs';
import { notify } from './notifier';
import { formatAchievementMessage } from './notifyFormat';

export { ACHIEVEMENTS, type Achievement } from './achievementDefs';

/** Fired once per newly unlocked achievement (e.g. to hatch a reward fish). */
export type AchievementReward = () => void | Promise<void>;

export class AchievementTracker {
    private unlocked: Set<string>;
    private reward?: AchievementReward;

    constructor(private context: vscode.ExtensionContext) {
        this.unlocked = new Set(
            context.globalState.get<string[]>(KEY_ACHIEVEMENTS, []),
        );
    }

    public setRewardHandler(reward: AchievementReward): void {
        this.reward = reward;
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
            // Routed through notify() so unlock toasts obey the opt-in
            // (codeAquarium.notifications.enabled).
            notify(
                formatAchievementMessage(
                    vscode.l10n.t('Achievement unlocked'),
                    a.emoji,
                    a.title,
                    a.description,
                ),
            );
            // In-tank reward (hatch a fish), independent of the toast opt-in.
            if (this.reward) {
                await this.reward();
            }
        }
        return newlyUnlocked;
    }
}
