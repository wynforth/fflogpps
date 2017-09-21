const  egiAbilities = [
		//Demi-Bahamut
		'Wyrmwave', 'Akh Morn',
		//emerald
		'Gust', 'Backdraft', 'Downburst', 
		//topaz
		'Gouge', 'Shining Topaz', 'Storm',
		//garuda
		'Wind Blade', 'Shockwave', 'Aerial Slash', 'Aerial Blast',
		//titan
		'Rock Buster', 'Mountain Buster', 'Landslide', 'Earthen Fury',
		//ifrit
		'Crimson Cyclone', 'Burning Strike', 'Radiant Shield', 'Flaming Crush', 'Inferno', 'Radiant Shield',
	];

const all_potencies = {
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
		
		'Pitch Perfect': 100,
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
		//Rook
		'Charged Volley Fire': 160,
		'Volley Fire': 80,
		'Rook Overload': 800,
		//Bishop
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
	
	//'Summoner-Egi':
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
	},
	'DarkKnight': {
		'Attack': 110,
		'Hard Slash': 150,
		'Spinning Slash': 100,
		'Unleash': 50,
		'Syphon Strike': 100,
		'Unmend': 150,
		'Power Slash': 100,
		'Souleater': 100,
		'Dark Passenger': 100,
		'Salted Earth': 75,
		'Plunge': 200,
		'Abyssal Drain': 120,
		'Carve And Spit': 100,
		'Quietus': 160,
		'Bloodspiller': 400,
	},
	'Paladin': {
		'Attack': 110,
		'Fast Blade': 160,
		'Savage Blade': 100,
		'Riot Blade': 100,
		'Shield Lob': 120,
		'Shield Bash': 110,
		'Shield Swipe': 150,
		'Spirits Within': 300,
		'Total Eclipse': 110,
		'Circle Of Scorn': 100,
		'Goring Blade': 100,
		'Royal Authority': 100,
		'Sword Oath': 75,
		'Holy Spirit': 400,
		'Requiescat': 350,
	},
	'Warrior': {
		'Attack': 110,
		'Heavy Swing': 150,
		'Skull Sunder': 100,
		'Overpower': 120,
		'Tomahawk': 130,
		'Maim': 100,
		"Butcher's Block": 100,
		"Storm's Path": 100,
		'Steel Cyclone': 200,
		"Storm's Eye": 100,
		'Fell Cleave': 500,
		'Decimate': 280,
		'Onslaught': 100,
		'Upheaval': 300,
		'Inner Beast': 350,
	},
	//Healers
	'Astrologian': {
		'Attack': 110,
		'Malefic': 150,
		'Malefic II': 180,
		'Malefic III': 220,
		'Stellar Burst': 150,
		'Stellar Explosion': 200,
		'Lord Of Crowns': 300,
		'Gravity': 200,
	},
	'WhiteMage': {
		'Attack': 110,
		'Stone': 140,
		'Stone II': 200,
		'Stone III': 210,
		'Stone IV': 250,
		'Aero': 50,
		'Aero II': 50,
		'Aero III': 50,
		'Assize': 300,
		'Holy': 200,
	},
	'Scholar': {
		'Attack': 110,
		'Ruin': 100,
		'Ruin II': 100,
		'Energy Drain': 150,
		'Miasma': 20,
		'Miasma II': 100,
		'Broil': 190,
		'Broil II': 230,
	}
}

const all_dot_base = {
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
	},
	'DarkKnight': {
		'Salted Earth': 75,
	},
	'Paladin': {
		'Circle Of Scorn': 30,
		'Goring Blade': 60,
	}, 
	'Warrior': {
		'Vengeance': 50,
	},
	'Astrologian': {
		'Combust': 40,
		'Combust II': 50,
	},
	'WhiteMage': {
		'Aero': 30,
		'Aero II': 50,
		'Aero III': 40,
	},
	'Scholar': {
		'Bio': 40,
		'Bio II': 35,
		'Miasma': 35,
		'Miasma II': 25,
		'Shadow Flare': 50,
	}
}
	
const all_pos_potencies = {
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
	//tank
	'DarkKnight': {
		'Syphon Strike': 240,
		'Souleater': 240,
		'Dark Passenger': 240,
		'Carve And Spit': 450,
		'Quietus': 210,
		'Bloodspiller': 540,
	},
	'Paladin': {},
	'Warrior': {},
	//heals
	'WhiteMage': {},
	'Astrologian': {},
	'Scholar': {},
}

const all_combo_potencies = {
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
	'DarkKnight': {
		'Spinning Slash': 220,
		'Syphon Strike': 250,
		'Power Slash': 300,
		'Souleater': 300,
	},
	'Paladin': {
		'Goring Blade': 250,
		'Royal Authority': 360,
		'Savage Blade': 210,
		'Riot Blade': 240,
		'Rage Of Halone': 270,
	},
	'Warrior': {
		'Skull Sunder': 200,
		'Maim': 190,
		"Butcher's Block": 280,
		"Storm's Path": 270,
		"Storm's Eye": 270,
	},
	//heals
	'WhiteMage': {},
	'Astrologian': {},
	'Scholar': {},
}

const all_pos_combo_potencies = {
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
	'DarkKnight': {
		'Syphon Strike': 390,
		'Souleater': 440,
	},
	'Paladin': {},
	'Warrior': {},
	//heals
	'WhiteMage': {},
	'Astrologian': {},
	'Scholar': {},
}

const all_combo = {
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
	'Machinist': {},
	'Monk': {},
	'Ninja': {
		'Gust Slash': ['Spinning Edge'],
		'Aeolian Edge': ['Gust Slash'],
		'Shadow Fang': ['Gust Slash'],
		'Armor Crush': ['Gust Slash'],
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
	},
	'DarkKnight':{
		'Spinning Slash': ['Hard Slash'],
		'Syphon Strike': ['Hard Slash'],
		'Power Slash': ['Spinning Slash'],
		'Souleater': ['Syphon Strike'],
	},
	'Paladin': {
		'Riot Blade': ['Fast Blade'],
		'Savage Blade': ['Fast Blade'],
		'Royal Authority': ['Riot Blade'],
		'Goring Blade': ['Riot Blade'],
		'Rage Of Halone': ['Savage Blade'],
	},
	'Warrior': {
		'Skull Sunder': ['Heavy Swing'],
		'Maim': ['Heavy Swing'],
		"Butcher's Block": ['Skull Sunder'],
		"Storm's Path": ['Maim'],
		"Storm's Eye": ['Maim'],
	},
	//heals
	'WhiteMage': {},
	'Astrologian': {},
	'Scholar': {},
}

	//anything that makes/breaks a combo
const all_comboskills = {
	'Bard': [],
	'Dragoon': ['True Thrust', 'Vorpal Thrust', 'Impulse Drive', 'Heavy Thrust', 'Full Thrust', 'Disembowel', 'Chaos Thrust', 'Fang And Claw', 'Wheeling Thrust', 'Doom Spike', 'Sonic Thrust', 'Piercing Talon'],
	'Machinist': [],
	'Monk': [],
	'Ninja': ['Gust Slash', 'Spinning Edge', 'Aeolian Edge', 'Shadow Fang', 'Throwing Dagger', 'Death Blossom'],
	'RedMage': ['Moulinet', 'Enchanted Moulinet', 'Zwerchhau', 'Riposte', 'Enchanted Riposte', 'Redoublement', 'Enchanted Zwerchhau', 'Enchanted Redoublement'],
	'Samurai': ['Hakaze', 'Jinpu', 'Gekko', 'Shifu', 'Kasha', 'Yukikaze', 'Mangetsu', 'Fuga', 'Oka', 'Enpi'],
	'DarkKnight': ['Hard Slash', 'Spinning Slash', 'Unleash', 'Syphon Strike', 'Unmend', 'Power Slash', 'Souleater', 'Abyssal Drain', 'Quietus'/*, 'Bloodspiller'*/],
	'Paladin': ['Fast Blade', 'Savage Blade', 'Riot Blade', 'Rage Of Halone', 'Goring Blade', 'Royal Authority', 'Holy Spirit', 'Shield Lob', 'Shield Bash', 'Total Eclipse', 'Clemency'],
	'Warrior': ['Heavy Swing', 'Skull Sunder', 'Maim', "Butcher's Block", "Storm's Eye", "Storm's Path", 'Overpower', 'Tomahawk'],
	//heals
	'Astrologian': [],
	'WhiteMage': [],
	'Scholar': [],
}

	//all 'WeaponSkills'
const all_weaponskills = {
	'Bard': ["Heavy Shot","Straight Shot","Empyreal Arrow","Iron Jaws","Refulgent Arrow","Quick Nock","Caustic Bite","Stormbite"],
	'Dragoon': ['True Thrust', 'Vorpal Thrust', 'Impulse Drive', 'Heavy Thrust', 'Full Thrust', 'Disembowel', 'Chaos Thrust', 'Fang And Claw', 'Wheeling Thrust', 'Doom Spike', 'Sonic Thrust', 'Piercing Talon'],
	'Machinist': ['Hot Shot', 'Split Shot', 'Slug Shot', 'Spread Shot', 'Clean Shot', 'Cooldown', 'Heated Split Shot', 'Heated Slug Shot', 'Heated Clean Shot'],
	'RedMage': ['Moulinet', 'Zwerchhau', 'Riposte', 'Redoublement', 'Enchanted Moulinet', 'Enchanted Riposte', 'Enchanted Zwerchhau', 'Enchanted Redoublement'],
	'Samurai': ['Hakaze', 'Jinpu', 'Gekko', 'Shifu', 'Kasha', 'Yukikaze', 'Mangetsu', 'Fuga', 'Oka', 'Enpi', 'Higanbana', 'Midare Setsugekka', 'Tenka Goken'],
	'DarkKnight': ['Hard Slash', 'Spinning Slash', 'Syphon Strike', 'Power Slash', 'Souleater', 'Quietus', 'Bloodspiller'],
	'Paladin': ['Fast Blade', 'Savage Blade', 'Riot Blade', 'Rage Of Halone', 'Goring Blade', 'Royal Authority', 'Shield Lob', 'Shield Bash', 'Total Eclipse'],
	'Warrior': ['Heavy Swing', 'Skull Sunder', 'Maim', "Butcher's Block", "Storm's Eye", "Storm's Path", 'Overpower', 'Tomahawk','Inner Beast', 'Steel Cyclone', 'Fell Cleave', 'Decimate'],
	//heals
	'Astrologian': [],
	'WhiteMage': [],
	'Scholar': [],
}	

//buffs

const all_buffs = {
	'Bard': {
		'Increased Action Damage II': new Buff('Trait II', .20, true, ['Shot']),
		'Raging Strikes': new Buff('Raging Strikes', .10),
		'Straight Shot': new Buff('Straight Shot', (.10 * .45)),
		'Foe Requiem': new Debuff('Foe Requiem', .03),
		"Army's Paeon": new Buff("Army's Paeon", 0),
		"Mage's Ballad": new Buff("Mage's Ballad", 0),
		"The Wanderer's Minuet": new Buff("The Wanderer's Minuet", 0),
		'Storm Bite': new Debuff('Storm Bite', 0),
		'Caustic Bite': new Debuff('Caustic Bite', 0),
	},
	'BlackMage':{
		'Thundercloud': new BuffThunder('Thundercloud', 1),
		'Trait': new Buff('Magic & Mend II', .3, true, ['Attack']),
		'Enochian': new Buff('Enochian', .1, false, ['Attack']),
		'Thunder III': new Debuff('Thunder III', 0),
		'Thunder IV': new Debuff('Thunder IV', 0),
		'Astral Fire': new BuffStackFire('Astral Fire', .2, .2, 3, 1, false, [], ['Fire', 'Fire II', 'Fire III', 'Fire IV', 'Flare', 'Blizzard', 'Blizzard II', 'Blizzard III', 'Blizzard IV', 'Freeze']),
		'Umbral Ice': new BuffStack('Umbral Ice', 0, -.1, 3, 1, false, [], ['Fire', 'Fire II', 'Fire III', 'Fire IV', 'Flare']),
		'Sharpcast': new Buff('Sharpcast', 0),
		'Triplecast': new Buff('Triplecast', 0),
		'Swiftcast': new Buff('Swiftcast', 0),
		'Circle Of Power': new Buff('Ley Lines', 0),
	},
	'Dragoon': {
		'Blood Of The Dragon': new Buff('Blood Of The Dragon', .30, false, [], ['Jump', 'Spineshatter Dive']),
		'Heavy Thrust': new Buff('Heavy Thrust', .15),
		'Blood For Blood': new Buff('Blood For Blood', .15),
		'Right Eye': new BuffStack('Right Eye', .10, 0, 1, 1),
		'Battle Litany': new Buff('Battle Litany', (.15 * .45)),
		'True North': new Buff('True North', 0),
		//'Piercing Resistance Down': new Debuff('Disemboweled', .05),
		'Piercing Resistance Down': new DebuffTimed('Disembowel', .05, 30),
	},
	'Machinist': {
		'Ammunition': new BuffDirectConsumedStack('Ammunition', 25, 0, 3, 3, false, [], all_weaponskills['Machinist']), 
		'Trait': new Buff('Action Damage II', .20, true, ['Shot']),
		'Hot Shot': new Buff('Hot Shot', .08, false, ['Charged Volley Fire', 'Volley Fire', 'Aether Mortar', 'Charged Aether Mortar', 'Rook Overload', 'Bishop Overload']),
		'Heat': new BuffStack('Heat', 0, 0, 100, 0),
		'Overheated': new Buff('Overheated', .20, false, ['Charged Volley Fire', 'Volley Fire', 'Aether Mortar', 'Charged Aether Mortar', 'Rook Overload', 'Bishop Overload']),
		'Vulnerability Up': new DebuffTimed('Hypercharge', .05, 10),
		'Reassembled': new Buff('Reassembled', .45, false, [], all_weaponskills['Machinist']),
		'Gauss Barrel': new Buff('Gauss Barrel', 0, true),
		'Cleaner Shot': new Buff('Cleaner Shot', 0, false),
		'Enhanced Slug Shot': new Buff('Enhanced Slug Shot', 0, false)
	},
	'Monk': {
		'Greased Lightning': new BuffStack('Greased Lightning', 0, .1, 3, 1),
		'Riddle Of Fire': new BuffStack('Riddle of Fire', .30, 0, 1, 1),
		'Fists Of Fire': new Buff('Fists of Fire', .05, true),
		'Internal Release': new Buff('Internal Release', .3 * .45, false, ['Bootshine']),
		'True North': new Buff('True North', 0),
		'Perfect Balance': new Buff('Perfect Balance', 0),
		'Twin Snakes': new Buff('Twin Snakes', .10),
		'Blunt Resistance Down': new DebuffTimed('Dragon Kick', .10, 15),
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
		'Swiftcast': new Buff('Swiftcast', 0),
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
		'Dreadwyrm Trance': new Buff('Dreadwyrm Trance', .10, false, egiAbilities.concat(['Attack', 'Radiant Shield'])),
		'Rouse': new Buff('Rouse', .40, false, [], egiAbilities.concat(['Attack'])),
		'Magic Vulnerability Up': new Debuff('Contagion', .10, ['Attack', 'Radiant Shield']),
		'Physical Vulnerability Up': new Debuff('Radiant Shield', .02, [], ['Attack', 'Radiant Shield']),
		'Swiftcast': new Buff('Swiftcast', 0),
	},
	
	'DarkKnight': {
		'Dark Arts': new Buff('Dark Arts', 0),
		'Grit': new Buff('Grit', -.20),
		'Blood Weapon': new BuffStack('Blood Weapon', 0, 0, 1, 1),
		'Darkside': new BuffStack('Darkside', .20, 0, 1, 1),
		
	},
	'Paladin': {
		'Sword Oath': new BuffStack('Sword Oath', 0, 0, 100, 100),
		'Shield Oath': new BuffStack('Shield Oath', -.20, 0, 100, 100),
		'Requiescat': new Buff('Requiscat', .2, false, [], ['Holy Spirit', 'Clemency']),
		'Fight Or Flight': new Buff('Fight or Flight', .25, false, ['Holy Spirit', 'Clemency']),
		'Goring Blade': new Debuff('Goring Blade', 0),
	},
	'Warrior': {
		'Defiance': new Buff('Defiance', -.20, false, ['Inner Beast', 'Steel Cyclone', 'Upheaval']),
		'Unchained': new Buff('Unchained', .25, false, ['Inner Beast', 'Steel Cyclone']),
		'Thrill Of Battle': new Buff('Thrill of Battle', 0),
		'Berserk': new Buff('Berserk', .45),
		"Storm's Eye": new Buff("Storm's Eye", .20),
		
		'Inner Release': new BuffStack('Inner Release', 0),
		'Slashing Resistance Down': new DebuffTimed('Maim', .10, 24),
		
		'Deliverance': new Buff('Deliverance', .05),
	},
	//Healers
	'Astrologian': {
		'Trait': new Buff('Magic & Mend II', .3, true, ['Attack']),
		'The Balance': new Buff('The Balance', .1),
		'The Arrow': new Buff('The Arrow', 0),
		'The Spear': new Buff('The Spear', (.10 * .45)),
		'Cleric Stance': new Buff('Cleric Stance', .05, false, ['Attack']),
		'Lightspeed': new BuffStack('Lightspeed', -.25, 0, 1, 1, false, [], ['Malefic', 'Malefic II', 'Malefic III', 'Combust', 'Combust II', 'Lord Of Crowns']),
	},
	'WhiteMage': {
		'Trait': new Buff('Magic & Mend II', .3, true, ['Attack']),
		'Cleric Stance': new Buff('Cleric Stance', .05, false, ['Attack']),
	},
	'Scholar': {
		'Trait': new Buff('Magic & Mend II', .3, true, ['Attack']),
		'Cleric Stance': new Buff('Cleric Stance', .05, false, ['Attack']),
	},
}

const buff_display = {
	'BlackMage': {
		'Enochian':  new BuffDisplay('Enochian', '#548785'),
		'Circle Of Power': new BuffDisplay('Circle Of Power', '#A05FF0', 'ley_lines.png'),
		'Sharpcast': new BuffDisplay('Sharpcast', '#A05F7F'),
		'Triplecast': new BuffDisplay('Triplecast', '#984C85'),
		'Swiftcast': new BuffDisplay('Swiftcast', '#E090C0'),
		'Thundercloud': new BuffDisplay('Thundercloud', '#C0B0F0'),
		'Thunder': new BuffDisplay('Thunder', '', 'thunder_iii.png'),
		'State': new BuffDisplay('Song of Ice and Fire','', 'astral_umbral.png'),
	},
	'Bard':{
		'Straight Shot': new BuffDisplay('Straight Shot','#B01F00'),
		'Foe Requiem': new BuffDisplay('Foe Requiem','#90D0D0'),
		'Raging Strikes': new BuffDisplay('Raging Strikes','#D03F00'),
		'Storm Bite': new BuffDisplay('Storm Bite','#9DBBD2'),
		'Caustic Bite': new BuffDisplay('Caustic Bite','#D75896'),
		'Bard Song': new BuffDisplay('Bard Song','', ),
	},
	'Dragoon': {
		'Blood Of The Dragon': new BuffDisplay('Blood Of The Dragon', '#7DA3AD'),
		'Heavy Thrust': new BuffDisplay('Heavy Thrust', '#CDA34C'),
		'Blood For Blood': new BuffDisplay('Blood For Blood', '#901F1D'),
		'Right Eye': new BuffDisplay('Right Eye', '#B41512'),
		'Battle Litany': new BuffDisplay('Battle Litany', '#6F8C93'),
		'Piercing Resistance Down': new BuffDisplay('Piercing Resistance Down', '#932F2F'),
		'True North': new BuffDisplay('True North', '#C07F4F'),
	},
	'Machinist': {
		'Gauss Barrel': new BuffDisplay('Gauss Barrel', '#A4786F'),
		'Hot Shot': new BuffDisplay('Hot Shot', '#6D2600'),
		'Vulnerability Up': new BuffDisplay('Vulnerability Up', '#932F2F', 'hypercharge.png'),
		'Ammunition': new BuffDisplayCount('Ammunition', 'ammunition_loaded.png'),
		'Heat': new BuffDisplayGradient('Heat', 'overheated.png'),
	},
	'Monk': {
		'Greased Lightning': new BuffDisplay('Greased Lightning', '#4099CE'),
		'Twin Snakes': new BuffDisplay('Twin Snakes', '#B7727D'),
		'Blunt Resistance Down': new BuffDisplay('Blunt Resistance Down', '#932F2F', 'dragon_kick.png'),
		'Internal Release': new BuffDisplay('Internal Release', '#8DD7AF'),
		'Riddle Of Fire': new BuffDisplay('Riddle Of Fire', '#D8786F'),
		'Perfect Balance': new BuffDisplay('Perfect Balance', '#DF964C'),
		'True North': new BuffDisplay('True North', '#C07F4F'),
	},
	'Ninja': {
		'Vulnerability Up': new BuffDisplay('Vulnerability Up', '#933630'),
		'Shadow Fang': new BuffDisplay('Shadow Fang','#44B3DA'),
		'Ten Chi Jin': new BuffDisplay('Ten Chi Jin','#BA4B4A'),
		'True North': new BuffDisplay('True North', '#C07F4F'),
		'Huton': new BuffDisplay('Huton','#7DB6C3'),
	},
	'RedMage': {
		'Embolden': new BuffDisplay('Embolden', '#C19143'),
		'Acceleration': new BuffDisplay('Acceleration', '#AF2234'),
		'Swiftcast': new BuffDisplay('Swiftcast', '#E090C0'),
	},
	'Samurai': {
		'Meikyo Shisui': new BuffDisplay('Meikyo Shisui','#E04F4F'),
		'Jinpu': new BuffDisplay('Jinpu','#E0B000'),
		'Slashing Resistance Down': new BuffDisplay('Slashing Resistance Down','#932F2F'),
		'Kaiten': new BuffDisplay('Kaiten','#C04F0F','hissatsu_kaiten.png'),
		'True North': new BuffDisplay('True North','#C07F4F'),
	},
	'Summoner': {
		'Dreadwyrm Trance': new BuffDisplay('Dreadwyrm Trance','#C1294D'),
		'Ruination': new BuffDisplay('Ruination','#4BA1EC'),
		'Bio III': new BuffDisplay('Bio III','#56631E'),
		'Miasma III': new BuffDisplay('Miasma III','#4B494F'),
		'Rouse': new BuffDisplay('Rouse','#5796C4'),
		'Magic Vulnerability Up': new BuffDisplay('Magic Vulnerability Up','#932F2F'),
		'Physical Vulnerability Up': new BuffDisplay('Physical Vulnerability Up','#932F2F'),
	},
	'DarkKnight': {
		'Darkside': new BuffDisplay('Darkside', "#943631"),
		'Dark Arts': new BuffDisplay('Dark Arts', "#AB84C6"),
		'Blood Weapon': new BuffDisplay('Blood Weapon', "#631118"),
		'Grit': new BuffDisplay('Grit', '#92B8C9'),
	},
	'Paladin': {
		'Fight Or Flight': new BuffDisplay('Fight Or Flight', '#C04B32'),
		'Requiescat': new BuffDisplay('Requiescat', '#3A69CB'),
		'Goring Blade': new BuffDisplay('Goring Blade', '#A45B20'),
		'Oath': new BuffDisplay('Active Oath', '', 'shield_sword.png'),
		
	},
	'Warrior': {
		'Berserk': new BuffDisplay('Berserk', '#BD633C'),
		"Storm's Eye": new BuffDisplay("Storm's Eye",'#DB9489'),
		'Slashing Resistance Down': new BuffDisplay('Slashing Resistance Down','#932F2F'),
		//'Thrill Of Battle': new BuffDisplay('Thrill of Battle', '#fff'),
		//'Unchained': new BuffDisplay('Unchained', '#CE7CD1'),
		//'Inner Release': new BuffDisplay('Inner Release', '#9B553E'),
		'Unchained Release': new BuffDisplay('Unchained Release', '', 'unchained_release.png'),
		'Defiverance': new BuffDisplay('Stance', '', 'warrior_stance.png'),
		
	},
	//Healers
	'Astrologian': {
		//'Trait': new Buff('Magic & Mend II', .3, true, ['Attack']),
		'The Balance': new BuffDisplay('The Balance', '#E08C51'),
		'The Arrow': new BuffDisplay('The Arrow', '#4A7CAF'),
		'The Spear': new BuffDisplay('The Spear', '#4152AF'),
		'Lightspeed': new BuffDisplay('Lightspeed', '#AD9B5C'),
		'Cleric Stance': new BuffDisplay('Cleric Stance', '#B24437'),
	},
	'WhiteMage': {
		'Cleric Stance': new BuffDisplay('Cleric Stance', '#B24437'),
	},
	'Scholar': {
		'Cleric Stance': new BuffDisplay('Cleric Stance', '#B24437'),
	},
}

const all_timers = {
	'Bard': {
		"Army's Paeon": new Timer("Army's Paeon", 30),
		"Mage's Ballad": new Timer("Mage's Ballad", 30),
		"The Wanderer's Minuet": new Timer("The Wanderer's Minuet", 30),
	},
	'BlackMage': {
		'Enochian': new Timer('Enochian', 30),
		'Astral Fire': new Timer('Astral Fire', 13),
		'Umbral Ice': new Timer('Umbral Ice', 13),
	},
	'Dragoon': {
		"Blood Of The Dragon": new Timer("Blood of the Dragon", 20),
	},
	'Machinist': {
		'Overheated': new Timer("Overheated", 10)
	},
	'Monk': {},
	'Ninja': {
		'Huton': new Timer('Huton', 70),
	},
	'RedMage': {},
	'Samurai': {},
	'Summoner': {
		'Summon Bahamut': new Timer('Summon Bahamut', 20),
	},
	
	'DarkKnight': {},
	'Paladin': {},
	'Warrior': {},
	
	'WhiteMage': {},
	'Astrologian': {},
	'Scholar': {},
}

const roleActions = {
	
	'caster': ["Addle","Break","Drain","Diversion","Lucid Dreaming","Swiftcast","Mana Shift","Apocatastasis","Surecast","Erase"],
	'healer': ["Cleric Stance","Break","Protect","Esuna","Lucid Dreaming","Swiftcast","Eye for an Eye","Largesse","Surecast","Rescue"],
	'tank': ["Rampart","Low Blow","Provoke","Convalescence","Anticipation","Reprisal","Awareness","Interject","Ultimatum","Shirk"],
	'melee': ["Second Wind","Arm's Length","Leg Sweep","Diversion","Invigorate","Bloodbath","Goad","Feint","Crutch","True North"],
	'ranged': ["Second Wind","Foot Graze","Leg Graze","Peloton","Invigorate","Tactician","Refresh","Head Graze","Arm Graze","Palisade"]
};

const role_actions = {
	'Bard': ["Second Wind","Foot Graze","Leg Graze","Peloton","Invigorate","Tactician","Refresh","Head Graze","Arm Graze","Palisade"],
	'Machinist': ["Second Wind","Foot Graze","Leg Graze","Peloton","Invigorate","Tactician","Refresh","Head Graze","Arm Graze","Palisade"],
	
	'Dragoon': ["Second Wind","Arm's Length","Leg Sweep","Diversion","Invigorate","Bloodbath","Goad","Feint","Crutch","True North"],
	'Monk': ["Second Wind","Arm's Length","Leg Sweep","Diversion","Invigorate","Bloodbath","Goad","Feint","Crutch","True North"],
	'Ninja': ["Second Wind","Arm's Length","Leg Sweep","Diversion","Invigorate","Bloodbath","Goad","Feint","Crutch","True North"],
	'Samurai': ["Second Wind","Arm's Length","Leg Sweep","Diversion","Invigorate","Bloodbath","Goad","Feint","Crutch","True North"],
	
	'RedMage': ["Addle","Break","Drain","Diversion","Lucid Dreaming","Swiftcast","Mana Shift","Apocatastasis","Surecast","Erase"],
	'BlackMage': ["Addle","Break","Drain","Diversion","Lucid Dreaming","Swiftcast","Mana Shift","Apocatastasis","Surecast","Erase"],
	'Summoner': ["Addle","Break","Drain","Diversion","Lucid Dreaming","Swiftcast","Mana Shift","Apocatastasis","Surecast","Erase"],
	
	'DarkKnight': ["Rampart","Low Blow","Provoke","Convalescence","Anticipation","Reprisal","Awareness","Interject","Ultimatum","Shirk"],
	'Paladin': ["Rampart","Low Blow","Provoke","Convalescence","Anticipation","Reprisal","Awareness","Interject","Ultimatum","Shirk"],
	'Warrior': ["Rampart","Low Blow","Provoke","Convalescence","Anticipation","Reprisal","Awareness","Interject","Ultimatum","Shirk"],
	
	'Astrologian': ["Cleric Stance","Break","Protect","Esuna","Lucid Dreaming","Swiftcast","Eye for an Eye","Largesse","Surecast","Rescue"],
	'WhiteMage': ["Cleric Stance","Break","Protect","Esuna","Lucid Dreaming","Swiftcast","Eye for an Eye","Largesse","Surecast","Rescue"],
	'Scholar': ["Cleric Stance","Break","Protect","Esuna","Lucid Dreaming","Swiftcast","Eye for an Eye","Largesse","Surecast","Rescue"],
}

const all_damageSteps = {
	'Bard': {},
	'BlackMage': {
		'Foul': [.9, .8, .7, .6, .5],
		'Flare': [.85, .7, .55, .4, .3],
		
	},
	'Dragoon': {},
	'Machinist': {
		'Ricochet': [.9, .8, .7, .6, .5],
		'Aether Mortar': [.9, .8, .7, .6, .5],
		'Charged Aether Mortar': [.9, .8, .7, .6, .5],
	},
	'Monk': {},
	'Ninja': {},
	'RedMage': {},
	'Samurai': {
		'Mangetsu': [.9, .8, .7, .6, .5],
		'Oka': [.9, .8, .7, .6, .5],
		'Tenka Goken': [.9, .8, .7, .6, .5],
		'Hissatsu: Guren': [.75, .5],
	},
	'Summoner': {
		'Deathflare': [.9, .8, .7, .6, .5],
		'Akh Morn': [.9, .8, .7, .6, .5],
	},
	
	'DarkKnight': {},
	'Paladin': {},
	'Warrior': {},
	
	'WhiteMage': {
		'Holy': [.9, .8, .7, .6, .5],
	},
	'Astrologian': {
		'Gravity': [.9, .8, .7, .6, .5],
	},
	'Scholar': {
		'Bio': [.8, .6, .4, .2],
		'Bio II': [.8, .6, .4, .2],
		'Miasma': [.8, .6, .4, .2],
		'Miasma II': [.8, .6, .4, .2],
		'Shadow Flare': [.8, .6, .4, .2],
	},
}

const all_combo_damageSteps = {
	'Bard': {},
	'BlackMage': {},
	'Dragoon': {},
	'Machinist': {},
	'Monk': {},
	'Ninja': {},
	'RedMage': {},
	'Samurai': {
		'Mangetsu': [.95, .9, .85, .8, .75],
		'Oka': [.95, .9, .85, .8, .75],
	},
	'Summoner': {},
	
	'DarkKnight': {},
	'Paladin': {},
	'Warrior': {},
	
	'WhiteMage': {},
	'Astrologian': {},
	'Scholar': {},
	
}

const template = {
	'Bard': {},
	'BlackMage': {},
	'Dragoon': {},
	'Machinist': {},
	'Monk': {},
	'Ninja': {},
	'RedMage': {},
	'Samurai': {},
	'Summoner': {},
	//tanks
	'DarkKnight': {},
	'Paladin': {},
	'Warrior': {},
	//heals
	'WhiteMage': {},
	'Astrologian': {},
	'Scholar': {},
}

