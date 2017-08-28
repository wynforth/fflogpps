var all_potencies = {
	'Bard': {
		'Shot': 100,
		'Heavy Shot': 150,
		'Straight Shot': 140,
		'Empyreal Arrow': 230,
		'Iron Jaws': 100,
		'Refulgent Arrow': 300,

		'Quick Nock': 110,
		'Rain Of Death': 100,

		'Sidewinder': 100,
		"Misery's End": 190,
		'Bloodletter': 130,

		"Mage's Ballad": 100,
		"Army's Paeon": 100,
		"The Wanderer's Minuet": 100,

		'Caustic Bite': 120,
		'Stormbite': 120,
	},
	'BlackMage': {
		'Attack': 110,
		'Fire': 180,
		'Fire II': 80,
		'Fire III': 240,
		'Fire IV': 260,
		'Flare': 260,
		'Blizzard I': 180,
		'Blizzard II': 50,
		'Blizzard III': 240,
		'Blizzard IV': 260,
		'Freeze': 100,
		'Thunder I': 30,
		'Thunder II': 30,
		'Thunder III': 70,
		'Thunder IV': 50,
		'Scathe': 100,
		'Foul': 650,
	},
	'Dragoon': {
		'Attack': 110,
		'True Thrust': 150,
		'Vorpal Thrust': 100,
		'Impulse Drive': 190,
		'Heavy Thrust': (180 * 9 + 140) / 10,
		'Piercing Talon': 120,
		'Full Thrust': 100,
		'Jump': 250,
		'Disembowel': 100,
		'Doom Spike': 130,
		'Spineshatter Dive': 200,
		'Chaos Thrust': (140 * 9 + 100) / 10,
		'Dragonfire Dive': 300,
		'Fang And Claw': (290 * 9 + 250) / 10,
		'Wheeling Thrust': (290 * 9 + 250) / 10,
		'Geirskogul': 220,
		'Sonic Thrust': 100,
		'Mirage Dive': 200,
		'Nastrond': 320
	},
	'Machinist': {
		'Shot': 100,
		'Hot Shot': 120,
		'Split Shot': 160,
		'Slug Shot': 100,
		'Heartbreak': 240,
		'Spread Shot': 80,
		'Clean Shot': 100,
		'Gauss Round': 200,
		'Ricochet': 300,
		'Cooldown': 150,
		'Flamethrower': 60,
		'Heated Split Shot': 190,
		'Heated Slug Shot': 100,
		'Heated Clean Shot': 100,
		'Wildfire': 0,
	},
	'Rook Autoturret': {
		'Charged Volley Fire': 160,
		'Volley Fire': 80,
		'Rook Overload': 800,
	},
	'Bishop Autoturret': {
		'Aether Mortar': 60,
		'Charged Aether Mortar': 90,
		'Bishop Overload': 600,
	},
	'Monk': {
		'Attack': 110,
		'Bootshine': (140 + (140 * 1.45) * 9) / 10, //weighted average 90% hitting positional
		'True Strike': (140 + 180 * 9) / 10,
		'Demolish': (30 + 70 * 9) / 10,
		'Dragon Kick': (100 + 140 * 9) / 10,
		'Twin Snakes': (100 + 130 * 9) / 10,
		'Snap Punch': (130 + 170 * 9) / 10,
		'Arm of the Destroyer': 50,
		'One Ilm Punch': 120,
		'Rockbreaker': 130,
		'The Forbidden Chakra': 250,
		'Elixir Field': 220,
		'Steel Peak': 150,
		'Shoulder Tackle': 100,
		'Howling Fist': 210,
		'Tornado Kick': 330,
		'Riddle of Wind': 65,
		'Earth Tackle': 100,
		'Wind Tackle': 65,
		'Fire Tackle': 130,	
	},
	'Ninja': {
		'Attack': 110,
		'Spinning Edge': 150,
		'Gust Slash': 100,
		'Assassinate': 200,
		'Throwing Dagger': 120,
		'Mug': 140,
		'Trick Attack': 400, //scan ahead for the vuln up state?
		'Aeolian Edge': (160 * 9 + 100) / 10,
		'Jugulate': 80,
		'Shadow Fang': 100,
		'Death Blossom': 110,
		'Armor Crush': (160 * 9 + 100) / 10,
		'Dream Within A Dream': 150,
		'Hellfrog Medium': 400,
		'Bhavacakra': 600,
		'Fuma Shuriken': 240,
		'Katon': 250,
		'Raiton': 360,
		'Hyoton': 140,
		'Doton': 40,
		'Suiton': 180
	},
	'RedMage':{
		'Attack': 110,
		'Riposte': 130,
		'Zwerchhau': 100,
		'Redoublement': 100,
		'Jolt': 180,
		'Impact': 270,
		'Verthunder': 300,
		'Verfire': 270,
		'Verflare': 550,
		'Veraero': 300,
		'Verstone': 270,
		'Verholy': 550,
		'Scatter': 100,
		'Moulinet': 60,
		'Corps-a-corps': 130,
		'Displacement': 130,
		'Fleche': 420,
		'Contre Sixte': 300,
		'Jolt II': 240,
		'Enchanted Riposte': 210,
		'Enchanted Zwerchhau': 100,
		'Enchanted Redoublement': 100,
		'Enchanted Moulinet': 60,
	},
	'Samurai': {
		'Attack': 110,
		'Hakaze': 150,
		'Jinpu': 100,
		'Gekko': 100,
		'Yukikaze': 100,
		'Shifu': 100,
		'Kasha': 100,
		'Fuga': 100,
		'Mangetsu': 100,
		'Oka': 100,
		'Ageha': 200,
		'Enpi': 100,
		'Higanbana': 240,
		'Midare Setsugekka': 720,
		'Tenka Goken': 360,
		'Hissatsu: Gyoten': 100,
		'Hissatsu: Yaten': 100,
		'Hissatsu: Shinten': 300,
		'Hissatsu: Kyuten': 150,
		'Hissatsu: Seigan': 200,
		'Hissatsu: Guren': 800,
	},
	'Summoner': {
		'Attack': 110,
		'Ruin': 100,
		'Ruin II': 100,
		'Ruin III': 150,
		'Ruin IV': 200,
		'Energy Drain': 150,
		'Painflare': 200,
		'Deathflare': 400,
		'Miasma': 20,
		'Miasma III': 50,
		'Fester': 0,
		'Tri-bind': 20,
		'Shadow Flare': 0,
		'Bio': 0,
		'Bio II': 0,
		'Bio III': 0,
		//special case
		'Radiant Shield': 50,
	},
	'Summoner-Egi': {
		'Attack': 80,
		//Bahamut
		'Wyrmwave': 160,
		'Akh Morn': 680,
		//emerald
		'Gust': 90,
		'Backdraft': 80,
		'Downburst': 80,
		//topaz
		'Gouge': 70,
		'Shining Topaz': 60,
		'Storm': 60,
		//garuda
		'Wind Blade': 110,
		'Shockwave': 90,
		'Aerial Slash': 90,
		'Aerial Blast': 250,
		//titan
		'Rock Buster': 85,
		'Mountain Buster': 70,
		'Landslide': 70,
		'Earthen Fury': 200,
		//ifrit
		'Crimson Cyclone': 110,
		'Burning Strike': 135,
		'Radiant Shield': 50,
		'Flaming Crush': 110,
		'Inferno': 200,
		'Radiant Shield': 50,
	}
}

var all_dot_base = {
	'Bard': {
		'Storm Bite': 55,
		'Caustic Bite': 45,
	},
	'BlackMage': {
		'Thunder IV': 30,
		'Thunder III': 40,
	},
	'Dragoon': {
		'Chaos Thrust': 35,
	},
	'Machinist': {
		'Flamethrower': 60,
		'Wildfire': 0,
	},
	'Monk': {
		'Demolish': 50,
	},
	'Ninja': {
		'Shadow Fang': 35,
		'Doton': 40,
	},
	'Samurai': {
		'Higanbana': 35,
	},
	'RedMage': {},
	'Summoner': {
		'Shadow Flare': 50,
		'Bio': 40,
		'Bio II': 35,
		'Bio III': 50,
		'Miasma': 35,
		'Miasma III': 50,
		'Inferno': 20,
		'Radiant Shield': 50,
	}
}
	
var all_pos_potencies = {
	'Bard': {},
	'BlackMage': {},
	'Dragoon': {
		'Heavy Thrust': 180,
		'Chaos Thrust': 140,
		'Fang And Claw': 290,
		'Wheeling Thrust': 290,
	},
	'Machinist': {},
	'Monk': {
		'Bootshine': 140 * 1.45,
		'True Strike': 180,
		'Demolish': 70,
		'Dragon Kick': 140,
		'Twin Snakes': 130,
		'Snap Punch': 170
	},
	'Ninja': {
		'Aeolian Edge': 160,
		'Armor Crush': 160,
	},
	'RedMage': {},
	'Samurai': {},
	'Summoner': {},
}

var all_combo_potencies = {
	'Bard': {},
	'BlackMage': {},
	'Dragoon': {
		'Vorpal Thrust': 240,
		'Full Thrust': 440,
		'Disembowel': 230,
		'Chaos Thrust': (270 * 9 + 230) / 10,
		'Sonic Thrust': 170,
		'Fang And Claw': 100 + ((290 * 9 + 250) / 10),
		'Wheeling Thrust': 100 + ((290 * 9 + 250) / 10),
	},
	'Machinist': {
		'Slug Shot': 200,
		'Clean Shot': 240,
		'Cooldown': 230,
		'Heated Slug Shot': 230,
		'Heated Clean Shot': 270,
	},
	'Ninja': {
		'Gust Slash': 200,
		'Aeolian Edge': (340 * 9 + 280) / 10,
		'Shadow Fang': 200,
		'Armor Crush': (300 * 9 + 240) / 10,
	},
	'RedMage': {
		'Zwerchhau': 150,
		'Redoublement': 230,
		'Enchanted Zwerchhau': 290,
		'Enchanted Redoublement': 470,
	},
	'Samurai': {
		'Jinpu': 280,
		'Gekko': 400,
		'Yukikaze': 340,
		'Shifu': 280,
		'Kasha': 400,
		'Mangetsu': 200,
		'Oka': 200,
	},
	'Summoner': {},
}

var all_pos_combo_potencies = {
	'Bard': {},
	'BlackMage': {},
	'Dragoon': {
		'Chaos Thrust': 270,
		'Fang And Claw': 100 + 290,
		'Wheeling Thrust': 100 + 290,
	},
	'Machinist': {},
	'Monk': {},
	'Ninja': {
		'Aeolian Edge': 340,
		'Armor Crush': 300,
	},
	'RedMage': {},
	'Samurai': {},
	'Summoner': {},
}

var all_combo = {
	'Bard': {},
	'Dragoon': {
		'Vorpal Thrust': ['True Thrust'],
		'Full Thrust': ['Vorpal Thrust'],
		'Disembowel': ['Impulse Drive'],
		'Chaos Thrust': ['Disembowel'],
		'Sonic Thrust': ['Doom Spike'],
		'Wheeling Thrust': ['Fang And Claw'],
		'Fang And Claw': ['Wheeling Thrust'],
	},
	'Ninja': {
		'Gust Slash': ['Spinning Edge'],
		'Aeolian Edge': ['Gust Slash'],
		'Shadow Fang': ['Gust Slash'],
	},
	'RedMage': {
		'Zwerchhau': ['Riposte', 'Enchanted Riposte'],
		'Redoublement': ['Zwerchhau', 'Enchanted Zwerchhau'],
		'Enchanted Zwerchhau': ['Riposte', 'Enchanted Riposte'],
		'Enchanted Redoublement': ['Zwerchhau', 'Enchanted Zwerchhau'],
	},
	'Samurai': {
		'Jinpu': ['Hakaze'],
		'Gekko': ['Jinpu'],
		'Shifu': ['Hakaze'],
		'Kasha': ['Shifu'],
		'Yukikaze': ['Hakaze'],
		'Mangetsu': ['Fuga'],
		'Oka': ['Fuga'],
	}
}

	//anything that makes/breaks a combo
var all_comboskills = {
	'Bard': [],
	'Dragoon': ['True Thrust', 'Vorpal Thrust', 'Impulse Drive', 'Heavy Thrust', 'Full Thrust', 'Disembowel', 'Chaos Thrust', 'Fang And Claw', 'Wheeling Thrust', 'Doom Spike', 'Sonic Thrust', 'Piercing Talon'],
	'Ninja': ['Gust Slash', 'Spinning Edge', 'Aeolian Edge', 'Shadow Fang', 'Throwing Dagger', 'Death Blossom'],
	'RedMage': ['Moulinet', 'Enchanted Moulinet', 'Zwerchhau', 'Riposte', 'Enchanted Riposte', 'Redoublement', 'Enchanted Zwerchhau', 'Enchanted Redoublement'],
	'Samurai': ['Hakaze', 'Jinpu', 'Gekko', 'Shifu', 'Kasha', 'Yukikaze', 'Mangetsu', 'Fuga', 'Oka', 'Enpi'],
}

	//all 'WeaponSkills'
var all_weaponskills = {
	'Bard': ["Heavy Shot","Straight Shot","Empyreal Arrow","Iron Jaws","Refulgent Arrow","Quick Nock","Caustic Bite","Stormbite"],
	'Dragoon': ['True Thrust', 'Vorpal Thrust', 'Impulse Drive', 'Heavy Thrust', 'Full Thrust', 'Disembowel', 'Chaos Thrust', 'Fang And Claw', 'Wheeling Thrust', 'Doom Spike', 'Sonic Thrust', 'Piercing Talon'],
	'Machinist': ['Hot Shot', 'Split Shot', 'Slug Shot', 'Spread Shot', 'Clean Shot', 'Cooldown', 'Heated Split Shot', 'Heated Slug Shot', 'Heated Clean Shot'],
	'RedMage': ['Moulinet', 'Zwerchhau', 'Riposte', 'Redoublement', 'Enchanted Moulinet', 'Enchanted Riposte', 'Enchanted Zwerchhau', 'Enchanted Redoublement'],
	'Samurai': ['Hakaze', 'Jinpu', 'Gekko', 'Shifu', 'Kasha', 'Yukikaze', 'Mangetsu', 'Fuga', 'Oka', 'Enpi', 'Higanbana', 'Midare Setsugekka', 'Tenka Goken'],
}	

//buffs

var all_buffs = {
	'Bard': {
		'Increased Action Damage II': new Buff('Trait II', .20, true, ['Shot']),
		'Raging Strikes': new Buff('Raging Strikes', .10),
		'Straight Shot': new Buff('Straight Shot', (.10 * .45)),
		'Foe Requiem': new Debuff('Foe Requiem', .03),
		'song': new Debuff('Placeholder', 0),
		'Storm Bite': new Debuff('Storm Bite', 0),
		'Caustic Bite': new Debuff('Caustic Bite', 0),
	},
	'BlackMage':{
		'Trait': new Buff('Magic & Mend II', .3, true, ['Attack']),
		'Enochian': new Buff('Enochian', .1, false, ['Attack'])
	},
	'Dragoon': {
		'Blood Of The Dragon': new Buff('Blood Of The Dragon', .30, false, [], ['Jump', 'Spineshatter Dive']),
		'Heavy Thrust': new Buff('Heavy Thrust', .15),
		'Blood For Blood': new Buff('Blood For Blood', .15),
		'Right Eye': new Buff('Right Eye', .10),
		'Battle Litany': new Buff('Battle Litany', (.15 * .45)),
		'True North': new Buff('True North', 0),
		'Piercing Resistance Down': new Debuff('Disemboweled', .05),
	},
	'Machinist': {
		'Trait': new Buff('Action Damage II', .20, true, ['Shot']),
		'Hot Shot': new Buff('Hot Shot', .08),
		'Overheated': new Buff('Overheated', .20),
		'Vulnerability Up': new Debuff('Hypercharge', .05),
		'Reassembled': new Buff('Reassembled', .45, false, [], all_weaponskills['Machinist']),
	},
	'Rook Autoturret': {
		'Trait': new Buff('Action Damage II', .20, true, ['Shot']),
		'Vulnerability Up': new Debuff('Hypercharge', .05),
	},
	'Bishop Autoturret': {
		'Trait': new Buff('Action Damage II', .20, true, ['Shot']),
		'Vulnerability Up': new Debuff('Hypercharge', .05),
	},
	'Monk': {
		'Riddle Of Fire': new Buff('Riddle of Fire', .30),
		'Fists Of Fire': new Buff('Fists of Fire', .05, true),
		'Internal Release': new Buff('Internal Release', .3 * .45, false, ['Bootshine']),
		'True North': new Buff('True North', 0),
		'Perfect Balance': new Buff('Perfect Balance', 0),
		'Twin Snakes': new Buff('Twin Snakes', .10),
		'Blunt Resistance Down': new Debuff('Dragon Kick', .10),
	},
	'Ninja': {
		'Dripping Blades': new Buff('Dripping Blades II', .2, true, ['Attack']),
		'True North': new Buff('True North', 0),
		'Ten Chi Jin': new BuffStack('Ten Chi Jin', 1.0, 0,1, 1, false, [], ['Fuma Shuriken', 'Katon', 'Raiton', 'Hyoton', 'Doton', 'Suiton']),
		'Shadow Fang': new Debuff('Shadow Fang', .10, ['Katon', 'Hellfrog Medium', 'Suiton', 'Raiton', 'Bhavacakra']),
		'Vulnerability Up': new DebuffTimed('Trick Attack', .10, 10),
		'Duality': new Buff('Duality',0),
		'Huton': new Buff('Huton',0),
	},
	'RedMage': {
		'Main & Mend II': new Buff('Trait', .30, true, ['Attack'], []),
		'Embolden': new BuffStack('Embolden', 0, .02, 5, 5, false, ['Attack', 'Fleche', 'Contre Sixte', 'Corps-a-corps', 'Displacement', 'Moulinet', 'Zwerchhau', 'Riposte', 'Redoublement'], []),
		'Acceleration': new Buff('Acceleration', 0),
	},
	'Samurai': {
		'Meikyo Shisui': new Buff('Meikyo Shisui', 0),
		'True North': new Buff('True North', 0),
		'Jinpu': new Buff('Jinpu', .10),
		'Kaiten': new Buff('Hissatsu: Kaiten', .50, false, [], ['Hakaze', 'Jinpu', 'Gekko', 'Shifu', 'Kasha', 'Yukikaze', 'Mangetsu', 'Fuga', 'Oka', 'Enpi', 'Higanbana', 'Midare Setsugekka', 'Tenka Goken']),
		'Slashing Resistance Down': new DebuffTimed('Yukikaze', .10, 30),
	},
	'Summoner': {
		'Bio III': new DebuffDirect('Bio III', 150, [], ['Fester']),
		'Miasma III': new DebuffDirect('Miasma III', 150, [], ['Fester']),
		'Ruination': new DebuffDirect('Ruination', 20, [], ['Ruin', 'Ruin II', 'Ruin III', 'Ruin IV']),
		'Magic & Mend': new Buff('Trait', .30, true, ['Radiant Shield']),
		'Dreadwyrm Trance': new Buff('Dreadwyrm Trance', .10, false,['Attack', 'Radiant Shield']),
		'Magic Vulnerability Up': new Debuff('Contagion', .10, ['Attack', 'Radiant Shield']),
	}
}

var buff_display = {
	'Bard':{
		'Straight Shot': '#B01F00',
		'Foe Requiem': '#90D0D0',
		'Raging Strikes': '#D03F00',
		'song': '#fff',
		'Storm Bite': '#9DBBD2',
		'Caustic Bite': '#D75896',
	},
	'Dragoon': {
		'Blood Of The Dragon': '#7DA3AD',
		'Heavy Thrust': '#CDA34C',
		'Blood For Blood': '#901F1D',
		'Right Eye': '#B41512',
		'Battle Litany': '#6F8C93',
		'Piercing Resistance Down': '#932F2F',
		'True North': '#C07F4F',
	},
	'Machinist': {
		'Hot Shot': '#6D2600',
		'Vulnerability Up': '#9BA275',
		'Overheated': '#A6391E',
	},
	'Monk': {
		'Twin Snakes': '#B7727D',
		'Blunt Resistance Down': '#932F2F',
		'Internal Release': '#8DD7AF',
		'Riddle Of Fire': '#D8786F',
		'Perfect Balance': '#DF964C',
		'True North': '#C07F4F',
	},
	'Ninja': {
		'Vulnerability Up': '#933630',
		'Shadow Fang': '#44B3DA',
		'Ten Chi Jin': '#BA4B4A',
		'True North': '#C07F4F',
		'Huton': '#7DB6C3',
	},
	'RedMage': {
		'Embolden': '#C19143',
		'Acceleration': '#AF2234',
	},
	'Samurai': {
		'Meikyo Shisui': '#E04F4F',
		'Jinpu': '#E0B000',
		'Slashing Resistance Down': '#932F2F',
		'Kaiten': '#C04F0F',
		'True North': '#C07F4F',
	},
	'Summoner': {
		'Dreadwyrm Trance': '#C1294D',
		'Ruination': '#4BA1EC',
		'Bio III': '#56631E',
		'Miasma III': '#4B494F',
		'Magic Vulnerability Up': '#932F2F'
	}
}

var all_timers = {
	'Bard': {},
	'BlackMage': {},
	'Dragoon': {},
	'Machinist': {},
	'Monk': {},
	'Ninja': {
		'Huton': new Timer('Huton', 70),
	},
	'RedMage': {},
	'Samurai': {},
	'Summoner': {},
}

var template = {
	'Bard': {},
	'BlackMage': {},
	'Dragoon': {},
	'Machinist': {},
	'Monk': {},
	'Ninja': {},
	'RedMage': {},
	'Samurai': {},
	'Summoner': {},
}