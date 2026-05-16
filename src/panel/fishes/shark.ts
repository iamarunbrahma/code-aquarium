import { BaseFish, FishConstructorOpts } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class Shark extends BaseFish {
    public emoji = '\uD83E\uDD88';
    public hello = '*dorsal fin*';

    public sequence: ISequenceTree = {
        startingState: FishState.swimRight,
        sequenceStates: [
            {
                state: FishState.swimRight,
                possibleNextStates: [FishState.swimLeft],
            },
            {
                state: FishState.swimLeft,
                possibleNextStates: [FishState.swimRight],
            },
            {
                state: FishState.idle,
                possibleNextStates: [FishState.swimRight, FishState.swimLeft],
            },
            {
                state: FishState.dart,
                possibleNextStates: [FishState.swimRight, FishState.swimLeft],
            },
            {
                state: FishState.sleep,
                possibleNextStates: [FishState.swimRight],
            },
        ],
    };

    constructor(opts: FishConstructorOpts) {
        super(opts);
        // Sharks are bigger, faster, and patrol the mid-water.
        this._speed = 0.9;
    }
}
