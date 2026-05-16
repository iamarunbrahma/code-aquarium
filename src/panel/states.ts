// Fish state machine.

export const enum FishState {
    swimRight = 'swim-right',
    swimLeft = 'swim-left',
    idle = 'idle',
    dart = 'dart',
    chaseFood = 'chase-food',
    eat = 'eat',
    sleep = 'sleep',
    bubble = 'bubble',
    hide = 'hide',
    float = 'float',
    walkRight = 'walk-right',
    walkLeft = 'walk-left',
}

export const enum HorizontalDirection {
    left = 'left',
    right = 'right',
    natural = 'natural',
}

export const enum FrameResult {
    stateContinue,
    stateComplete,
}

/**
 * Generic state-tick contract. Each concrete fish state implements
 * nextFrame() and updates the fish's position/direction directly.
 */
export interface IState {
    nextFrame(): FrameResult;
}

export function spriteLabelForState(state: FishState): string {
    switch (state) {
        case FishState.swimRight:
        case FishState.swimLeft:
            return 'swim';
        case FishState.idle:
            return 'idle';
        case FishState.dart:
            return 'dart';
        case FishState.chaseFood:
            return 'swim';
        case FishState.eat:
            return 'eat';
        case FishState.sleep:
            return 'sleep';
        case FishState.bubble:
            return 'idle';
        case FishState.hide:
            return 'sleep';
        case FishState.float:
            return 'idle';
        case FishState.walkRight:
        case FishState.walkLeft:
            return 'walk';
        default:
            return 'idle';
    }
}

export function horizontalDirectionForState(
    state: FishState,
): HorizontalDirection {
    switch (state) {
        case FishState.swimLeft:
        case FishState.walkLeft:
            return HorizontalDirection.left;
        case FishState.swimRight:
        case FishState.walkRight:
            return HorizontalDirection.right;
        default:
            return HorizontalDirection.natural;
    }
}
