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
	//console.log("Parsing Report for " + report.title);
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
		if (buff.isAllowed(event) && buff.getBonus(event) != 0) {
			value = buff.apply(value, event);
			event.tooltip += buff.name + ": " + buff.getDisplay(event) + " [" + value.toFixed(0) + "]<br/>";
		}
	}
	return value;
}

function hasBuff(name, buffs) {
	if (buffs.hasOwnProperty(name))
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
		if (!hutonCast)
			timers['Huton'].restart();

	} else if (type == "Summoner") {
		for (var e in events) {
			var event = events[e];

			if (egiAbilities.indexOf(event.ability.name) > -1) {
				activePet[0] = event.sourceID
			}
			//the remove only shows up within 20 seconds if it was started prefight
			if (event.type == 'removebuff' && event.ability.name == "Rouse") {
				buffs['Rouse'].applybuff();
			}

			if (event.timestamp > start + 20000)
				break;
		}
	} else if (type == 'DarkKnight'){
		var grit_cast = false;
		for (var e in events) {
			var event = events[e];
			if (event.timestamp > start + 10000) //10 seconds ahead
				break;

			//foe shows as an applybuff to self first in the log first, it wasn't precasted
			if (event.type == "removebuff") {
				if (event.ability.name == "Grit")
					buffs["Grit"].applybuff();
			}
			if (event.type == "applybuff") {
				if (event.ability.name == "Grit")
					grit_cast = true;
			}
		}
		if (grit_cast)
			buffs["Grit"].active = false;
	} else if (type == 'Paladin'){
		var oath_cast = false;
		var start_sword = false;
		for (var e in events) {
			var event = events[e];
			if (event.timestamp > start + 10000) //10 seconds ahead
				break;

			//foe shows as an applybuff to self first in the log first, it wasn't precasted
			if (event.type == "cast") {
				if (event.ability.name == "Sword Oath" || event.ability.name == "Shield Oath")
					oath_cast = true;
			}
			
			if (event.type == "damage") {
				if (event.ability.name == "Sword Oath")
					start_sword = true;
			}
		}
		if (!oath_cast){ //no oath cast during opening meaning we start with one on
			if(start_sword)
				buffs['Sword Oath'].applybuff();
			else
				buffs['Shield Oath'].applybuff();
		}
	} else if (type == 'Warrior'){
		var deliverance_start = false;
		for (var e in events) {
			var event = events[e];
			if (event.timestamp > start + 20000) //20 seconds ahead
				break;

			//foe shows as an applybuff to self first in the log first, it wasn't precasted
			if (event.type == "cast") {
				//console.log(event.ability.name);
				if(['Inner Release', 'Fell Cleave', 'Decimate', 'Defiance'].indexOf(event.ability.name) > -1){ 
					//delivrance ability was used
					//console.log(event.ability.name);
					deliverance_start = true;
					break;
				} else if(event.ability.name == 'Deliverance'){
					break;
				}
				
					
			}
			
		}
		//if defiance is cast we assume we start with the other one, otherwise we are in defiance
		if(deliverance_start)
			buffs['Deliverance'].applybuff();
		else
			buffs['Defiance'].applybuff();
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
		if (buffs.hasOwnProperty(event.name) && (event.targetID == result.player.ID || event.targetID == activePet))
			buffs[event.name].active = false;
	} else if (event.type == "removebuffstack") {
		if (buffs.hasOwnProperty(event.name) && (event.targetID == result.player.ID || event.targetID == activePet))
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

function updateExtras(extra, event, buffs, type) {
	var columns = buff_display[type];

	for (var b in columns) {
		var displayString = columns[b].display(event, buffs[b]);
		if (displayString != undefined)
			extra.push(displayString);
	}
}

function parseClass(response) {

	var type = result.player.type;

	//console.log("Parsing " + type);


	var prevTime = 0;
	var ellapsed = 0;
	var lastWS = "";
	var ratio = 0;

	//aoe spells
	var lastDamage = '';
	var lastFightTime = '';
	var dStep = 0;
	var damageSteps = all_damageSteps[type];
	var combo_damageSteps = all_combo_damageSteps[type];
	//pet support
	var activePet = 0;
	var petLookup = {};
	for (var p in result.player.pets) {
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
	var combo = all_combo[type];
	var comboskills = all_comboskills[type];
	var weaponskills = all_weaponskills[type];
	//buffs
	var buffs = all_buffs[type];
	//role actions
	var role_all = role_actions[type];
	var role_taken = {};
	for (var i = 0; i < role_all.length; i++) {
		role_taken[role_all[i]] = 0;
	}
	//timers
	var timers = all_timers[type];

	//prescan
	if (['Samurai','Monk'].indexOf(type) == -1){
		var ps0 = performance.now();
		preScreen(type, response.events, buffs, timers);
		var ps1 = performance.now();
		console.log("Prescreen took " + (ps1-ps0).toFixed(4) + "ms");
	}

	//Main Parsing
	var newCast = false;
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
					if (combo[event.name].indexOf(lastWS) > -1 || (event.name == lastWS && !newCast) || hasBuff('Meikyo Shisui', buffs)) { //hack for aoe combos
						if ((hasBuff("True North", buffs) || hasBuff('Dark Arts', buffs)) && pos_combo_potencies.hasOwnProperty(event.name))
							potency = pos_combo_potencies[event.name];
						else
							potency = combo_potencies[event.name];
					}
				} else {
					if ((hasBuff("True North", buffs) || hasBuff('Dark Arts', buffs)) && pos_potencies.hasOwnProperty(event.name))
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
				} else if(event.name == "Bloodspiller"){
					if(hasBuff('Grit', buffs))
						if(hasBuff('Dark Arts', buffs))
							potency += 90;
						else
							potency += 75;
				}

				event.tooltip = event.name + ": " + potency + "<br/>";

				//if the spell decreases on aoe test if the time and name are the same
				if (event.fightTime == lastFightTime && event.name == lastDamage) {
					//test for combo
					var curSteps = damageSteps;
					if (combo.hasOwnProperty(event.name)){
						if (combo[event.name].indexOf(lastWS) > -1 || event.name == lastWS || hasBuff('Meikyo Shisui', buffs))
							curSteps = combo_damageSteps;
					}

					if (curSteps.hasOwnProperty(event.name)) {
						//decriment the potency
						//console.log(event.fightTime + " - " + event.name);
						var step = curSteps[event.name][Math.min(dStep, curSteps[event.name].length - 1)];
						potency = Math.trunc(potency * step);
						event.tooltip += "Multiple Targets: -" + ((1 - step) * 100).toFixed(0) + "% [" + potency.toFixed(0) + "]<br/>";
						dStep++;
					}
				} else {
					lastDamage = event.name;
					lastFightTime = event.fightTime;
					dStep = 0;
				}

				if (event.name == 'Upheaval'){
					//max health
					var maxhealth = event.sourceResources.maxHitPoints;
					if(hasBuff('Defiance', buffs))
						maxhealth = maxhealth / 1.25;
					if(hasBuff('Thrill Of Battle', buffs))
						maxhealth = maxhealth / 1.2;
					var bonus = Math.max(event.sourceResources.hitPoints/maxhealth, 1/3);
					//health bonus
					potency = Math.trunc(potency * (bonus));
					event.tooltip += "Health Modifier: " + ((bonus-1) * 100).toFixed(0) + "% [" + potency.toFixed(0) + "]<br/>";
				}
				
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

			if (potency == 0 && event.amount != 0) {
				console.log("WARNING: Damage dealt with unknown potency");
				console.log(event);
			}
			newCast = false;

		}

		//TIMERS AND TIMED BUFFS
		ellapsed = event.fightTime - prevTime;
		if (ellapsed != 0)
			updateTimers(timers, buffs, ellapsed, event);

		if (event.type == "cast") {
			//id match shouldn't be needed bt being safe
			if (role_all.indexOf(event.name) != -1 && event.sourceID == result.player.ID) {
				role_taken[event.name]++;
			}

			if (dot_base.hasOwnProperty(event.name)) {
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
			} else if (event.name == "Fang And Claw" || event.name == "Wheeling Thrust" || event.name == "Sonic Thrust") {
				if (timers["Blood Of The Dragon"].isActive())
					timers["Blood Of The Dragon"].extend(10, 30);
			}
			newCast = true;
		}

		//BUFF APPLICATION
		//console.log(event);
		updateBuffs(buffs, timers, event, result);
		//class specifics
		if (type == "Monk") {
			if (event.type == "applybuff" || event.type == "refreshbuff") {
				if (event.name == "Fists Of Wind" || event.name == "Fists Of Earth") {
					buffs["Fists Of Fire"].active = false;
					buffs["Riddle Of Fire"].active = false;
				}
			}
		} else if (type == "Paladin") {
			if (event.type == "applybuff" || event.type == "refreshbuff" || event.type == 'applybuffstack') {
				if (event.name == "Shield Oath") {
					buffs["Sword Oath"].removebuff();
				} else if (event.name == "Sword Oath") {
					buffs["Shield Oath"].removebuff();
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
		} else if (type == "Paladin") {
			img = '';
			if (["applybuff", "applydebuff"].indexOf(event.type) > -1)
				if(event.name == 'Sword Oath')
					img = `<img src="img/sword_oath.png">`;
				else if(event.name == 'Shield Oath')
					img = `<img src="img/shield_oath.png">`;

			if (hasBuff("Sword Oath", buffs))
				extra.push(`<div class="center status-block" style="background-color: #93CACD">${img}</div>`);
			else if (buffs["Shield Oath"].active)
				extra.push(`<div class="center status-block" style="background-color: #E7DE95">${img}</div>`);
			else
				extra.push(``);
			img = '';
		} else if (type == "Warrior") {
			//unchained and inner release
			if (["applybuff", "refreshbuff", "applydebuff"].indexOf(event.type) > -1)
				if(event.name == 'Unchained' || event.name == 'Inner Release')
					img = `<img src="img/${event.name.toLowerCase().replace(/ /g,'_')}.png">`;
				

			if (hasBuff("Unchained", buffs))
				extra.push(`<div class="center status-block" style="background-color: #CE7CD1">${img}</div>`);
			else if (hasBuff("Inner Release", buffs))
				extra.push(`<div class="center status-block" style="background-color: #9B553E">${img}</div>`);
			else
				extra.push(``);
			img = '';
			
			//defiance vs deliverance
			img = '';
			if (["applybuff", "refreshbuff", "applydebuff"].indexOf(event.type) > -1)
				if(event.name == 'Defiance' || event.name == 'Deliverance')
					img = `<img src="img/${event.name.toLowerCase()}.png">`;
				

			if (hasBuff("Defiance", buffs))
				extra.push(`<div class="center status-block" style="background-color: #6E8C16">${img}</div>`);
			else if (hasBuff("Deliverance", buffs))
				extra.push(`<div class="center status-block" style="background-color: #495685">${img}</div>`);
			else
				extra.push(``);
			img = '';
		}
		

		event.extra = extra;
		event.potency = potency;
		prevTime = event.fightTime;

		result.events[e] = event;
		//update ratio currently only used for guessing pitch perfect :/
		//dont acount for dots, since we cant properly tell crits or directs (do dots direct?)
		if (event.potency != 0 && (event.dmgType != 1 && event.dmgType != 64))  { 
			var tp = event.potency * (event.isDirect ? 1.25 : 1) * (event.hitType == 'Crit' ? 1.45 : 1);
			var r = event.amount / tp;

			var expected = event.potency * ratio;
			expected = Math.trunc(expected * (event.isDirect ? 1.25:1));
			expected = Math.trunc(expected * (event.hitType == 'Crit' ? 1.45 : 1));
			var baseline = event.amount;
			
			var variance = expected/event.amount;
			if(ratio != 0 && (variance > 1.3 || variance < .7))
					console.log('WARNING @ ' + event.fightTime + ': ' +event.name + ' - ' + expected.toFixed(0) + ' vs ' + event.amount);
			//warning if something is far off from the ratio?
			
			
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
		if (result.totals.hasOwnProperty(activePet))
			result.totals[activePet].time += ellapsed;

	}
	//role actions used
	for (var r in role_taken) {
		if (role_taken[r] == 0)
			delete role_taken[r];
	}
	result.role_actions = Object.keys(role_taken);

	return result;
}

function parseBlackmage(response) {
	var type = result.player.type;
	console.log("Parsing BLM");

	var suffix = ['', '', '_ii', '_iii'];
	//totals
	result.totals[result.player.ID] = {
		'amount': 0,
		'potency': 0,
		'name': result.fight.team[result.player.ID],
		'id': result.player.ID,
		'time': 0 //result.fight.duration,
	}

	//buffs
	var buffs = all_buffs[type];
	//role actions
	var role_all = role_actions[type];
	var role_taken = {};
	for (var i = 0; i < role_all.length; i++) {
		role_taken[role_all[i]] = 0;
	}
	//timers
	var timers = all_timers[type];
	//potencies
	var potencies = all_potencies[type];

	//dots
	var dot_potencies = {};
	var dot_base = all_dot_base[type];

	var first = true;
	var prevTime = 0;
	//aoe spells
	var lastDamage = '';
	var lastFightTime = '';
	var dStep = 0;
	var damageSteps = all_damageSteps[type];
	var combo_damageSteps = all_combo_damageSteps[type];

	//role actions
	var role_all = role_actions[type];
	var role_taken = {};
	for (var i = 0; i < role_all.length; i++) {
		role_taken[role_all[i]] = 0;
	}

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

		if (event.type == "damage" && event.amount != 0) {
			//Dots
			if (event.dmgType == 1 || event.dmgType == 64) {
				potency = dot_potencies[event.name];
				event.tooltip = "DoT: " + event.name;
			} else {
				potency = potencies[event.name];
				event.tooltip = event.name + ": " + potency + "<br/>";

				//if the spell decreases on aoe test if the time and name are the same
				if (event.fightTime == lastFightTime && event.name == lastDamage) {
					if (damageSteps.hasOwnProperty(event.name)) {
						//decriment the potency
						console.log(event.fightTime + " - " + event.name);
						var step = damageSteps[event.name][Math.min(dStep, damageSteps[event.name].length - 1)];
						potency = Math.trunc(potency * step);
						event.tooltip += "Multiple Targets: -" + ((1 - step) * 100).toFixed(0) + "% [" + potency.toFixed(0) + "]<br/>";
						dStep++;
					}
				} else {
					lastDamage = event.name;
					lastFightTime = event.fightTime;
					dStep = 0;
				}

				potency = applyBuffs(potency, event, buffs);

				if (potency == undefined)
					potency = 0;

				if (potency == 0 && event.amount != 0) {
					console.log("WARNING: Damage dealt with unknown potency");
					console.log(event);
				}
			}

		}

		//TIMERS AND TIMED BUFFS
		ellapsed = event.fightTime - prevTime;
		updateTimers(timers, buffs, ellapsed, event);

		if (timers['Enochian'].isActive() || timers['Enochian'].justFell) {
			//enoch.update(ellapsed);
			if (buffs['Astral Fire'].stacks <= 0 && buffs['Umbral Ice'].stacks <= 0) {
				timers['Enochian'].stop();
			} else if (timers['Enochian'].current <= 0) {
				timers['Enochian'].restartOffset();
			}
		}
		buffs["Enochian"].active = timers['Enochian'].isActive();

		var img = '';
		if (event.type == "cast") {
			//id match shouldn't be needed bt being safe
			if (role_all.indexOf(event.name) != -1 && event.sourceID == result.player.ID) {
				role_taken[event.name]++;
			}
			//update dots
			if (dot_base.hasOwnProperty(event.name)) {
				dot_potencies[event.name] = applyBuffs(dot_base[event.name], event, buffs);
			}

			if (timers.hasOwnProperty(event.name)) {
				timers[event.name].restart();
			}
		}

		if (event.type == "damage") {
			switch (event.ability.name) {

			case "Fire":
			case "Fire II":
				if (buffs['Umbral Ice'].active) {
					timers['Umbral Ice'].stop();
					buffs['Umbral Ice'].setStacks(0);
				} else {
					timers['Astral Fire'].restart();
					buffs['Astral Fire'].addStacks(1);
					img = "astral_fire" + suffix[buffs['Astral Fire'].stacks] + ".png";
				}
				break;
			case "Blizzard":
			case "Blizzard II":
			case "Freeze":
				if (buffs['Astral Fire'].active) {
					timers['Astral Fire'].stop();
					buffs['Astral Fire'].setStacks(0);
				} else {
					timers['Umbral Ice'].restart();
					buffs['Umbral Ice'].addStacks(1);
					img = "umbral_ice" + suffix[buffs['Umbral Ice'].stacks] + ".png";
				}
				break;
			case "Fire III":
			case "Flare":
				timers['Astral Fire'].restart();
				buffs['Astral Fire'].setStacks(3);
				timers['Umbral Ice'].stop();
				img = "astral_fire_iii.png";
				break;
			case "Blizzard III":
				timers['Umbral Ice'].restart();
				buffs['Umbral Ice'].setStacks(3);
				timers['Astral Fire'].stop();
				img = "umbral_ice_iii.png";
				break;
			case "Transpose":
				if (umbral > 0) {
					timers['Astral Fire'].restart();
					buffs['Astral Fire'].setStacks(1);
					timers['Umbral Ice'].stop();
					img = "astral_fire" + suffix[umbralStack] + ".png";
				} else if (astral > 0) {
					timers['Umbral Ice'].restart();
					buffs['Umbral Ice'].setStacks(1);
					timers['Astral Fire'].stop();
					img = "umbral_ice" + suffix[umbralStack] + ".png";
				}
				break;
			}
		}

		//BUFF APPLICATION
		updateBuffs(buffs, timers, event, result);

		var extra = [];
		updateExtras(extra, event, buffs, type);

		var timg = '';
		if (timg != '')
			timg = `<img src="img/${img}"/>`;
		if (buffs['Thunder IV'].active) {
			if (event.name == 'Thunder IV' && ["cast", "applybuff", "applydebuff"].indexOf(event.type) > -1)
				timg = `<img src="img/thunder_iv.png">`;
			extra.push(`<div class="center status-block" style="background-color: #A14AB6">${timg}</div>`);
		} else if (buffs['Thunder III'].active) {
			if (event.name == 'Thunder III' && ["cast", "applybuff", "applydebuff"].indexOf(event.type) > -1)
				timg = `<img src="img/thunder_iii.png">`;
			extra.push(`<div class="center status-block" style="background-color: #3D6DB6">${timg}</div>`);
		} else {
			extra.push('');
		}
		timg = '';

		if (img != '')
			img = `<img src="img/${img}"/>`;
		if (buffs['Astral Fire'].active) {
			extra.push(`<div class="center status-block" style="background-color: #F05F2F">${img}</div>`);
		} else if (buffs['Umbral Ice'].active) {
			extra.push(`<div class="center status-block" style="background-color: #5FD0F0">${img}</div>`);
		} else {
			extra.push('');
		}
		img = '';

		event.extra = extra;
		event.potency = potency;
		prevTime = event.fightTime;

		result.events[e] = event;

		//potency & time tracking
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
	}

	//role actions used
	for (var r in role_taken) {
		if (role_taken[r] == 0)
			delete role_taken[r];
	}
	result.role_actions = Object.keys(role_taken);
	//console.log(result);
	return result;
}

function parseMachinist(response) {
	var type = result.player.type;
	console.log("Parsing MCH");

	var prevTime = 0;
	var activePet = 0;
	var petLookup = {};
	for (var p in result.player.pets) {
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

	//potencies
	var potencies = all_potencies[type];
	var combo_potencies = all_combo_potencies[type];
	//dots
	var dot_potencies = {};
	var dot_base = all_dot_base[type];
	var weaponskills = all_weaponskills[type];
	//buffs
	var buffs = all_buffs[type];
	//role actions
	var role_all = role_actions[type];
	var role_taken = {};
	for (var i = 0; i < role_all.length; i++) {
		role_taken[role_all[i]] = 0;
	}
	//timers
	var timers = all_timers[type];

	//prescan
	//temp making it an array to pass by reference yay javascript
	activePet = [0];
	preScreen('Machinist', response.events, buffs, timers, activePet);
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
			if (role_all.indexOf(event.name) != -1 && event.sourceID == result.player.ID) {
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

			if (dot_base.hasOwnProperty(event.name)) {
				dot_potencies[event.name] = applyBuffs(dot_base[event.name], event, buffs);
			}

			if (event.name == "Bishop Autoturret" || event.name == "Rook Autoturret")
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
		if (result.totals.hasOwnProperty(activePet))
			result.totals[activePet].time += ellapsed;
	}
	//role actions used
	for (var r in role_taken) {
		if (role_taken[r] == 0)
			delete role_taken[r];
	}
	result.role_actions = Object.keys(role_taken);

	return result;
}

function parseSummoner(response) {
	var type = result.player.type;
	console.log("Parsing SMN");

	var prevTime = 0;
	var prevPet = 0;
	var activePet = 0;
	var petLookup = {};
	for (var p in result.player.pets) {
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

	//potencies
	var potencies = all_potencies[type];
	//dots
	var dot_potencies = {};
	var dot_base = all_dot_base[type];
	//buffs
	var buffs = all_buffs[type];
	//role actions
	var role_all = role_actions[type];
	var role_taken = {};
	for (var i = 0; i < role_all.length; i++) {
		role_taken[role_all[i]] = 0;
	}
	//timers
	var timers = all_timers[type];

	//prescan
	//temp making it an array to pass by reference yay javascript
	activePet = [0];
	preScreen(type, response.events, buffs, timers, activePet);
	activePet = activePet[0];

	for (var e in response.events) {
		var event = response.events[e];

		if (event.sourceID != result.player.ID && event.sourceID != undefined) {
			if ((result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff" && event.type != "death")) {
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
				if (event.name == 'Attack') {
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

		if (!timers['Summon Bahamut'].isActive() && prevPet != 0) {
			activePet = prevPet;
			prevPet = 0;
		}

		if (event.type == "cast") {
			//id match shouldn't be needed bt being safe
			if (role_all.indexOf(event.name) != -1 && event.sourceID == result.player.ID) {
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

			if (dot_base.hasOwnProperty(event.name)) {
				dot_potencies[event.name] = applyBuffs(dot_base[event.name], event, buffs);
			}
		}

		//BUFF APPLICATION
		updateBuffs(buffs, timers, event, result, activePet);
		if(event.type == 'applybuff'){
			if (dot_base.hasOwnProperty(event.name) && !dot_potencies.hasOwnProperty(event.name)) {
				dot_potencies[event.name] = applyBuffs(dot_base[event.name], event, buffs);
			}
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
		if (result.totals.hasOwnProperty(activePet))
			result.totals[activePet].time += ellapsed;
	}

	//role actions used
	for (var r in role_taken) {
		if (role_taken[r] == 0)
			delete role_taken[r];
	}
	result.role_actions = Object.keys(role_taken);

	return result;
}