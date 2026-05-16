import { FishState } from './states';

export interface ISequenceNode {
    state: FishState;
    possibleNextStates: FishState[];
}

export interface ISequenceTree {
    startingState: FishState;
    sequenceStates: ISequenceNode[];
}

/**
 * Pick a random next state from the sequence tree. Falls back to the
 * starting state if the current state is not in the tree (e.g. dart was
 * triggered by an external event).
 */
export function pickNextState(
    tree: ISequenceTree,
    current: FishState,
): FishState {
    const node = tree.sequenceStates.find((n) => n.state === current);
    if (!node || node.possibleNextStates.length === 0) {
        return tree.startingState;
    }
    const i = Math.floor(Math.random() * node.possibleNextStates.length);
    return node.possibleNextStates[i];
}
