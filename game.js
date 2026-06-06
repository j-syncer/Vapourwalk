class Game {
    constructor() {
        this.currentRoom = 'entry_hall';
        this.inventory = [];
        this.energy = 100;
        this.maxEnergy = 100;
        this.sanity = 100;
        this.maxSanity = 100;
        this.selectedVerb = null;
        this.lastCheckpoint = 'entry_hall';
        this.deadBodies = {}; // Maps room ID to inventory dropped on death

        this.elements = {
            viewport: document.getElementById('viewport'),
            narrativeText: document.getElementById('narrative-text'),
            energyBar: document.getElementById('energy-bar'),
            energyNum: document.getElementById('energy-num'),
            sanityBar: document.getElementById('sanity-bar'),
            sanityNum: document.getElementById('sanity-num'),
            locationName: document.getElementById('location-name'),
            inventoryList: document.getElementById('inventory-list'),
            exitButtons: document.getElementById('exit-buttons'),
            modal: document.getElementById('modal'),
            modalText: document.getElementById('modal-text'),
            modalClose: document.getElementById('modal-close')
        };

        this.setupEventListeners();
        this.loadGameState();
        this.renderRoom();
    }

    setupEventListeners() {
        // Verb selection
        document.querySelectorAll('.verb-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectVerb(e.target.dataset.verb));
        });

        // Close modal
        this.elements.modalClose.addEventListener('click', () => {
            this.elements.modal.classList.remove('active');
        });
    }

    selectVerb(verb) {
        this.selectedVerb = verb;
        document.querySelectorAll('.verb-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    loadGameState() {
        const saved = localStorage.getItem('liminal_os_save');
        if (saved) {
            const state = JSON.parse(saved);
            this.currentRoom = state.currentRoom;
            this.inventory = state.inventory;
            this.energy = state.energy;
            this.sanity = state.sanity;
            this.lastCheckpoint = state.lastCheckpoint;
            this.deadBodies = state.deadBodies || {};
        }
    }

    saveGameState() {
        const state = {
            currentRoom: this.currentRoom,
            inventory: this.inventory,
            energy: this.energy,
            sanity: this.sanity,
            lastCheckpoint: this.lastCheckpoint,
            deadBodies: this.deadBodies
        };
        localStorage.setItem('liminal_os_save', JSON.stringify(state));
    }

    renderRoom() {
        const room = GAME_DB.rooms[this.currentRoom];
        if (!room) return;

        // Update viewport
        this.elements.viewport.style.backgroundImage = `url('${room.img}')`;
        this.elements.locationName.textContent = room.title;

        // Render narrative
        this.elements.narrativeText.innerHTML = this.processNarrative(room.desc, room);

        // Attach click handlers to clickable text
        this.elements.narrativeText.querySelectorAll('.clickable-target').forEach(target => {
            target.addEventListener('click', () => this.handleClickable(target, room));
        });

        // Render exits
        this.renderExits(room);

        // Render inventory
        this.renderInventory();

        // Update stats
        this.updateStatsDisplay();

        // Check for dead body in this room
        this.checkForDeadBody(room);

        this.saveGameState();
    }

    processNarrative(desc, room) {
        // Check if player died in this room
        if (this.deadBodies[room.id]) {
            const bodyIntro = `<p style="color: #ff006e; text-shadow: 0 0 10px #ff006e;">A faceless marble statue stands here, its arms at its sides. Your inventory is scattered at its feet.</p>`;
            return bodyIntro + '<p>' + desc + '</p>';
        }
        return '<p>' + desc + '</p>';
    }

    handleClickable(target, room) {
        if (!this.selectedVerb) {
            this.showModal('Select an action first: INSPECT, TAKE, USE, or CONSUME.');
            return;
        }

        const targetId = target.dataset.targetId;
        const scenery = room.scenery[targetId];

        if (!scenery) {
            this.penalizeWrongClick();
            return;
        }

        const verb = this.selectedVerb;

        if (verb === 'INSPECT') {
            this.showModal(scenery.description);
            this.drainStats(2, 1);
        } else if (verb === 'TAKE') {
            if (scenery.loot.length > 0) {
                const item = scenery.loot[0];
                this.addToInventory(item);
                this.showModal(`You obtained: ${GAME_DB.items[item].name}`);
                scenery.loot = []; // Remove loot after taking
                this.drainStats(3, 0);
            } else {
                this.penalizeWrongClick();
            }
        } else if (verb === 'USE') {
            if (scenery.required_tags.length === 0) {
                this.showModal('Nothing happens.');
                this.penalizeWrongClick();
                return;
            }

            const hasRequiredTag = this.inventory.some(itemId => {
                const item = GAME_DB.items[itemId];
                return scenery.required_tags.some(tag => item.tags.includes(tag));
            });

            if (hasRequiredTag) {
                this.showModal(scenery.description);
                if (scenery.loot.length > 0) {
                    const item = scenery.loot[0];
                    this.addToInventory(item);
                }
                this.drainStats(5, 2);
            } else {
                this.penalizeWrongClick();
            }
        } else if (verb === 'CONSUME') {
            const consumable = this.inventory.find(itemId => {
                const item = GAME_DB.items[itemId];
                return item.consumable && item.id === targetId;
            });

            if (!consumable) {
                this.penalizeWrongClick();
                return;
            }

            const item = GAME_DB.items[consumable];
            if (item.energyRestore) this.energy = Math.min(this.maxEnergy, this.energy + item.energyRestore);
            if (item.sanityRestore) this.sanity = Math.min(this.maxSanity, this.sanity + item.sanityRestore);

            this.removeFromInventory(consumable);
            this.showModal(`You consumed: ${item.name}`);
            this.drainStats(0, 0);
        }

        this.renderRoom();
    }

    penalizeWrongClick() {
        this.showModal('That is not helpful.');
        this.drainStats(5, 3); // Energy penalty for wasting time
    }

    drainStats(energyCost, sanityCost) {
        this.energy = Math.max(0, this.energy - energyCost);
        this.sanity = Math.max(0, this.sanity - sanityCost);

        if (this.energy === 0 || this.sanity === 0) {
            this.triggerDeath();
        }
    }

    triggerDeath() {
        // Store current inventory at this location
        this.deadBodies[this.currentRoom] = [...this.inventory];
        this.inventory = [];

        // Reset to checkpoint
        this.currentRoom = this.lastCheckpoint;
        this.energy = 100;
        this.sanity = 100;

        this.showModal('Your vision fragments into geometric patterns. You feel yourself becoming... something else. Cold marble replaces your skin. When consciousness returns, you awaken at your last safe place.');
        this.renderRoom();
    }

    checkForDeadBody(room) {
        if (this.deadBodies[room.id]) {
            const bodyItems = this.deadBodies[room.id];
            // Add a hidden clickable for looting the body
            const desc = this.elements.narrativeText.innerHTML;
            const lootBtn = `<p style="color: #00f5ff; margin-top: 10px;"><span class="clickable-target loot-body" style="cursor: pointer; text-decoration: underline;">Loot the statue's feet for your belongings</span></p>`;
            this.elements.narrativeText.innerHTML = desc + lootBtn;

            document.querySelector('.loot-body').addEventListener('click', () => {
                bodyItems.forEach(itemId => this.addToInventory(itemId));
                delete this.deadBodies[room.id];
                this.showModal(`You retrieved ${bodyItems.length} items from your former self.`);
                this.renderRoom();
            });
        }
    }

    renderExits(room) {
        this.elements.exitButtons.innerHTML = '';
        Object.entries(room.exits).forEach(([direction, roomId]) => {
            const btn = document.createElement('button');
            btn.className = 'exit-btn';
            btn.textContent = direction;
            btn.addEventListener('click', () => {
                this.drainStats(3, 0);
                this.currentRoom = roomId;
                this.renderRoom();
            });
            this.elements.exitButtons.appendChild(btn);
        });
    }

    renderInventory() {
        this.elements.inventoryList.innerHTML = '';
        if (this.inventory.length === 0) {
            this.elements.inventoryList.textContent = '(empty)';
            return;
        }

        this.inventory.forEach(itemId => {
            const item = GAME_DB.items[itemId];
            const span = document.createElement('span');
            span.className = 'inventory-item';
            span.textContent = item.name;
            this.elements.inventoryList.appendChild(span);
        });
    }

    updateStatsDisplay() {
        const energyPercent = (this.energy / this.maxEnergy) * 100;
        const sanityPercent = (this.sanity / this.maxSanity) * 100;

        this.elements.energyBar.style.width = energyPercent + '%';
        this.elements.energyNum.textContent = `${this.energy}/${this.maxEnergy}`;

        this.elements.sanityBar.style.width = sanityPercent + '%';
        this.elements.sanityNum.textContent = `${this.sanity}/${this.maxSanity}`;

        // Warning states
        if (this.energy < 25) {
            this.elements.energyBar.parentElement.style.borderColor = '#ff006e';
        } else {
            this.elements.energyBar.parentElement.style.borderColor = 'var(--neon-cyan)';
        }

        if (this.sanity < 25) {
            this.elements.sanityBar.parentElement.style.borderColor = '#ff006e';
        } else {
            this.elements.sanityBar.parentElement.style.borderColor = 'var(--neon-cyan)';
        }
    }

    addToInventory(itemId) {
        if (!this.inventory.includes(itemId)) {
            this.inventory.push(itemId);
        }
    }

    removeFromInventory(itemId) {
        this.inventory = this.inventory.filter(id => id !== itemId);
    }

    showModal(text) {
        this.elements.modalText.textContent = text;
        this.elements.modal.classList.add('active');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
