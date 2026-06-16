class Game {
    constructor() {
        this.currentRoom = 'room_02_01_bedroom';
        this.inventory = [];
        this.energy = 100;
        this.maxEnergy = 100;
        this.sanity = 100;
        this.maxSanity = 100;
        this.selectedVerb = null;
        this.lastCheckpoint = 'room_02_01_bedroom';
        this.deadBodies = {}; 
        this.navigationLocked = false;
        this.panelExpanded = false;
        this.unlockedExits = {}; // Tracks permanently opened doors
        this._effectTimers = [];
        this._effectsRoomId = null;
        this.pendingTransition = null;

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
            modalClose: document.getElementById('modal-close'),
            expandBtn: document.getElementById('expand-btn'),
            lockBtn: document.getElementById('lock-btn'),
            container: document.querySelector('.container')
        };

        this.setupEventListeners();
        this.loadGameState();
        this.renderRoom();
    }

    setupEventListeners() {
        document.querySelectorAll('.verb-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectVerb(e.target.dataset.verb, e));
        });

        this.elements.modalClose.addEventListener('click', () => {
            this.elements.modal.classList.remove('active');
            if (this.pendingTransition) {
                const target = this.pendingTransition;
                this.pendingTransition = null;
                this.currentRoom = target;
                this.renderRoom();
            }
        });

        this.elements.expandBtn.addEventListener('click', () => {
            this.togglePanelExpand();
        });

        this.elements.lockBtn.addEventListener('click', () => {
            this.toggleNavigationLock();
        });
    }

    selectVerb(verb, event) {
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
            this.currentRoom = state.currentRoom || 'room_02_01_bedroom';
            this.inventory = state.inventory || [];
            this.energy = state.energy ?? 100;
            this.sanity = state.sanity ?? 100;
            this.lastCheckpoint = state.lastCheckpoint || 'room_02_01_bedroom';
            this.deadBodies = state.deadBodies || {};
            this.navigationLocked = state.navigationLocked || false;
            this.panelExpanded = state.panelExpanded || false;
            this.unlockedExits = state.unlockedExits || {};
        }
    }

    saveGameState() {
        const state = {
            currentRoom: this.currentRoom,
            inventory: this.inventory,
            energy: this.energy,
            sanity: this.sanity,
            lastCheckpoint: this.lastCheckpoint,
            deadBodies: this.deadBodies,
            navigationLocked: this.navigationLocked,
            panelExpanded: this.panelExpanded,
            unlockedExits: this.unlockedExits
        };
        localStorage.setItem('liminal_os_save', JSON.stringify(state));
    }

    renderRoom() {
        const room = GAME_DB.rooms[this.currentRoom];
        if (!room) return;

        // Restart effects only when the room actually changes
        if (this._effectsRoomId !== this.currentRoom) {
            this.stopRoomEffects();
            this._effectsRoomId = this.currentRoom;
            this.elements.viewport.style.backgroundImage = `url('${room.img}')`;
            this.startRoomEffects(room);
        }

        this.elements.locationName.textContent = room.title;

        this.elements.narrativeText.innerHTML = this.processNarrative(room.desc, room);

        this.elements.narrativeText.querySelectorAll('.clickable-target').forEach(target => {
            target.addEventListener('click', () => this.handleClickable(target, room));
        });

        this.renderExits(room);
        this.renderInventory();
        this.updateStatsDisplay();
        this.applyUIStates();
        this.checkForDeadBody(room);

        if (room.checkpoint) {
            this.lastCheckpoint = room.id;
        }

        this.saveGameState();
    }

    processNarrative(desc, room) {
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
                scenery.loot = []; 
                this.drainStats(3, 0);
            } else {
                this.penalizeWrongClick();
            }
        } else if (verb === 'USE') {
            // Scenery that warps to a new room on use (no inventory item required)
            if (scenery.autoTransition) {
                const msg = scenery.useDescription || scenery.description;
                this.showModal(msg);
                this.pendingTransition = scenery.autoTransition;
                this.drainStats(0, 8);
                return;
            }

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
                
                // Process Room Unlocking
                if (scenery.unlocksExit) {
                    const unlockKey = `${room.id}_${scenery.unlocksExit}`;
                    this.unlockedExits[unlockKey] = true;
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
        this.drainStats(5, 3); 
    }

    drainStats(energyCost, sanityCost) {
        this.energy = Math.max(0, this.energy - energyCost);
        this.sanity = Math.max(0, this.sanity - sanityCost);

        if (this.energy === 0 || this.sanity === 0) {
            this.triggerDeath();
        }
    }

    triggerDeath() {
        this.deadBodies[this.currentRoom] = [...this.inventory];
        this.inventory = [];

        this.currentRoom = this.lastCheckpoint;
        this.energy = 100;
        this.sanity = 100;

        this.showModal('Your vision fragments into geometric patterns. You feel yourself becoming... something else. Cold marble replaces your skin. When consciousness returns, you awaken at your last safe place.');
        this.renderRoom();
    }

    checkForDeadBody(room) {
        if (this.deadBodies[room.id]) {
            const bodyItems = this.deadBodies[room.id];
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
        Object.entries(room.exits).forEach(([direction, exitData]) => {
            const btn = document.createElement('button');
            btn.className = 'exit-btn';
            
            const unlockKey = `${room.id}_${direction}`;
            const isLocked = exitData.locked && !this.unlockedExits[unlockKey];

            btn.textContent = isLocked ? `${direction} 🔒` : direction;
            btn.disabled = this.navigationLocked || isLocked;

            btn.addEventListener('click', () => {
                if (!this.navigationLocked && !isLocked) {
                    this.drainStats(3, 0);
                    this.currentRoom = exitData.target;
                    this.renderRoom();
                }
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

    applyUIStates() {
        this.elements.lockBtn.textContent = this.navigationLocked ? '🔒' : '🔓';
        this.elements.lockBtn.classList.toggle('locked', this.navigationLocked);

        this.elements.expandBtn.textContent = this.panelExpanded ? '⬇' : '⬆';
        this.elements.container.classList.toggle('expanded', this.panelExpanded);
    }

    startRoomEffects(room) {
        if (!room.effects || room.effects.length === 0) return;
        if (room.effects.includes('rain')) this._startRainEffect();
        if (room.effects.includes('lightning')) this._scheduleLightning();
    }

    stopRoomEffects() {
        this._effectTimers.forEach(id => clearTimeout(id));
        this._effectTimers = [];
        document.querySelectorAll('.room-effect').forEach(el => el.remove());
        this.elements.viewport.classList.remove('viewport-shaking');
        this._effectsRoomId = null;
    }

    _startRainEffect() {
        const el = document.createElement('div');
        el.className = 'room-effect effect-rain';
        this.elements.viewport.appendChild(el);
    }

    _scheduleLightning() {
        const delay = 5000 + Math.random() * 12000;
        const id = setTimeout(() => {
            this._triggerLightning();
            this._scheduleLightning();
        }, delay);
        this._effectTimers.push(id);
    }

    _triggerLightning() {
        let flash = this.elements.viewport.querySelector('.effect-lightning');
        if (!flash) {
            flash = document.createElement('div');
            flash.className = 'room-effect effect-lightning';
            this.elements.viewport.appendChild(flash);
        }
        flash.classList.remove('flash-active');
        void flash.offsetWidth; // force reflow to restart animation
        flash.classList.add('flash-active');

        // Thunder shake, slightly delayed after the flash
        const shakeId = setTimeout(() => {
            this.elements.viewport.classList.add('viewport-shaking');
            const clearId = setTimeout(() => {
                this.elements.viewport.classList.remove('viewport-shaking');
            }, 550);
            this._effectTimers.push(clearId);
        }, 120 + Math.random() * 160);
        this._effectTimers.push(shakeId);
    }

    toggleNavigationLock() {
        this.navigationLocked = !this.navigationLocked;
        this.elements.lockBtn.textContent = this.navigationLocked ? '🔒' : '🔓';
        this.elements.lockBtn.classList.toggle('locked', this.navigationLocked);

        document.querySelectorAll('.exit-btn').forEach(btn => {
            // Only toggle buttons that aren't inherently locked by room logic
            if (!btn.textContent.includes('🔒')) {
                btn.disabled = this.navigationLocked;
            }
        });

        this.saveGameState();
    }

    togglePanelExpand() {
        this.panelExpanded = !this.panelExpanded;
        this.elements.expandBtn.textContent = this.panelExpanded ? '⬇' : '⬆';
        this.elements.container.classList.toggle('expanded', this.panelExpanded);
        this.saveGameState();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Clear save on load to prevent loading old non-episodic save states during initial deployment
    localStorage.removeItem('liminal_os_save'); 
    window.game = new Game();
});
