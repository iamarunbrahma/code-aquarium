import { BaseFish } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class Goldfish extends BaseFish {
    public emoji = '\uD83D\uDC1F';
    public hello = 'Blub blub! \uD83E\uDEE7';

    public sequence: ISequenceTree = {
        startingState: FishState.swimRight,
        sequenceStates: [
            {
                state: FishState.swimRight,
                possibleNextStates: [
                    FishState.idle,
                    FishState.swimLeft,
                    FishState.swimLeft,
                ],
            },
            {
                state: FishState.swimLeft,
                possibleNextStates: [
                    FishState.idle,
                    FishState.swimRight,
                    FishState.swimRight,
                ],
            },
            {
                state: FishState.idle,
                possibleNextStates: [
                    FishState.swimRight,
                    FishState.swimLeft,
                    FishState.bubble,
                ],
            },
            {
                state: FishState.bubble,
                possibleNextStates: [FishState.swimRight, FishState.swimLeft],
            },
            {
                state: FishState.chaseFood,
                possibleNextStates: [FishState.eat],
            },
            {
                state: FishState.eat,
                possibleNextStates: [FishState.swimRight, FishState.swimLeft],
            },
            {
                state: FishState.dart,
                possibleNextStates: [FishState.swimRight, FishState.swimLeft],
            },
            {
                state: FishState.sleep,
                possibleNextStates: [FishState.swimRight, FishState.swimLeft],
            },
        ],
    };
}
