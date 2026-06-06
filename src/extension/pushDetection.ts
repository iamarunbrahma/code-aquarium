// Pure predicate for detecting a push from successive HEAD snapshots.
// The vscode.git API has no push event and its `onDidChange` carries no
// payload, so a push is inferred when the "ahead" count collapses to 0 on
// the same branch.
export interface HeadSnapshot {
    commit?: string;
    branch?: string;
    ahead?: number;
}

/**
 * True when `next` represents a push relative to `prev`: same branch, and
 * the ahead count went from a positive number down to exactly 0. Best
 * effort by design (branch switches, fetches, and unknown counts do not
 * fire).
 */
export function shouldFirePush(
    prev: HeadSnapshot | undefined,
    next: HeadSnapshot,
): boolean {
    if (!prev) {
        return false;
    }
    if (prev.branch !== next.branch) {
        return false;
    }
    return (prev.ahead ?? 0) > 0 && next.ahead === 0;
}
