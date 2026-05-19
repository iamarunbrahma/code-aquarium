# 🐠 Code Aquarium

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-007ACC?logo=visualstudiocode&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=arunbrahma.code-aquarium-app)
[![License](https://img.shields.io/github/license/iamarunbrahma/code-aquarium)](LICENSE)
[![Stars](https://img.shields.io/github/stars/iamarunbrahma/code-aquarium?style=flat)](https://github.com/iamarunbrahma/code-aquarium)
[![Last commit](https://img.shields.io/github/last-commit/iamarunbrahma/code-aquarium)](https://github.com/iamarunbrahma/code-aquarium/commits)

A tiny, living aquarium right inside VS Code. Fish swim, bubbles drift, and the tank quietly comes alive while you code.

Code Aquarium is an ambient companion - a little pocket of calm in your editor. Add a few fish, give them names, and watch them swim, nap, chase food, and react to your day. Pet one whenever you need a smile.

---

## What it does

- **Six kinds of sea creatures** - goldfish, tropical fish, pufferfish, shark, octopus, and crab. Each has its own size, look, and way of moving: the shark glides, the crab scuttles along the sand, the octopus drifts with its eight tentacles.
- **Three tank themes** - Coral Reef, Deep Sea, and Sunken Ship - each with its own backdrop, plants, and decorations.
- **It reacts to your coding session:**
  - **Save a file** → food drops in, and the hungry fish chase it down.
  - **Make a git commit** → a brand-new fish hatches with a sparkle.
  - **Step away for a while** → the lights gently dim until you're back.
- **Day & night** - the tank follows your computer's clock: brighter and livelier by day, calm and moody at night.
- **Pet your fish** - click any fish and it perks up with a happy bounce, a burst of hearts, and a cheeky one-liner (they're a sarcastic bunch).
- **Little surprises** - every so often a fish darts, a treasure twinkles, or a glowing orb drifts through the deep.
- **Achievements** - nine to discover, from your First Splash to owning a shark.
- **Your fish follow you** - their names and identities sync across your computers through VS Code Settings Sync.

---

## Getting started

1. Install **Code Aquarium** from the VS Code Marketplace.
2. Open the **Explorer** sidebar - you'll find the **Code Aquarium** panel, with three starter fish already swimming.
3. That's it. The aquarium simply lives there while you work.

Want it bigger? In **Settings**, set **Code Aquarium: Position** to **Panel** to give the tank its own editor tab.

---

## Playing with your aquarium

- **Click a fish** to pet it - it'll bounce happily and say something.
- **Click empty water** to sprinkle in a piece of food.
- **Add your own fish** and name them with the **Add Fish** command.
- Open the **Command Palette** (`Ctrl+Shift+P`, or `Cmd+Shift+P` on a Mac) and type **Code Aquarium** to see everything you can do.

There's also an **Aquarium** button in the status bar, along the bottom of the window, for one-click fish-adding.

### Commands

| Command | What it does |
| --- | --- |
| **Add Fish** | Pick a species, color, and name, and add a new fish. |
| **Feed Fish** | Drop a handful of food into the tank. |
| **Clean Tank** | Tidy the tank - clears leftover food and cheers up every fish. |
| **Release Fish** | Choose a fish to set free. |
| **Release All Fish** | Empty the tank. |
| **Roll Call** | See a list of every fish and how it's doing. |
| **Change Theme** | Switch between Coral Reef, Deep Sea, and Sunken Ship. |
| **Show Achievements** | See which achievements you've unlocked. |

---

## Settings

Open **Settings** and search for **Code Aquarium** to make the tank your own:

- **Position** - keep the aquarium in the Explorer sidebar, or give it its own editor tab.
- **Theme** - Coral Reef, Deep Sea, or Sunken Ship.
- **Size** - how big the tank and its creatures appear.
- **React to coding** - turn the save / commit / idle reactions on or off.
- **Day/night cycle** - let the tank brighten and dim with the time of day.
- **Idle timeout** - how many quiet minutes before the lights dim.
- **Commits per hatch** - how many git commits it takes to hatch a new fish.
- **Max fish** - the most fish your tank will hold.
- **Disable effects** - switch off bubbles and sparkles for a calmer, lighter tank.
- **Errors tint the water** *(optional, off by default)* - when your code has lots of errors, the water turns stormy.
- **Default species & color** - what's pre-selected when you add a fish.

---

## Achievements

| Achievement | How to unlock it |
| --- | --- |
| 💦 First Splash | Add your first fish. |
| 🐟 School's In | Have 5 fish in the tank at once. |
| 🍤 Feeder Frenzy | Save files 50 times. |
| 💯 Centurion | Save files 100 times. |
| 🥚 Commit Hatcher | Hatch a fish by making a git commit. |
| ⏳ Old Timer | Keep a fish alive for a long time. |
| 🌈 Diverse Tank | Have three different species at once. |
| 🦈 Apex Predator | Own a shark. |
| 🐙 Octogarden | Own an octopus. |

---

## Good to know

- **Your fish are saved automatically**, and their names travel with you across computers via VS Code Settings Sync.
- **Gentle by design** - Code Aquarium is completely silent and stays out of your way.
- **Accessibility** - if your system is set to reduce motion, the ambient animations switch off automatically.
- **Lightweight** - it's a small ambient view and won't slow down your editor.

---

## Questions

**Do my fish disappear if I close VS Code?**
No. They're saved and waiting when you come back.

**Will it make noise?**
Never. Code Aquarium is completely silent.

**Does it need an internet connection?**
No. Everything runs locally inside VS Code.

---

## Compatibility

Requires **VS Code 1.75 or newer**. Works on Windows, macOS, and Linux.

---

## For developers

Code Aquarium is a TypeScript VS Code extension - the extension host drives a webview that renders the tank.

```sh
npm install      # install dependencies
npm run compile  # build the extension and the webview bundle
npm run lint     # check code style
npm test         # run the test suite
```

Press **F5** in VS Code to launch a development window with the extension loaded.

---

## License

MIT - see [LICENSE](LICENSE).
