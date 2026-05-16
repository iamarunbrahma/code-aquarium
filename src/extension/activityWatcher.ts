import * as vscode from 'vscode';
import { ALL_SPECIES, FishColor, FishSize, ITankStats } from '../common/types';
import { AchievementTracker } from './achievements';
import { GitWatcher } from './gitWatcher';
import {
    FishSpecification,
    storeCollectionAsMemento,
    writeStats,
} from './persistence';
import { IAquariumPanel } from './AquariumWebviewContainer';
import {
    getCommitsPerHatch,
    getErrorTintThreshold,
    getErrorsTintWater,
    getIdleTimeoutMinutes,
    getMaxFish,
    getReactToCoding,
} from './utils';

export interface ActivityWatcherOptions {
    context: vscode.ExtensionContext;
    panel: () => IAquariumPanel | undefined;
    git: GitWatcher;
    achievements: AchievementTracker;
    stats: ITankStats;
    // Getter — never capture the array by reference, because the
    // release-fish and release-all flows reassign the module-level
    // collection.
    getCollection: () => FishSpecification[];
    setCollection: (next: FishSpecification[]) => void;
    defaultSize: () => FishSize;
}

/**
 * Bridges VS Code activity events (saves, commits, idle, diagnostics)
 * into webview messages so the tank reacts to your coding session.
 */
export class ActivityWatcher {
    private idleTimer: NodeJS.Timeout | undefined;
    private storm = false;
    private lightsDimmed = false;
    private lastActivity: number = Date.now();
    private pendingHatches = 0;
    private disposables: vscode.Disposable[] = [];

    constructor(private opts: ActivityWatcherOptions) {}

    public start(): void {
        const { context, git } = this.opts;
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument(() => this.onSave()),
        );
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(() => this.bumpActivity()),
        );
        this.disposables.push(
            vscode.window.onDidChangeWindowState((s) => {
                if (s.focused) {
                    this.bumpActivity();
                }
            }),
        );
        this.disposables.push(
            vscode.languages.onDidChangeDiagnostics(() => this.onDiagnostics()),
        );
        this.disposables.push(git.onCommit(() => void this.onCommit()));
        this.idleTimer = setInterval(() => this.checkIdle(), 30_000);
        // Register disposables so VS Code unwinds them on deactivation.
        context.subscriptions.push({ dispose: () => this.dispose() });
    }

    private isEnabled(): boolean {
        return getReactToCoding();
    }

    private async onSave(): Promise<void> {
        if (!this.isEnabled()) {
            return;
        }
        this.opts.stats.totalSaves += 1;
        await writeStats(this.opts.context, this.opts.stats);
        const panel = this.opts.panel();
        if (panel) {
            panel.feed(1);
        }
        await this.opts.achievements.checkAndUnlock(
            this.opts.stats,
            this.opts.getCollection(),
        );
    }

    private async onCommit(): Promise<void> {
        if (!this.isEnabled()) {
            return;
        }
        this.opts.stats.totalCommits += 1;
        this.pendingHatches += 1;
        const perHatch = getCommitsPerHatch();
        let hatched = 0;
        const collection = this.opts.getCollection();
        while (this.pendingHatches >= perHatch) {
            this.pendingHatches -= perHatch;
            if (collection.length >= getMaxFish()) {
                break;
            }
            const spec = randomSpec(this.opts.defaultSize());
            collection.push(spec);
            this.opts.stats.totalCommitHatches += 1;
            hatched += 1;
            const panel = this.opts.panel();
            if (panel) {
                panel.hatchFish(spec);
            }
        }
        await writeStats(this.opts.context, this.opts.stats);
        if (hatched > 0) {
            // Re-read in case release flows ran concurrently. The mutation
            // above is on the freshly fetched array; persist that exact one.
            this.opts.setCollection(collection);
            await storeCollectionAsMemento(this.opts.context, collection);
            await this.opts.achievements.checkAndUnlock(
                this.opts.stats,
                collection,
            );
        }
    }

    private onDiagnostics(): void {
        if (!this.isEnabled() || !getErrorsTintWater()) {
            if (this.storm) {
                this.storm = false;
                this.opts.panel()?.setStorm(false);
            }
            return;
        }
        let errorCount = 0;
        for (const [, diagnostics] of vscode.languages.getDiagnostics()) {
            for (const d of diagnostics) {
                if (d.severity === vscode.DiagnosticSeverity.Error) {
                    errorCount += 1;
                }
            }
        }
        const threshold = getErrorTintThreshold();
        const shouldStorm = errorCount >= threshold;
        if (shouldStorm !== this.storm) {
            this.storm = shouldStorm;
            this.opts.panel()?.setStorm(shouldStorm);
        }
    }

    private checkIdle(): void {
        if (!this.isEnabled()) {
            return;
        }
        const minutes = getIdleTimeoutMinutes();
        if (minutes <= 0) {
            if (this.lightsDimmed) {
                this.lightsDimmed = false;
                this.opts.panel()?.setLightLevel('on');
            }
            return;
        }
        const idleMs = Date.now() - this.lastActivity;
        const limitMs = minutes * 60_000;
        const shouldDim = idleMs >= limitMs;
        if (shouldDim !== this.lightsDimmed) {
            this.lightsDimmed = shouldDim;
            this.opts.panel()?.setLightLevel(shouldDim ? 'dim' : 'on');
        }
    }

    private bumpActivity(): void {
        this.lastActivity = Date.now();
        if (this.lightsDimmed) {
            this.lightsDimmed = false;
            this.opts.panel()?.setLightLevel('on');
        }
    }

    public dispose(): void {
        if (this.idleTimer) {
            clearInterval(this.idleTimer);
            this.idleTimer = undefined;
        }
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
    }
}

function randomSpec(size: FishSize): FishSpecification {
    const species = ALL_SPECIES[Math.floor(Math.random() * ALL_SPECIES.length)];
    const colors = [
        FishColor.orange,
        FishColor.white,
        FishColor.blue,
        FishColor.yellow,
        FishColor.red,
        FishColor.pink,
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return new FishSpecification(species, color, size);
}
