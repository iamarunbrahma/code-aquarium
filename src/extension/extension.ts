import * as vscode from 'vscode';
import {
    ALL_SPECIES,
    ALL_THEMES,
    availableColorsForSpecies,
    ExtPosition,
    FishColor,
    FishSpecies,
    ITankStats,
    TankTheme,
} from '../common/types';
import { randomName } from '../common/names';
import { stringListAsQuickPickItemList } from '../common/localize';
import {
    getConfiguredColor,
    getConfiguredPosition,
    getConfiguredSize,
    getConfiguredSpecies,
    getConfiguredTheme,
    getDayNightCycle,
    getDisableEffects,
    getMaxFish,
    getReactToCoding,
    getWebviewOptions,
    setPositionContext,
} from './utils';
import {
    FishSpecification,
    readStats,
    storeCollectionAsMemento,
} from './persistence';
import { AquariumPanel, WebviewMessageHandler } from './AquariumPanel';
import { AquariumViewProvider } from './AquariumViewProvider';
import { IAquariumPanel } from './AquariumWebviewContainer';
import { GitWatcher } from './gitWatcher';
import { ActivityWatcher } from './activityWatcher';
import { ACHIEVEMENTS, Achievement, AchievementTracker } from './achievements';

let viewProvider: AquariumViewProvider;
let gitWatcher: GitWatcher;
let activityWatcher: ActivityWatcher;
let achievements: AchievementTracker;
let stats: ITankStats;
let collection: FishSpecification[] = [];
let statusBarItem: vscode.StatusBarItem;

function activePanel(): IAquariumPanel | undefined {
    if (getConfiguredPosition() === ExtPosition.explorer) {
        return viewProvider?.isReady() ? viewProvider : undefined;
    }
    return AquariumPanel.currentPanel;
}

async function ensurePanel(
    context: vscode.ExtensionContext,
): Promise<IAquariumPanel | undefined> {
    const existing = activePanel();
    if (existing) {
        return existing;
    }
    if (getConfiguredPosition() === ExtPosition.explorer) {
        // Focus the sidebar, then wait for the webview view to actually
        // resolve. `.focus` resolves before `resolveWebviewView` runs, so
        // a synchronous isReady() check here would race and miss it.
        await vscode.commands.executeCommand(
            `${AquariumViewProvider.viewType}.focus`,
        );
        await viewProvider?.whenReady(3000);
        return viewProvider?.isReady() ? viewProvider : undefined;
    }
    return AquariumPanel.createOrShow(
        context.extensionUri,
        getConfiguredSpecies(),
        getConfiguredColor(),
        getConfiguredSize(),
        getConfiguredTheme(),
        getDisableEffects(),
        getReactToCoding(),
        getDayNightCycle(),
        buildMessageHandler(),
    );
}

function buildMessageHandler(): WebviewMessageHandler {
    return (msg) => {
        if (!msg || typeof msg !== 'object') {
            return;
        }
        switch (msg.command) {
            case 'info':
                if (typeof msg['text'] === 'string') {
                    void vscode.window.showInformationMessage(
                        msg['text'] as string,
                    );
                }
                return;
            case 'alert':
                if (typeof msg['text'] === 'string') {
                    void vscode.window.showErrorMessage(msg['text'] as string);
                }
                return;
            default:
                return;
        }
    };
}

async function spawnAllFish(): Promise<void> {
    const panel = activePanel();
    if (!panel) {
        return;
    }
    for (const fish of collection) {
        panel.addFish(fish);
    }
}

async function pickSpecies(): Promise<FishSpecies | undefined> {
    const items = stringListAsQuickPickItemList<FishSpecies>(ALL_SPECIES);
    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: vscode.l10n.t('Pick a species'),
    });
    return picked?.value;
}

async function pickColor(species: FishSpecies): Promise<FishColor | undefined> {
    const available = availableColorsForSpecies(species);
    if (available.length <= 1) {
        return available[0];
    }
    const items = stringListAsQuickPickItemList<FishColor>(available);
    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: vscode.l10n.t('Pick a color'),
    });
    return picked?.value;
}

async function addFishFlow(context: vscode.ExtensionContext): Promise<void> {
    if (collection.length >= getMaxFish()) {
        void vscode.window.showWarningMessage(
            vscode.l10n.t('Tank is at capacity'),
        );
        return;
    }
    const panel = await ensurePanel(context);
    if (!panel) {
        return;
    }
    const species = await pickSpecies();
    if (!species) {
        return;
    }
    const color = await pickColor(species);
    if (!color) {
        return;
    }
    const suggested = randomName(species);
    const name = await vscode.window.showInputBox({
        value: suggested,
        prompt: vscode.l10n.t('Name your new fish'),
    });
    if (name === undefined) {
        return;
    }
    const finalName = name.trim() || suggested;
    const spec = new FishSpecification(
        species,
        color,
        getConfiguredSize(),
        finalName,
    );
    collection.push(spec);
    panel.addFish(spec);
    await storeCollectionAsMemento(context, collection);
    await achievements.checkAndUnlock(stats, collection);
    void vscode.window.showInformationMessage(
        vscode.l10n.t('Added {0} the {1}', finalName, species),
    );
}

async function releaseFishFlow(
    context: vscode.ExtensionContext,
): Promise<void> {
    if (collection.length === 0) {
        void vscode.window.showInformationMessage(
            vscode.l10n.t('No fish in the tank yet'),
        );
        return;
    }
    const items = collection.map((f) => ({
        label: f.name,
        description: `${f.color} ${f.species}`,
        value: f,
    }));
    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: vscode.l10n.t('Pick a fish to release'),
    });
    if (!picked) {
        return;
    }
    collection = collection.filter((f) => f !== picked.value);
    activePanel()?.removeFish(picked.value.name);
    await storeCollectionAsMemento(context, collection);
    void vscode.window.showInformationMessage(
        vscode.l10n.t('Released {0}', picked.value.name),
    );
}

async function releaseAllFlow(context: vscode.ExtensionContext): Promise<void> {
    collection = [];
    activePanel()?.resetFish();
    await storeCollectionAsMemento(context, collection);
    void vscode.window.showInformationMessage(
        vscode.l10n.t('All fish released'),
    );
}

async function changeThemeFlow(): Promise<void> {
    const items = stringListAsQuickPickItemList<TankTheme>(ALL_THEMES);
    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: vscode.l10n.t('Pick a theme'),
    });
    if (!picked) {
        return;
    }
    await vscode.workspace
        .getConfiguration('codeAquarium')
        .update('theme', picked.value, vscode.ConfigurationTarget.Global);
    void vscode.window.showInformationMessage(
        vscode.l10n.t('Aquarium theme: {0}', picked.value),
    );
}

async function rollCallFlow(): Promise<void> {
    if (collection.length === 0) {
        void vscode.window.showInformationMessage(
            vscode.l10n.t('No fish in the tank yet'),
        );
        return;
    }
    const items: vscode.QuickPickItem[] = collection.map((f) => ({
        label: `\uD83D\uDC1F ${f.name}`,
        description: `${f.color} ${f.species}`,
        detail: vscode.l10n.t(
            'Happiness {0} \u00B7 Hunger {1} \u00B7 Energy {2}',
            f.happiness,
            f.hunger,
            f.energy,
        ),
    }));
    await vscode.window.showQuickPick(items, {
        placeHolder: vscode.l10n.t('{0} fish in the tank', collection.length),
    });
}

async function showAchievementsFlow(): Promise<void> {
    const items: vscode.QuickPickItem[] = ACHIEVEMENTS.map(
        (a: Achievement) => ({
            label: `${a.emoji} ${a.title}`,
            description: achievements.isUnlocked(a.id)
                ? vscode.l10n.t('Unlocked')
                : vscode.l10n.t('Locked'),
            detail: a.description,
        }),
    );
    await vscode.window.showQuickPick(items, {
        placeHolder: vscode.l10n.t('Achievements'),
    });
}

function registerCommands(context: vscode.ExtensionContext): void {
    const dispose = (cmd: string, fn: (...args: unknown[]) => unknown) => {
        context.subscriptions.push(vscode.commands.registerCommand(cmd, fn));
    };
    dispose('codeAquarium.add-fish', () => addFishFlow(context));
    dispose('codeAquarium.feed', async () => {
        // A randomized handful of food (5-12 pellets) on every click.
        const panel = await ensurePanel(context);
        panel?.feed(5 + Math.floor(Math.random() * 8));
    });
    dispose('codeAquarium.clean-tank', async () => {
        const panel = await ensurePanel(context);
        if (!panel) {
            return;
        }
        panel.cleanTank();
        void vscode.window.showInformationMessage(
            vscode.l10n.t('Tank cleaned'),
        );
    });
    dispose('codeAquarium.release-fish', () => releaseFishFlow(context));
    dispose('codeAquarium.release-all', () => releaseAllFlow(context));
    dispose('codeAquarium.roll-call', () => rollCallFlow());
    dispose('codeAquarium.change-theme', () => changeThemeFlow());
    dispose('codeAquarium.show-achievements', () => showAchievementsFlow());
}

function registerConfigurationListener(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('codeAquarium.position')) {
                void setPositionContext();
            }
            const panel = activePanel();
            if (!panel) {
                return;
            }
            if (
                e.affectsConfiguration('codeAquarium.species') ||
                e.affectsConfiguration('codeAquarium.color')
            ) {
                panel.setDefaults(getConfiguredSpecies(), getConfiguredColor());
            }
            if (e.affectsConfiguration('codeAquarium.size')) {
                panel.setSize(getConfiguredSize());
            }
            if (e.affectsConfiguration('codeAquarium.theme')) {
                panel.setTheme(getConfiguredTheme());
            }
            if (e.affectsConfiguration('codeAquarium.disableEffects')) {
                panel.setDisableEffects(getDisableEffects());
            }
        }),
    );
}

function registerSerializer(context: vscode.ExtensionContext): void {
    if (!vscode.window.registerWebviewPanelSerializer) {
        return;
    }
    vscode.window.registerWebviewPanelSerializer(AquariumPanel.viewType, {
        async deserializeWebviewPanel(webviewPanel) {
            webviewPanel.webview.options = getWebviewOptions(
                context.extensionUri,
            );
            AquariumPanel.revive(
                webviewPanel,
                context.extensionUri,
                getConfiguredSpecies(),
                getConfiguredColor(),
                getConfiguredSize(),
                getConfiguredTheme(),
                getDisableEffects(),
                getReactToCoding(),
                getDayNightCycle(),
                buildMessageHandler(),
            );
            await spawnAllFish();
        },
    });
}

function createStatusBar(context: vscode.ExtensionContext): void {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100,
    );
    statusBarItem.text = '$(snowflake) Aquarium';
    statusBarItem.tooltip = vscode.l10n.t('Add a fish to your aquarium');
    statusBarItem.command = 'codeAquarium.add-fish';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

const KEY_WELCOMED = 'codeAquarium.welcomed';

async function seedStarterFish(
    context: vscode.ExtensionContext,
): Promise<void> {
    const size = getConfiguredSize();
    // Deterministic spawn positions so the first impression always shows
    // all three starter fish, evenly spaced across the tank. Positions
    // are transient hints - the webview will reassign as fish swim.
    const starters: Array<{
        species: FishSpecies;
        color: FishColor;
        left: number;
        bottom: number;
    }> = [
        {
            species: FishSpecies.goldfish,
            color: FishColor.orange,
            left: 25,
            bottom: 55,
        },
        {
            species: FishSpecies.tropical,
            color: FishColor.blue,
            left: 50,
            bottom: 45,
        },
        {
            species: FishSpecies.pufferfish,
            color: FishColor.yellow,
            left: 75,
            bottom: 60,
        },
    ];
    for (const s of starters) {
        const spec = new FishSpecification(
            s.species,
            s.color,
            size,
            randomName(s.species),
        );
        spec.initialLeft = s.left;
        spec.initialBottom = s.bottom;
        collection.push(spec);
    }
    await storeCollectionAsMemento(context, collection);
    await context.globalState.update(KEY_WELCOMED, true);
}

export async function activate(
    context: vscode.ExtensionContext,
): Promise<void> {
    stats = readStats(context);
    collection = FishSpecification.collectionFromMemento(
        context,
        getConfiguredSize(),
    );
    achievements = new AchievementTracker(context);

    // First-run welcome: seed a small starter tank so the user sees life
    // immediately instead of an empty aquarium.
    const welcomed = context.globalState.get<boolean>(KEY_WELCOMED, false);
    if (!welcomed && collection.length === 0) {
        await seedStarterFish(context);
    }

    viewProvider = new AquariumViewProvider(
        context.extensionUri,
        getConfiguredSpecies(),
        getConfiguredColor(),
        getConfiguredSize(),
        getConfiguredTheme(),
        getDisableEffects(),
        getReactToCoding(),
        getDayNightCycle(),
    );
    viewProvider.setMessageHandler(buildMessageHandler());
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            AquariumViewProvider.viewType,
            viewProvider,
        ),
    );
    context.subscriptions.push({ dispose: () => viewProvider.dispose() });

    gitWatcher = new GitWatcher();
    void gitWatcher.start();
    context.subscriptions.push({ dispose: () => gitWatcher.dispose() });

    activityWatcher = new ActivityWatcher({
        context,
        panel: activePanel,
        git: gitWatcher,
        achievements,
        stats,
        getCollection: () => collection,
        setCollection: (next) => {
            collection = next;
        },
        defaultSize: getConfiguredSize,
    });
    activityWatcher.start();

    createStatusBar(context);
    registerCommands(context);
    registerConfigurationListener(context);
    registerSerializer(context);
    await setPositionContext();

    // Restore fish into the sidebar view whenever it becomes ready.
    // Tank dedupes by name, so re-resolving the view is safe.
    viewProvider.onReady(() => {
        for (const fish of collection) {
            viewProvider.addFish(fish);
        }
    });
}

export function deactivate(): void {
    statusBarItem?.dispose();
}
