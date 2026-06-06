import * as vscode from 'vscode';
import { FishColor, FishSize, FishSpecies, TankTheme } from '../common/types';
import { AquariumWebviewContainer } from './AquariumWebviewContainer';
import { getWebviewOptions } from './utils';

export type WebviewMessageHandler = (message: {
    command: string;
    [key: string]: unknown;
}) => void;

/**
 * Editor-tab panel singleton.
 */
export class AquariumPanel extends AquariumWebviewContainer {
    public static currentPanel: AquariumPanel | undefined;
    public static readonly viewType = 'codeAquariumPanel';

    private readonly _panel: vscode.WebviewPanel;
    private _messageHandler?: WebviewMessageHandler;

    public static createOrShow(
        extensionUri: vscode.Uri,
        species: FishSpecies,
        color: FishColor,
        size: FishSize,
        theme: TankTheme,
        disableEffects: boolean,
        reactToCoding: boolean,
        dayNightCycle: boolean,
        chatter: boolean,
        messageHandler?: WebviewMessageHandler,
    ): AquariumPanel {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (AquariumPanel.currentPanel) {
            AquariumPanel.currentPanel._panel.reveal(column);
            if (messageHandler) {
                AquariumPanel.currentPanel._messageHandler = messageHandler;
            }
            return AquariumPanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            AquariumPanel.viewType,
            vscode.l10n.t('Code Aquarium'),
            vscode.ViewColumn.Two,
            {
                ...getWebviewOptions(extensionUri),
                retainContextWhenHidden: true,
            },
        );

        AquariumPanel.currentPanel = new AquariumPanel(
            panel,
            extensionUri,
            species,
            color,
            size,
            theme,
            disableEffects,
            reactToCoding,
            dayNightCycle,
            chatter,
            messageHandler,
        );
        return AquariumPanel.currentPanel;
    }

    public static revive(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        species: FishSpecies,
        color: FishColor,
        size: FishSize,
        theme: TankTheme,
        disableEffects: boolean,
        reactToCoding: boolean,
        dayNightCycle: boolean,
        chatter: boolean,
        messageHandler?: WebviewMessageHandler,
    ): void {
        AquariumPanel.currentPanel = new AquariumPanel(
            panel,
            extensionUri,
            species,
            color,
            size,
            theme,
            disableEffects,
            reactToCoding,
            dayNightCycle,
            chatter,
            messageHandler,
        );
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        species: FishSpecies,
        color: FishColor,
        size: FishSize,
        theme: TankTheme,
        disableEffects: boolean,
        reactToCoding: boolean,
        dayNightCycle: boolean,
        chatter: boolean,
        messageHandler?: WebviewMessageHandler,
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
            chatter,
        );
        this._panel = panel;
        this._messageHandler = messageHandler;

        this.update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.onDidChangeViewState(
            () => {
                if (this._panel.visible) {
                    this.update();
                }
            },
            null,
            this._disposables,
        );
        this._panel.webview.onDidReceiveMessage(
            (msg) => this._messageHandler?.(msg),
            null,
            this._disposables,
        );
    }

    public tick(): void {
        if (this._panel.visible) {
            void this.getWebview().postMessage({ command: 'tick' });
        }
    }

    protected getWebview(): vscode.Webview {
        return this._panel.webview;
    }

    public dispose(): void {
        AquariumPanel.currentPanel = undefined;
        this._panel.dispose();
        super.dispose();
    }
}
