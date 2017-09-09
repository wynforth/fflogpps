var  egiAbilities = [
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
	'Machinist': {},
	'Monk': {},
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
	'Machinist': [],
	'Monk': [],
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
		"Army's Paeon": new Buff("Army's Paeon", 0),
		"Mage's Ballad": new Buff("Mage's Ballad", 0),
		"The Wanderer's Minuet": new Buff("The Wanderer's Minuet", 0),
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
	}
}

var buff_display = {
	'BlackMage': {
		'Enochian':  new BuffDisplay('Enochian', '#7F5FB0'),
		'Thunder': new BuffDisplay('Thunder', '#C0B02F', 'thunder_iii.png'),
		'Thundercloud': new BuffDisplay('Thundercloud', '#C0B0F0'),
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
		'Magic Vulnerability Up': new BuffDisplay('Magic Vulnerability Up','#932F2F'),
		'Rouse': new BuffDisplay('Rouse','#5796C4'),
	}
}

var all_timers = {
	'Bard': {
		"Army's Paeon": new Timer("Army's Paeon", 30),
		"Mage's Ballad": new Timer("Mage's Ballad", 30),
		"The Wanderer's Minuet": new Timer("The Wanderer's Minuet", 30),
	},
	'BlackMage': {},
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
}

const roleActions = {
	
	'caster': ["Addle","Break","Drain","Diversion","Lucid Dreaming","Swiftcast","Mana Shift","Apocatastasis","Surecast","Erase"],
	'healer': ["Cleric Stance","Break","Protect","Esuna","Lucid Dreaming","Swiftcast","Eye for an Eye","Largesse","Surecast","Rescue"],
	'tank': ["Rampart","Low Blow","Provoke","Convalescence","Anticipation","Reprisal","Awareness","Interject","Ultimatum","Shirk"],
	'melee': ["Second Wind","Arm's Length","Leg Sweep","Diversion","Invigorate","Bloodbath","Goad","Feint","Crutch","True North"],
	'ranged': ["Second Wind","Foot Graze","Leg Graze","Peloton","Invigorate","Tactician","Refresh","Head Graze","Arm Graze","Palisade"]
};

var role_actions = {
	'Bard': ["Second Wind","Foot Graze","Leg Graze","Peloton","Invigorate","Tactician","Refresh","Head Graze","Arm Graze","Palisade"],
	'Machinist': ["Second Wind","Foot Graze","Leg Graze","Peloton","Invigorate","Tactician","Refresh","Head Graze","Arm Graze","Palisade"],
	
	'Dragoon': ["Second Wind","Arm's Length","Leg Sweep","Diversion","Invigorate","Bloodbath","Goad","Feint","Crutch","True North"],
	'Monk': ["Second Wind","Arm's Length","Leg Sweep","Diversion","Invigorate","Bloodbath","Goad","Feint","Crutch","True North"],
	'Ninja': ["Second Wind","Arm's Length","Leg Sweep","Diversion","Invigorate","Bloodbath","Goad","Feint","Crutch","True North"],
	'Samurai': ["Second Wind","Arm's Length","Leg Sweep","Diversion","Invigorate","Bloodbath","Goad","Feint","Crutch","True North"],
	
	'RedMage': ["Addle","Break","Drain","Diversion","Lucid Dreaming","Swiftcast","Mana Shift","Apocatastasis","Surecast","Erase"],
	'BlackMage': ["Addle","Break","Drain","Diversion","Lucid Dreaming","Swiftcast","Mana Shift","Apocatastasis","Surecast","Erase"],
	'Summoner': ["Addle","Break","Drain","Diversion","Lucid Dreaming","Swiftcast","Mana Shift","Apocatastasis","Surecast","Erase"],

}


var buff_columns = {
	"Bard": `<td class=\"status-col\"><img src="img/straight_shot.png" title="Straight Shot"/></td>
		<td class=\"status-col\"><img src="img/foe_requiem.png" title="Foe Requiem"/></td>
		<td class=\"status-col\"><img src="img/raging_strikes.png" title="Raging Strikes"/></td>
		<td class=\"status-col\"><img src="img/storm_bite.png" title="Storm Bite"/></td>
		<td class=\"status-col\"><img src="img/caustic_bite.png" title="Caustic Bite"/></td>
		<td class=\"status-col\"><img src="img/bard_song.png" title="Bard Song's"/></td>`,
	"BlackMage":
		`<td class=\"status-col\"><img src="img/enochian.png" title="Enochian"/></td>
		<td class=\"status-col\"><img src="img/astral_umbral.png" title="A Song of Ice & Fire"/></td>
		<td class=\"status-col\"><img src="img/thunder_iii.png" title="Thunder Dot"/></td>
		<td class=\"status-col\"><img src="img/thundercloud.png" title="Thundercloud"/></td>`,
	"Dragoon": `<td class=\"status-col\"><img src="img/blood_of_the_dragon.png" title="Blood of the Dragon"/></td>
		<td class=\"status-col\"><img src="img/heavy_thrust.png" title="Heavy Thrust"/></td>
		<td class=\"status-col\"><img src="img/blood_for_blood.png" title="Blood For Blood"/></td>
		<td class=\"status-col\"><img src="img/right_eye.png" title="Dragon Sight"/></td>
		<td class=\"status-col\"><img src="img/battle_litany.png" title="Battle Litany"/></td>
		<td class=\"status-col\"><img src="img/piercing_resistance_down.png" title="Disembowel"/></td>
		<td class=\"status-col\"><img src="img/true_north.png" title="True North"/></td>`,
	"Machinist": `<td class=\"status-col\"><img src="img/gauss_barrel.png" title="Gauss Barrel"/></td>
		<td class=\"status-col\"><img src="img/hot_shot.png" title="Hot Shot"/></td>
		<td class=\"status-col\"><img src="img/hypercharge.png" title="Hypercharge"/></td>
		<td class=\"status-col\"><img src="img/overheated.png" title="Heat"/></td>
		<td class=\"status-col\"><img src="img/ammunition_loaded.png" title="Ammo"/></td>`,
	"Monk": `<td class=\"status-col\"><img src="img/greased_lightning.png" title="Greased Lightning! Go Greased Lightning!"/></td>
		<td class=\"status-col\"><img src="img/twin_snakes.png" title="Twin Snakes"/></td>
		<td class=\"status-col\"><img src="img/dragon_kick.png" title="Dragon Kick"/></td>
		<td class=\"status-col\"><img src="img/internal_release.png" title="Internal Release"/></td>
		<td class=\"status-col\"><img src="img/riddle_of_fire.png" title="Riddle of Fire"/></td>
		<td class=\"status-col\"><img src="img/perfect_balance.png" title="Perfect Balance"/></td>
		<td class=\"status-col\"><img src="img/true_north.png" title="True North"/></td>`,
	"Ninja": `<td class=\"status-col\"><img src="img/vulnerability_up.png" title="Trick Attack"/></td>
		<td class=\"status-col\"><img src="img/shadow_fang.png" title="Shadow Fang"/></td>
		<td class=\"status-col\"><img src="img/ten_chi_jin.png" title="Ten Chi Jin"/></td>
		<td class=\"status-col\"><img src="img/true_north.png" title="True North"/></td>
		<td class=\"status-col\"><img src="img/huton.png" title="Huton"/></td>`,
	"RedMage": `<td class=\"status-col\"><img src="img/embolden.png" title="Embolden"/></td>
		<td class=\"status-col\"><img src="img/acceleration.png" title="Acceleration"/></td>`,
	"Samurai": `<td class=\"status-col\"><img src="img/meikyo_shisui.png" title="Meikyo Shisui"/></td>
		<td class=\"status-col\"><img src="img/jinpu.png" title="Jinpu"/></td>
		<td class=\"status-col\"><img src="img/slashing_resistance_down.png" title="Yukikaze"/></td>
		<td class=\"status-col\"><img src="img/hissatsu_kaiten.png" title="Hissatsu: Kaiten"/></td>
		<td class=\"status-col\"><img src="img/true_north.png" title="True North"/></td>`,
	"Summoner": `<td class=\"status-col\"><img src="img/dreadwyrm_trance.png" title="Dreadwyrm Trance"/></td>
		<td class=\"status-col\"><img src="img/ruination.png" title="Ruination"/></td>
		<td class=\"status-col\"><img src="img/bio_iii.png" title="Bio III"/></td>
		<td class=\"status-col\"><img src="img/miasma_iii.png" title="Miasma III"/></td>
		<td class=\"status-col\"><img src="img/magic_vulnerability_up.png" title="Contagion"/></td>`
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

