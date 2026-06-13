import { BaseFish } from '../fish';
import { ISequenceTree } from '../sequences';
import { FishState } from '../states';

export class TropicalFish extends BaseFish {
    public emojis = [
        '\uD83D\uDC20',
        '\uD83C\uDF08',
        '\u2728',
        '\uD83D\uDC99',
        '\uD83C\uDFDD\uFE0F',
    ];
    public hellos = [
        'School up! \uD83C\uDF0A',
        'Look at these colors. \uD83C\uDF08',
        'Fabulous, as always. \uD83D\uDC85',
        'Reef royalty, reporting in. \uD83D\uDC20',
        "I don't swim, I strut.",
        'Yes, I am this vibrant. \u2728',
        'Tropical and proud. \uD83C\uDFDD\uFE0F',
        'Every angle is my good side.',
        'Sun-kissed and sea-blessed. \uD83C\uDF0A',
        'Compliments accepted, always.',
        'Bright fish, bright future. \uD83D\uDC99',
        'Glub, darling. \uD83D\uDC20',
    ];

    public sequence: ISequenceTree = {
        startingState: FishState.swimRight,
        sequenceStates: [
            {
                state: FishState.swimRight,
                possibleNextStates: [FishState.swimLeft, FishState.swimRight],
            },
            {
                state: FishState.swimLeft,
                possibleNextStates: [FishState.swimRight, FishState.swimLeft],
            },
            {
                state: FishState.idle,
                possibleNextStates: [FishState.swimRight, FishState.swimLeft],
            },
            {
                state: FishState.bubble,
                possibleNextStates: [FishState.swimRight],
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
                possibleNextStates: [FishState.swimRight],
            },
        ],
    };
}
