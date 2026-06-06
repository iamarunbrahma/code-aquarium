import * as assert from 'assert';
import { HeadSnapshot, shouldFirePush } from '../extension/pushDetection';

const snap = (over: Partial<HeadSnapshot> = {}): HeadSnapshot => ({
    branch: 'main',
    commit: 'abc',
    ahead: 0,
    ...over,
});

describe('shouldFirePush', () => {
    it('fires when ahead drops from >0 to 0 on the same branch', () => {
        assert.strictEqual(
            shouldFirePush(snap({ ahead: 2 }), snap({ ahead: 0 })),
            true,
        );
    });

    it('does not fire when ahead was already 0', () => {
        assert.strictEqual(
            shouldFirePush(snap({ ahead: 0 }), snap({ ahead: 0 })),
            false,
        );
    });

    it('does not fire on a partial decrease that never reaches 0', () => {
        assert.strictEqual(
            shouldFirePush(snap({ ahead: 3 }), snap({ ahead: 1 })),
            false,
        );
    });

    it('does not fire across a branch switch', () => {
        assert.strictEqual(
            shouldFirePush(
                snap({ branch: 'main', ahead: 2 }),
                snap({ branch: 'dev', ahead: 0 }),
            ),
            false,
        );
    });

    it('does not fire without a previous snapshot', () => {
        assert.strictEqual(
            shouldFirePush(undefined, snap({ ahead: 0 })),
            false,
        );
    });

    it('does not fire when the new ahead count is unknown', () => {
        assert.strictEqual(
            shouldFirePush(snap({ ahead: 2 }), snap({ ahead: undefined })),
            false,
        );
    });
});
