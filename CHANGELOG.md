# Changelog

## 0.0.6

- The Aquarium status bar button now opens the tank instead of adding a fish (new Open Aquarium command).

## 0.0.5

- Redrew the three tank backdrops (coral reef, sunken ship, deep ocean) as full painted underwater scenes - real ocean water up top fading to a sand/seabed floor - and removed the stray corner sparkle from each.
- Deep ocean is lighter and bluer, with an oceanic grey-blue seabed and resting bottom-dwellers; tuned each theme's water fill colour to match its new backdrop.
- Refreshed the floor decorations across all themes so every prop sprite is used: a fuller coral reef, treasure-and-shells around the wreck, and a sparse pair of urchins in the deep.
- Petting a fish now draws from a much larger pool of species-specific one-liners (about a dozen each) and pops that species' own emojis instead of a generic heart burst.

## 0.0.3

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
- Fish now keep to species-appropriate depths: crabs and octopuses stay near the floor, sharks patrol mid-water, and community fish roam the upper water. Crabs chase sunken food along the sand instead of darting upward, and ease back down to the sand rather than snapping.
- Every new fish now gets a unique, real name (each species' name pool grew to 50), so two fish can no longer share a name and silently fail to appear in the tank.
- Coordinated the error and failed-build storm so a finished task no longer clears an ongoing error storm early, and vice versa.

## 0.0.2

- Brightened the toolbar icons (add, feed, release) so they match the rest of the editor's title-bar icons.
- Redesigned the feed icon as a food shaker for clearer meaning.
- Fixed the retired Marketplace badge in the README and added active license, stars, and last-commit badges.

## 0.0.1 - Initial release

First public release of Code Aquarium.
