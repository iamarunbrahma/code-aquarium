import * as assert from 'assert';
import { growthFactor } from '../panel/fish';

describe('growthFactor', () => {
    it('renders a newborn fry smaller than full size', () => {
        const fry = growthFactor(0);
        assert.ok(fry > 0 && fry < 1, `expected 0 < ${fry} < 1`);
    });

    it('reaches and stays at full size once grown', () => {
        assert.strictEqual(growthFactor(1_000_000), 1);
    });

    it('grows monotonically with age', () => {
        assert.ok(growthFactor(0) < growthFactor(100));
        assert.ok(growthFactor(100) < growthFactor(1000));
    });
});
