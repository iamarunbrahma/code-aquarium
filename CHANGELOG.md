# Changelog

## Unreleased

- The tank now celebrates git pushes and branch publishes with a sparkle burst, alongside the existing save and commit reactions.
- Added five git-milestone achievements: Committed (50 commits), Century Commits (100 commits), Liftoff (first push), Shipping It (25 pushes), and Branch Out (first published branch).
- Added an opt-in Notifications setting (off by default) for pop-up notifications on commits, pushes, and achievement unlocks. The tank still reacts silently when it is off.
- Unlocking an achievement now hatches a celebratory random fish (sparkles instead when the tank is full).
- The tank reacts to debugging and build/test runs: fish perk up when a debug session starts, celebrate when it ends or a task passes, and a failed task stirs up a brief storm.
- Fish now have personalities: name-based traits flavour their swim speed and the idle one-liners they muse to themselves, plus the occasional mood emote when they need care.
- Fish grow up: freshly hatched fry start small and grow to full size as they age.
- Reworked the needs system: hunger and energy now drain at different, activity-aware rates (bigger fish and foodies get hungry faster; energy is spent swimming and restored by sleeping), and happiness is emergent, rising when a fish is fed and rested and falling when it is hungry or exhausted.
- Roll Call now shows each fish's live happiness, hunger, and energy (with a mood emote) instead of frozen creation-time values.
- "Disable effects" now also quiets the ambient surprises, prefers-reduced-motion is honored in the live animation (not just CSS), and a new "Fish chatter" setting can mute the idle talk and mood emotes.
- Removed the leftover test scripts and unused test dependencies.
- Now count debug sessions and build/test results, and grew the achievement set from 14 to 27 with new coding milestones: save/commit/push tiers, branch counts, a commit-hatch milestone, debugging (Debugger / Bug Hunter / Exterminator), and build outcomes (It Compiles! / All Green / Embrace Failure).

## 0.0.2

- Brightened the toolbar icons (add, feed, release) so they match the rest of the editor's title-bar icons.
- Redesigned the feed icon as a food shaker for clearer meaning.
- Fixed the retired Marketplace badge in the README and added active license, stars, and last-commit badges.

## 0.0.1 - Initial release

First public release of Code Aquarium.
