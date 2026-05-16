import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Code Aquarium extension activation', () => {
    test('registers all expected commands', async () => {
        const expected = [
            'codeAquarium.add-fish',
            'codeAquarium.feed',
            'codeAquarium.clean-tank',
            'codeAquarium.release-fish',
            'codeAquarium.release-all',
            'codeAquarium.roll-call',
            'codeAquarium.change-theme',
            'codeAquarium.show-achievements',
        ];
        // Nudge activation, then confirm the commands are registered.
        await vscode.commands.executeCommand('codeAquarium.roll-call').then(
            () => undefined,
            // Some commands may fail because the webview isn't ready in the
            // headless test runner — we only care that the command exists.
            () => undefined,
        );
        const all = await vscode.commands.getCommands(true);
        for (const cmd of expected) {
            assert.ok(all.includes(cmd), `Command ${cmd} was not registered`);
        }
    });

    test('contributes the sidebar view', () => {
        const ext = vscode.extensions.getExtension('arunbrahma.code-aquarium');
        assert.ok(ext, 'Extension is not loaded by the test runner');
        const contributes = ext!.packageJSON.contributes as {
            views?: Record<string, Array<{ id: string }>>;
        };
        assert.ok(contributes.views, 'Views are not contributed');
        const explorerViews = contributes.views!.explorer ?? [];
        assert.ok(
            explorerViews.some((v) => v.id === 'codeAquariumView'),
            'codeAquariumView is not contributed under the explorer view',
        );
    });

    test('declares Code Aquarium configuration namespace', () => {
        const ext = vscode.extensions.getExtension('arunbrahma.code-aquarium');
        assert.ok(ext);
        const configContribs = (
            ext!.packageJSON.contributes as {
                configuration?: { properties: Record<string, unknown> };
            }
        ).configuration;
        assert.ok(configContribs, 'No configuration is contributed');
        const keys = Object.keys(configContribs!.properties);
        assert.ok(
            keys.some((k) => k.startsWith('codeAquarium.')),
            'No codeAquarium.* configuration keys present',
        );
    });
});
