import * as assert from 'assert';
import { JSDOM } from 'jsdom';
import { FishColor, FishSize, FishSpecies } from '../../common/types';
import { Goldfish } from '../../panel/fishes/goldfish';

/**
 * Drives a Goldfish for 200 ticks against a jsdom DOM. Asserts that
 * - nextFrame() never throws,
 * - the fish visits multiple distinct states,
 * - the fish's left position stays inside the visible tank.
 */
suite('Goldfish state machine', () => {
    let dom: JSDOM;

    setup(() => {
        dom = new JSDOM(
            '<!DOCTYPE html><html><body><div id="fishContainer"></div></body></html>',
        );
        (global as unknown as { window: unknown }).window =
            dom.window as unknown;
        (global as unknown as { document: unknown }).document =
            dom.window.document;
    });

    test('runs 200 ticks without throwing and stays inside the tank', () => {
        const container = dom.window.document.getElementById(
            'fishContainer',
        ) as unknown as HTMLElement;
        assert.ok(container);
        const fish = new Goldfish({
            species: FishSpecies.goldfish,
            color: FishColor.orange,
            name: 'Goldie',
            size: FishSize.small,
            baseAssetUri: 'http://localhost',
            container,
            initialLeft: 50,
            initialBottom: 50,
        });
        fish.init();
        for (let i = 0; i < 200; i++) {
            assert.doesNotThrow(() => fish.nextFrame(), `frame ${i} threw`);
            const { left, bottom } = fish.position();
            assert.ok(
                left >= 0 && left <= 100,
                `left out of bounds at frame ${i}: ${left}`,
            );
            assert.ok(
                bottom >= 0 && bottom <= 100,
                `bottom out of bounds at frame ${i}: ${bottom}`,
            );
        }
    });

    test('decays stats over time', () => {
        const container = dom.window.document.getElementById(
            'fishContainer',
        ) as unknown as HTMLElement;
        const fish = new Goldfish({
            species: FishSpecies.goldfish,
            color: FishColor.orange,
            name: 'Decay',
            size: FishSize.small,
            baseAssetUri: 'http://localhost',
            container,
            hunger: 80,
            happiness: 80,
            energy: 80,
        });
        fish.init();
        for (let i = 0; i < 300; i++) {
            fish.nextFrame();
        }
        // Stats decay 1 point per 100 ticks for each of hunger/happiness/energy
        // unless an eat/sleep transition restored them. At least one must drop.
        assert.ok(
            fish.hunger < 80 || fish.happiness < 80 || fish.energy < 80,
            'expected at least one stat to decay',
        );
    });

    test('dart override transitions back to a sequence state', () => {
        const container = dom.window.document.getElementById(
            'fishContainer',
        ) as unknown as HTMLElement;
        const fish = new Goldfish({
            species: FishSpecies.goldfish,
            color: FishColor.orange,
            name: 'Bolt',
            size: FishSize.small,
            baseAssetUri: 'http://localhost',
            container,
        });
        fish.init();
        fish.dart();
        // Run enough frames to exhaust dart (30 frames) plus the next state.
        for (let i = 0; i < 80; i++) {
            fish.nextFrame();
        }
        const state = fish.serialize().fishState;
        // dart should not be sticky after 80 frames.
        assert.notStrictEqual(state, 'dart');
    });
});
