import { BaseFish, FishConstructorOpts } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class Octopus extends BaseFish {
    public emoji = '\uD83D\uDC19';
    public hello = '*eight-armed wave*';

    public sequence: ISequenceTree = {
        startingState: FishState.idle,
        sequenceStates: [
            {
                state: FishState.idle,
                possibleNextStates: [
                    FishState.swimLeft,
                    FishState.swimRight,
                    FishState.hide,
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
                state: FishState.hide,
                possibleNextStates: [FishState.idle],
            },
            {
                state: FishState.dart,
                possibleNextStates: [FishState.idle],
            },
            {
                state: FishState.eat,
                possibleNextStates: [FishState.idle],
            },
            {
                state: FishState.chaseFood,
                possibleNextStates: [FishState.eat],
            },
            {
                state: FishState.sleep,
                possibleNextStates: [FishState.idle],
            },
        ],
    };

    constructor(opts: FishConstructorOpts) {
        super(opts);
        // Octopuses prefer the lower half of the tank.
        this._speed = 0.25;
    }
}
