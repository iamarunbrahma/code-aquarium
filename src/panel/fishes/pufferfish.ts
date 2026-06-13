import { BaseFish } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class Pufferfish extends BaseFish {
    public emojis = [
        '\uD83D\uDC21',
        '\uD83C\uDF88',
        '\uD83D\uDCA2',
        '\u2728',
        '\uD83D\uDE24',
    ];
    public hellos = [
        "I'm spiky! Don't poke!",
        'Personal space! \uD83D\uDCA2',
        "Don't make me puff. \uD83C\uDF88",
        'I am 90% air and anxiety.',
        'Poke me and I balloon. \uD83D\uDE24',
        'Spiky outside, soft inside.',
        'Was that a threat? \uD83D\uDC21',
        'I inflate when nervous. Often.',
        'Deep breath... too deep. \uD83C\uDF88',
        'Careful, I have... spines.',
        'Stress level: maximum puff. \uD83D\uDCA2',
        'Glub?! You startled me!',
    ];

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
