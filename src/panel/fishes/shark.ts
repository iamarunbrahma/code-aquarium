import { BaseFish, FishConstructorOpts } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class Shark extends BaseFish {
    public emojis = [
        '\uD83E\uDD88',
        '\uD83C\uDF0A',
        '\uD83D\uDE0E',
        '\u2728',
        '\uD83E\uDDB7',
    ];
    public hellos = [
        '*dorsal fin* \uD83E\uDD88',
        'Apex predator, gentle soul.',
        'Just a fin in the dark. \uD83C\uDF0A',
        'I only bite bugs in your code.',
        'Smooth. Silent. Sharky. \uD83D\uDE0E',
        'Relax, I already ate.',
        'Top of the food chain, zero drama.',
        'Keep swimming, kid. \uD83E\uDD88',
        'I patrol these waters.',
        'Teeth? For show. Mostly. \uD83E\uDDB7',
        'Cool water, cooler shark. \uD83C\uDF0A',
        "Don't be chum. Be a friend.",
    ];

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
