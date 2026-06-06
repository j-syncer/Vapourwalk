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
        entry_hall: {
            id: 'entry_hall',
            title: 'The Lobby',
            img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%230a0e27" width="800" height="600"/%3E%3Crect fill="%23ff10f0" opacity="0.1" width="800" height="600"/%3E%3Ctext x="400" y="300" text-anchor="middle" font-size="48" fill="%23ff006e" font-family="monospace"%3ELIMINAL.OS%3C/text%3E%3C/svg%3E',
            desc: `You stand in an endless lobby. Fluorescent lights buzz overhead, casting a sickly pale glow across cream-colored tiles. The architecture seems designed to make you forget where you are—or perhaps to make you forget you ever tried to leave. To the north, a corridor stretches into darkness. To the east, you can make out the entrance to what appears to be a vast indoor pool. Scattered across the floor are the remnants of a corporate world: scattered <span class="clickable-target" data-target-id="papers">papers</span>, a <span class="clickable-target" data-target-id="luggage">broken piece of luggage</span>, and the faint smell of chlorine mixed with something you can't quite place.`,
            exits: {
                'NORTH': 'corridor_west',
                'EAST': 'pool_chamber'
            },
            scenery: {
                papers: {
                    id: 'papers',
                    name: 'Scattered Papers',
                    required_tags: ['light'],
                    description: 'The papers are too faded to read. Corporate memos? Exit signs? It doesn\'t matter anymore.',
                    loot: []
                },
                luggage: {
                    id: 'luggage',
                    name: 'Broken Luggage',
                    required_tags: ['heavy', 'rigid'],
                    description: 'You manage to pry open the cracked shell. Inside, you find a water bottle.',
                    loot: ['water_bottle']
                }
            },
            checkpoint: false
        },

        corridor_west: {
            id: 'corridor_west',
            title: 'The Marble Corridor',
            img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23000" width="800" height="600"/%3E%3Crect fill="%2300f5ff" opacity="0.15" width="800" height="600"/%3E%3Cpath stroke="%23ff006e" stroke-width="2" d="M 0 300 Q 100 200, 200 300 T 400 300 T 600 300 T 800 300"/%3E%3C/svg%3E',
            desc: `An impossibly long corridor lined with pale marble. Your footsteps echo with an unnatural clarity. The walls are decorated with abstract statuary—featureless forms in various states of decay. Some look almost human. As you walk, you notice the air grows colder. A <span class="clickable-target" data-target-id="statue">marble statue</span> blocks the direct path north, and to your west is a <span class="clickable-target" data-target-id="maintenance_door">rusted maintenance door</span>. Something metallic lies on the ground: a <span class="clickable-target" data-target-id="pipe">pipe</span>.`,
            exits: {
                'SOUTH': 'entry_hall',
                'EAST': 'corridor_east',
                'WEST': 'maintenance_room'
            },
            scenery: {
                statue: {
                    id: 'statue',
                    name: 'Marble Statue',
                    required_tags: ['heavy'],
                    description: 'The statue is heavy and immovable. But as you push it, you notice something... carved into its base. A keycard slot.',
                    loot: []
                },
                pipe: {
                    id: 'pipe',
                    name: 'Rusty Pipe',
                    required_tags: [],
                    description: 'You pick up the pipe. It\'s heavier than expected.',
                    loot: ['rusty_pipe']
                },
                maintenance_door: {
                    id: 'maintenance_door',
                    name: 'Maintenance Door',
                    required_tags: ['key', 'security'],
                    description: 'The door hisses as it swings open, revealing a cramped room beyond.',
                    loot: []
                }
            },
            checkpoint: false
        },

        pool_chamber: {
            id: 'pool_chamber',
            title: 'The Indoor Pool',
            img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%230a1a2e" width="800" height="600"/%3E%3Crect fill="%2300f5ff" opacity="0.3" y="200" width="800" height="300"/%3E%3Ctext x="400" y="80" text-anchor="middle" font-size="36" fill="%23b800e6" font-family="monospace"%3EMPTY POOL%3C/text%3E%3C/svg%3E',
            desc: `An enormous indoor swimming pool, drained long ago. The tile walls are a sickly shade of turquoise, stained with algae. The deep end stretches down into shadow. A set of <span class="clickable-target" data-target-id="stairs">metal stairs</span> leads down into the darkness. Scattered around the pool deck are <span class="clickable-target" data-target-id="lounge_chairs">broken lounge chairs</span> and the <span class="clickable-target" data-target-id="badge">remnants of a security badge</span>. The air tastes like chlorine and something organic.`,
            exits: {
                'WEST': 'entry_hall',
                'DOWN': 'pool_deep'
            },
            scenery: {
                stairs: {
                    id: 'stairs',
                    name: 'Metal Stairs',
                    required_tags: [],
                    description: 'The stairs descend into darkness. You feel drawn downward.',
                    loot: []
                },
                lounge_chairs: {
                    id: 'lounge_chairs',
                    name: 'Lounge Chairs',
                    required_tags: ['rigid'],
                    description: 'You examine the chairs and find a cracked mirror underneath one.',
                    loot: ['cracked_mirror']
                },
                badge: {
                    id: 'badge',
                    name: 'Security Badge',
                    required_tags: [],
                    description: 'You pick up the badge. It pulses with a faint neon glow.',
                    loot: ['fluorescent_badge']
                }
            },
            checkpoint: false
        },

        corridor_east: {
            id: 'corridor_east',
            title: 'The Eastern Wing',
            img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23220033" width="800" height="600"/%3E%3Crect fill="%23ffff00" opacity="0.1" width="800" height="600"/%3E%3C/svg%3E',
            desc: `The corridor transitions into what might have been administrative offices. Doors line the walls on both sides, their frosted glass panels obscured by dust and mold. A <span class="clickable-target" data-target-id="vending_machine">vending machine</span> stands in the corner, its neon signs long dead. To the north, you can see light—harsh, artificial light.`,
            exits: {
                'WEST': 'corridor_west',
                'NORTH': 'upper_atrium'
            },
            scenery: {
                vending_machine: {
                    id: 'vending_machine',
                    name: 'Vending Machine',
                    required_tags: ['heavy', 'rigid'],
                    description: 'You manage to shake the machine. A tuna can tumbles out.',
                    loot: ['tuna_can']
                }
            },
            checkpoint: false
        },

        maintenance_room: {
            id: 'maintenance_room',
            title: 'The Maintenance Room',
            img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23000" width="800" height="600"/%3E%3Crect fill="%23ff006e" opacity="0.2" width="800" height="600"/%3E%3C/svg%3E',
            desc: `A claustrophobic room filled with pipes and hissing valves. This place smells of rust and stale air. A <span class="clickable-target" data-target-id="control_panel">control panel</span> is mounted on the far wall, its buttons glowing faintly. Next to it, a <span class="clickable-target" data-target-id="locked_cabinet">locked cabinet</span> sits dark and forbidding.`,
            exits: {
                'EAST': 'corridor_west'
            },
            scenery: {
                control_panel: {
                    id: 'control_panel',
                    name: 'Control Panel',
                    required_tags: [],
                    description: 'The buttons are labeled in a language you don\'t recognize. Pressing one does nothing.',
                    loot: []
                },
                locked_cabinet: {
                    id: 'locked_cabinet',
                    name: 'Locked Cabinet',
                    required_tags: ['key'],
                    description: 'The cabinet swings open with a pneumatic hiss. Inside is a plasteel key.',
                    loot: ['plasteel_key']
                }
            },
            checkpoint: false
        },

        pool_deep: {
            id: 'pool_deep',
            title: 'The Deep End',
            img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23001a33" width="800" height="600"/%3E%3Crect fill="%2300f5ff" opacity="0.4" width="800" height="600"/%3E%3Ctext x="400" y="300" text-anchor="middle" font-size="48" fill="%23ff006e" font-family="monospace" opacity="0.3"%3E..........%3C/text%3E%3C/svg%3E',
            desc: `You descend into the deep end of the pool. The darkness is almost complete. Your breath echoes off tile and concrete. There's something in the water—a faint bioluminescence. You can make out <span class="clickable-target" data-target-id="moss">glowing moss</span> covering the floor. An <span class="clickable-target" data-target-id="exit_door">emergency exit</span> is marked on the far wall.`,
            exits: {
                'UP': 'pool_chamber',
                'FORWARD': 'upper_atrium'
            },
            scenery: {
                moss: {
                    id: 'moss',
                    name: 'Bioluminescent Moss',
                    required_tags: [],
                    description: 'You carefully extract a sample of the glowing moss.',
                    loot: ['moss_sample']
                },
                exit_door: {
                    id: 'exit_door',
                    name: 'Emergency Exit',
                    required_tags: [],
                    description: 'The exit sign is dark. The door is sealed.',
                    loot: []
                }
            },
            checkpoint: false
        },

        upper_atrium: {
            id: 'upper_atrium',
            title: 'The Upper Atrium',
            img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23333300" width="800" height="600"/%3E%3Crect fill="%23ffff00" opacity="0.15" width="800" height="600"/%3E%3Ctext x="400" y="150" text-anchor="middle" font-size="36" fill="%23ff006e"%3E[ ? ]%3C/text%3E%3C/svg%3E',
            desc: `You've reached a vast open atrium. Skylights filter wan sunlight from impossibly high above. The walls rise in concentric circles, each level lined with doors. The architecture defies logic—it should be impossible to be both inside and under open sky. A <span class="clickable-target" data-target-id="elevator">dormant elevator</span> stands to one side, its doors fused shut.`,
            exits: {
                'SOUTH': 'corridor_east',
                'DOWN': 'pool_deep'
            },
            scenery: {
                elevator: {
                    id: 'elevator',
                    name: 'Fused Elevator',
                    required_tags: ['heavy', 'tool'],
                    description: 'You work at the elevator doors. After much effort, they slide open, revealing a shaft descending into darkness.',
                    loot: []
                }
            },
            checkpoint: true
        }
    }
};
