import * as assert from 'assert';
import { dayNightBrightness } from '../panel/tank';

describe('dayNightBrightness', () => {
    it('stays in a gentle, always-visible range across the day', () => {
        for (let hour = 0; hour < 24; hour++) {
            const b = dayNightBrightness(hour);
            assert.ok(b >= 0.6 && b <= 1, `hour ${hour} -> ${b}`);
        }
    });

    it('is brighter at midday than at midnight', () => {
        assert.ok(dayNightBrightness(12) > dayNightBrightness(0));
    });
});
