import { Effect } from './effect';

/**
 * Opt-in error storm: tints the background canvas a sickly green and
 * draws occasional lightning bolts. Triggered when the extension host
 * counts >= errorTintThreshold error diagnostics.
 */
export class StormEffect implements Effect {
    private active = false;
    private enabled = true;
    private ctx: CanvasRenderingContext2D;
    private flashUntil = 0;
    private tickCount = 0;

    constructor(private canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Storm canvas 2D context unavailable');
        }
        this.ctx = ctx;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    public start(): void {
        this.active = true;
    }

    public stop(): void {
        this.active = false;
        this.clear();
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }

    public tick(): void {
        if (!this.enabled || !this.active) {
            return;
        }
        this.tickCount += 1;
        // Lightning every ~8 seconds (80 ticks).
        if (this.tickCount % 80 === 0) {
            this.flashUntil = this.tickCount + 3;
        }
        this.render();
    }

    private clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private render(): void {
        this.clear();
        // Green tint overlay.
        this.ctx.fillStyle = 'rgba(40, 80, 30, 0.18)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.tickCount < this.flashUntil) {
            this.ctx.fillStyle = 'rgba(255, 255, 200, 0.18)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            // Crude lightning bolt.
            this.ctx.strokeStyle = '#fffaa0';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            const x = Math.random() * this.canvas.width;
            this.ctx.moveTo(x, 0);
            let cy = 0;
            let cx = x;
            while (cy < this.canvas.height) {
                cy += 10 + Math.random() * 20;
                cx += (Math.random() - 0.5) * 30;
                this.ctx.lineTo(cx, cy);
            }
            this.ctx.stroke();
        }
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
