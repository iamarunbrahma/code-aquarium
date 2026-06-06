import * as assert from 'assert';
import { formatAchievementMessage } from '../extension/notifyFormat';

describe('notifyFormat', () => {
    it('builds a toast containing every part', () => {
        const msg = formatAchievementMessage(
            'Achievement unlocked',
            '🌊',
            'Committed',
            'Make 50 git commits',
        );
        assert.ok(msg.includes('Achievement unlocked'));
        assert.ok(msg.includes('🌊'));
        assert.ok(msg.includes('Committed'));
        assert.ok(msg.includes('Make 50 git commits'));
    });

    it('never contains an em dash', () => {
        const msg = formatAchievementMessage('Unlocked', '🏆', 'A', 'B');
        assert.ok(!msg.includes('—'), 'message must not contain an em dash');
    });
});
