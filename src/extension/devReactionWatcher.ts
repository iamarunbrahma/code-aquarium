import * as vscode from 'vscode';
import { ITankStats } from '../common/types';
import { AchievementTracker } from './achievements';
import { FishSpecification, writeStats } from './persistence';
import { IAquariumPanel } from './AquariumWebviewContainer';
import { notify } from './notifier';
import { getReactToCoding } from './utils';

export interface DevReactionOptions {
    context: vscode.ExtensionContext;
    panel: () => IAquariumPanel | undefined;
    achievements: AchievementTracker;
    stats: ITankStats;
    getCollection: () => FishSpecification[];
}

/**
 * Makes the tank react to debugging and build/test runs, and counts those
 * events so they can drive achievements: fish perk up when a debug session
 * starts and celebrate when it ends, a finished task sparkles on success or
 * stirs up a brief storm on failure. All gated by `reactToCoding`; toasts
 * only appear when notifications are opted in.
 */
export class DevReactionWatcher {
    private disposables: vscode.Disposable[] = [];
    private stormTimer: NodeJS.Timeout | undefined;

    constructor(private opts: DevReactionOptions) {}

    public start(): void {
        this.disposables.push(
            vscode.debug.onDidStartDebugSession(() => void this.onDebugStart()),
        );
        this.disposables.push(
            vscode.debug.onDidTerminateDebugSession(() => this.onDebugEnd()),
        );
        this.disposables.push(
            vscode.tasks.onDidEndTaskProcess((e) => void this.onTaskEnd(e)),
        );
        this.opts.context.subscriptions.push({ dispose: () => this.dispose() });
    }

    private isEnabled(): boolean {
        return getReactToCoding();
    }

    private async checkAchievements(): Promise<void> {
        await writeStats(this.opts.context, this.opts.stats);
        await this.opts.achievements.checkAndUnlock(
            this.opts.stats,
            this.opts.getCollection(),
        );
    }

    private async onDebugStart(): Promise<void> {
        if (!this.isEnabled()) {
            return;
        }
        this.opts.stats.totalDebugSessions += 1;
        this.opts.panel()?.startle();
        await this.checkAchievements();
    }

    private onDebugEnd(): void {
        if (!this.isEnabled()) {
            return;
        }
        this.opts.panel()?.celebrate();
    }

    private async onTaskEnd(e: vscode.TaskProcessEndEvent): Promise<void> {
        if (!this.isEnabled()) {
            return;
        }
        // A cancelled or terminated task has no exit code; ignore it so it
        // counts as neither a pass nor a failure.
        if (typeof e.exitCode !== 'number') {
            return;
        }
        const name = e.execution.task.name;
        if (e.exitCode === 0) {
            this.opts.stats.totalTasksPassed += 1;
            this.opts.panel()?.celebrate();
            notify(vscode.l10n.t('Task passed: {0}', name));
        } else {
            this.opts.stats.totalTasksFailed += 1;
            this.flashStorm();
            notify(vscode.l10n.t('Task failed: {0}', name));
        }
        await this.checkAchievements();
    }

    // A short storm that clears itself, so a failed run is felt without
    // leaving the tank permanently gloomy.
    private flashStorm(): void {
        const panel = this.opts.panel();
        if (!panel) {
            return;
        }
        panel.setStorm(true);
        if (this.stormTimer) {
            clearTimeout(this.stormTimer);
        }
        this.stormTimer = setTimeout(() => {
            this.opts.panel()?.setStorm(false);
            this.stormTimer = undefined;
        }, 4000);
    }

    public dispose(): void {
        if (this.stormTimer) {
            clearTimeout(this.stormTimer);
            this.stormTimer = undefined;
        }
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
    }
}
