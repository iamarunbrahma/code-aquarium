import * as assert from 'assert';
import { rewardAction } from '../extension/achievementReward';

describe('rewardAction', () => {
    it('hatches a fish while under the cap', () => {
        assert.strictEqual(rewardAction(0, 15), 'hatch');
        assert.strictEqual(rewardAction(14, 15), 'hatch');
    });

    it('only celebrates (no hatch) once the tank is full', () => {
        assert.strictEqual(rewardAction(15, 15), 'celebrate');
        assert.strictEqual(rewardAction(16, 15), 'celebrate');
    });
});
