// Food pellet system. Pellets drop from the top, settle on the floor,
// and get consumed by fish that reach them.

const TANK_FLOOR = 12; // % from bottom that food rests at
const FALL_SPEED = 0.6; // % per tick while falling
const MAX_LIFETIME_TICKS = 600; // 60 seconds at 100 ms per tick

interface FoodLook {
    size: number;
    color: string;
    radius: string;
}

// Each pellet picks a look at random: reddish-brown flakes (irregular
// blobs), coloured round pellets, and tiny granules.
const FOOD_LOOKS: ReadonlyArray<FoodLook> = [
    { size: 9, color: '#c4702a', radius: '45% 55% 60% 40%' },
    { size: 8, color: '#a8571f', radius: '60% 40% 45% 55%' },
    { size: 10, color: '#8f4f2c', radius: '50% 50% 40% 65%' },
    { size: 8, color: '#5a8f3c', radius: '50%' },
    { size: 8, color: '#d98a2b', radius: '50%' },
    { size: 7, color: '#c0492e', radius: '50%' },
    { size: 5, color: '#9c7b3f', radius: '50%' },
    { size: 5, color: '#7e8f4a', radius: '50%' },
];

export class FoodPellet {
    private _left: number;
    private _bottom: number;
    private _consumed = false;
    private _age = 0;
    private el: HTMLDivElement;

    constructor(left: number, container: HTMLElement) {
        this._left = left;
        this._bottom = 100;
        const look = FOOD_LOOKS[Math.floor(Math.random() * FOOD_LOOKS.length)];
        this.el = document.createElement('div');
        this.el.className = 'food-pellet';
        this.el.style.position = 'absolute';
        this.el.style.width = `${look.size}px`;
        this.el.style.height = `${look.size}px`;
        this.el.style.borderRadius = look.radius;
        this.el.style.backgroundColor = look.color;
        this.el.style.boxShadow = '0 0 4px rgba(0,0,0,0.4)';
        this.el.style.pointerEvents = 'none';
        this.el.style.transform = `rotate(${Math.floor(
            Math.random() * 360,
        )}deg)`;
        this.el.style.left = `${left}%`;
        this.el.style.bottom = `${this._bottom}%`;
        container.appendChild(this.el);
    }

    public left(): number {
        return this._left;
    }
    public bottom(): number {
        return this._bottom;
    }
    public isConsumed(): boolean {
        return this._consumed;
    }
    public isExpired(): boolean {
        return this._age > MAX_LIFETIME_TICKS;
    }

    public tick(): void {
        this._age += 1;
        if (this._bottom > TANK_FLOOR) {
            this._bottom -= FALL_SPEED;
            this.el.style.bottom = `${this._bottom}%`;
        }
    }

    public consume(): void {
        if (this._consumed) {
            return;
        }
        this._consumed = true;
        this.el.parentElement?.removeChild(this.el);
    }

    public dispose(): void {
        this.consume();
    }
}

export class FoodSystem {
    private pellets: FoodPellet[] = [];

    constructor(private container: HTMLElement) {}

    public drop(count: number): void {
        for (let i = 0; i < count; i++) {
            const left = 15 + Math.random() * 70;
            this.pellets.push(new FoodPellet(left, this.container));
        }
    }

    public tick(): void {
        for (const p of this.pellets) {
            p.tick();
        }
        this.pellets = this.pellets.filter((p) => {
            if (p.isExpired() && !p.isConsumed()) {
                p.dispose();
                return false;
            }
            return !p.isConsumed();
        });
    }

    public closestTo(left: number, bottom: number): FoodPellet | undefined {
        let best: FoodPellet | undefined;
        let bestDist = Infinity;
        for (const p of this.pellets) {
            if (p.isConsumed()) {
                continue;
            }
            const dx = p.left() - left;
            const dy = p.bottom() - bottom;
            const d = Math.hypot(dx, dy);
            if (d < bestDist) {
                bestDist = d;
                best = p;
            }
        }
        return best;
    }

    public clear(): void {
        for (const p of this.pellets) {
            p.dispose();
        }
        this.pellets = [];
    }
}
