import { FishColor, FishSize, FishSpecies, TankTheme } from '../common/types';
import { IStateApi, recoverState, saveState } from './persistedState';
import { Tank } from './tank';

interface VsCodeApi {
    postMessage: (msg: unknown) => void;
    setState: (s: unknown) => void;
    getState: () => unknown;
}

declare function acquireVsCodeApi(): VsCodeApi;

interface IncomingMessage {
    command: string;
    [key: string]: unknown;
}

/**
 * Webview entry. Invoked from the inline <script> in
 * AquariumWebviewContainer._getHtmlForWebview().
 */
export function aquariumPanelApp(
    baseAssetUri: string,
    theme: string,
    size: string,
    _species: string,
    _color: string,
    _reactToCoding: boolean,
    dayNightCycle: boolean,
    disableEffects: boolean,
    chatter: boolean,
    stateApi?: IStateApi,
): void {
    const api: IStateApi = stateApi ?? wrapVsCode(acquireVsCodeApi());
    const tank = new Tank({
        baseAssetUri,
        theme: theme as TankTheme,
        size: size as FishSize,
        dayNightCycle,
        disableEffects,
        chatter,
    });
    let saveCounter = 0;

    window.addEventListener('message', (event: MessageEvent) => {
        const msg = event.data as IncomingMessage;
        if (!msg || typeof msg !== 'object') {
            return;
        }
        switch (msg.command) {
            case 'tick':
                tank.tick();
                saveCounter += 1;
                if (saveCounter % 10 === 0) {
                    saveState(api, tank);
                    api.postMessage({
                        command: 'stats',
                        fish: tank.statsSnapshot(),
                    });
                }
                break;
            case 'add-fish':
                tank.addFish(
                    msg['species'] as FishSpecies,
                    msg['color'] as FishColor,
                    msg['name'] as string,
                    msg['hunger'] as number | undefined,
                    msg['happiness'] as number | undefined,
                    msg['energy'] as number | undefined,
                    msg['age'] as number | undefined,
                    msg['initialLeft'] as number | undefined,
                    msg['initialBottom'] as number | undefined,
                );
                break;
            case 'remove-fish':
                tank.removeFish(msg['name'] as string);
                break;
            case 'drop-food':
                tank.dropFood((msg['count'] as number) ?? 3);
                break;
            case 'clean-tank':
                tank.cleanTank();
                break;
            case 'celebrate':
                tank.celebrate();
                break;
            case 'startle':
                tank.startleAll();
                break;
            case 'reset-all':
                tank.reset();
                break;
            case 'set-theme':
                tank.setTheme(msg['theme'] as TankTheme);
                break;
            case 'set-size':
                tank.setSize(msg['size'] as FishSize);
                break;
            case 'lights-dim':
                tank.setLights('dim');
                break;
            case 'lights-on':
                tank.setLights('on');
                break;
            case 'storm-on':
                tank.enableStorm();
                break;
            case 'storm-off':
                tank.disableStorm();
                break;
            case 'disable-effects':
                tank.setEffectsEnabled(!(msg['disabled'] as boolean));
                break;
            case 'set-chatter':
                tank.setChatter(msg['enabled'] as boolean);
                break;
            case 'hatch-fish':
                tank.hatchCelebration(
                    msg['species'] as FishSpecies,
                    msg['color'] as FishColor,
                    msg['name'] as string,
                );
                break;
            default:
                break;
        }
    });

    window.addEventListener('load', () => {
        tank.start();
        recoverState(api, tank);
    });
}

function wrapVsCode(v: VsCodeApi): IStateApi {
    return {
        getState: () => v.getState(),
        setState: (s) => v.setState(s),
        postMessage: (m) => v.postMessage(m),
    };
}
