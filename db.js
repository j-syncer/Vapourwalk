// LIMINAL.OS Game Database
const GAME_DB = {
    items: {
        rusty_pipe: {
            id: 'rusty_pipe',
            name: 'Rusty Pipe',
            tags: ['heavy', 'rigid', 'tool'],
            fragility: 0.7,
            consumable: false,
            energyCost: -5,
            sanityCost: -2,
            description: 'A corroded length of metal pipe. Surprisingly heavy.'
        },
        tuna_can: {
            id: 'tuna_can',
            name: 'Tuna Can',
            tags: ['rigid', 'flat', 'consumable'],
            fragility: 0.3,
            consumable: true,
            energyRestore: 25,
            sanityRestore: 5,
            energyCost: -3,
            description: 'A dented aluminum can. The label is unreadable.'
        },
        fluorescent_badge: {
            id: 'fluorescent_badge',
            name: 'Fluorescent Badge',
            tags: ['light', 'key', 'security'],
            fragility: 0.2,
            consumable: false,
            energyCost: 0,
            description: 'A pulsing neon employee badge. It hums with purpose.'
        },
        cracked_mirror: {
            id: 'cracked_mirror',
            name: 'Cracked Mirror',
            tags: ['light', 'rigid', 'fragile'],
            fragility: 0.95,
            consumable: false,
            sanityCost: -10,
            energyCost: -2,
            description: 'A fractured reflection. Gazing into it drains you.'
        },
        water_bottle: {
            id: 'water_bottle',
            name: 'Water Bottle',
            tags: ['consumable', 'container'],
            fragility: 0.1,
            consumable: true,
            energyRestore: 15,
            energyCost: 0,
            description: 'A half-empty plastic bottle. The water is clear but tastes wrong.'
        },
        plasteel_key: {
            id: 'plasteel_key',
            name: 'Plasteel Key',
            tags: ['key', 'security', 'rigid'],
            fragility: 0.1,
            consumable: false,
            description: 'A synthetic key humming with dormant access codes.'
        },
        moss_sample: {
            id: 'moss_sample',
            name: 'Moss Sample',
            tags: ['organic', 'consumable'],
            fragility: 0.4,
            consumable: true,
            sanityRestore: -5,
            energyRestore: 10,
            description: 'Bioluminescent algae in a sealed vial. It glows faintly.'
        }
    },

    rooms: {
        room_01_01_arrival: {
            id: 'room_01_01_arrival',
            episode: 1,
            sequence: 1,
            title: '01: THE ARRIVAL',
            img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%230a0e27" width="800" height="600"/%3E%3Crect fill="%23ff10f0" opacity="0.1" width="800" height="600"/%3E%3Ctext x="400" y="300" text-anchor="middle" font-size="48" fill="%23ff006e" font-family="monospace"%3ELEVEL 01%3C/text%3E%3C/svg%3E',
            desc: `You materialize on cold tile. A flickering neon sign above simply reads '01'. To the north, a <span class="clickable-target" data-target-id="blast_door">heavy security door</span> blocks the path into the maze. A <span class="clickable-target" data-target-id="keycard">plastic card</span> lies discarded on the floor.`,
            exits: {
                'NORTH': { target: 'room_01_02_corridor', locked: true, unlockTag: 'security' }
            },
            scenery: {
                keycard: {
                    id: 'keycard',
                    name: 'Fluorescent Badge',
                    required_tags: [],
                    description: 'You pick up the card. It hums with a faint neon glow.',
                    loot: ['fluorescent_badge']
                },
                blast_door: {
                    id: 'blast_door',
                    name: 'Security Door',
                    required_tags: ['security'],
                    description: 'You swipe the badge. The heavy door slides open with a grinding thud, unlocking the path NORTH.',
                    loot: [],
                    unlocksExit: 'NORTH' 
                }
            },
            checkpoint: true
        },
        
        room_01_02_corridor: {
            id: 'room_01_02_corridor',
            episode: 1,
            sequence: 2,
            title: '01: THE MARBLE CORRIDOR',
            img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23000" width="800" height="600"/%3E%3Crect fill="%2300f5ff" opacity="0.15" width="800" height="600"/%3E%3Cpath stroke="%23ff006e" stroke-width="2" d="M 0 300 Q 100 200, 200 300 T 400 300 T 600 300 T 800 300"/%3E%3C/svg%3E',
            desc: `An impossibly long corridor lined with pale marble. Your footsteps echo with an unnatural clarity. To the south is the arrival room.`,
            exits: {
                'SOUTH': { target: 'room_01_01_arrival', locked: false }
            },
            scenery: {},
            checkpoint: false
        }
    }
};
