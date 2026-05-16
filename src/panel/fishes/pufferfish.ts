import { BaseFish } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class Pufferfish extends BaseFish {
    public emoji = '\uD83D\uDC21';
    public hello = "I'm spiky! Don't poke!";

    public sequence: ISequenceTree = {
        startingState: FishState.idle,
        sequenceStates: [
            {
                state: FishState.idle,
                possibleNextStates: [
                    FishState.swimRight,
                    FishState.swimLeft,
                    FishState.bubble,
                ],
            },
            {
                state: FishState.swimRight,
                possibleNextStates: [FishState.idle, FishState.swimLeft],
            },
            {
                state: FishState.swimLeft,
                possibleNextStates: [FishState.idle, FishState.swimRight],
            },
            {
                state: FishState.bubble,
                possibleNextStates: [FishState.idle],
            },
            {
                state: FishState.chaseFood,
                possibleNextStates: [FishState.eat],
            },
            {
                state: FishState.eat,
                possibleNextStates: [FishState.idle],
            },
            {
                state: FishState.dart,
                possibleNextStates: [FishState.idle],
            },
            {
                state: FishState.sleep,
                possibleNextStates: [FishState.idle],
            },
        ],
    };
}
