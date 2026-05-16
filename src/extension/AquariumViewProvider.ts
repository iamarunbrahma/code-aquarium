import * as vscode from 'vscode';
import { FishColor, FishSize, FishSpecies, TankTheme } from '../common/types';
import { AquariumWebviewContainer } from './AquariumWebviewContainer';
import { WebviewMessageHandler } from './AquariumPanel';
import { getWebviewOptions } from './utils';

/**
 * Sidebar webview provider.
 */
export class AquariumViewProvider
    extends AquariumWebviewContainer
    implements vscode.WebviewViewProvider
{
    public static readonly viewType = 'codeAquariumView';

    private _webviewView?: vscode.WebviewView;
    private _messageHandler?: WebviewMessageHandler;
    private _readyCallbacks: Array<() => void> = [];

    constructor(
        extensionUri: vscode.Uri,
        species: FishSpecies,
        color: FishColor,
        size: FishSize,
        theme: TankTheme,
        disableEffects: boolean,
        reactToCoding: boolean,
        dayNightCycle: boolean,
    ) {
        super(
            extensionUri,
            species,
            color,
            size,
            theme,
            disableEffects,
            reactToCoding,
            dayNightCycle,
        );
    }

    public setMessageHandler(handler: WebviewMessageHandler): void {
        this._messageHandler = handler;
    }

    public resolveWebviewView(webviewView: vscode.WebviewView): void {
        this._webviewView = webviewView;
        webviewView.webview.options = getWebviewOptions(this._extensionUri);
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(
            (msg) => this._messageHandler?.(msg),
            null,
            this._disposables,
        );
        webviewView.onDidDispose(
            () => {
                this._webviewView = undefined;
            },
            null,
            this._disposables,
        );
        // Notify listeners that the view has resolved and can receive
        // postMessage calls. Run them after the current microtask so the
        // webview HTML has a chance to initialize the message listener.
        const cbs = this._readyCallbacks.slice();
        setTimeout(() => {
            for (const cb of cbs) {
                try {
                    cb();
                } catch (e) {
                    console.error('Code Aquarium onReady callback failed', e);
                }
            }
        }, 0);
    }

    /**
     * Register a callback to be invoked once the webview view has been
     * resolved and is ready to receive messages. Callbacks are also
     * invoked if the view is later closed and re-opened, so the caller
     * is responsible for deduping if necessary.
     */
    public onReady(cb: () => void): vscode.Disposable {
        this._readyCallbacks.push(cb);
        if (this.isReady()) {
            setTimeout(() => {
                try {
                    cb();
                } catch (e) {
                    console.error('Code Aquarium onReady callback failed', e);
                }
            }, 0);
        }
        return {
            dispose: () => {
                this._readyCallbacks = this._readyCallbacks.filter(
                    (c) => c !== cb,
                );
            },
        };
    }

    /**
     * Resolves once the webview view is ready to receive messages, or
     * after `timeoutMs` if it never resolves (e.g. the view container is
     * hidden). Lets callers reliably wait out the async gap between
     * focusing the view and `resolveWebviewView` running.
     */
    public whenReady(timeoutMs: number): Promise<void> {
        if (this.isReady()) {
            return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
            const ready = this.onReady(() => {
                ready.dispose();
                clearTimeout(timer);
                resolve();
            });
            const timer = setTimeout(() => {
                ready.dispose();
                resolve();
            }, timeoutMs);
        });
    }

    public tick(): void {
        if (this._webviewView && this._webviewView.visible) {
            void this.getWebview().postMessage({ command: 'tick' });
        }
    }

    public isReady(): boolean {
        return this._webviewView !== undefined;
    }

    protected getWebview(): vscode.Webview {
        if (!this._webviewView) {
            throw new Error(
                vscode.l10n.t(
                    'Aquarium view is not visible. Open the Code Aquarium sidebar first.',
                ),
            );
        }
        return this._webviewView.webview;
    }

    public dispose(): void {
        this._webviewView = undefined;
        super.dispose();
    }
}
