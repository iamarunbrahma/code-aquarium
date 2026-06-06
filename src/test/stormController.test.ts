import * as assert from 'assert';
import { StormController } from '../extension/stormController';

describe('StormController', () => {
    it('keeps the storm up while either source still wants it', () => {
        const calls: boolean[] = [];
        const storm = new StormController((on) => calls.push(on));

        storm.set('diagnostics', true); // errors appear -> on
        storm.set('task', true); // a task fails -> already on, no change
        storm.set('task', false); // task auto-clears -> errors remain, stays on
        storm.set('diagnostics', false); // errors resolve -> now off

        assert.deepStrictEqual(calls, [true, false]);
    });

    it('does not re-fire for repeated same-state updates', () => {
        const calls: boolean[] = [];
        const storm = new StormController((on) => calls.push(on));

        storm.set('diagnostics', false); // already off
        storm.set('diagnostics', true); // on
        storm.set('diagnostics', true); // still on

        assert.deepStrictEqual(calls, [true]);
    });
});
