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
	for (var e in response.events) {
		var event = response.events[e];

		//only events of self, pets, or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != 'applybuff') {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		
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
	
	var prevTime = 0;
	
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
	
	for (var e in response.events) {
		var event = response.events[e];

		//only events of self, pets, or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != 'applybuff') {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
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