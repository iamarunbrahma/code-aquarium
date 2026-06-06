import * as vscode from 'vscode';
import { HeadSnapshot, shouldFirePush } from './pushDetection';

// Minimal subset of the vscode.git API that we rely on.
interface GitBranch {
    name?: string;
    commit?: string;
    ahead?: number;
}

interface GitRepository {
    state: {
        HEAD?: GitBranch;
        onDidChange: (cb: () => void) => vscode.Disposable;
    };
    rootUri: vscode.Uri;
}

interface PublishEvent {
    repository: GitRepository;
    branch?: string;
}

interface GitApi {
    repositories: GitRepository[];
    onDidOpenRepository: (
        cb: (repo: GitRepository) => void,
    ) => vscode.Disposable;
    onDidPublish?: (cb: (e: PublishEvent) => void) => vscode.Disposable;
}

interface GitExtensionExports {
    getAPI(version: 1): GitApi;
}

/**
 * Wraps the bundled `vscode.git` extension and emits events for the local
 * git milestones the tank reacts to: new commits, pushes, and branch
 * publishes. Push detection is best effort — the API has no push event and
 * `onDidChange` carries no payload, so a push is inferred when the branch's
 * "ahead" count collapses to 0 (see pushDetection.ts).
 */
export class GitWatcher {
    private commitListeners: Array<() => void> = [];
    private pushListeners: Array<(branch?: string) => void> = [];
    private publishListeners: Array<(branch?: string) => void> = [];
    private lastHead: Map<string, HeadSnapshot> = new Map();
    private disposables: vscode.Disposable[] = [];
    private started = false;

    public onCommit(cb: () => void): vscode.Disposable {
        this.commitListeners.push(cb);
        return {
            dispose: () => {
                this.commitListeners = this.commitListeners.filter(
                    (l) => l !== cb,
                );
            },
        };
    }

    public onPush(cb: (branch?: string) => void): vscode.Disposable {
        this.pushListeners.push(cb);
        return {
            dispose: () => {
                this.pushListeners = this.pushListeners.filter((l) => l !== cb);
            },
        };
    }

    public onPublish(cb: (branch?: string) => void): vscode.Disposable {
        this.publishListeners.push(cb);
        return {
            dispose: () => {
                this.publishListeners = this.publishListeners.filter(
                    (l) => l !== cb,
                );
            },
        };
    }

    public async start(): Promise<void> {
        if (this.started) {
            return;
        }
        this.started = true;
        const ext =
            vscode.extensions.getExtension<GitExtensionExports>('vscode.git');
        if (!ext) {
            console.warn(
                'Code Aquarium: vscode.git extension not available; commit/push reactions disabled.',
            );
            return;
        }
        const exports = ext.isActive ? ext.exports : await ext.activate();
        let api: GitApi;
        try {
            api = exports.getAPI(1);
        } catch (e) {
            console.warn('Code Aquarium: git getAPI(1) failed', e);
            return;
        }
        this.disposables.push(
            api.onDidOpenRepository((repo) => this.watchRepo(repo)),
        );
        // A branch publish (first push of a new branch) has a dedicated event.
        if (api.onDidPublish) {
            this.disposables.push(
                api.onDidPublish((e) => {
                    this.publishListeners.forEach((cb) => cb(e.branch));
                }),
            );
        }
        api.repositories.forEach((repo) => this.watchRepo(repo));
    }

    private watchRepo(repo: GitRepository): void {
        const id = repo.rootUri.toString();
        const snapshot = (): HeadSnapshot => ({
            commit: repo.state.HEAD?.commit,
            branch: repo.state.HEAD?.name,
            ahead: repo.state.HEAD?.ahead,
        });
        this.disposables.push(
            repo.state.onDidChange(() => {
                const next = snapshot();
                const prev = this.lastHead.get(id);
                // Commit: the SHA advanced while we stayed on the same branch.
                // Branch switches and checkouts also move HEAD but must not
                // hatch a fish.
                if (
                    next.commit &&
                    prev &&
                    next.commit !== prev.commit &&
                    next.branch === prev.branch
                ) {
                    this.commitListeners.forEach((cb) => cb());
                }
                // Push: the ahead count collapsed to 0 on the same branch.
                if (prev && shouldFirePush(prev, next)) {
                    this.pushListeners.forEach((cb) => cb(next.branch));
                }
                if (next.commit) {
                    this.lastHead.set(id, next);
                }
            }),
        );
        const initial = snapshot();
        if (initial.commit) {
            this.lastHead.set(id, initial);
        }
    }

    public dispose(): void {
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
        this.commitListeners = [];
        this.pushListeners = [];
        this.publishListeners = [];
        this.lastHead.clear();
    }
}
