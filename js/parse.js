var result = {
	report: {
		reportID: getUrlParameter("report"),
		fightID: getUrlParameter("fight"),
	},
	fight: {
		team: {},
		enemies: {}
	},
	player: {
		name: getUrlParameter("name"),
		pets: []
	},
	events: {}
}

function parseReport(report) {
	console.log("Parsing Report for " + report.title);
	var fightID = result.report.fightID;

	for (var k in report.fights) {
		var fight = report.fights[k];
		if (fight.id == fightID) {
			result.fight.start = fight.start_time;
			result.fight.end = fight.end_time;
			result.fight.duration = (fight.end_time - fight.start_time) / 1000;
		}
	}

	for (var k in report.friendlies) {
		var friend = report.friendlies[k];
		for (var j in friend.fights) {
			if (friend.fights[j].id == fightID) {
				if (friend.hasOwnProperty("name")) {
					result.fight.team[friend.id] = friend.name;
				}

				if (friend.name == result.player.name) {
					result.player.ID = friend.id;
					result.player.type = friend.type;
				}
			}
		}
	}

	for (var k in report.enemies) {
		var enemy = report.enemies[k];
		for (var j in enemy.fights) {
			if (enemy.fights[j].id == fightID) {
				if (enemy.hasOwnProperty("name")) {
					result.fight.enemies[enemy.id] = enemy.name;
				}
			}
		}
	}

	for (var k in report.friendlyPets) {
		var pet = report.friendlyPets[k];

		for (var j in pet.fights) {
			if (pet.fights[j].id == fightID) {
				if (pet.hasOwnProperty("name")) {
					result.fight.team[pet.id] = pet.name;
				}

				if (pet.petOwner == result.player.ID) {
					result.player.pets.push(pet.id)
					break;
				}
			}
		}
	}

	return result;
}

function parseGeneric(response) {
	var prevTime = 0;
	for (var e in response.events) {
		var event = response.events[e];

		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;

	}
	return result;

}

function parseMonk(response) {
	console.log("Parsing Monk");

	var brotherhood = new Timer("Brotherhood", 15);
	var dragonkick = new Timer("Dragon Kick", 15);
	var twinsnakes = new Timer("Twin Snakes", 15);
	var internalrelease = false;
	var gl = new Timer("Greased Lightning", 15);
	var glstacks = 0;
	var effectiveStacks = 0;
	var fire = true;
	var riddle = false;

	var demDot = 50;
	var demCast = false;

	var potencies = {
		"Bootshine": (140 + 210 * 9) / 10, //weighted average 90% hitting positional
		"True Strike": (140 + 180 * 9) / 10,
		"Demolish": (30 + 70 * 9) / 10,
		"Dragon Kick": (100 + 140 * 9) / 10,
		"Twin Snakes": (100 + 130 * 9) / 10,
		"Snap Punch": (130 + 170 * 9) / 10,
		"Arm of the Destroyer": 50,
		"One Ilm Punch": 120,
		"Rockbreaker": 130,
		"The Forbidden Chakra": 250,
		"Elixir Field": 220,
		"Steel Peak": 150,
		"Shoulder Tackle": 100,
		"Howling Fist": 210,
		"Tornado Kick": 330,
		"Riddle of Wind": 65,
		"Earth Tackle": 100,
		"Wind Tackle": 65,
		"Fire Tackle": 130,
		"Attack": 80,
	}
	//console.log(potencies);

	var positional = {
		"Bootshine": 140 * 1.5,
		"True Strike": 180,
		"Demolish": 70,
		"Dragon Kick": 140,
		"Twin Snakes": 130,
		"Snap Punch": 170
	}

	var lightnings = ["Demolish", "Snap Punch", "Arm of the Destroyer"]

	var prevTime = 0;
	for (var e in response.events) {
		var event = response.events[e];

		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;
		var stackChange = false;

		if (result.events[e].type == "damage" && result.events[e].amount != 0) {
			var potency = potencies[event.ability.name];

			if (event.ability.name == "Demolish") {
				if (!demCast)
					potency = demDot;
				demCast = false;
			}

			if (fire)
				potency *= 1.05;

			if (riddle)
				potency *= 1.3;

			if (internalrelease && event.ability.name != "Bootshine") //bootshine already has built in crit
				potency *= 1.15;

			if (twinsnakes.isActive())
				potency *= 1.1;

			if (dragonkick.isActive())
				potency *= 1.1;

			potency *= 1 + (.1 * effectiveStacks);

			if (potency == undefined)
				potency = 0;

			if (event.ability.name == "Twin Snakes")
				twinsnakes.restart();
			if (event.ability.name == "Dragon Kick")
				dragonkick.restart();
		}

		var ellapsed = result.events[e].fightTime - prevTime;

		gl.update(ellapsed);
		if (gl.current != gl.duration)
			effectiveStacks = glstacks;

		if (result.events[e].type == "cast") {
			if (event.ability.name == "Demolish")
				demCast = true;

			if (lightnings.indexOf(event.ability.name) > -1) {
				gl.restart();
				var old = glstacks;
				glstacks = Math.min(3, glstacks + 1);
				stackChange = glstacks != old
			}
		}

		if (result.events[e].type == "applybuff") {
			if (event.ability.name == "Internal Release")
				internalrelease = true;
			if (event.ability.name == "Riddle Of Fire") {
				fire = true;
				riddle = true;
			}

			if (event.ability.name == "Fists Of Wind" || event.ability.name == "Fists Of Earth")
				fire = false;
			if (event.ability.name == "Fists Of Fire")
				fire = true;

		}

		if (result.events[e].type == "removebuff") {
			if (event.ability.name == "Internal Release")
				internalrelease = false;

			if (event.ability.name == "Riddle Of Fire") {
				riddle = false;
			}
		}

		var extra = [];
		extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);
		if (gl.isActive()) {
			var img = "";
			if (stackChange) {
				if (glstacks == 1)
					img = `<img src="/img/greased_lightning.png" />`;
				if (glstacks == 2)
					img = `<img src="/img/greased_lightning_ii.png" />`;
				if (glstacks == 3)
					img = `<img src="/img/greased_lightning_iii.png" />`;
			}
			extra.push(`<div class="center status-block" style="background-color: #4099CE">${img}</div>`);
		} else {
			extra.push("");
		}
		extra.push(twinsnakes.isActive() ? `<div class="center status-block" style="background-color: #B7727D"></div>` : ``);
		extra.push(dragonkick.isActive() ? `<div class="center status-block" style="background-color: #EFE0A4"></div>` : ``);
		extra.push(internalrelease ? `<div class="center status-block" style="background-color: #8DD7AF"></div>` : ``);
		extra.push(riddle ? `<div class="center status-block" style="background-color: #D8786F"></div>` : ``);

		result.events[e].extra = extra;
		result.events[e].potency = potency;

		prevTime = result.events[e].fightTime;
	}
	//console.log(result);
	return result;

}

function parseBlackmage(response) {
	console.log("Parsing BLM");

	var enoch = 0;
	var astral = 0;
	var umbral = 0;

	var sharpcast = 0;
	var thundercloud = new Timer("Thundercloud", 12);
	var thunder = new Timer("Thunder III", 24);

	var canThundercloud = true;
	var castState = "";

	var potencies = {
		"Fire": 180,
		"Fire II": 80,
		"Fire III": 240,
		"Fire IV": 260,
		"Flare": 260,

		"Blizzard I": 180,
		"Blizzard II": 50,
		"Blizzard III": 240,
		"Blizzard IV": 260,
		"Freeze": 100,

		"Thunder I": 30,
		"Thunder II": 30,
		"Thunder III": 70,
		"Thunder IV": 50,

		"Scathe": 100,
		"Foul": 650,
	}

	var first = true;
	var prevTime = 0;
	for (var e in response.events) {
		var event = response.events[e];

		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;

		if (first) {
			first = false;
			if (result.events[e].type == "damage") {
				if (event.ability.name == "Blizzard III")
					umbral = 13;
				if (event.ability.name == "Fire")
					astral = 13;
			}
		}

		if (result.events[e].type == "damage" && result.events[e].amount != 0) {
			var potency = potencies[event.ability.name];
			if (potency == undefined)
				potency = 0;

			if (event.ability.name == "Thunder III") {
				if (result.events[e].dmgType == 1)
					potency = 40;
				else if (thundercloud.isActive() && canThundercloud) {
					potency += (40 * 8);
					thundercloud.stop();
				}
			}

			if (enoch > 0 && result.events[e].dmgType != 1)
				potency *= 1.05

				if (result.events[e].name.startsWith("Fire") || result.events[e].name == "Flare") {
					if (castState == "astral") {
						potency *= 1.8
					}
					if (castState == "umbral") {
						potency *= .7
					}
				}
			if (result.events[e].name.startsWith("Blizzard") || result.events[e].name == "Freeze") {
				if (castState == "astral")
					potency *= .7
			}

			if (umbral > 0)
				castState = "umbral";
			if (astral > 0)
				castState = "astral";

			//magic and mend
			if (result.events[e].type != 1 && result.events[e].type != 8)
				potency *= 1.30;

		} else {
			potency = 0;
		}

		var ellapsed = result.events[e].fightTime - prevTime;

		//tick timers
		console.log(thunder);
		thunder.update(ellapsed);
		thundercloud.update(ellapsed);

		sharpcast = Math.max(0, sharpcast - ellapsed);
		umbral = Math.max(0, umbral - ellapsed);
		astral = Math.max(0, astral - ellapsed);

		if (enoch > 0) {
			enoch = enoch - ellapsed;
			if (astral <= 0 && umbral <= 0)
				enoch = 0;
			else if (enoch <= 0)
				enoch += 30;
		}

		if (result.events[e].type == "applybuff" || result.events[e].type == "refreshbuff") {
			switch (result.events[e].name) {
			case "Thundercloud":
				thundercloud.restart();
				break;
			case "Sharpcast":
				sharpcast = 15;
				break
			default:
				break;
			}
		}

		if (result.events[e].type == "removebuff") {
			switch (result.events[e].name) {
			case "Thundercloud":
				thundercloud.set(0.001);
				break;
			default:
				break;
			}
		}

		if (result.events[e].type == "begincast") {
			switch (event.ability.name) {
			case "Thunder III":
				canThundercloud = false;
				break;
			default:
				canThundercloud = true;
				break;
			}

			if (umbral > 0)
				castState = "umbral";
			if (astral > 0)
				castState = "astral";
		}

		if (result.events[e].type == "cast") {
			switch (event.ability.name) {
			case "Fire":
				if (umbral > 0)
					umbral = 0;
				else
					astral = 13;
				break;
			case "Blizzard":
				if (astral > 0)
					astral = 0;
				else
					umbral = 13;
				break;
			case "Fire III":
				astral = 13;
				umbral = 0;
				break;
			case "Blizzard III":
				astral = 0;
				umbral = 13;
				break;
			case "Thunder III":
				if (sharpcast > 0)
					thundercloud.restart();
				thunder.restart();
				break;

			case "Enochian":
				enoch = 30;
				break;
			case "Transpose":
				if (umbral > 0) {
					astral = 13;
					umbral = 0;
				} else {
					astral = 0;
					umbral = 13;
				}
				break;
			default:
				break;
			}
		}

		var extra = [];

		extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);
		extra.push(enoch > 0 ? `<div class="center status-block" style="background-color: #7F5FB0"></div>` : ``);
		if (astral > 0)
			extra.push(`<div class="center status-block" style="background-color: #F05F2F"></div>`);
		else if (umbral > 0)
			extra.push(`<div class="center status-block" style="background-color: #5FD0F0"></div>`);
		else
			extra.push(``);
		extra.push(thunder.isActive() ? `<div class="center status-block" style="background-color: #C0B02F"></div>` : ``);

		result.events[e].extra = extra;
		result.events[e].potency = potency;
		prevTime = result.events[e].fightTime;

	}
	//console.log(result);
	return result;
}

function parseSamurai(response) {
	console.log("Parsing SAM");

	var prevTime = 0;
	var totalPotency = 0;
	var totalDamage = 0;

	var jinpu = 0;
	var yukikaze = {};
	var lastWS = "";
	var kaiten;
	var higanCast = false;
	var higanDot = 35;

	var potencies = {
		"Attack": 90,
		"Hakaze": 150,
		"Jinpu": 100,
		"Gekko": 100,
		"Yukikaze": 100,
		"Shifu": 100,
		"Kasha": 100,
		"Fuga": 100,
		"Mangetsu": 100,
		"Oka": 100,
		"Ageha": 200,
		"Enpi": 100,
		"Higanbana": 240,
		"Midare Setsugekka": 720,
		"Tenka Goken": 360,

		"Hissatsu: Gyoten": 100,
		"Hissatsu: Yaten": 100,
		"Hissatsu: Shinten": 300,
		"Hissatsu: Kyuten": 150,
		"Hissatsu: Seigan": 200,
		"Hissatsu: Guren": 800,

	}

	var combo_potencies = {
		"Jinpu": 280,
		"Gekko": 400,
		"Yukikaze": 340,
		"Shifu": 280,
		"Kasha": 400,
		"Mangetsu": 200,
		"Oka": 200,

	}

	var combo = {
		"Jinpu": "Hakaze",
		"Gekko": "Jinpu",
		"Shifu": "Hakaze",
		"Kasha": "Shifu",
		"Yukikaze": "Hakaze",
		"Mangetsu": "Fuga",
		"Oka": "Fuga",
	}

	var comboskills = ["Hakaze", "Jinpu", "Gekko", "Shifu", "Kasha", "Yukikaze", "Mangetsu", "Fuga", "Oka", "Enpi"]
	var weaponskills = ["Hakaze", "Jinpu", "Gekko", "Shifu", "Kasha", "Yukikaze", "Mangetsu", "Fuga", "Oka", "Enpi", "Higanbana", "Midare Setsugekka", "Tenka Goken"]

	var first = true;

	for (var e in response.events) {
		var event = response.events[e];

		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;

		if (result.events[e].type == "damage" && result.events[e].amount != 0) {
			if (result.events[e].name == "Higanbana" && !higanCast) {
				potency = higanDot;

			} else {
				if (combo[result.events[e].name] == lastWS)
					potency = combo_potencies[result.events[e].name];
				else
					potency = potencies[result.events[e].name];

				if (jinpu > 0)
					potency *= 1.10;

				if (yukikaze[result.events[e].target] > 0 && result.events[e].dmgType == 1)
					potency *= 1.10;

				if (result.events[e].name == "Jinpu")
					jinpu = 30;

				if (result.events[e].name == "Yukikaze")
					yukikaze[result.events[e].target] = 30;

				if (result.events[e].name == "Higanbana") {
					higanDot = 35 * (1 + (kaiten > 0 ? .5 : 0) + (jinpu > 0 ? .1 : 0) + (yukikaze[result.events[e].target] > 0 ? .1 : 0));
					higanCast = false;
				}

				if (kaiten > 0 && weaponskills.indexOf(result.events[e].name) > -1) {

					potency *= 1.5;
					kaiten = 0;
				}

				//combo
				if (comboskills.indexOf(result.events[e].name) > -1)
					lastWS = result.events[e].name;
			}
			if (result.events[e].amount == 0)
				potency = 0;
			if (potency == undefined)
				potency = 0;
		}

		if (result.events[e].type == "applybuff") {
			if (result.events[e].name == "Kaiten")
				kaiten = 10;
		}

		if (result.events[e].type == "cast") {
			if (result.events[e].name == "Higanbana")
				higanCast = true;
		}

		var ellapsed = result.events[e].fightTime - prevTime;

		if (jinpu > 0)
			jinpu = Math.max(0, jinpu - ellapsed);
		if (kaiten > 0)
			kaiten = Math.max(0, kaiten - ellapsed);
		for (var i in yukikaze) {
			yukikaze[i] = Math.max(0, yukikaze[i] - ellapsed);
		}

		var extra = [];

		extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);
		extra.push(jinpu > 0 ? `<div class="center status-block" style="background-color: #E0B000"></div>` : ``);
		//extra.push(yukikaze > 0 ? `<div class="center status-block" style="background-color: #6FA0E0"></div>` : ``);

		result.events[e].extra = extra;
		result.events[e].potency = potency;
		prevTime = result.events[e].fightTime;
	}

	return result;
}

function parseRedmage(response) {
	console.log("Parsing RDM");

	var prevTime = 0;
	var totalPotency = 0;
	var totalDamage = 0;

	//trackers
	var lastWS = ""
		var embolden = 0;

	var potencies = {
		"Attack": 90,

		"Riposte": 130,
		"Zwerchhau": 100,
		"Redoublement": 100,

		"Jolt": 180,
		"Impact": 270,

		"Verthunder": 300,
		"Verfire": 270,
		"Verflare": 550,

		"Veraero": 300,
		"Verstone": 270,
		"Verholy": 550,

		"Scatter": 100,
		"Moulinet": 60,

		"Corps-a-corps": 130,
		"Displacement": 130,
		"Fleche": 420,
		"Contre Sixte": 300,

		"Jolt II": 240,
		"Enchanted Riposte": 210,
		"Enchanted Zwerchhau": 100,
		"Enchanted Redoublement": 100,
		"Enchanted Moulinet": 60,
	}

	var combo_potencies = {
		"Zwerchhau": 150,
		"Redoublement": 230,
		"Enchanted Zwerchhau": 290,
		"Enchanted Redoublement": 470,
	}

	var combo = {
		"Zwerchhau": ["Riposte", "Enchanted Riposte"],
		"Redoublement": ["Zwerchhau", "Enchanted Zwerchhau"],
		"Enchanted Zwerchhau": ["Riposte", "Enchanted Riposte"],
		"Enchanted Redoublement": ["Zwerchhau", "Enchanted Zwerchhau"],
	}

	//anything that makes/breaks a combo
	var comboskills = ["Moulinet", "Enchanted Moulinet", "Zwerchhau", "Riposte", "Enchanted Riposte", "Redoublement", "Enchanted Zwerchhau", "Enchanted Redoublement"];
	//all "WeaponSkills"
	var weaponskills = ["Moulinet", "Enchanted Moulinet", "Zwerchhau", "Riposte", "Enchanted Riposte", "Redoublement", "Enchanted Zwerchhau", "Enchanted Redoublement"]

	var first = true;

	//prescan first couple attacks to see what buffs fall off
	for (var i = 0; i < 5; i++) {
		var event = response.events[i];

		if (event.type == "removebuff") {}
	}

	for (var e in response.events) {
		var event = response.events[e];

		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;

		if (result.events[e].type == "damage" && result.events[e].amount != 0) {
			potency = potencies[result.events[e].name];
			if (Object.keys(combo).indexOf(result.events[e].name) > -1)
				if (combo[result.events[e].name].indexOf(lastWS) > -1)
					potency = combo_potencies[result.events[e].name];

			if (comboskills.indexOf(result.events[e].name) > -1)
				lastWS = result.events[e].name;

			//embolden
			if (result.events[e].dmgType != 1) //magic damage
				potency *= 1 + (.02 * embolden);

			//maim and mend
			if (result.events[e].name != "Attack")
				potency *= 1.30;

			if (result.events[e].amount == 0)
				potency = 0;
			if (potency == undefined)
				potency = 0;
		}

		if (result.events[e].type == "applybuff") {}

		if (result.events[e].type == "applybuffstack") {
			if (result.events[e].name == "Embolden" && result.events[e].target == result.player.ID)
				embolden = 5;
		}

		if (result.events[e].type == "removebuff") {
			if (result.events[e].name == "Embolden" && result.events[e].target == result.player.ID)
				embolden = 0;
		}

		if (result.events[e].type == "removebuffstack") {
			if (result.events[e].name == "Embolden" && result.events[e].target == result.player.ID)
				embolden -= 1;
		}

		if (result.events[e].type == "cast") {}

		var ellapsed = result.events[e].fightTime - prevTime;

		//update timers

		var extra = [];

		extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);
		extra.push(embolden > 0 ? `<div class="center status-block" style="background-color: #C05F3F"></div>` : ``);

		result.events[e].extra = extra;
		result.events[e].potency = potency;
		prevTime = result.events[e].fightTime;
	}

	return result;
}

function parseBard(response) {
	console.log("Parsing BRD");

	var prevTime = 0;
	var totalPotency = 0;
	var totalDamage = 0;

	//trackers
	var foe = false;
	var ragingStrikes = false;
	var barrage = false;
	var minuet = new Timer("Minuet", 30);
	var mages = new Timer("Mage's", 30);
	var army = new Timer("Army's", 30);
	// casting vs dot damage;
	var causticDot = 45;
	var causticCast = false; //only needed for caustic as Stormbite is the spell and Storm Bite is the dot
	var caustic = new Timer("Caustic Bite", 30);
	var storm = new Timer("Storm Bite", 30);
	var causticLow = 99999;
	var stormLow = 99999;
	var img = '';

	var charges = 0;

	var potencies = {
		"Shot": 80,
		"Heavy Shot": 150,
		"Straight Shot": 140,
		"Empyreal Arrow": 230,
		"Iron Jaws": 100,
		"Refulgent Arrow": 300,

		"Quick Nock": 110,
		"Rain of Death": 100,

		"Sidewinder": 100,
		"Misery's End": 190,
		"Bloodletter": 130,

		"Mage's Ballad": 100,
		"Army's Paeon": 100,
		"The Wanderer's Minuet": 100,

		"Caustic Bite": 120,
		"Stormbite": 120,
		"Storm Bite": 55,
	}

	var first = true;

	//prescan first couple attacks to see what buffs fall off
	var prefoe = true;
	var start = response.events[0].timestamp;
	for (var e in response.events) {
		var event = response.events[e];
		if (event.timestamp > start + 5000)
			break;

		if (event.type == "applybuff") {
			if (event.ability.name == "Foe Requiem")
				prefoe = false;
		}

		if (event.type == "applydebuff") {
			if (event.ability.name == "Foe Requiem" && prefoe)
				foe = true;
		}
	}

	for (var e in response.events) {
		var event = response.events[e];

		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;

		if (result.events[e].type == "damage" && result.events[e].amount != 0) {
			potency = potencies[result.events[e].name];
			if (result.events[e].name == "Stormbite") {
				potencies['Storm Bite'] = 55 * (foe ? 1.02 : 1) * (ragingStrikes ? 1.1 : 1);
			}

			if (result.events[e].name == "Pitch Perfect") {
				if (charges >= 3)
					potency = 420;
				else if (charges == 2)
					potency = 240;
				else
					potency = 100;
				charges = 0;
			}

			if (result.events[e].name == "Sidewinder") {
				if (caustic.isActive() && storm.isActive())
					potency = 260;
				else if (caustic.isActive() || storm.isActive())
					potency = 175;
			}

			if (foe)
				potency *= 1.02;

			if (ragingStrikes)
				potency *= 1.1;

			//so the buffs arent applied twice to dots only when cast
			if (result.events[e].name == "Storm Bite") {
				potency = potencies[result.events[e].name];
				stormLow = Math.min(result.events[e].amount, stormLow);
			}
			if (result.events[e].name == "Caustic Bite") {
				if (causticCast) {
					causticDot = 45 * (foe ? 1.02 : 1) * (ragingStrikes ? 1.1 : 1);
					causticCast = false;
				} else {
					potency = causticDot;
					causticLow = Math.min(result.events[e].amount, causticLow);
				}
			}

			//build up charges for pitch perfect
			if (minuet.isActive()) {
				if (result.events[e].name == "Empyreal Arrow")
					charges++;
				//we have to guess at crits cause of fflogs
				if (result.events[e].name == "Caustic Bite" && !causticCast && result.events[e].amount >= (causticLow * 1.3))
					charges++;
				if (result.events[e].name == "Storm Bite" && result.events[e].amount >= (stormLow * 1.3))
					charges++;
			}

			if (potency == undefined)
				potency = 0;
		}

		if (result.events[e].type == "applybuff") {
			if (result.events[e].name == "Raging Strikes")
				ragingStrikes = true;
		}

		if (result.events[e].type == "removebuff") {
			if (result.events[e].name == "Raging Strikes")
				ragingStrikes = false;
		}

		if (result.events[e].type == "applydebuff") {
			if (result.events[e].name == "Foe Requiem")
				foe = true;

		}

		if (result.events[e].type == "removedebuff") {
			if (result.events[e].name == "Foe Requiem")
				foe = false;
		}

		if (result.events[e].type == "cast") {
			if (result.events[e].name == "Caustic Bite") {
				causticCast = true;
				caustic.restart();
			}
			if (result.events[e].name == "Stormbite") {
				causticCast = true;
				storm.restart();
			}

			if (result.events[e].name == "Iron Jaws") {
				if (caustic.isActive())
					caustic.restart();
				if (storm.isActive())
					storm.restart();
			}

			if (result.events[e].name == "The Wanderer's Minuet") {
				img = `<img src="/img/the_wanderers_minuet.png"/>`;
				minuet.restart();
				mages.stop();
				army.stop();
			}
			if (result.events[e].name == "Mage's Ballad") {
				img = `<img src="/img/mages_ballad.png"/>`;
				mages.restart();
				minuet.stop();
				army.stop();
			}
			if (result.events[e].name == "Army's Paeon") {
				img = `<img src="/img/armys_paeon.png"/>`;
				army.restart();
				minuet.stop();
				mages.stop();
			}

		}

		var ellapsed = result.events[e].fightTime - prevTime;

		//update timers
		minuet.update(ellapsed);
		mages.update(ellapsed);
		army.update(ellapsed);
		caustic.update(ellapsed);
		storm.update(ellapsed);

		if (!minuet.isActive() && charges > 0) {
			console.log("Minuet finished removing charges");
			charges = 0;
		}

		var extra = [];
		extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);
		extra.push(foe ? `<div class="center status-block" style="background-color: #90D0D0"></div>` : ``);
		extra.push(ragingStrikes ? `<div class="center status-block" style="background-color: #D03F00">$</div>` : ``);

		if (minuet.isActive())
			extra.push(`<div class="center status-block" style="background-color: #4F6F1F">${img}</div>`);
		else if (mages.isActive())
			extra.push(`<div class="center status-block" style="background-color: #A07FC0">${img}</div>`);
		else if (army.isActive())
			extra.push(`<div class="center status-block" style="background-color: #D07F5F">${img}</div>`);
		else
			extra.push(``);
		img = '';

		result.events[e].extra = extra;
		result.events[e].potency = potency;
		prevTime = result.events[e].fightTime;
	}

	return result;
}

/*

CLASS PARSGIN TEMPLATE

 */
/*
function parseClass(response) {
console.log("Parsing CLS");


var prevTime = 0;
var totalPotency = 0;
var totalDamage = 0;

//trackers


var potencies = {

}

var combo_potencies = {

}

var combo = {

}

//anything that makes/breaks a combo
var comboskills = [];
//all "WeaponSkills"
var weaponskills = []

var first = true;



//prescan first couple attacks to see what buffs fall off
for (var i = 0; i<5; i++) {
var event = response.events[i];

}

for (var e in response.events) {
var event = response.events[e];

//only events of self	pets	or targetted on self
if (event.sourceID != result.player.ID) {
if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
continue;
}
}

result.events[e] = getBasicData(event	result.fight);
var potency = 0;

if (result.events[e].type == "damage" && result.events[e].amount != 0) {
if (combo[result.events[e].name].indexOf(lastWS) > -1)
potency = combo_potencies[result.events[e].name];
else
potency = potencies[result.events[e].name];


if (comboskills.indexOf(result.events[e].name) > -1)
lastWS = result.events[e].name;


if (result.events[e].amount == 0)
potency = 0;
if (potency == undefined)
potency = 0;
}

if(result.events[e].type == "applybuff"){

}

if(result.events[e].type == "applybuffstack"){

}

if(result.events[e].type == "removebuff"){

}

if(result.events[e].type == "removebuffstack"){

}

if(result.events[e].type == "cast"){

}

var ellapsed = result.events[e].fightTime - prevTime;

//update timers

extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);

var extra = [];
result.events[e].extra = extra;
result.events[e].potency = potency;
prevTime = result.events[e].fightTime;
}

return result;
}
*/