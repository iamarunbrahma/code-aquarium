import { Effect } from './effect';

interface Sparkle {
    x: number;
    y: number;
    age: number;
    life: number;
    vx: number;
    vy: number;
    color: string;
}

const PALETTE = ['#ffd54f', '#fff59d', '#ffe082', '#fff'];

export class SparkleEffect implements Effect {
    private particles: Sparkle[] = [];
    private ctx: CanvasRenderingContext2D;
    private enabled = true;

    constructor(private canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Sparkle canvas 2D context unavailable');
        }
        this.ctx = ctx;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    public start(): void {
        // Ambient effect — no-op start.
    }

    public stop(): void {
        this.particles = [];
        this.clear();
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }

    /** Fire a burst at a percentage position (leftPct/bottomPct). */
    public burst(leftPct: number, bottomPct: number): void {
        if (!this.enabled) {
            return;
        }
        const x = (leftPct / 100) * this.canvas.width;
        const y = this.canvas.height - (bottomPct / 100) * this.canvas.height;
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5,
                age: 0,
                life: 30 + Math.floor(Math.random() * 20),
                color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
            });
        }
    }

    public tick(): void {
        if (!this.enabled) {
            return;
        }
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.age += 1;
        }
        this.particles = this.particles.filter((p) => p.age < p.life);
        this.render();
    }

    private clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private render(): void {
        this.clear();
        for (const p of this.particles) {
            const alpha = 1 - p.age / p.life;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }

    private resize(): void {
        const parent = this.canvas.parentElement;
        if (!parent) {
            return;
        }
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
    }
}
