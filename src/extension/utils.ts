import * as vscode from 'vscode';
import {
    ALL_COLORS,
    ALL_SIZES,
    ALL_SPECIES,
    ALL_THEMES,
    ExtPosition,
    FishColor,
    FishSize,
    FishSpecies,
    TankTheme,
} from '../common/types';

export const CONFIG_NAMESPACE = 'codeAquarium';
export const DEFAULT_SPECIES = FishSpecies.goldfish;
export const DEFAULT_COLOR = FishColor.orange;
export const DEFAULT_SIZE = FishSize.small;
export const DEFAULT_THEME = TankTheme.coralReef;
export const DEFAULT_POSITION = ExtPosition.explorer;

function readEnum<T>(key: string, fallback: T, allowed: ReadonlyArray<T>): T {
    const raw = vscode.workspace
        .getConfiguration(CONFIG_NAMESPACE)
        .get<T>(key, fallback);
    return allowed.includes(raw) ? raw : fallback;
}

export function getConfiguredSpecies(): FishSpecies {
    return readEnum<FishSpecies>('species', DEFAULT_SPECIES, ALL_SPECIES);
}

export function getConfiguredColor(): FishColor {
    return readEnum<FishColor>('color', DEFAULT_COLOR, ALL_COLORS);
}

export function getConfiguredSize(): FishSize {
    return readEnum<FishSize>('size', DEFAULT_SIZE, ALL_SIZES);
}

export function getConfiguredTheme(): TankTheme {
    return readEnum<TankTheme>('theme', DEFAULT_THEME, ALL_THEMES);
}

export function getConfiguredPosition(): ExtPosition {
    return readEnum<ExtPosition>('position', DEFAULT_POSITION, [
        ExtPosition.panel,
        ExtPosition.explorer,
    ]);
}

function readBool(key: string, fallback: boolean): boolean {
    return vscode.workspace
        .getConfiguration(CONFIG_NAMESPACE)
        .get<boolean>(key, fallback);
}

function readNumber(key: string, fallback: number): number {
    const raw = vscode.workspace
        .getConfiguration(CONFIG_NAMESPACE)
        .get<number>(key, fallback);
    return Number.isFinite(raw) ? raw : fallback;
}

export function getReactToCoding(): boolean {
    return readBool('reactToCoding', true);
}

export function getDayNightCycle(): boolean {
    return readBool('dayNightCycle', true);
}

export function getDisableEffects(): boolean {
    return readBool('disableEffects', false);
}

export function getErrorsTintWater(): boolean {
    return readBool('errorsTintWater', false);
}

export function getCommitsPerHatch(): number {
    return Math.max(1, Math.floor(readNumber('commitsPerHatch', 1)));
}

export function getIdleTimeoutMinutes(): number {
    return Math.max(0, readNumber('idleTimeoutMinutes', 5));
}

export function getErrorTintThreshold(): number {
    return Math.max(1, Math.floor(readNumber('errorTintThreshold', 10)));
}

export function getMaxFish(): number {
    return Math.max(1, Math.floor(readNumber('maxFish', 15)));
}

export function getWebviewOptions(
    extensionUri: vscode.Uri,
): vscode.WebviewOptions & vscode.WebviewPanelOptions {
    return {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
    };
}

export function getNonce(): string {
    let text = '';
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export async function setPositionContext(): Promise<void> {
    await vscode.commands.executeCommand(
        'setContext',
        'codeAquarium.position',
        getConfiguredPosition(),
    );
}
