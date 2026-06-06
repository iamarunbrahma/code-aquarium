import * as vscode from 'vscode';
import { getNotificationsEnabled } from './utils';

/**
 * Single chokepoint for every user-facing toast that the aquarium fires in
 * response to activity (events and achievement unlocks). It enforces the
 * opt-in (`codeAquarium.notifications.enabled`, off by default), which keeps
 * the extension silent by design.
 */
export function notify(message: string): void {
    if (!getNotificationsEnabled()) {
        return;
    }
    void vscode.window.showInformationMessage(message);
}
