import * as vscode from 'vscode';

// Minimal subset of the vscode.git API that we rely on.
interface GitRepository {
    state: {
        HEAD?: { name?: string; commit?: string };
        onDidChange: (cb: () => void) => vscode.Disposable;
    };
    rootUri: vscode.Uri;
}

interface GitApi {
    repositories: GitRepository[];
    onDidOpenRepository: (
        cb: (repo: GitRepository) => void,
    ) => vscode.Disposable;
}

interface GitExtensionExports {
    getAPI(version: 1): GitApi;
}

/**
 * Wraps the bundled `vscode.git` extension and emits an event on each
 * new commit observed across any open repository.
 */
export class GitWatcher {
    private listeners: Array<() => void> = [];
    private lastHead: Map<string, { commit: string; branch?: string }> =
        new Map();
    private disposables: vscode.Disposable[] = [];
    private started = false;

    public onCommit(cb: () => void): vscode.Disposable {
        this.listeners.push(cb);
        return {
            dispose: () => {
                this.listeners = this.listeners.filter((l) => l !== cb);
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
                'Code Aquarium: vscode.git extension not available; commit hatches disabled.',
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
        api.repositories.forEach((repo) => this.watchRepo(repo));
    }

    private watchRepo(repo: GitRepository): void {
        const id = repo.rootUri.toString();
        this.disposables.push(
            repo.state.onDidChange(() => {
                const head = repo.state.HEAD?.commit;
                const branch = repo.state.HEAD?.name;
                const prev = this.lastHead.get(id);
                // Treat it as a commit only when the SHA advanced while we
                // stayed on the same branch. Branch switches and checkouts
                // also move HEAD but should not hatch a fish.
                if (
                    head &&
                    prev &&
                    head !== prev.commit &&
                    branch === prev.branch
                ) {
                    this.listeners.forEach((cb) => cb());
                }
                if (head) {
                    this.lastHead.set(id, { commit: head, branch });
                }
            }),
        );
        const head = repo.state.HEAD?.commit;
        if (head) {
            this.lastHead.set(id, {
                commit: head,
                branch: repo.state.HEAD?.name,
            });
        }
    }

    public dispose(): void {
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
        this.listeners = [];
        this.lastHead.clear();
    }
}
