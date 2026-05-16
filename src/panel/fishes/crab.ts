import { BaseFish, FishConstructorOpts } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class Crab extends BaseFish {
    public emoji = '\uD83E\uDD80';
    public hello = '*claws clack*';

    public sequence: ISequenceTree = {
        startingState: FishState.walkRight,
        sequenceStates: [
            {
                state: FishState.walkRight,
                possibleNextStates: [FishState.idle, FishState.walkLeft],
            },
            {
                state: FishState.walkLeft,
                possibleNextStates: [FishState.idle, FishState.walkRight],
            },
            {
                state: FishState.idle,
                possibleNextStates: [FishState.walkRight, FishState.walkLeft],
            },
            {
                state: FishState.dart,
                possibleNextStates: [FishState.walkRight, FishState.walkLeft],
            },
            {
                state: FishState.chaseFood,
                possibleNextStates: [FishState.eat],
            },
            {
                state: FishState.eat,
                possibleNextStates: [FishState.walkRight, FishState.walkLeft],
            },
            {
                state: FishState.sleep,
                possibleNextStates: [FishState.idle],
            },
        ],
    };

    constructor(opts: FishConstructorOpts) {
        super(opts);
        // Crabs live on the floor.
        this._bottom = 10;
        this._speed = 0.3;
    }
}
