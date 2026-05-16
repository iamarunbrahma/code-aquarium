// Canvas-based ambient bubble emitter.

interface Bubble {
    x: number;
    y: number;
    r: number;
    vy: number;
    wobbleAmp: number;
    wobblePhase: number;
    originX: number;
    alpha: number;
}

export class BubbleEmitter {
    private bubbles: Bubble[] = [];
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private enabled: boolean = true;
    private density: number = 0.4;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Bubble canvas 2D context unavailable');
        }
        this.ctx = ctx;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            this.bubbles = [];
            this.clear();
        }
    }

    public setDensity(density: number): void {
        this.density = density;
    }

    public burst(): void {
        if (!this.enabled) {
            return;
        }
        for (let i = 0; i < 30; i++) {
            this.bubbles.push(this.spawn(true));
        }
    }

    public tick(): void {
        if (!this.enabled) {
            return;
        }
        if (
            this.bubbles.length < 60 * this.density &&
            Math.random() < this.density
        ) {
            this.bubbles.push(this.spawn(false));
        }
        for (const b of this.bubbles) {
            b.y -= b.vy;
            b.wobblePhase += 0.05;
            b.x = b.originX + Math.sin(b.wobblePhase) * b.wobbleAmp;
            if (b.y < 40) {
                b.alpha = Math.max(0, b.alpha - 0.02);
            }
        }
        this.bubbles = this.bubbles.filter((b) => b.alpha > 0 && b.y > -10);
        this.render();
    }

    private spawn(fromBottom: boolean): Bubble {
        const x = Math.random() * this.canvas.width;
        return {
            x,
            originX: x,
            y: fromBottom
                ? this.canvas.height - 20
                : this.canvas.height + Math.random() * 10,
            r: 2 + Math.random() * 4,
            vy: 0.5 + Math.random() * 1.2,
            wobbleAmp: 4 + Math.random() * 8,
            wobblePhase: Math.random() * Math.PI * 2,
            alpha: 0.6 + Math.random() * 0.4,
        };
    }

    private clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private render(): void {
        this.clear();
        for (const b of this.bubbles) {
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.4})`;
            this.ctx.fill();
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha})`;
            this.ctx.lineWidth = 1;
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
