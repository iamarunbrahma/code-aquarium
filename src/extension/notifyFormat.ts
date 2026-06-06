/**
 * Builds an achievement-unlock toast. `label` is the already-localized
 * "Achievement unlocked" string.
 */
export function formatAchievementMessage(
    label: string,
    emoji: string,
    title: string,
    description: string,
): string {
    return `${emoji} ${label}: ${title} (${description})`;
}
