var result = {
	report: {
		reportID: getUrlParameter('report'),
		fightID: getUrlParameter('fight'),
	},
	fight: {
		team: {},
		enemies: {}
	},
	player: {
		name: getUrlParameter('name'),
		pets: []
	},
	events: {}
}

/*
function getReportData() {
	var url = base_url + "/report/fights/" + result.report.reportID + "?translate=true&api_key=" + api_key;
	httpGetAsync(url, processReport);
}
*/

function parseReport(report) {
	
	var fightID = result.report.fightID;
	
	for (var k in report.fights) {
		var fight = report.fights[k];
		if (fight.id == fightID) {
			result.fight.start = fight.start_time;
			result.fight.end = fight.end_time;
			result.fight.duration = (fight.end_time - fight.start_time)/1000;
		}
	}

	for (var k in report.friendlies) {
		var friend = report.friendlies[k];
		for (var j in friend.fights) {
			if (friend.fights[j].id == fightID) {
				if (friend.hasOwnProperty('name')) {
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
				if (enemy.hasOwnProperty('name')) {
					result.fight.enemies[enemy.id] = enemy.name;
				}
			}
		}
	}

	for (var k in report.friendlyPets) {
		var pet = report.friendlyPets[k];

		for (var j in pet.fights) {
			if (pet.fights[j].id == fightID) {
				if (pet.hasOwnProperty('name')) {
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
	
	
	var url = base_url + "/report/events/" + result.report.reportID + "?translate=true";
	url += "&start=" + result.fight.start;
	url += "&end=" + result.fight.end;
	url += "&actorid=" + result.player.ID;
	url += "&api_key=" + api_key;

	
	
	var parseCallback = parseGeneral;
	/*
	if (result.fight.player == "BlackMage")
		httpGetAsync(url, parseBlackmage);
	else if (playerClass == "Samurai")
		httpGetAsync(url, parseSamurai);
	*/
		
	httpGetAsync(url, parseCallback);
}	



function parseGeneric(response){
	//console.log(response);
	var prevTime = 0;
	for (var e in response.events) {
		var event = response.events[e];

		//only events of self, pets, or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != 'applybuff') {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;
		
		
		
	}	
	//console.log(result);
	return result;
}

function parseMonk(response){
	console.log("Parsing Monk");
	//console.log(response);
		var brotherhood = new Timer("Brotherhood",15);
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
		"Bootshine": (140 + 210*9)/10, //weighted average 90% hitting positional
		"True Strike": (140 + 180*9)/10,
		"Demolish": (30 + 70*9)/10,
		"Dragon Kick": (100 + 140*9)/10,
		"Twin Snakes": (100 + 130*9)/10,
		"Snap Punch": (130 + 170*9)/10,
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
	console.log(potencies);
	
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

		//only events of self, pets, or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != 'applybuff') {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;
		var stackChange = false;
		
		if (result.events[e].type == "damage") {
			var potency = potencies[event.ability.name];
			
			if (event.ability.name == "Demolish") {
				if (!demCast)
					potency = demDot;
				demCast = false;
			}

			if(fire)
				potency *= 1.05;
			
			if(riddle)
				potency *= 1.3;
			
			if(internalrelease && event.ability.name != "Bootshine") //bootshine already has built in crit
				potency *= 1.15;
			
			if(twinsnakes.isActive())
				potency *= 1.1;
			
			if(dragonkick.isActive())
				potency *= 1.1;
				
			potency *= 1 + (.1 * effectiveStacks);


			if (potency == undefined)
				potency = 0;
			
			if(event.ability.name == "Twin Snakes")
				twinsnakes.restart();
			if(event.ability.name == "Dragon Kick")
				dragonkick.restart();
		}
		
		var ellapsed = result.events[e].fightTime - prevTime;
		
		gl.update(ellapsed);
		if(gl.current != gl.duration)
			effectiveStacks = glstacks;
		
		if (result.events[e].type == "cast") {
			if(event.ability.name == "Demolish")
				demCast = true;
			
			if(lightnings.indexOf(event.ability.name) > -1){
				gl.restart();
				var old = glstacks;
				glstacks = Math.min(3, glstacks + 1);
				stackChange = glstacks != old
			}
		}

		if (result.events[e].type == "applybuff") {
			if(event.ability.name == "Internal Release")
				internalrelease = true;
			if(event.ability.name == "Riddle Of Fire"){
				fire = true;
				riddle = true;
			}
			
			if(event.ability.name == "Fists Of Wind" || event.ability.name == "Fists Of Earth")
				fire = false;
			if(event.ability.name == "Fists Of Fire")
				fire = true;
		
		}

		if (result.events[e].type == "removebuff") {
			if(event.ability.name == "Internal Release")
				internalrelease = false;
			
			if(event.ability.name == "Riddle Of Fire"){	
				riddle = false;
			}
		}
		
		var extra = [];
		extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);
		if (gl.isActive()) {
			if (stackChange) {
				if (glstacks == 1)
					extra.push(`<img src="/img/greased_lightning.png" />`);
				if (glstacks == 2)
					extra.push(`<img src="/img/greased_lightning_ii.png" />`);
				if (glstacks == 3)
					extra.push(`<img src="/img/greased_lightning_iii.png" />`);
			} else
				extra.push(`<div class="center status-block" style="background-color: #4099CE"></div>`);
		} else {
			extra.push('');
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
	//console.log(response);
	//timers
	var enoch = 0;
	var astral = 0;
	var umbral = 0;
	
	var sharpcast = 0;
	var thundercloud = new Timer("Thundercloud", 12);
	var thunder = new Timer("Thunder III",24);
	
	
	
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

		//only events of self, pets, or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != 'applybuff') {
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

		if (result.events[e].type == "damage") {
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
			if(result.events[e].type != 1 && result.events[e].type != 8)
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
				enoch = 0
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
		if(astral > 0)
			extra.push(`<div class="center status-block" style="background-color: #F05F2F"></div>`);
		else if(umbral > 0)
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
	var lastWS = '';
	var kaiten;
	var higanCast = false;
	var higanDot = 35;

	var potencies = {
		'Attack': 90,
		"Hakaze": 150,
		"Jinpu": 100,
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

	}

	var combo_potencies = {
		"Jinpu": 280,
		'Gekko': 400,
		'Yukikaze': 340,
		'Shifu': 280,
		'Kasha': 400,
		'Mangetsu': 200,
		'Oka': 200,

	}

	var combo = {
		'Jinpu': 'Hakaze',
		'Gekko': 'Jinpu',
		'Shifu': 'Hakaze',
		'Kasha': 'Shifu',
		'Yukikaze': 'Hakaze',
		'Mangetsu': 'Fuga',
		'Oka': 'Fuga',
	}
	
	var comboskills = ['Hakaze', 'Jinpu', 'Gekko',  'Shifu',  'Kasha', 'Yukikaze', 'Mangetsu', 'Fuga', 'Oka', 'Enpi']
	var weaponskills = ['Hakaze', 'Jinpu', 'Gekko',  'Shifu',  'Kasha', 'Yukikaze', 'Mangetsu', 'Fuga', 'Oka', 'Enpi', 'Higanbana', 'Midare Setsugekka', 'Tenka Goken']

	var first = true;
	
	for (var e in response.events) {
		var event = response.events[e];

		//only events of self, pets, or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != 'applybuff') {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;

		if (result.events[e].type == "damage") {
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

				if (result.events[e].name == 'Jinpu')
					jinpu = 30;

				if (result.events[e].name == 'Yukikaze')
					yukikaze[result.events[e].target] = 30;

				if(result.events[e].name == "Higanbana"){
					higanDot = 35 * ( 1 + (kaiten > 0 ? .5:0) + (jinpu > 0 ? .1:0) + (yukikaze[result.events[e].target] > 0 ? .1:0));
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
			if(result.events[e].amount == 0)
				potency = 0;
			if (potency == undefined)
				potency = 0;
		}
		
		if(result.events[e].type == "applybuff"){
			if(result.events[e].name == "Kaiten")
				kaiten = 10;
		}
		
		if(result.events[e].type == "cast"){
			if(result.events[e].name == "Higanbana")
				higanCast = true;
		}
		
		var ellapsed = result.events[e].fightTime - prevTime;

		if (jinpu > 0)
			jinpu = Math.max(0, jinpu - ellapsed);
		if (kaiten > 0)
			kaiten = Math.max(0, kaiten - ellapsed);
		for(var i in yukikaze){
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
