# LIMINAL.OS
A vaporwave survival adventure game. Point-and-click exploration in impossible spaces.

## Running Locally
Open `index.html` in your browser.

## Architecture

### Files
- **index.html** - Split-screen UI (top: backdrop, bottom: narrative + controls)
- **style.css** - Vaporwave aesthetics with neon colors and retro UI
- **db.js** - Game database (rooms, items, scenery with tags)
- **game.js** - Core game engine (state, mechanics, save system)

### Core Mechanics
1. **Stats** - Energy and Sanity meters drain with each action
2. **Hidden Interactables** - Narrative text contains hidden clickable targets. Requires selecting a verb first
3. **Tag System** - Items have tags (heavy, rigid, key, consumable, etc.). Scenery requires specific tags to interact
4. **Death Loop** - Zero energy/sanity turns player into a statue, dropping inventory. Player respawns at last checkpoint with base stats
5. **Checkpoints** - Certain rooms (marked `checkpoint: true`) act as respawn points
6. **Corpse Run** - Dead bodies remain in rooms; player can loot their previous self

### Game Loop
1. Player arrives in a room with a narrative description and background image
2. Player selects a verb (INSPECT, TAKE, USE, CONSUME)
3. Player clicks words in the narrative to interact
4. Actions drain stats and yield results (items, story progression)
5. When stats hit 0, player becomes a statue and respawns at checkpoint

### Save System
Game state (position, inventory, stats, checkpoints) is saved to localStorage automatically.

### Expanding the Game
All content lives in `db.js`:
- **items** - Define new items with tags and properties
- **rooms** - Add new rooms with descriptions, exits, and interactable scenery
- **scenery** - Define what's interactive in each room and what's required to interact with it

The game engine parses this structure dynamically.