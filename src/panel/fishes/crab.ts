import { BaseFish, FishConstructorOpts } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class Crab extends BaseFish {
    public emojis = [
        '\uD83E\uDD80',
        '\uD83D\uDE20',
        '\uD83E\uDEE7',
        '\u2728',
        '\uD83D\uDCA2',
    ];
    public hellos = [
        '*claws clack* \uD83E\uDD80',
        'Pinch first, talk later.',
        'I only walk sideways. Deal.',
        'Grumpy? I prefer "crabby." \uD83D\uDE20',
        'Snip snip. That is a warning.',
        'Hard shell, harder attitude.',
        'Get off my sand. \uD83E\uDD80',
        'I scuttle, therefore I am.',
        'These claws are not for hugs.',
        'Bottom-dweller and proud.',
        'You woke me. Bold. \uD83D\uDE24',
        'Pet at your own risk. \uD83E\uDD80',
    ];

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
