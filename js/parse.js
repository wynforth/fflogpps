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
	events: {},
	totals: {},
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
	console.log("Parse Generic");
	var prevTime = 0;
	for (var e in response.events) {
		var event = response.events[e];
		console.log(event);

		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		getBasicData(event, result.fight);
		var potency = 0;
		
		result.events[e] = event;
	}
	return result;

}

function buildRow(data, fight) {

	tbl_row = '';

	tbl_row += `<td>${data.name}<span class="castType">${data.type}</span></td>`;
	tbl_row += `<td>${data.amount == 0 ? '':data.amount} <span class="castType">${data.isDirect ? "Direct ":''}${data.hitType}</span><span class="damage-block ${damageTypes[data.dmgType]}"></span></td>`;
	if (data.isTargetFriendly)
		tbl_row += `<td>${fight.team[data.target]}</td>`;
	else
		tbl_row += `<td>${fight.enemies[data.target]}</td>`;
	tbl_row += `<td class="center">${data.fightTime.toFixed(2)}</td>`;

	if (data.extra != undefined) {
		for (var i = 0; i < data.extra.length; i++) {
			tbl_row += `<td class="center">${data.extra[i]}</td>`;
		}
	}
	return tbl_row;
}

function applyBuffs(value, event, buffs) {
	for (var b in buffs) {
		var buff = buffs[b];
		if (buff.isAllowed(event) && buff.getBonus() != 0) {
			value = buff.apply(value, event);
			event.tooltip += buff.name + ": " + buff.getDisplay() + " [" + value.toFixed(0) + "]<br/>";
		}
	}
	return value;
}

function hasBuff(name, buffs){
	if(buffs.hasOwnProperty(name))
		return buffs[name].active;
	return false;
}


function preScreen(type, events, buffs, timers, activePet) {
	var start = events[0].timestamp;

	if (type == "Bard") {
		//prescan first couple attacks to see what buffs fall off
		var prefoe = true;
		for (var e in events) {
			var event = events[e];
			if (event.timestamp > start + 5000) //just 5 seconds which is enough time to ensure a server tick to see if foe is applied
				break;

			//if foe shows as an applybuff to self first in the log first, it wasn't precasted
			if (event.type == "applybuff") {
				if (event.ability.name == "Foe Requiem")
					prefoe = false;
			}

			if (event.type == "applydebuff") {
				if (event.ability.name == "Foe Requiem" && prefoe)
					buffs[event.ability.name].add(event);
			}
		}
	} else if (type == "RedMage") {
		var acceleration_cast = false;
		for (var e in events) {
			var event = events[e];
			if (event.timestamp > start + 10000) //10 seconds ahead
				break;

			//foe shows as an applybuff to self first in the log first, it wasn't precasted
			if (event.type == "removebuff") {
				if (event.ability.name == "Acceleration")
					buffs["Acceleration"].applybuff();
			}
			if (event.type == "applybuff") {
				if (event.ability.name == "Acceleration")
					acceleration_cast = true;
			}
		}
		if (acceleration_cast)
			buffs["Acceleration"].active = false;
	} else if (type == "Dragoon") {
		for (var e in events) {
			var event = events[e];
			if (event.type == "cast") {
				if (event.ability.name == "Fang And Claw" || event.ability.name == "Wheeling Thrust" || event.ability.name == "Sonic Thrust") {
					timers["Blood Of The Dragon"].restart();
				}
			}
			if (event.timestamp > start + 20000)
				break;

		}
		buffs["Blood Of The Dragon"].active = timers["Blood Of The Dragon"].isActive();

	} else if (type == "Machinist") {
		var notgauss = false;
		var startRook = true;

		for (var e in events) {
			var event = events[e];

			if (event.ability.name == "Gauss Barrel") {
				notgauss = true;
			}

			if (['Charged Volley Fire', 'Volley Fire', 'Aether Mortar', 'Charged Aether Mortar', 'Rook Overload', 'Bishop Overload'].indexOf(event.ability.name) > -1) {
				activePet[0] = event.sourceID
			}

			if (event.timestamp > start + 20000)
				break;

		}

		if (notgauss) {
			buffs['Gauss Barrel'].active = false;
		}
		buffs['Ammunition'].applybuff();
	} else if (type == "Ninja") {
		var hutonCast = false;
		for (var e in events) {
			var event = events[e];
			if (event.type == "cast") {
				if (event.ability.name == "Huton") {
					hutonCast;
				}
			}
			if (event.timestamp > start + 20000)
				break;

		}
		if(!hutonCast)
			timers['Huton'].restart();

	}else if (type == "Summoner") {
		for (var e in events) {
			var event = events[e];

			if (egiAbilities.indexOf(event.ability.name) > -1) {
				activePet[0] = event.sourceID
			}
			//the remove only shows up within 20 seconds if it was started prefight
			if(event.type == 'removebuff' && event.ability.name == "Rouse"){
				buffs['Rouse'].applybuff();
			}

			if (event.timestamp > start + 20000)
				break;
		}
	}
}

function updateTimers(timers, buffs, ellapsed, event) {
	if (timers != undefined) {
		for (var t in timers) {
			timers[t].update(ellapsed);
		}
	}
	for (var b in buffs) {
		if (typeof buffs[b].update === 'function') {
			//console.log(buffs[b].targets);
			buffs[b].update(event);
		}
	}


}

function updateBuffs(buffs, timers, event, result, activePet) {
	//BUFF APPLICATION
	if (event.type == "applybuff" || event.type == "refreshbuff") {
		if (buffs.hasOwnProperty(event.name) && (event.targetID == result.player.ID || event.targetID == activePet))
			buffs[event.name].applybuff();
	} else if (event.type == "applybuffstack") {
		if (buffs.hasOwnProperty(event.name) && (event.targetID == result.player.ID || event.targetID == activePet)) {
			buffs[event.name].setStacks(event.stack);
		}
	} else if (event.type == "applydebuff" || event.type == "refreshdebuff") {
		if (buffs.hasOwnProperty(event.name)) {
			buffs[event.name].add(event);
		}
	}
	//BUFF REMOVAL
	else if (event.type == "removebuff") {
		if (buffs.hasOwnProperty(event.name) &&  (event.targetID == result.player.ID || event.targetID == activePet))
			buffs[event.name].active = false;
	} else if (event.type == "removebuffstack") {
		if (buffs.hasOwnProperty(event.name) &&  (event.targetID == result.player.ID || event.targetID == activePet))
			buffs[event.name].setStacks(event.stack);
	} else if (event.type == "removedebuff") {
		if (buffs.hasOwnProperty(event.name))
			buffs[event.name].remove(event);
	}

	//update matching buffs to timers
	if (timers != undefined) {
		for (var t in timers) {
			if (buffs.hasOwnProperty(t))
				if (timers[t].isActive() && buffs[t].active == false)
					buffs[t].applybuff();
				else if (!timers[t].isActive())
					buffs[t].active = false;
		}
	}
}

function updateExtras(extra, event, buffs, type){
	var columns = buff_display[type];
	
	for (var b in columns) {
		var displayString = columns[b].display(event, buffs[b]);
		if(displayString != undefined)
			extra.push(displayString);
	}
}

function parseClass(response){
	var type = result.player.type;
	console.log("Parsing " + type);
	
	var prevTime = 0;
	var ellapsed = 0;
	var lastWS = ""
	var ratio = 0;
	var activePet = 0;
	var petLookup = {};
	for(var p in result.player.pets){
		petLookup[result.fight.team[result.player.pets[p]]] = result.player.pets[p];		
	}
	
	result.totals[result.player.ID] = {
		'amount': 0,
		'potency': 0,
		'name': result.fight.team[result.player.ID],
		'id': result.player.ID,
		'time': 0 //result.fight.duration,
	}
	for (var p in result.player.pets) {
		result.totals[result.player.pets[p]] = {
			'amount': 0,
			'potency': 0,
			'name': result.fight.team[result.player.pets[p]],
			'id': result.player.pets[p],
			'time': 0 //result.fight.duration,
		}
	}
	
	//potencies
	var potencies = all_potencies[type];
	var combo_potencies = all_combo_potencies[type];
	var pos_potencies = all_pos_potencies[type];
	var pos_combo_potencies = all_pos_combo_potencies[type];
	//dots
	var dot_potencies = {};
	var dot_base = all_dot_base[type];
	//skills
	var combo = all_combo[type]
	var comboskills = all_comboskills[type];
	var weaponskills = all_weaponskills[type];
	//buffs
	var buffs = all_buffs[type];
	//role actions
	var role_all = role_actions[type];
	var role_taken = {};
	for(var i=0; i< role_all.length; i++){
		role_taken[role_all[i]] = 0;
	}
	//timers
	var timers = all_timers[type];
		
	//prescan
	preScreen(type,response.events, buffs, timers);
	
	//Main Parsing
	for (var e in response.events) {
		var event = response.events[e];
		
		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		getBasicData(event, result.fight);
		var potency = 0;

		if (event.type == "damage" && event.amount != 0) {
			if (event.dmgType == 1 || event.dmgType == 64) {
				//dots
				potency = dot_potencies[event.name];
				event.tooltip = "DoT: " + event.name;
			} else {
				potency = potencies[event.name];

				if (combo.hasOwnProperty(event.name)) {
					if (combo[event.name].indexOf(lastWS) > -1 || event.name == lastWS || hasBuff('Meikyo Shisui', buffs)) { //hack for aoe combos
						if (hasBuff("True North", buffs) && pos_combo_potencies.hasOwnProperty(event.name))
							potency = pos_combo_potencies[event.name];
						else
							potency = combo_potencies[event.name];
					}
				} else {
					if (hasBuff("True North", buffs) && pos_potencies.hasOwnProperty(event.name))
						potency = pos_potencies[event.name];
				}

				if (comboskills.indexOf(event.name) > -1 && !hasBuff("Duality", buffs)) {
					lastWS = event.name;
				}

				if (event.name == "Pitch Perfect") {
					var val = event.amount;
					if (event.isDirect)
						val *= 1 / 1.25;
					if (event.hitType == "Crit")
						val *= 1 / 1.45;
					val = val / ratio;

					if (val >= 400)
						potency = 420;
					else if (val >= 150)
						potency = 240;
				}

				event.tooltip = event.name + ": " + potency + "<br/>";
				potency = applyBuffs(potency, event, buffs);

				if (dot_base.hasOwnProperty(event.name)) {
					event.tooltip += "<br/>Dot Damage:<br/>";
					dot_potencies[event.name] = applyBuffs(dot_base[event.name], event, buffs);
				} else if (event.name == "Stormbite") {
					//cast Stormbite, Dot Storm Bite so it doesnt fit the normal pattern
					event.tooltip += "<br/>Dot Damage:<br/>";
					dot_potencies['Storm Bite'] = applyBuffs(dot_base['Storm Bite'], event, buffs);
				} else if (event.name == "Iron Jaws") {
					//iron jaws reapplies both dots
					event.tooltip += "<br/>Dot Damage:<br/>";
					dot_potencies["Storm Bite"] = applyBuffs(dot_base["Storm Bite"], event, buffs);
					event.tooltip += "<br/>Dot Damage:<br/>";
					dot_potencies["Caustic Bite"] = applyBuffs(dot_base["Caustic Bite"], event, buffs);
				}
			}

			if (potency == undefined)
				potency = 0;
			
			if(potency == 0 && event.amount != 0){
				console.log("WARNING: Damage dealt with unknown potency");
				console.log(event);
			}
			
		}
	
		//TIMERS AND TIMED BUFFS
		ellapsed = event.fightTime - prevTime;
		updateTimers(timers, buffs, ellapsed, event);
		
		if (event.type == "cast") {
			//id match shouldn't be needed bt being safe
			if(role_all.indexOf(event.name) != -1 && event.sourceID == result.player.ID){ 
				role_taken[event.name]++;
			}
			
			if (dot_base.hasOwnProperty(event.name)){
				dot_potencies[event.name] = applyBuffs(dot_base[event.name], event, buffs);
			} 
			
			if (timers.hasOwnProperty(event.name)) {
				//bard unique, other songs need to stop when a new song starts
				if (type == "Bard") {
					var img = '';
					var songs = ["The Wanderer's Minuet", "Mage's Ballad", "Army's Paeon"];
					if (songs.indexOf(event.name) > -1) {
						for (var i = 0; i < songs.length; i++)
							timers[songs[i]].stop(); 
						img = `<img src="/img/${event.name.replace(/'/g,"").replace(/ /g, "_").toLowerCase()}.png"/>`;
					}
				}
				timers[event.name].restart();
			} 
			//ability specific
			if (event.name == "Armor Crush") {
				timers["Huton"].update(-30);
			} else if (event.name == "Iron Jaws") {
				dot_potencies["Storm Bite"] = applyBuffs(dot_base["Storm Bite"], event, buffs);
				dot_potencies["Caustic Bite"] = applyBuffs(dot_base["Caustic Bite"], event, buffs);
			} else if (event.name == "Fang And Claw" || event.name == "Wheeling Thrust" || event.name == "Sonic Thrust"){
				if(timers["Blood Of The Dragon"].isActive())
					timers["Blood Of The Dragon"].extend(10, 30);
			}
		}
		
		//BUFF APPLICATION
		updateBuffs(buffs, timers, event, result);
		//class specifics
		if (type == "Monk") {
			if (event.type == "applybuff" || event.type == "refreshbuff") {
				if (event.name == "Fists Of Wind" || event.name == "Fists Of Earth") {
					buffs["Fists Of Fire"].active = false;
					buffs["Riddle Of Fire"].active = false;
				}
			}
		}
		

		var extra = [];
		updateExtras(extra, event, buffs, type);
		//class specific
		if (type == "Bard") {
			if (buffs["The Wanderer's Minuet"].active)
				extra.push(`<div class="center status-block" style="background-color: #4F6F1F">${img}</div>`);
			else if (buffs["Mage's Ballad"].active)
				extra.push(`<div class="center status-block" style="background-color: #A07FC0">${img}</div>`);
			else if (buffs["Army's Paeon"].active)
				extra.push(`<div class="center status-block" style="background-color: #D07F5F">${img}</div>`);
			else
				extra.push(``);
			img = '';
		}

		event.extra = extra;
		event.potency = potency;
		prevTime = event.fightTime;

		result.events[e] = event;
		//update ratio currently only used for guessing pitch perfect :/
		if (event.potency != 0) {
			var tp = event.potency * (event.isDirect ? 1.25:1) * (event.hitType == 'Crit' ? 1.45:1);
			var r = event.amount / tp;
			
			if (ratio == 0)
				ratio = r;
			else
				ratio = (ratio + r) / 2
		}
		
		if (event.amount > 0 && event.type != 'heal') {
			if (result.totals.hasOwnProperty(event.sourceID)) {
				result.totals[event.sourceID].amount += event.amount;
				result.totals[event.sourceID].potency += potency;
			} else {
				console.log("Unaccounted for source");
				console.log(event);
			}
		}
		
		result.totals[result.player.ID].time += ellapsed;
		if(result.totals.hasOwnProperty(activePet))
			result.totals[activePet].time += ellapsed;
		
	}
	//role actions used
	for(var r in role_taken){
		if(role_taken[r] == 0)
			delete role_taken[r];
	}
	result.role_actions = Object.keys(role_taken);
	
	return result;
}

function parseBlackmage(response) {
	console.log("Parsing BLM");

	var enoch = new Timer("Enochian", 30);
	var astral = 0;
	var umbral = 0;
	var astralStack = 0;
	var umbralStack = 0;
	var suffix = ['', '', '_ii', '_iii'];

	var sharpcast = 0;
	var thundercloud = new Timer("Thundercloud", 12);
	var thunder = new Timer("Thunder III", 24);
	var thunderDot = 40;

	var canThundercloud = true;
	var castState = "";

	var buffs = {
		"Trait": new Buff("Magic & Mend II", .3, true, ["Attack"]),
		"Enochian": new Buff("Enochian", .1, false, ["Attack"])
	}

	var potencies = {
		"Attack": 110,
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

	var dot_potencies = {
		"Thunder IV": 30,
		"Thunder III": 40,
	};

	var first = true;
	var prevTime = 0;
	for (var e in response.events) {
		var potency = 0;
		var event = response.events[e];
		
		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		getBasicData(event, result.fight);
		//console.log(event);

		if (first) {
			first = false;
			if (event.type == "damage") {
				if (event.name == "Blizzard III") {
					umbralStack = 3;
					umbral = 13;
				}
				if (event.name == "Fire") {
					astralStack = 1;
					astral = 13;
				}
				if (event.name == "Thunder III")
					thunderCast = true;
			}
		}

		if (event.type == "damage" && event.amount != 0) {
			//Dots
			if (event.dmgType == 1 || event.dmgType == 64) {
				potency = dot_potencies[event.name];
				event.tooltip = "DoT: " + event.name;
			} else {
				potency = potencies[event.name];
				if (potency == undefined)
					potency = 0;

				//spell specific actions
				var tctip = '';
				if (event.name == "Thunder III") {
					if (thundercloud.isActive() && canThundercloud) {
						tctip = event.name + ": " + potency + "<br/>";
						potency += (40 * 8);
						tctip += "Thundercloud: +" + (40 * 8) + " [" + potency.toFixed(0) + "]<br/>"
						//thundercloud.stop();
					}
					dot_potencies[event.name] = applyBuffs(40, event, buffs);
				} else if (event.name == "Thunder IV") {
					if (thundercloud.isActive() && canThundercloud) {
						tctip = event.name + ": " + potency + "<br/>";
						potency += (30 * 6);
						tctip += "Thundercloud: +" + (30 * 6) + " [" + potency.toFixed(0) + "]<br/>"
					}
					event.tooltip += "<br/>Dot Damage:<br/>";
					dot_potencies[event.name] = applyBuffs(30, event, buffs);
				} else {
					canThundercloud = true;
				}

				event.tooltip = event.name + ": " + potency + "<br/>";
				if (tctip != "")
					event.tooltip = tctip;

				potency = applyBuffs(potency, event, buffs);

				//Stupid BLMs and astral umbral mechanics :P
				if (event.name.startsWith("Fire") || event.name == "Flare") {
					if (castState == "astral") {
						potency = Math.trunc(potency * (1.2 + (astralStack * .2)));
						event.tooltip += "Astral Fire: " + ((.2 + (astralStack * .2)) * 100).toFixed(0) + "% [" + potency.toFixed(0) + "]<br/>";
					}
					if (castState == "umbral") {
						potency = Math.trunc(potency * (1 - (umbralStack * .1)));
						event.tooltip += "Umbral Ice: -" + ((umbralStack * .1) * 100).toFixed(0) + "% [" + potency.toFixed(0) + "]<br/>";
					}
				}
				if (event.name.startsWith("Blizzard") || event.name == "Freeze") {
					if (castState == "astral") {
						potency = Math.trunc(potency * (1 - (astralStack * .1)));
						event.tooltip += "Astral Fire: -" + ((astralStack * .1) * 100).toFixed(0) + "% [" + potency.toFixed(0) + "]<br/>";
					}
				}

				if (umbral > 0) {
					astralStack = 0;
					castState = "umbral";
				}
				if (astral > 0) {
					umbralStack = 0;
					castState = "astral";
				}
			}
		} else {
			potency = 0;
		}

		var ellapsed = event.fightTime - prevTime;

		//tick timers
		thunder.update(ellapsed);
		thundercloud.update(ellapsed);

		sharpcast = Math.max(0, sharpcast - ellapsed);
		umbral = Math.max(0, umbral - ellapsed);
		astral = Math.max(0, astral - ellapsed);

		if (enoch.isActive()) {
			enoch.update(ellapsed);
			if (astral <= 0 && umbral <= 0) {
				enoch.stop();
			} else if (enoch.current <= 0) {
				enoch.restartOffset();
			}
		}
		buffs["Enochian"].active = enoch.isActive();

		if (event.type == "applybuff" || event.type == "refreshbuff") {
			switch (event.name) {
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

		if (event.type == "removebuff") {
			switch (event.name) {
			case "Thundercloud":
				thundercloud.set(0.001);
				break;
			default:
				break;
			}
		}

		if (event.type == "begincast") {
			switch (event.ability.name) {
			case "Thunder III":
			case "Thunder IV":
				console.log(event.fightTime + " begin thunder");
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

		var img = '';
		if (event.type == "cast") {
			switch (event.ability.name) {
			case "Fire":
			case "Fire II":
				if (umbral > 0) {
					umbral = 0;
					//umbralStack = 0;
				} else {
					astral = 13;
					astralStack = Math.min(3, astralStack + 1);
					img = "astral_fire" + suffix[astralStack] + ".png";
				}
				break;
			case "Blizzard":
			case "Blizzard II":
			case "Freeze":
				if (astral > 0) {
					astral = 0;
					//astralStack = 0;
				} else {
					umbral = 13;
					umbralStack = Math.min(3, umbralStack + 1);
					img = "umbral_ice" + suffix[umbralStack] + ".png";
				}
				break;
			case "Fire III":
			case "Flare":
				img = "astral_fire_iii.png";
				astralStack = 3;
				//umbralStack = 0;
				astral = 13;
				umbral = 0;
				break;
			case "Blizzard III":
				img = "umbral_ice_iii.png";
				//astralStack = 0;
				umbralStack = 3;
				astral = 0;
				umbral = 13;
				break;
			case "Thunder III":
			case "Thunder IV":
				if (sharpcast > 0)
					thundercloud.restart();
				thunder.restart();
				break;

			case "Enochian":
				enoch.restart();
				buffs["Enochian"].active = true;
				break;
			case "Transpose":
				if (umbral > 0) {
					astralStack = 1;
					//astralStack = 0;
					astral = 13;
					umbral = 0;
					img = "astral_fire" + suffix[umbralStack] + ".png";
				} else if (astral > 0) {
					//astralStack = 0;
					astralStack = 1;
					astral = 0;
					umbral = 13;
					img = "umbral_ice" + suffix[umbralStack] + ".png";
				}
				break;
			}
		}

		var extra = [];
		extra.push(enoch.isActive() > 0 ? `<div class="center status-block" style="background-color: #7F5FB0"></div>` : ``);
		if (img != '')
			img = `<img src="img/${img}"/>`;

		if (astral > 0)
			extra.push(`<div class="center status-block" style="background-color: #F05F2F">${img}</div>`);
		else if (umbral > 0)
			extra.push(`<div class="center status-block" style="background-color: #5FD0F0">${img}</div>`);
		else
			extra.push(``);
		extra.push(thunder.isActive() ? `<div class="center status-block" style="background-color: #C0B02F"></div>` : ``);
		extra.push(thundercloud.isActive() ? `<div class="center status-block" style="background-color: #C0B0F0"></div>` : ``);
		img = ''

			event.extra = extra;
		event.potency = potency;
		prevTime = event.fightTime;
		result.events[e] = event;

	}
	//console.log(result);
	return result;
}

function parseMachinist(response) {
	console.log("Parsing MCH");

	var prevTime = 0;
	var activePet = 0;
	var petLookup = {};
	for(var p in result.player.pets){
		petLookup[result.fight.team[result.player.pets[p]]] = result.player.pets[p];		
	}
	
	result.totals[result.player.ID] = {
		'amount': 0,
		'potency': 0,
		'name': result.fight.team[result.player.ID],
		'id': result.player.ID,
		'time': 0 //result.fight.duration,
	}
	for (var p in result.player.pets) {
		result.totals[result.player.pets[p]] = {
			'amount': 0,
			'potency': 0,
			'name': result.fight.team[result.player.pets[p]],
			'id': result.player.pets[p],
			'time': 0 //result.fight.duration,
		}
	}

	//trackers
	var heatChange = 0;

	var removeBarrel = false;
	var wildTarget = 0;
	var wildfirePot = 0;

	var type = 'Machinist';
	//potencies
	var potencies = all_potencies[type];
	var combo_potencies = all_combo_potencies[type];
	var pos_potencies = all_pos_potencies[type];
	var pos_combo_potencies = all_pos_combo_potencies[type];
	//dots
	var dot_potencies = {};
	var dot_base = all_dot_base[type];
	//skills
	var combo = all_combo[type]
	var comboskills = all_comboskills[type];
	var weaponskills = all_weaponskills[type];
	//buffs
	var buffs = all_buffs[type];
	//role actions
	var role_all = role_actions[type];
	var role_taken = {};
	for(var i=0; i< role_all.length; i++){
		role_taken[role_all[i]] = 0;
	}
	//timers
	var timers = all_timers[type];
	
	//prescan
	//temp making it an array to pass by reference yay javascript
	activePet = [0];
	preScreen('Machinist',response.events, buffs, timers, activePet);
	activePet = activePet[0];

	for (var e in response.events) {
		var event = response.events[e];

		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		getBasicData(event, result.fight);
		var potency = 0;

		if (event.type == "damage" && event.amount != 0) {
				//player damage
				if (event.dmgType == 64 || event.dmgType == 1) {
					if (event.name == "Flamethrower")
						heatChange = 20;
					//dots
					potency = dot_potencies[event.name];
					event.tooltip = "DoT: " + event.name;
				} else {
					potency = potencies[event.name];
					//action specific
					if (buffs['Heat'].stacks >= 50 && event.name == "Cooldown")
						potency = combo_potencies[event.name];
					else if (hasBuff("Cleaner Shot", buffs) && (event.name == "Clean Shot" || event.name == "Heated Clean Shot"))
						potency = combo_potencies[event.name];
					else if (hasBuff("Enhanced Slug Shot", buffs) && (event.name == "Slug Shot" || event.name == "Heated Slug Shot"))
						potency = combo_potencies[event.name];

					event.tooltip = event.name + ": " + potency + "<br/>";
					potency = applyBuffs(potency, event, buffs);

					if (event.targetID == wildTarget && event.sourceID == result.player.ID) {
						dot_potencies["Wildfire"] += potency * .25;
					}
				}


			if (potency == undefined)
				potency = 0;
		}

		//update timers
		var ellapsed = event.fightTime - prevTime;
		updateTimers(timers, buffs, ellapsed, event);

		if (!timers['Overheated'].isActive()) {
			buffs['Heat'].addStacks(heatChange);
			heatChange = 0;

			if (removeBarrel) {
				buffs['Heat'].setStacks(0);
				buffs['Gauss Barrel'].active = false;
				removeBarrel = false;
			}

			if (buffs['Heat'].stacks >= 100) {
				timers['Overheated'].restart();
				removeBarrel = true; //mark barrel for removal
			}
		}
		

		
		
		if (event.type == "cast") {
			//id match shouldn't be needed bt being safe
			if(role_all.indexOf(event.name) != -1 && event.sourceID == result.player.ID){ 
				role_taken[event.name]++;
			}
			
			switch (event.name) {
			case "Reload":
				buffs['Ammunition'].setStacks(3);
				break;
			case "Quick Reload":
				buffs['Ammunition'].addStacks(1)
				break;
			case "Barrel Stabilizer":
				buffs['Heat'].setStacks(50);
				break;
			case "Hot Shot":
			case "Split Shot":
			case "Slug Shot":
			case "Spread Shot":
			case "Clean Shot":
			case "Heated Split Shot":
			case "Heated Slug Shot":
			case "Heated Clean Shot":
				if (!buffs['Ammunition'].active && buffs['Gauss Barrel'].active)
					heatChange = 5;
				break;
			case "Cooldown":
				heatChange = -25;
				break;
			case "Gauss Barrel":
				buffs[event.name].applybuff();
				gauss = true;
				break;
			case "Remove Barrel":
				buffs['Gauss Barrel'].active = false;
				gauss = false;
				break;
			case 'Wildfire':
				wildTarget = event.targetID;
				dot_potencies[event.name] = 0;
				break;
			}

			if (dot_base.hasOwnProperty(event.name)){
				dot_potencies[event.name] = applyBuffs(dot_base[event.name], event, buffs);
			}
		
			if(event.name == "Bishop Autoturret" || event.name == "Rook Autoturret")
				activePet = petLookup[event.name];

		}
		
		//BUFF APPLICATION
		updateBuffs(buffs, timers, event, result);
		//class specifics
		if (event.type == "applybuff") {
			if (event.name == "Flamethrower")
				heatChange = 20;
		}


		var extra = [];
		updateExtras(extra, event, buffs, type);

		event.extra = extra;
		event.potency = potency;
		prevTime = event.fightTime;

		result.events[e] = event;
		
		if (result.totals.hasOwnProperty(event.sourceID)) {
			result.totals[event.sourceID].amount += event.amount;
			result.totals[event.sourceID].potency += potency;
		}
		
		result.totals[result.player.ID].time += ellapsed;
		if(result.totals.hasOwnProperty(activePet))
			result.totals[activePet].time += ellapsed;
	}
	//role actions used
	for(var r in role_taken){
		if(role_taken[r] == 0)
			delete role_taken[r];
	}
	result.role_actions = Object.keys(role_taken);
	
	return result;
}

function parseSummoner(response) {
	console.log("Parsing SMN");

	var prevTime = 0;
	var prevPet = 0;
	var activePet = 0;
	var petLookup = {};
	for(var p in result.player.pets){
		petLookup[result.fight.team[result.player.pets[p]]] = result.player.pets[p];		
	}
	
	result.totals[result.player.ID] = {
		'amount': 0,
		'potency': 0,													
		'name': result.fight.team[result.player.ID],
		'id': result.player.ID,
		'time': 0 //result.fight.duration,
	}
	for (var p in result.player.pets) {
		result.totals[result.player.pets[p]] = {
			'amount': 0,
			'potency': 0,
			'name': result.fight.team[result.player.pets[p]],
			'id': result.player.pets[p],
			'time': 0 //result.fight.duration,
		}
	}

	//trackers
	var heatChange = 0;

	var removeBarrel = false;
	var wildTarget = 0;
	var wildfirePot = 0;

	var type = 'Summoner';
	//potencies
	var potencies = all_potencies[type];
	var combo_potencies = all_combo_potencies[type];
	var pos_potencies = all_pos_potencies[type];
	var pos_combo_potencies = all_pos_combo_potencies[type];
	//dots
	var dot_potencies = {};
	var dot_base = all_dot_base[type];
	//skills
	var combo = all_combo[type]
	var comboskills = all_comboskills[type];
	var weaponskills = all_weaponskills[type];
	//buffs
	var buffs = all_buffs[type];
	//role actions
	var role_all = role_actions[type];
	var role_taken = {};
	for(var i=0; i< role_all.length; i++){
		role_taken[role_all[i]] = 0;
	}
	//timers
	var timers = all_timers[type];
	
	//prescan
	//temp making it an array to pass by reference yay javascript
	activePet = [0];
	preScreen(type,response.events, buffs, timers, activePet);
	activePet = activePet[0];

	for (var e in response.events) {
		var event = response.events[e];
		
		if (event.sourceID != result.player.ID && event.sourceID != undefined) {		
			if ((result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff" && event.type != "death") ) {
				continue;
			}
		}
		
		getBasicData(event, result.fight);
		
		var potency = 0;
		if (event.type == "damage" && event.amount != 0) {
			
				if (event.dmgType == 1 || event.dmgType == 64) {
					//dots
					potency = dot_potencies[event.name];
					event.tooltip = "DoT: " + event.name;
				} else {
					potency = potencies[event.name];
					if(event.name == 'Attack'){
						if (event.sourceID == result.player.ID) 
							potency = 110;
						else
							potency = 80;
					}

					event.tooltip = event.name + ": " + potency + "<br/>";
					potency = applyBuffs(potency, event, buffs);
				
				}

			if (potency == undefined)
				potency = 0;
		}
		//update timers
		var ellapsed = event.fightTime - prevTime;
		updateTimers(timers, buffs, ellapsed, event);
		
		if(!timers['Summon Bahamut'].isActive() && prevPet != 0){
			activePet = prevPet;
			prevPet = 0;
		}

		if (event.type == "cast") {		
			//id match shouldn't be needed bt being safe
			if(role_all.indexOf(event.name) != -1 && event.sourceID == result.player.ID){ 
				role_taken[event.name]++;
			}
		
			switch (event.name) {
			case "Tri-disaster":
				dot_potencies["Bio III"] = applyBuffs(dot_base["Bio III"], event, buffs);
				dot_potencies["Miasma III"] = applyBuffs(dot_base["Miasma III"], event, buffs);
				break;
			case "Summon Bahamut":
				prevPet = activePet;
				activePet = petLookup["Demi-Bahamut"];
				timers['Summon Bahamut'].restart();
				break;
			}
			
			if (dot_base.hasOwnProperty(event.name)){
				dot_potencies[event.name] = applyBuffs(dot_base[event.name], event, buffs);
			}
		}

		//BUFF APPLICATION
		updateBuffs(buffs, timers, event, result, activePet);
		//class specifics
		if (event.type == "applybuff") {
			if (event.name == "Flamethrower")
				heatChange = 20;
		}


		var extra = [];
		updateExtras(extra, event, buffs, type);
		
		event.extra = extra;
		event.potency = potency;
		
		prevTime = event.fightTime;
		result.events[e] = event;

		if (result.totals.hasOwnProperty(event.sourceID)) {
			result.totals[event.sourceID].amount += event.amount;
			result.totals[event.sourceID].potency += potency;
		}
		
		result.totals[result.player.ID].time += ellapsed;
		if(result.totals.hasOwnProperty(activePet))
			result.totals[activePet].time += ellapsed;
	}
	//role actions used
	for(var r in role_taken){
		if(role_taken[r] == 0)
			delete role_taken[r];
	}
	
	return result;
}

/*

CLASS PARSING TEMPLATE

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
var lastWS = '';

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

event = getBasicData(event, result.fight);
var potency = 0;

if (event.type == "damage" && event.amount != 0) {
if (combo[event.name] == lastWS)
potency = combo_potencies[event.name];
else
potency = potencies[event.name];


if (comboskills.indexOf(event.name) > -1)
lastWS = event.name;


if (event.amount == 0)
potency = 0;
if (potency == undefined)
potency = 0;
}

if(event.type == "applybuff"){

}

if(event.type == "applybuffstack"){

}

if(event.type == "removebuff"){

}

if(event.type == "removebuffstack"){

}

if(event.type == "cast"){

}

var ellapsed = event.fightTime - prevTime;

//update timers

var extra = [];
extra.push(`${potency == 0 ? "" : potency}`);

event.extra = extra;
event.potency = potency;
prevTime = event.fightTime;
result.events[e] = event;
}

return result;
}
*/