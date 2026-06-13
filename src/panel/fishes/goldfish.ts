import { BaseFish } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class Goldfish extends BaseFish {
    public emojis = [
        '\uD83D\uDC1F',
        '\uD83E\uDEE7',
        '\uD83D\uDC9B',
        '\u2728',
        '\uD83D\uDFE0',
    ];
    public hellos = [
        'Blub blub! \uD83E\uDEE7',
        'Wait, have we met? \uD83D\uDC1F',
        'Three-second memory, eternal vibes.',
        'Oh hi! Oh hi! Oh hi!',
        'I forgot what I\u2014 ooh, a pet! \uD83D\uDC9B',
        'Bloop. New friend acquired.',
        'Was I doing something? No idea.',
        'Round tank, round thoughts. \uD83C\uDF00',
        'I remember you... probably.',
        'Glub. That was profound.',
        'Snack? Did someone say snack?',
        'Living the loop life. \uD83D\uDC1F',
    ];

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
