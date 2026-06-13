import { FishColor, FishMood, FishSize, FishSpecies } from '../common/types';
import { FoodPellet } from './food';
import { ISequenceTree, pickNextState } from './sequences';
import {
    FishState,
    FrameResult,
    HorizontalDirection,
    IState,
    horizontalDirectionForState,
    spriteLabelForState,
} from './states';
import {
    FishTrait,
    ambientLine,
    traitForName,
    traitSpeedMultiplier,
} from './personality';
import { decayNeeds, exertionForState, moodFor } from './needs';
import {
    TANK_FLOOR,
    bandFor,
    chaseClamp,
    isFloorDweller,
    roamClamp,
} from './movement';

export interface FishElementState {
    name: string;
    species: FishSpecies;
    color: FishColor;
    fishState: FishState;
    elLeft: number;
    elBottom: number;
    hunger: number;
    happiness: number;
    energy: number;
    age: number;
}

export interface FishConstructorOpts {
    species: FishSpecies;
    color: FishColor;
    name: string;
    size: FishSize;
    baseAssetUri: string;
    container: HTMLElement;
    initialLeft?: number;
    initialBottom?: number;
    hunger?: number;
    happiness?: number;
    energy?: number;
    age?: number;
}

const SIZE_PX: Record<FishSize, number> = {
    nano: 32,
    small: 48,
    medium: 64,
    large: 96,
};

// Per-species visual scale layered on top of the configured tank size,
// so relative proportions read true: a shark towers over a goldfish, an
// octopus is clearly larger, a crab stays small. Stylised, not literal
// marine biology — just believable relative sizing.
const SPECIES_SCALE: Record<FishSpecies, number> = {
    [FishSpecies.shark]: 3.4,
    [FishSpecies.octopus]: 1.8,
    [FishSpecies.pufferfish]: 1.4,
    [FishSpecies.crab]: 1.0,
    [FishSpecies.goldfish]: 0.9,
    [FishSpecies.tropical]: 0.8,
};

// Fish render smaller when young and grow to full size with age, so a
// freshly hatched fry visibly grows up. `age` is already persisted, so this
// needs no extra storage; the scale runs from FRY_SCALE up to 1.0.
const FRY_SCALE = 0.6;
const ADULT_AGE = 3000;

// Fish scale gently with the tank width but stay within a comfortable band, so
// they shrink a bit in a narrow sidebar and don't become dots in a wide panel.
const FISH_REF_WIDTH = 1000;
const FISH_MIN_SCALE = 0.7;
const FISH_MAX_SCALE = 1.25;

function viewportScale(): number {
    const s = window.innerWidth / FISH_REF_WIDTH;
    return Math.min(FISH_MAX_SCALE, Math.max(FISH_MIN_SCALE, s));
}

export function growthFactor(age: number): number {
    if (age >= ADULT_AGE) {
        return 1;
    }
    return FRY_SCALE + (1 - FRY_SCALE) * (age / ADULT_AGE);
}

// Shared pool of funny / sarcastic one-liners a fish can blurt when
// petted. Combined with each species' own `hello` line, so pets feel
// fresh instead of repeating one static greeting.
const FISH_QUIPS: ReadonlyArray<string> = [
    'Blub. That is all.',
    'Personal space, please.',
    'I was mid-lap, you know.',
    '10/10 pet. Do it again.',
    "You again? I'm flattered.",
    "I'm not a snack machine.",
    'Glub glub. That means hi.',
    'Stop poking, start coding.',
    'I have no thoughts, only vibes.',
    'Your bug? Saw it. Judged it.',
    "I'm your rubber duck, with fins.",
    'Bold move, waking me up.',
    'Ah, a fan. How nice.',
    'Ship the code, then pet me.',
    'Five stars. Would swim again.',
    'Wow. Contact. How social.',
    'Pet acknowledged. Carry on.',
    'I felt that. We are bonded now.',
    'Touch fish, fix bug. Science.',
    "I'm basically a coworker.",
    'Hydrated and motivated. You?',
    'That tickled. Tell no one.',
    'Refactor your heart, then pet me.',
    'I am the senior fish here.',
];

/**
 * Base behavior shared by every species. Concrete classes only declare
 * their sequence tree, palette, and species-specific tweaks.
 */
export abstract class BaseFish {
    public readonly name: string;
    public readonly species: FishSpecies;
    public readonly color: FishColor;
    public size: FishSize;
    public hunger: number;
    public happiness: number;
    public energy: number;
    public age: number;
    public readonly trait: FishTrait;

    protected baseAssetUri: string;
    protected el: HTMLImageElement;
    protected _left: number;
    protected _bottom: number;
    protected _vx: number;
    protected _vy: number;
    protected _speed: number;
    protected _baseSpeed: number;
    protected currentState!: IState;
    protected currentStateEnum!: FishState;
    protected stateFramesRemaining: number = 0;
    protected stashedState?: FishState;
    protected target?: FoodPellet;
    protected lastSpeech?: string;

    public abstract sequence: ISequenceTree;
    public abstract emojis: ReadonlyArray<string>;
    public abstract hellos: ReadonlyArray<string>;

    constructor(opts: FishConstructorOpts) {
        this.name = opts.name;
        this.species = opts.species;
        this.color = opts.color;
        this.size = opts.size;
        this.baseAssetUri = opts.baseAssetUri;
        this.hunger = opts.hunger ?? 80;
        this.happiness = opts.happiness ?? 80;
        this.energy = opts.energy ?? 80;
        this.age = opts.age ?? 0;
        this._left = opts.initialLeft ?? Math.random() * 80 + 10;
        this._bottom = opts.initialBottom ?? Math.random() * 60 + 15;
        this._vx = 0;
        this._vy = 0;
        this.trait = traitForName(opts.name);
        this._baseSpeed = 0.4 * traitSpeedMultiplier(this.trait);
        this._speed = this._baseSpeed;

        this.el = document.createElement('img');
        this.el.className = `fish fish-${opts.species} color-${opts.color} size-${opts.size}`;
        this.el.alt = opts.name;
        this.el.title = opts.name;
        this.el.style.position = 'absolute';
        const px = this.pixelSize();
        this.el.style.width = `${px}px`;
        this.el.style.height = `${px}px`;
        this.el.style.imageRendering = 'auto';
        // pointer-events handled via CSS so clicks land on fish but pass
        // through the rest of the fish container.
        opts.container.appendChild(this.el);
    }

    /**
     * Rendered sprite size: tank size scaled by this species' proportion, the
     * fish's age-based growth (fry render smaller, adults full size), and a
     * clamped viewport factor so fish stay comfortably sized across tank sizes.
     */
    protected pixelSize(): number {
        return Math.round(
            SIZE_PX[this.size] *
                SPECIES_SCALE[this.species] *
                growthFactor(this.age) *
                viewportScale(),
        );
    }

    /** Re-apply the rendered size; called on window resize for the clamp. */
    public refreshSize(): void {
        const px = this.pixelSize();
        this.el.style.width = `${px}px`;
        this.el.style.height = `${px}px`;
    }

    /** Resize the sprite to match current growth as the fish ages. */
    protected applyGrowth(): void {
        const px = this.pixelSize();
        this.el.style.width = `${px}px`;
        this.el.style.height = `${px}px`;
    }

    /** Late initializer called by subclass once `sequence` is assigned. */
    public init(): void {
        this._baseSpeed = this._speed;
        // Start the fish inside its species' vertical band.
        this._bottom = roamClamp(this.species, this._bottom);
        this.setState(this.sequence.startingState);
        this.applyTransform();
    }

    public dispose(): void {
        this.el.parentElement?.removeChild(this.el);
    }

    public getElement(): HTMLImageElement {
        return this.el;
    }

    public position(): { left: number; bottom: number } {
        return { left: this._left, bottom: this._bottom };
    }

    public setSize(size: FishSize): void {
        this.size = size;
        const px = this.pixelSize();
        this.el.style.width = `${px}px`;
        this.el.style.height = `${px}px`;
        this.el.classList.remove(
            'size-nano',
            'size-small',
            'size-medium',
            'size-large',
        );
        this.el.classList.add(`size-${size}`);
    }

    public mood(): FishMood {
        return moodFor({
            hunger: this.hunger,
            energy: this.energy,
            happiness: this.happiness,
        });
    }

    public dart(): void {
        if (this.currentStateEnum === FishState.dart) {
            return;
        }
        this.stashedState = this.currentStateEnum;
        this.setState(FishState.dart);
        this.stateFramesRemaining = 30;
    }

    public chase(food: FoodPellet): void {
        this.target = food;
        this.setState(FishState.chaseFood);
    }

    /**
     * A random line to show when the fish is petted — drawn from the
     * shared quip pool plus this species' own `hello`. Rerolls once to
     * avoid repeating the previous line back-to-back.
     */
    public speak(): string {
        const pool = [...this.hellos, ...FISH_QUIPS];
        let line = pool[Math.floor(Math.random() * pool.length)];
        if (line === this.lastSpeech) {
            line = pool[Math.floor(Math.random() * pool.length)];
        }
        this.lastSpeech = line;
        return line;
    }

    /** An unprompted idle musing, flavoured by personality and time of day. */
    public ambientSpeak(isNight: boolean): string {
        return ambientLine(this.trait, isNight);
    }

    /**
     * Glyphs that float up when this fish is petted: two of the species' own
     * emojis with a heart between them, so a pet feels affectionate and
     * species-flavoured rather than a generic heart burst.
     */
    public tapEmojis(): string[] {
        const pool = [...this.emojis];
        const first = pool.splice(
            Math.floor(Math.random() * pool.length),
            1,
        )[0];
        const second = pool.length
            ? pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
            : first;
        return [first, '♥', second];
    }

    /** Slow the fish right down when the OS asks for reduced motion. */
    public setCalm(reduced: boolean): void {
        this._speed = this._baseSpeed * (reduced ? 0.35 : 1);
    }

    public serialize(): FishElementState {
        return {
            name: this.name,
            species: this.species,
            color: this.color,
            fishState: this.currentStateEnum,
            elLeft: this._left,
            elBottom: this._bottom,
            hunger: this.hunger,
            happiness: this.happiness,
            energy: this.energy,
            age: this.age,
        };
    }

    public nextFrame(): void {
        // Age the fish and decay its needs every ~10s of tick time.
        this.age += 1;
        if (this.age % 100 === 0) {
            const updated = decayNeeds(
                {
                    hunger: this.hunger,
                    energy: this.energy,
                    happiness: this.happiness,
                },
                {
                    species: this.species,
                    trait: this.trait,
                    exertion: exertionForState(this.currentStateEnum),
                },
            );
            this.hunger = updated.hunger;
            this.energy = updated.energy;
            this.happiness = updated.happiness;
            if (this.age <= ADULT_AGE) {
                this.applyGrowth();
            }
        }
        // Sleep if exhausted.
        if (
            this.energy < 20 &&
            this.currentStateEnum !== FishState.sleep &&
            this.currentStateEnum !== FishState.dart &&
            this.currentStateEnum !== FishState.chaseFood
        ) {
            this.setState(FishState.sleep);
            this.stateFramesRemaining = 200;
        }
        // Pursue target if we have one.
        if (this.target && this.currentStateEnum === FishState.chaseFood) {
            this.moveToward(this.target.left(), this.target.bottom());
            if (this.target.isConsumed()) {
                this.target = undefined;
                this.setState(FishState.eat);
                this.stateFramesRemaining = 20;
            }
            this.applyTransform();
            return;
        }
        // Run state-specific logic.
        const result = this.currentState.nextFrame();
        if (this.stateFramesRemaining > 0) {
            this.stateFramesRemaining -= 1;
        }
        if (
            result === FrameResult.stateContinue &&
            this.stateFramesRemaining > 0
        ) {
            this.applyTransform();
            return;
        }
        // Pick next state.
        let next: FishState;
        if (this.stashedState) {
            next = this.stashedState;
            this.stashedState = undefined;
        } else if (
            this.currentStateEnum === FishState.eat ||
            this.currentStateEnum === FishState.sleep
        ) {
            // Eating and sleeping restore the underlying needs; happiness
            // then follows on its own via the emergent wellbeing model.
            if (this.currentStateEnum === FishState.eat) {
                this.hunger = Math.min(100, this.hunger + 25);
            }
            if (this.currentStateEnum === FishState.sleep) {
                this.energy = Math.min(100, this.energy + 30);
            }
            next = this.sequence.startingState;
        } else {
            next = pickNextState(this.sequence, this.currentStateEnum);
        }
        this.setState(next);
        this.applyTransform();
    }

    protected setState(state: FishState): void {
        this.currentStateEnum = state;
        this.currentState = this.buildState(state);
        this.stateFramesRemaining = this.framesForState(state);
        const dir = horizontalDirectionForState(state);
        if (dir === HorizontalDirection.left) {
            this.el.style.transform = 'scaleX(-1)';
        } else if (dir === HorizontalDirection.right) {
            this.el.style.transform = 'scaleX(1)';
        }
        const sprite = spriteLabelForState(state);
        this.el.src = `${this.baseAssetUri}/aquarium/${this.species}/${this.color}_${sprite}.svg`;
    }

    protected framesForState(state: FishState): number {
        switch (state) {
            case FishState.swimRight:
            case FishState.swimLeft:
                return 50 + Math.floor(Math.random() * 50);
            case FishState.idle:
                return 20 + Math.floor(Math.random() * 30);
            case FishState.bubble:
                return 10;
            case FishState.dart:
                return 30;
            case FishState.eat:
                return 20;
            case FishState.sleep:
                return 200;
            case FishState.hide:
                return 80;
            case FishState.walkLeft:
            case FishState.walkRight:
                return 60 + Math.floor(Math.random() * 40);
            default:
                return 30;
        }
    }

    /**
     * Inline state factory — keeps the BaseFish self-contained
     * without forcing a giant switch in a separate file.
     */
    protected buildState(state: FishState): IState {
        const fish = this;
        switch (state) {
            case FishState.swimRight:
            case FishState.swimLeft: {
                const sign = state === FishState.swimRight ? 1 : -1;
                fish._vx = sign * fish._speed;
                fish._vy = (Math.random() - 0.5) * 0.05;
                const [floor, ceil] = bandFor(fish.species);
                return {
                    nextFrame: () => {
                        fish._left += fish._vx;
                        fish._bottom += fish._vy;
                        if (fish._left <= 4) {
                            fish._left = 4;
                            return FrameResult.stateComplete;
                        }
                        if (fish._left >= 92) {
                            fish._left = 92;
                            return FrameResult.stateComplete;
                        }
                        if (fish._bottom < floor) {
                            fish._bottom = floor;
                            fish._vy = Math.abs(fish._vy);
                        }
                        if (fish._bottom > ceil) {
                            fish._bottom = ceil;
                            fish._vy = -Math.abs(fish._vy);
                        }
                        return FrameResult.stateContinue;
                    },
                };
            }
            case FishState.idle:
                fish._vx = 0;
                fish._vy = 0;
                return {
                    nextFrame: () => {
                        fish._bottom = roamClamp(
                            fish.species,
                            fish._bottom + Math.sin(fish.age * 0.1) * 0.05,
                        );
                        return FrameResult.stateContinue;
                    },
                };
            case FishState.dart:
                fish._vx = (Math.random() < 0.5 ? -1 : 1) * fish._speed * 3;
                fish._vy = (Math.random() - 0.5) * 0.4;
                return {
                    nextFrame: () => {
                        fish._left = clamp(fish._left + fish._vx, 4, 92);
                        fish._bottom = roamClamp(
                            fish.species,
                            fish._bottom + fish._vy,
                        );
                        return FrameResult.stateContinue;
                    },
                };
            case FishState.chaseFood:
                return {
                    nextFrame: () => FrameResult.stateContinue,
                };
            case FishState.eat:
                fish._vx = 0;
                fish._vy = 0;
                return {
                    nextFrame: () => FrameResult.stateContinue,
                };
            case FishState.sleep:
                fish._vx = 0;
                fish._vy = -0.02;
                return {
                    nextFrame: () => {
                        fish._bottom = Math.max(
                            TANK_FLOOR,
                            fish._bottom + fish._vy,
                        );
                        return FrameResult.stateContinue;
                    },
                };
            case FishState.bubble:
                return {
                    nextFrame: () => FrameResult.stateContinue,
                };
            case FishState.hide:
                fish._vx = 0;
                fish._vy = 0;
                return {
                    nextFrame: () => FrameResult.stateContinue,
                };
            case FishState.float:
                fish._vx = (Math.random() - 0.5) * 0.1;
                fish._vy = 0.05;
                return {
                    nextFrame: () => {
                        fish._left = clamp(fish._left + fish._vx, 4, 92);
                        fish._bottom = roamClamp(
                            fish.species,
                            fish._bottom + fish._vy,
                        );
                        return FrameResult.stateContinue;
                    },
                };
            case FishState.walkRight:
            case FishState.walkLeft: {
                const sign = state === FishState.walkRight ? 1 : -1;
                fish._vx = sign * fish._speed * 0.4;
                fish._vy = 0;
                return {
                    nextFrame: () => {
                        fish._left += fish._vx;
                        // Ease down onto the sand rather than snapping to it.
                        fish._bottom += (TANK_FLOOR - fish._bottom) * 0.25;
                        if (fish._left <= 4) {
                            fish._left = 4;
                            return FrameResult.stateComplete;
                        }
                        if (fish._left >= 92) {
                            fish._left = 92;
                            return FrameResult.stateComplete;
                        }
                        return FrameResult.stateContinue;
                    },
                };
            }
            default:
                return {
                    nextFrame: () => FrameResult.stateContinue,
                };
        }
    }

    protected moveToward(targetLeft: number, targetBottom: number): void {
        // Floor-dwellers (crabs) pursue food horizontally along the sand and
        // wait for it to sink, rather than swimming up to it.
        if (isFloorDweller(this.species)) {
            const dir = targetLeft < this._left ? -1 : 1;
            this._left += dir * this._speed * 2;
            this._bottom = TANK_FLOOR;
            this.el.style.transform = dir < 0 ? 'scaleX(-1)' : 'scaleX(1)';
            return;
        }
        const dx = targetLeft - this._left;
        const dy = targetBottom - this._bottom;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = this._speed * 2;
        this._left += (dx / dist) * speed;
        // Descend toward a sunken pellet if needed, but never rise above the
        // species' band ceiling.
        this._bottom = chaseClamp(
            this.species,
            this._bottom + (dy / dist) * speed,
        );
        if (dx < 0) {
            this.el.style.transform = 'scaleX(-1)';
        } else {
            this.el.style.transform = 'scaleX(1)';
        }
    }

    protected applyTransform(): void {
        this.el.style.left = `${this._left}%`;
        this.el.style.bottom = `${this._bottom}%`;
    }
}

function clamp(value: number, min: number, max: number): number {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}
