import {
    FishColor,
    FishMood,
    FishSize,
    FishSpecies,
    TankTheme,
} from '../common/types';
import { BubbleEmitter } from './bubbles';
import { renderAmbientLayer, renderDecorations } from './decorations';
import { SparkleEffect } from './effects/sparkleEffect';
import { StormEffect } from './effects/stormEffect';
import { BaseFish, FishElementState } from './fish';
import { Crab } from './fishes/crab';
import { Goldfish } from './fishes/goldfish';
import { Octopus } from './fishes/octopus';
import { Pufferfish } from './fishes/pufferfish';
import { Shark } from './fishes/shark';
import { TropicalFish } from './fishes/tropical';
import { FoodSystem } from './food';
import { getThemeInfo, TankThemeInfo } from './themes';

export interface TankOpts {
    baseAssetUri: string;
    theme: TankTheme;
    size: FishSize;
    dayNightCycle: boolean;
    disableEffects: boolean;
    chatter: boolean;
}

interface ContainerRefs {
    background: HTMLElement;
    decor: HTMLElement;
    fish: HTMLElement;
    foreground: HTMLElement;
    bubbleCanvas: HTMLCanvasElement;
    fgEffectCanvas: HTMLCanvasElement;
    bgEffectCanvas: HTMLCanvasElement;
}

export class Tank {
    private fish: BaseFish[] = [];
    private opts: TankOpts;
    private refs: ContainerRefs;
    private themeInfo: TankThemeInfo;
    private bubbles: BubbleEmitter;
    private sparkle: SparkleEffect;
    private storm: StormEffect;
    private food: FoodSystem;
    private size: FishSize;
    // effectsEnabled is derived: the user's setting AND not reduced-motion.
    private effectsEnabled = true;
    private userEffects: boolean;
    private reducedMotion: boolean;
    private chatterEnabled: boolean;

    constructor(opts: TankOpts) {
        this.opts = opts;
        this.size = opts.size;
        this.userEffects = !opts.disableEffects;
        this.reducedMotion = prefersReducedMotion();
        this.chatterEnabled = opts.chatter;
        this.refs = this.resolveContainers();
        this.themeInfo = getThemeInfo(opts.theme);
        this.bubbles = new BubbleEmitter(this.refs.bubbleCanvas);
        this.sparkle = new SparkleEffect(this.refs.fgEffectCanvas);
        this.storm = new StormEffect(this.refs.bgEffectCanvas);
        this.food = new FoodSystem(this.refs.fish);
        this.applyEffectsState();
        this.watchReducedMotion();
    }

    public start(): void {
        this.applyTheme();
        this.applyDayNight();
        renderAmbientLayer(this.refs.background);
        this.installInteractions();
        this.installIdleSurprises();
    }

    /**
     * Periodic ambient delight: every 18-32 seconds, pick a small
     * surprise - a fish darts, a fish muses or shows a mood emote, a
     * sparkle twinkles, or a shooting orb streaks across the deep
     * background. Keeps the scene feeling alive even when the user isn't
     * doing anything; respects the effects, chatter, and reduced-motion
     * gates (see fireSurprise).
     */
    private installIdleSurprises(): void {
        const schedule = () => {
            const wait = 18000 + Math.random() * 14000;
            setTimeout(() => {
                this.fireSurprise();
                schedule();
            }, wait);
        };
        schedule();
    }

    private fireSurprise(): void {
        // Reduced motion calms the tank entirely; effects and chatter are
        // each independently switchable.
        if (this.reducedMotion) {
            return;
        }
        const roll = Math.random();
        const haveFish = this.fish.length > 0;
        if (roll < 0.3 && haveFish && this.effectsEnabled) {
            // Random fish gets startled.
            this.randomFish().dart();
        } else if (roll < 0.55 && haveFish && this.chatterEnabled) {
            // Idle self-talk: a fish muses to itself.
            const f = this.randomFish();
            this.showSpeech(f, f.ambientSpeak(isNightHour()));
        } else if (roll < 0.72 && haveFish && this.chatterEnabled) {
            // A gentle mood cue floats over a fish that needs some care.
            const f = this.randomFish();
            const glyph = moodGlyph(f.mood());
            if (glyph) {
                this.showSpeech(f, glyph);
            }
        } else if (roll < 0.88 && this.effectsEnabled) {
            // Sparkle on a random decoration location near the floor.
            const left = 8 + Math.random() * 84;
            const bottom = 6 + Math.random() * 14;
            this.sparkle.burst(left, bottom);
        } else if (this.effectsEnabled) {
            // Streaking orb in the deep background.
            this.streakOrb();
        }
    }

    private randomFish(): BaseFish {
        return this.fish[Math.floor(Math.random() * this.fish.length)];
    }

    private streakOrb(): void {
        const orb = document.createElement('div');
        const top = 15 + Math.random() * 50;
        orb.style.cssText = [
            'position:absolute',
            `top:${top}%`,
            'left:-30px',
            'width:6px',
            'height:6px',
            'border-radius:50%',
            'background:radial-gradient(circle,rgba(255,250,200,0.95),rgba(255,200,140,0.3) 60%,transparent 80%)',
            'pointer-events:none',
            'filter:blur(0.5px)',
            'box-shadow:0 0 8px rgba(255,230,160,0.7),0 0 18px rgba(255,200,120,0.4)',
            'animation:drift 6s linear forwards',
        ].join(';');
        this.refs.background.appendChild(orb);
        setTimeout(() => orb.parentElement?.removeChild(orb), 6200);
    }

    /**
     * Click handlers for petting fish and dropping food into empty water.
     * Fish elements re-enable pointer-events via CSS; the foreground layer
     * catches clicks that miss any fish so we can show a ripple + drop food.
     */
    private installInteractions(): void {
        // Pet a fish: click bubbles up from the .fish element.
        this.refs.fish.addEventListener('click', (ev) => {
            const target = ev.target as HTMLElement | null;
            if (!target) {
                return;
            }
            const fishEl = target.closest('.fish') as HTMLElement | null;
            if (!fishEl) {
                return;
            }
            const fish = this.fish.find((f) => f.getElement() === fishEl);
            if (!fish) {
                return;
            }
            this.petFish(fish);
            ev.stopPropagation();
        });

        // Click empty water → drop one food pellet at the click point.
        // The body catches anything that doesn't hit a fish.
        document.body.addEventListener('click', (ev) => {
            const target = ev.target as HTMLElement | null;
            if (target && target.closest('.fish')) {
                return;
            }
            this.showRipple(ev.clientX, ev.clientY);
            this.food.drop(1);
        });
    }

    private petFish(fish: BaseFish): void {
        fish.happiness = Math.min(100, fish.happiness + 8);
        fish.dart();
        const el = fish.getElement();
        el.classList.remove('fish-pet');
        // Restart the bounce animation.
        void el.offsetWidth;
        el.classList.add('fish-pet');
        this.showSpeech(fish, fish.speak());
        this.spawnPetRing(fish);
        this.burstHearts(fish);
        // A few extra bubbles from the fish location for an "excited" pop.
        this.bubbles.burst();
    }

    private showSpeech(fish: BaseFish, text: string): void {
        const bubble = document.createElement('div');
        bubble.className = 'fish-speech';
        bubble.textContent = text;
        const pos = fish.position();
        bubble.style.left = `${pos.left}%`;
        bubble.style.bottom = `${pos.bottom + 8}%`;
        this.refs.foreground.appendChild(bubble);
        // Remove after the CSS animation finishes.
        setTimeout(() => {
            bubble.parentElement?.removeChild(bubble);
        }, 2100);
    }

    private spawnPetRing(fish: BaseFish): void {
        const ring = document.createElement('div');
        ring.className = 'pet-ring';
        const pos = fish.position();
        ring.style.left = `${pos.left}%`;
        ring.style.bottom = `${pos.bottom}%`;
        this.refs.foreground.appendChild(ring);
        setTimeout(() => ring.parentElement?.removeChild(ring), 820);
    }

    private burstHearts(fish: BaseFish): void {
        const pos = fish.position();
        const glyphs = ['\u2665', '\u2728', '\u2665'];
        for (let i = 0; i < glyphs.length; i++) {
            const h = document.createElement('div');
            h.className = 'heart';
            h.textContent = glyphs[i];
            h.style.left = `${pos.left}%`;
            h.style.bottom = `${pos.bottom + 4}%`;
            // Random horizontal drift per heart, in px.
            const dx = (i - 1) * 12 + (Math.random() * 8 - 4);
            h.style.setProperty('--dx', `${dx.toFixed(1)}px`);
            h.style.animationDelay = `${i * 80}ms`;
            this.refs.foreground.appendChild(h);
            setTimeout(() => h.parentElement?.removeChild(h), 1200 + i * 80);
        }
    }

    private showRipple(clientX: number, clientY: number): void {
        const rect = this.refs.foreground.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        // Three staggered concentric rings for organic feel.
        for (let i = 0; i < 3; i++) {
            const ripple = document.createElement('div');
            ripple.className = `water-ripple${
                i === 1 ? ' r2' : i === 2 ? ' r3' : ''
            }`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            this.refs.foreground.appendChild(ripple);
            setTimeout(
                () => ripple.parentElement?.removeChild(ripple),
                1100 + i * 100,
            );
        }
    }

    public tick(): void {
        this.food.tick();
        for (const f of this.fish) {
            // Pick the closest pellet if the fish is hungry and unoccupied.
            if (f.hunger < 60) {
                const pellet = this.food.closestTo(
                    f.position().left,
                    f.position().bottom,
                );
                if (pellet) {
                    f.chase(pellet);
                    // Consume on proximity.
                    const dx = pellet.left() - f.position().left;
                    const dy = pellet.bottom() - f.position().bottom;
                    if (Math.hypot(dx, dy) < 5) {
                        pellet.consume();
                    }
                }
            }
            f.nextFrame();
        }
        this.bubbles.tick();
        this.sparkle.tick();
        this.storm.tick();
        this.applyDayNight();
    }

    public addFish(
        species: FishSpecies,
        color: FishColor,
        name: string,
        hunger?: number,
        happiness?: number,
        energy?: number,
        age?: number,
        initialLeft?: number,
        initialBottom?: number,
    ): BaseFish | undefined {
        if (this.fish.some((f) => f.name === name)) {
            return undefined;
        }
        const fish = buildFish({
            species,
            color,
            name,
            size: this.size,
            baseAssetUri: this.opts.baseAssetUri,
            container: this.refs.fish,
            hunger,
            happiness,
            energy,
            age,
            initialLeft,
            initialBottom,
        });
        fish.init();
        fish.setCalm(this.reducedMotion);
        this.fish.push(fish);
        return fish;
    }

    public removeFish(name: string): void {
        const idx = this.fish.findIndex((f) => f.name === name);
        if (idx < 0) {
            return;
        }
        this.fish[idx].dispose();
        this.fish.splice(idx, 1);
    }

    public reset(): void {
        for (const f of this.fish) {
            f.dispose();
        }
        this.fish = [];
        this.food.clear();
    }

    public dropFood(count: number): void {
        this.food.drop(count);
    }

    public startleAll(): void {
        for (const f of this.fish) {
            f.dart();
        }
    }

    public cleanTank(): void {
        this.food.clear();
        this.storm.stop();
        this.bubbles.burst();
        // A visible "clean sweep" - sparkles arc across the whole tank -
        // plus a happiness lift for every fish, so the command has a real
        // in-game effect rather than only firing a notification.
        for (let i = 0; i < 6; i++) {
            const left = 12 + i * 15;
            const bottom = 28 + Math.random() * 44;
            this.sparkle.burst(left, bottom);
        }
        for (const f of this.fish) {
            f.happiness = Math.min(100, f.happiness + 12);
        }
    }

    /**
     * Celebratory sparkle arc for a git milestone (push/publish). Unlike
     * cleanTank() it leaves food and storm untouched - it is purely a burst
     * of delight, and never spawns a fish, so it can fire freely without
     * touching the tank's population.
     */
    public celebrate(): void {
        this.bubbles.burst();
        for (let i = 0; i < 6; i++) {
            const left = 12 + i * 15;
            const bottom = 30 + Math.random() * 40;
            this.sparkle.burst(left, bottom);
        }
    }

    public setTheme(theme: TankTheme): void {
        this.opts.theme = theme;
        this.themeInfo = getThemeInfo(theme);
        this.applyTheme();
    }

    public setSize(size: FishSize): void {
        this.size = size;
        for (const f of this.fish) {
            f.setSize(size);
        }
    }

    public setLights(level: 'on' | 'dim'): void {
        document.documentElement.style.setProperty(
            '--light-level',
            level === 'dim' ? '0.45' : '1',
        );
    }

    public enableStorm(): void {
        this.storm.start();
        this.startleAll();
    }

    public disableStorm(): void {
        this.storm.stop();
    }

    public hatchCelebration(
        species: FishSpecies,
        color: FishColor,
        name: string,
    ): void {
        const fish = this.addFish(species, color, name);
        if (!fish) {
            return;
        }
        const pos = fish.position();
        this.sparkle.burst(pos.left, pos.bottom);
    }

    public setEffectsEnabled(enabled: boolean): void {
        this.userEffects = enabled;
        this.applyEffectsState();
    }

    public setChatter(enabled: boolean): void {
        this.chatterEnabled = enabled;
    }

    private applyEffectsState(): void {
        this.effectsEnabled = this.userEffects && !this.reducedMotion;
        this.bubbles.setEnabled(this.effectsEnabled);
        this.sparkle.setEnabled(this.effectsEnabled);
        this.storm.setEnabled(this.effectsEnabled);
    }

    private setReducedMotion(reduced: boolean): void {
        this.reducedMotion = reduced;
        this.applyEffectsState();
        for (const f of this.fish) {
            f.setCalm(reduced);
        }
    }

    private watchReducedMotion(): void {
        if (typeof window === 'undefined' || !window.matchMedia) {
            return;
        }
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        mq.addEventListener?.('change', (e) =>
            this.setReducedMotion(e.matches),
        );
    }

    public serializeFish(): FishElementState[] {
        return this.fish.map((f) => f.serialize());
    }

    public statsSnapshot(): Array<{
        name: string;
        hunger: number;
        happiness: number;
        energy: number;
        mood: string;
    }> {
        return this.fish.map((f) => ({
            name: f.name,
            hunger: f.hunger,
            happiness: f.happiness,
            energy: f.energy,
            mood: f.mood(),
        }));
    }

    private applyTheme(): void {
        const bgUrl = this.themeInfo.backgroundUrl(this.opts.baseAssetUri);
        this.refs.background.style.backgroundImage = `url(${bgUrl})`;
        this.refs.background.style.backgroundSize = 'cover';
        this.refs.background.style.backgroundPosition = 'center';
        this.bubbles.setDensity(this.themeInfo.bubbleDensity);
        renderDecorations(
            this.refs.decor,
            this.themeInfo,
            this.opts.baseAssetUri,
        );
    }

    private applyDayNight(): void {
        if (!this.opts.dayNightCycle) {
            document.documentElement.style.setProperty('--day-night', '1');
            return;
        }
        const factor = dayNightBrightness(new Date().getHours());
        document.documentElement.style.setProperty(
            '--day-night',
            factor.toFixed(2),
        );
    }

    private resolveContainers(): ContainerRefs {
        const need = (id: string): HTMLElement => {
            const el = document.getElementById(id);
            if (!el) {
                throw new Error(`Missing container #${id}`);
            }
            return el;
        };
        return {
            background: need('background'),
            decor: need('decorContainer'),
            fish: need('fishContainer'),
            foreground: need('foreground'),
            bubbleCanvas: need('bubbleCanvas') as HTMLCanvasElement,
            fgEffectCanvas: need('foregroundEffectCanvas') as HTMLCanvasElement,
            bgEffectCanvas: need('backgroundEffectCanvas') as HTMLCanvasElement,
        };
    }
}

interface BuildFishOpts {
    species: FishSpecies;
    color: FishColor;
    name: string;
    size: FishSize;
    baseAssetUri: string;
    container: HTMLElement;
    hunger?: number;
    happiness?: number;
    energy?: number;
    age?: number;
    initialLeft?: number;
    initialBottom?: number;
}

function buildFish(opts: BuildFishOpts): BaseFish {
    switch (opts.species) {
        case FishSpecies.tropical:
            return new TropicalFish(opts);
        case FishSpecies.pufferfish:
            return new Pufferfish(opts);
        case FishSpecies.shark:
            return new Shark(opts);
        case FishSpecies.octopus:
            return new Octopus(opts);
        case FishSpecies.crab:
            return new Crab(opts);
        case FishSpecies.goldfish:
        default:
            return new Goldfish(opts);
    }
}

/**
 * Maps a clock hour (0-23) to the tank's brightness multiplier for the
 * day/night cycle. Peaks at 1.0 around midday and eases down to a still
 * clearly-visible 0.6 in the dead of night - a gentle tint, never a
 * blackout. Drives the `--day-night` CSS variable.
 */
function dayNightBrightness(hour: number): number {
    return 0.8 + 0.2 * Math.sin(((hour - 6) / 24) * Math.PI * 2);
}

function prefersReducedMotion(): boolean {
    return (
        typeof window !== 'undefined' &&
        !!window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}

function isNightHour(): boolean {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 20;
}

/** A small emote for a fish that needs attention; empty when it's content. */
function moodGlyph(mood: FishMood): string {
    switch (mood) {
        case FishMood.hungry:
            return '🍤';
        case FishMood.tired:
            return '💤';
        case FishMood.grumpy:
            return '😾';
        default:
            return '';
    }
}
