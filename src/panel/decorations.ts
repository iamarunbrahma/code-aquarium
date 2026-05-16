import { DecorationSpec, TankThemeInfo } from './themes';

/**
 * Renders the theme's decorations as absolutely-positioned <img> tags
 * inside the supplied container. Replaces any existing children.
 */
export function renderDecorations(
    container: HTMLElement,
    info: TankThemeInfo,
    baseAssetUri: string,
): void {
    container.innerHTML = '';
    for (const spec of info.decorations) {
        container.appendChild(makeDecoration(spec, baseAssetUri));
    }
}

function makeDecoration(
    spec: DecorationSpec,
    baseAssetUri: string,
): HTMLImageElement {
    const img = document.createElement('img');
    img.src = `${baseAssetUri}/decorations/${spec.asset}`;
    img.className = `decoration ${decorationClass(spec.asset)}`;
    img.style.position = 'absolute';
    img.style.left = `${spec.leftPct}%`;
    img.style.bottom = `${spec.bottomPct}%`;
    img.style.width = `${spec.widthPx}px`;
    img.style.height = 'auto';
    img.style.pointerEvents = 'none';
    // Stagger sway phase so adjacent decorations don't move in lockstep.
    img.style.animationDelay = `${(spec.leftPct % 7) * -0.5}s`;
    img.alt = '';
    return img;
}

function decorationClass(asset: string): string {
    if (asset.startsWith('seaweed')) {
        return 'deco-seaweed';
    }
    if (asset.startsWith('coral')) {
        return 'deco-coral';
    }
    if (
        asset.startsWith('treasure') ||
        asset.startsWith('sunken') ||
        asset.startsWith('pearl') ||
        asset.startsWith('starfish')
    ) {
        return 'deco-static';
    }
    return '';
}

/**
 * Populates the background container with the full ambient stack:
 * - water surface (sunbeam ripple at top)
 * - light shafts (handled by ::before in CSS)
 * - floor caustics (two layers for organic shimmer)
 * - sand floor
 * - sand motes drifting upward
 * - distant micro-fish silhouettes
 * - schools of tiny fish
 * - giant deep-silhouette (whale-style) on rare drift
 *
 * Pure CSS animation under the hood — we only seed elements and
 * randomize timing/position once on theme apply.
 */
export function renderAmbientLayer(background: HTMLElement): void {
    background.innerHTML = '';

    // 1. Water surface band — wavy sun-beam top.
    const surface = document.createElement('div');
    surface.className = 'water-surface';
    background.appendChild(surface);

    // 2. Floor caustics — two staggered shimmer layers.
    const caustA = document.createElement('div');
    caustA.className = 'floor-caustics';
    background.appendChild(caustA);
    const caustB = document.createElement('div');
    caustB.className = 'floor-caustics-b';
    background.appendChild(caustB);

    // 3. Sand floor anchoring the bottom.
    const floor = document.createElement('div');
    floor.className = 'sand-floor';
    background.appendChild(floor);

    // 4. Giant deep silhouette — a slow whale drifting in the deep layer.
    const whale = document.createElement('div');
    whale.className = 'deep-silhouette whale';
    whale.style.top = `${28 + Math.random() * 18}%`;
    const whaleDur = 60 + Math.random() * 40;
    whale.style.animationDuration = `${whaleDur.toFixed(1)}s`;
    whale.style.animationDelay = `${(-Math.random() * whaleDur).toFixed(1)}s`;
    if (Math.random() < 0.5) {
        whale.style.transform = 'scaleX(-1)';
        whale.style.animationDirection = 'reverse';
    }
    background.appendChild(whale);

    // 5. Distant micro-fish — solo drifters at varying speeds and depths.
    const fishCount = 8;
    for (let i = 0; i < fishCount; i++) {
        const f = document.createElement('div');
        f.className = 'bg-microfish';
        const top = 12 + Math.random() * 70;
        const dur = 22 + Math.random() * 22;
        const delay = -Math.random() * dur;
        f.style.top = `${top}%`;
        f.style.animationDuration = `${dur.toFixed(1)}s`;
        f.style.animationDelay = `${delay.toFixed(1)}s`;
        if (Math.random() < 0.5) {
            f.style.transform = 'scaleX(-1)';
            f.style.animationDirection = 'reverse';
        }
        background.appendChild(f);
    }

    // 6. Schools — tight formations of 4-6 tiny fish drifting together.
    const schoolCount = 3;
    for (let s = 0; s < schoolCount; s++) {
        background.appendChild(buildSchool());
    }

    // 7. Sand motes drifting lazily up from the floor.
    const moteCount = 18;
    for (let i = 0; i < moteCount; i++) {
        const m = document.createElement('div');
        m.className = 'sand-mote';
        m.style.left = `${Math.random() * 100}%`;
        m.style.bottom = `${Math.random() * 14}%`;
        const dur = 10 + Math.random() * 14;
        m.style.animationDuration = `${dur.toFixed(1)}s`;
        m.style.animationDelay = `${(-Math.random() * dur).toFixed(1)}s`;
        m.style.opacity = (0.3 + Math.random() * 0.6).toFixed(2);
        background.appendChild(m);
    }
}

/**
 * Builds a small DOM cluster of tiny fish positioned in a loose
 * V-formation so they appear to swim together as a school.
 */
function buildSchool(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'school';
    const top = 18 + Math.random() * 55;
    const dur = 30 + Math.random() * 20;
    const delay = -Math.random() * dur;
    wrapper.style.top = `${top}%`;
    wrapper.style.animationDuration = `${dur.toFixed(1)}s`;
    wrapper.style.animationDelay = `${delay.toFixed(1)}s`;
    const reverse = Math.random() < 0.5;
    if (reverse) {
        wrapper.style.transform = 'scaleX(-1)';
        wrapper.style.animationDirection = 'reverse';
    }

    // 5-6 fish arranged in a loose V.
    const count = 5 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
        const fish = document.createElement('div');
        fish.className = 'school-fish';
        const offsetX = i * 11;
        const offsetY = i % 2 === 0 ? 0 : 5 + (i % 3);
        fish.style.left = `${offsetX}px`;
        fish.style.top = `${offsetY}px`;
        wrapper.appendChild(fish);
    }
    return wrapper;
}
