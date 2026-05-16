import * as assert from 'assert';
import { dayNightBrightness } from '../../panel/tank';

/**
 * The day/night cycle multiplies the whole tank's brightness. Guards that
 * it stays a gentle tint — never dark enough to hide the fish — at every
 * hour of the day. (The previous formula bottomed out at 0.10 at midnight,
 * rendering the aquarium near-black.)
 */
suite('day/night brightness', () => {
    test('never drops below 0.6 at any hour', () => {
        for (let hour = 0; hour < 24; hour++) {
            const b = dayNightBrightness(hour);
            assert.ok(b >= 0.6, `hour ${hour} too dark: ${b}`);
            assert.ok(b <= 1.0, `hour ${hour} over-bright: ${b}`);
        }
    });

    test('peaks around midday and dips at night', () => {
        assert.ok(
            dayNightBrightness(12) > dayNightBrightness(0),
            'noon should be brighter than midnight',
        );
        assert.ok(dayNightBrightness(12) >= 0.99, 'noon should be near full');
        assert.ok(dayNightBrightness(0) <= 0.61, 'midnight should be dimmest');
    });
});
