import { BaseFish, FishConstructorOpts } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class Octopus extends BaseFish {
    public emojis = [
        '\uD83D\uDC19',
        '\uD83D\uDC9C',
        '\uD83C\uDF00',
        '\u2728',
        '\uD83E\uDEE7',
    ];
    public hellos = [
        '*eight-armed wave* \uD83D\uDC19',
        'Eight arms, zero patience.',
        'Three hearts, all judging you.',
        'Smartest one in the tank. \uD83E\uDDE0',
        'Ink first, ask later. \uD83C\uDF00',
        'I can open jars. Can you?',
        'Mysterious and squishy. \uD83D\uDC9C',
        'High-five? I have eight. \uD83D\uDC19',
        'Camouflage: activated.',
        'I solved your bug in my sleep.',
        'Glub from the deep. \uD83E\uDEE7',
        'Tentacles crossed for you. \uD83D\uDC9C',
    ];

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
