import * as vscode from 'vscode';
import { FishColor, FishSize, FishSpecies, TankTheme } from '../common/types';
import { FishSpecification } from './persistence';
import { getNonce } from './utils';

export interface IAquariumPanel {
    addFish(spec: FishSpecification): void;
    removeFish(name: string): void;
    feed(count?: number): void;
    cleanTank(): void;
    resetFish(): void;
    hatchFish(spec: FishSpecification): void;
    setLightLevel(level: 'on' | 'dim'): void;
    setStorm(enabled: boolean): void;
    setTheme(theme: TankTheme): void;
    setSize(size: FishSize): void;
    setDisableEffects(disabled: boolean): void;
    setDefaults(species: FishSpecies, color: FishColor): void;
    update(): void;
    dispose(): void;
}

export abstract class AquariumWebviewContainer implements IAquariumPanel {
    protected _extensionUri: vscode.Uri;
    protected _disposables: vscode.Disposable[] = [];
    protected _species: FishSpecies;
    protected _color: FishColor;
    protected _size: FishSize;
    protected _theme: TankTheme;
    protected _disableEffects: boolean;
    protected _reactToCoding: boolean;
    protected _dayNightCycle: boolean;
    protected _tickIntervalId: NodeJS.Timeout | number | undefined;

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
        this._extensionUri = extensionUri;
        this._species = species;
        this._color = color;
        this._size = size;
        this._theme = theme;
        this._disableEffects = disableEffects;
        this._reactToCoding = reactToCoding;
        this._dayNightCycle = dayNightCycle;
        this._tickIntervalId = setInterval(() => {
            this.tick();
        }, 100);
    }

    public abstract tick(): void;
    protected abstract getWebview(): vscode.Webview;

    public setDefaults(species: FishSpecies, color: FishColor): void {
        this._species = species;
        this._color = color;
    }

    public setSize(size: FishSize): void {
        this._size = size;
        void this.getWebview().postMessage({ command: 'set-size', size });
    }

    public setTheme(theme: TankTheme): void {
        this._theme = theme;
        void this.getWebview().postMessage({
            command: 'set-theme',
            theme,
        });
    }

    public setDisableEffects(disabled: boolean): void {
        this._disableEffects = disabled;
        void this.getWebview().postMessage({
            command: 'disable-effects',
            disabled,
        });
    }

    public addFish(spec: FishSpecification): void {
        void this.getWebview().postMessage({
            command: 'add-fish',
            species: spec.species,
            color: spec.color,
            name: spec.name,
            hunger: spec.hunger,
            happiness: spec.happiness,
            energy: spec.energy,
            age: spec.age,
            initialLeft: spec.initialLeft,
            initialBottom: spec.initialBottom,
        });
        void this.getWebview().postMessage({
            command: 'set-size',
            size: spec.size,
        });
    }

    public removeFish(name: string): void {
        void this.getWebview().postMessage({ command: 'remove-fish', name });
    }

    public feed(count: number = 3): void {
        void this.getWebview().postMessage({ command: 'drop-food', count });
    }

    public cleanTank(): void {
        void this.getWebview().postMessage({ command: 'clean-tank' });
    }

    public resetFish(): void {
        void this.getWebview().postMessage({ command: 'reset-all' });
    }

    public hatchFish(spec: FishSpecification): void {
        void this.getWebview().postMessage({
            command: 'hatch-fish',
            species: spec.species,
            color: spec.color,
            name: spec.name,
        });
    }

    public setLightLevel(level: 'on' | 'dim'): void {
        void this.getWebview().postMessage({
            command: level === 'dim' ? 'lights-dim' : 'lights-on',
        });
    }

    public setStorm(enabled: boolean): void {
        void this.getWebview().postMessage({
            command: enabled ? 'storm-on' : 'storm-off',
        });
    }

    public update(): void {
        const webview = this.getWebview();
        webview.html = this._getHtmlForWebview(webview);
    }

    protected _getHtmlForWebview(webview: vscode.Webview): string {
        const scriptPath = vscode.Uri.joinPath(
            this._extensionUri,
            'media',
            'main-bundle.js',
        );
        const resetCssPath = vscode.Uri.joinPath(
            this._extensionUri,
            'media',
            'reset.css',
        );
        const mainCssPath = vscode.Uri.joinPath(
            this._extensionUri,
            'media',
            'aquarium.css',
        );
        const scriptUri = webview.asWebviewUri(scriptPath);
        const resetCssUri = webview.asWebviewUri(resetCssPath);
        const mainCssUri = webview.asWebviewUri(mainCssPath);
        const baseAssetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media'),
        );
        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; img-src ${webview.cspSource} data:; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${resetCssUri}" rel="stylesheet" nonce="${nonce}">
    <link href="${mainCssUri}" rel="stylesheet" nonce="${nonce}">
    <title>Code Aquarium</title>
</head>
<body>
    <div id="tankCanvasContainer">
        <canvas id="bubbleCanvas"></canvas>
        <canvas id="foregroundEffectCanvas"></canvas>
        <canvas id="backgroundEffectCanvas"></canvas>
    </div>
    <div id="background"></div>
    <div id="decorContainer"></div>
    <div id="fishContainer"></div>
    <div id="foreground"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    <script nonce="${nonce}">aquariumApp.aquariumPanelApp("${baseAssetUri}", "${this._theme}", "${this._size}", "${this._species}", "${this._color}", ${this._reactToCoding}, ${this._dayNightCycle}, ${this._disableEffects});</script>
</body>
</html>`;
    }

    public dispose(): void {
        while (this._disposables.length) {
            const d = this._disposables.pop();
            if (d) {
                d.dispose();
            }
        }
        if (this._tickIntervalId !== undefined) {
            clearInterval(this._tickIntervalId as NodeJS.Timeout);
            this._tickIntervalId = undefined;
        }
    }
}
