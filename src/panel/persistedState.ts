import { ITankStats } from '../common/types';
import { FishElementState } from './fish';
import { Tank } from './tank';

export interface AquariumPanelState {
    fishStates: FishElementState[];
    tankStats: Partial<ITankStats>;
}

export interface IStateApi {
    getState(): unknown;
    setState(s: AquariumPanelState): void;
    postMessage(msg: unknown): void;
}

const EMPTY: AquariumPanelState = { fishStates: [], tankStats: {} };

export function saveState(stateApi: IStateApi, tank: Tank): void {
    const next: AquariumPanelState = {
        fishStates: tank.serializeFish(),
        tankStats: {},
    };
    stateApi.setState(next);
}

export function recoverState(stateApi: IStateApi, tank: Tank): void {
    const prev =
        (stateApi.getState() as AquariumPanelState | undefined) ?? EMPTY;
    for (const f of prev.fishStates) {
        tank.addFish(
            f.species,
            f.color,
            f.name,
            f.hunger,
            f.happiness,
            f.energy,
            f.age,
        );
    }
}
