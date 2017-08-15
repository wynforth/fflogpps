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
		console.log(event);

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
	//console.log(tbl_row);
	return tbl_row;
	//$(".ranking-table tbody").append(`<tr>${tbl_row}</tr>`);
}


function applyBuffs(value, event, buffs) {
	for (var b in buffs) {
		var buff = buffs[b];
		if(buff.isAllowed(event)){
			value = buff.apply(value, event);
			event.tooltip += buff.name + ": " + buff.getDisplayPercent() + "% [" + value.toFixed(0) + "]<br/>";
		}
		
		/*
		if (buff.active && buff.restricted.indexOf(event.name) == -1) {
			value = Math.trunc(value * (1 + (buff.bonus)));
			event.tooltip += buff.name + ": " + (buff.bonus * 100).toFixed(0) + "% [" + value.toFixed(0) + "]<br/>";
		}
		*/
	}
	return value;
}

function applyDebuffs(value, event, debuffs) {
	for (var d in debuffs) {
		var debuff = debuffs[d];
		if(debuff.isAllowed(event)){
			value = debuff.apply(value, event);
			event.tooltip += debuff.name + ": " + debuff.getDisplayPercent() + "% [" + value.toFixed(0) + "]<br/>";
		}
		//console.log(buff);
		
		if (debuff.isTarget(event.targetID) && debuff.restricted.indexOf(event.name) == -1) {
			//value = Math.trunc(value * (1 + (debuff.bonus)));
			//event.tooltip += debuff.name + ": " + (debuff.bonus * 100).toFixed(0) + "% [" + value.toFixed(0) + "]<br/>";
		}		
	}
	return value;
}

function parseBard(response) {
	console.log("Parsing BRD");

	var prevTime = 0;

	//trackers
	var minuet = new Timer("Minuet", 30);
	var mages = new Timer("Mage's", 30);
	var army = new Timer("Army's", 30);
	// casting vs dot damage;
	var causticDot = 45;
	var stormDot = 55;
	var caustic = new Timer("Caustic Bite", 30);
	var storm = new Timer("Storm Bite", 30);
	var causticLow = 99999;
	var stormLow = 99999;
	var img = '';

	var charges = 0;

	var buffs = {
		"Increased Action Damage II": new Buff("Trait II", .20, true, ["Shot"]),
		"Raging Strikes": new Buff("Raging Strikes", .10),
		"Straight Shot": new Buff("Straight Shot", (.10 * .45)),
		"Foe Requiem": new Debuff("Foe Requiem", .03)
	};

	var potencies = {
		"Shot": 100,
		"Heavy Shot": 150,
		"Straight Shot": 140,
		"Empyreal Arrow": 230,
		"Iron Jaws": 100,
		"Refulgent Arrow": 300,

		"Quick Nock": 110,
		"Rain Of Death": 100,

		"Sidewinder": 100,
		"Misery's End": 190,
		"Bloodletter": 130,

		"Mage's Ballad": 100,
		"Army's Paeon": 100,
		"The Wanderer's Minuet": 100,

		"Caustic Bite": 120,
		"Stormbite": 120,
	}
	
	var dot_potencies = {
		"Storm Bite": 55,
		"Caustic Bite": 45,
	};

	//prescan first couple attacks to see what buffs fall off
	var prefoe = true;
	var start = response.events[0].timestamp;

	for (var e in response.events) {
		var event = response.events[e];
		if (event.timestamp > start + 5000) //just 5 seconds which is enough time to ensure a server tick to see if foe is applied
			break;

		//foe shows as an applybuff to self first in the log first, it wasn't precasted
		if (event.type == "applybuff") {
			if (event.ability.name == "Foe Requiem")
				prefoe = false;
		}

		if (event.type == "applydebuff") {
			if (event.ability.name == "Foe Requiem" && prefoe)
				buffs[event.ability.name].add(event.targetID);
		}
	}

	for (var e in response.events) {
		var tooltip = "";
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

			if (event.dmgType == 1 || event.dmgType == 64) {
				potency = dot_potencies[event.name];
				event.tooltip = "DoT: " + event.name;
				//guessing at crits for charges
				if (event.name == "Storm Bite") {
					stormLow = Math.min(event.amount, stormLow);
					if (minuet.isActive() && event.amount >= (stormLow * 1.35))
						charges++;
				} else if (event.name == "Caustic Bite") {
					causticLow = Math.min(event.amount, causticLow);
					if (minuet.isActive() && event.amount >= (causticLow * 1.35))
						charges++;
				}
			} else {
				potency = potencies[event.name];

				//action specific tasks
				if (event.name == "Pitch Perfect") {
					if (charges >= 3)
						potency = 420;
					else if (charges == 2)
						potency = 240;
					else
						potency = 100;
					charges = 0;
				} else if (event.name == "Sidewinder") {
					if (caustic.isActive() && storm.isActive())
						potency = 260;
					else if (caustic.isActive() || storm.isActive())
						potency = 175;
				} else if (event.name == "Stormbite") {
					dot_potencies["Storm Bite"] = applyBuffs(55, event, buffs);
					//dot_potencies["Storm Bite"] = applyDebuffs(dot_potencies["Storm Bite"], event, debuffs);
				} else if (event.name == "Caustic Bite") {
					dot_potencies["Caustic Bite"] = applyBuffs(45, event, buffs);
					//dot_potencies["Caustic Bite"] = applyDebuffs(dot_potencies["Caustic Bite"], event, debuffs);
				} else if (event.name == "Iron Jaws") {
					dot_potencies["Storm Bite"] = applyBuffs(55, event, buffs);
					//dot_potencies["Storm Bite"] = applyDebuffs(dot_potencies["Storm Bite"], event, debuffs);
					dot_potencies["Caustic Bite"] = applyBuffs(45, event, buffs);
					//dot_potencies["Caustic Bite"] = applyDebuffs(dot_potencies["Caustic Bite"], event, debuffs);
				} else if (event.name == "Empyreal Arrow" && minuet.isActive()) {
					charges++;
				}
				event.tooltip = event.name + " Base: " + potency + "<br/>";

				potency = applyBuffs(potency, event, buffs);
				//potency = applyDebuffs(potency, event, debuffs);
			}

			if (potency == undefined)
				potency = 0;
		}

		//update timers
		var ellapsed = event.fightTime - prevTime;
		minuet.update(ellapsed);
		mages.update(ellapsed);
		army.update(ellapsed);
		caustic.update(ellapsed);
		storm.update(ellapsed);
		//console.log("Fight Time: " + result.events[e].fightTime + "\tStorm Bite: " + storm.current + "\tCaustic Bite: " + caustic.current + "\tJust Fell? " + storm.justFell);

		if (!minuet.isActive() && charges > 0)
			charges = 0;

		if (event.type == "applybuff") {
			if (buffs.hasOwnProperty(event.name)) {
				buffs[event.name].active = true;
			}
		}

		if (event.type == "removebuff") {
			if (buffs.hasOwnProperty(event.name)) {
				buffs[event.name].active = false;
			}
		}

		if (event.type == "applydebuff") {
			if (buffs.hasOwnProperty(event.name)) {
				//console.log("adding " + event.name);
				buffs[event.name].add(event.targetID);
			}

		}

		if (event.type == "removedebuff") {
			if (buffs.hasOwnProperty(event.name)) {
				buffs[event.name].remove(event.targetID);
			}
		}

		if (event.type == "cast") {
			switch (event.name) {
			case "Caustic Bite":
				causticCast = true;
				caustic.restart();
				break;
			case "Stormbite":
				storm.restart();
				break;
			case "Iron Jaws":
				if (caustic.canRefresh())
					caustic.restart();
				if (storm.canRefresh())
					storm.restart();
				break;
			case "The Wanderer's Minuet":
				img = `<img src="/img/the_wanderers_minuet.png"/>`;
				minuet.restart();
				mages.stop();
				army.stop();
				break;
			case "Mage's Ballad":
				img = `<img src="/img/mages_ballad.png"/>`;
				mages.restart();
				minuet.stop();
				army.stop();
				break;
			case "Army's Paeon":
				img = `<img src="/img/armys_paeon.png"/>`;
				army.restart();
				minuet.stop();
				mages.stop();
				break;
			}

		}

		var extra = [];
		extra.push(`<span data-toggle="tooltip" title="${event.tooltip}">${potency == 0 ? "" : potency.toFixed(2)}</span>`);
		extra.push(buffs["Straight Shot"].active ? `<div class="center status-block" style="background-color: #B01F00"></div>` : ``);
		extra.push(buffs["Foe Requiem"].targets.length > 0 ? `<div class="center status-block" style="background-color: #90D0D0"></div>` : ``);
		extra.push(buffs["Raging Strikes"].active ? `<div class="center status-block" style="background-color: #D03F00"></div>` : ``);

		if (minuet.isActive())
			extra.push(`<div class="center status-block" style="background-color: #4F6F1F">${img}</div>`);
		else if (mages.isActive())
			extra.push(`<div class="center status-block" style="background-color: #A07FC0">${img}</div>`);
		else if (army.isActive())
			extra.push(`<div class="center status-block" style="background-color: #D07F5F">${img}</div>`);
		else
			extra.push(``);
		img = '';
		extra.push(storm.isActive() ? `<div class="center status-block" style="background-color: #9DBBD2"></div>` : ``);
		extra.push(caustic.isActive() ? `<div class="center status-block" style="background-color: #D75896"></div>` : ``);

		event.extra = extra;
		
		event.potency = potency;
		result.events[e] = event;
		prevTime = event.fightTime;
	}
	return result;
}

function parseBlackmage(response) {
	console.log("Parsing BLM");

	var enoch = new Timer("Enochian", 30);
	var astral = 0;
	var umbral = 0;
	var astralStack = 0;
	var umbralStack = 0;
	var suffix = ['', '','_ii','_iii'];
	
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
				if (event.name == "Blizzard III"){
					umbralStack = 3;
					umbral = 13;
				}
				if (event.name == "Fire"){
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
				if (event.name == "Thunder III"){
					if(thundercloud.isActive() && canThundercloud) {
						tctip = event.name + " Base: " + potency + "<br/>";
						potency += (40 * 8);
						tctip += "Thundercloud: +" + (40 * 8) + " [" + potency.toFixed(0) + "]<br/>"
						//thundercloud.stop();
					}
					dot_potencies[event.name] = applyBuffs(40, event, buffs);
				} else if (event.name == "Thunder IV"){
					if(thundercloud.isActive() && canThundercloud) {
						tctip = event.name + " Base: " + potency + "<br/>";
						potency += (30 * 6);
						tctip += "Thundercloud: +" + (30 * 6) + " [" + potency.toFixed(0) + "]<br/>"
					}
					dot_potencies[event.name] = applyBuffs(30, event, buffs);
				} else {
					canThundercloud = true;
				}
				
				event.tooltip = event.name + " Base: " + potency + "<br/>";
				if(tctip != "")
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
			if (astral <= 0 && umbral <= 0){
				enoch.stop();
			}else if (enoch.current <= 0){
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
				if (umbral > 0){
					umbral = 0;
					//umbralStack = 0;
				} else {
					astral = 13;
					astralStack = Math.min(3,astralStack + 1);
					img = "astral_fire" + suffix[astralStack]+".png";
				}
				break;
			case "Blizzard":
			case "Blizzard II":
			case "Freeze":
				if (astral > 0){
					astral = 0;
					//astralStack = 0;
				} else {
					umbral = 13;
					umbralStack = Math.min(3,umbralStack + 1);
					img = "umbral_ice" + suffix[umbralStack]+".png";
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
					img = "astral_fire" + suffix[umbralStack]+".png";
				} else if(astral > 0) {
					//astralStack = 0;
					astralStack = 1;
					astral = 0;
					umbral = 13;
					img = "umbral_ice" + suffix[umbralStack]+".png";
				}
				break;
			}
		}

		var extra = [];

		extra.push(`<span data-toggle="tooltip" title="${event.tooltip}">${potency == 0 ? "" : potency.toFixed(2)}</span>`);
		extra.push(enoch.isActive() > 0 ? `<div class="center status-block" style="background-color: #7F5FB0"></div>` : ``);
		if(img != '')
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

function parseDragoon(response) {
	console.log("Parsing DRG");

	var prevTime = 0;

	//trackers
	var botd = new Timer("Blood of the Dragon", 20);

	var potencies = {
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
	}

	var dot_potencies = {
		'Chaos Thrust': 35,
	}

	var combo_potencies = {
		'Vorpal Thrust': 240,
		'Full Thrust': 440,
		'Disembowel': 230,
		'Chaos Thrust': (270 * 9 + 230) / 10,
		'Sonic Thrust': 170,
		'Fang And Claw': 100 + ((290 * 9 + 250) / 10),
		'Wheeling Thrust': 100 + ((290 * 9 + 250) / 10),
	}

	var combo = {
		'Vorpal Thrust': 'True Thrust',
		'Full Thrust': 'Vorpal Thrust',
		'Disembowel': 'Impulse Drive',
		'Chaos Thrust': 'Disembowel',
		'Sonic Thrust': 'Doom Spike',
		'Wheeling Thrust': 'Fang And Claw',
		'Fang And Claw': 'Wheeling Thrust',
	}

	//anything that makes/breaks a combo
	var comboskills = ['True Thrust', 'Vorpal Thrust', 'Impulse Drive', 'Heavy Thrust', 'Full Thrust', 'Disembowel', 'Chaos Thrust', 'Fang And Claw', 'Wheeling Thrust', 'Doom Spike', 'Sonic Thrust', 'Piercing Talon'];
	//all "WeaponSkills"
	var weaponskills = ['True Thrust', 'Vorpal Thrust', 'Impulse Drive', 'Heavy Thrust', 'Full Thrust', 'Disembowel', 'Chaos Thrust', 'Fang And Claw', 'Wheeling Thrust', 'Doom Spike', 'Sonic Thrust', 'Piercing Talon']
	var lastWS = '';

	//buffs
	var buffs = {
		"Blood Of The Dragon": new Buff("Blood Of The Dragon", .30, false, [], ["Jump", "Spineshatter Dive"]),
		"Heavy Thrust": new Buff("Heavy Thrust", .15),
		"Blood For Blood": new Buff("Blood For Blood", .15),
		"Right Eye": new Buff("Right Eye", .10),
		"Battle Litany": new Buff("Battle Litany", (.15 * .45)),
		"Piercing Resistance Down": new Debuff("Disemboweled", .05),
	};
	var colors = {
		"Blood Of The Dragon": "#7DA3AD",
		"Heavy Thrust": "#CDA34C",
		"Blood For Blood": "#901F1D",
		"Right Eye": "#B41512",
		"Battle Litany": "#6F8C93",
		"Piercing Resistance Down": "#932F2F",
	}
	//prescan first couple attacks to see what buffs are up prelogging
	var start = response.events[0].timestamp;
	for (var e in response.events) {
		var event = response.events[e];
		if (event.type == "cast") {
			if (event.ability.name == "Fang And Claw" || event.ability.name == "Wheeling Thrust" || event.ability.name == "Sonic Thrust") {
				botd.restart();
			}
		}
		if (event.timestamp > start + 20000)
			break;

	}
	buffs["Blood Of The Dragon"].active = botd.isActive();

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
				//DOTS
				potency = dot_potencies[event.name];
				event.tooltip = "DoT: " + event.name;
			} else {
				if (combo[event.name] == lastWS)
					potency = combo_potencies[event.name];
				else if (combo.hasOwnProperty(event.name) && event.name == lastWS) //hack for aoe combos
					potency = combo_potencies[event.name];
				else
					potency = potencies[event.name];

				if (comboskills.indexOf(event.name) > -1)
					lastWS = event.name;

				event.tooltip = event.name + " Base: " + potency + "<br/>";

				potency = applyBuffs(potency, event, buffs)

					//update dot damage
					if (event.name == "Chaos Thrust") {
						dot_potencies[event.name] = applyBuffs(35, event, buffs);
					}

			}
			if (potency == undefined)
				potency = 0;
		}

		//update timers
		var ellapsed = event.fightTime - prevTime;
		botd.update(ellapsed);

		if (event.type == "applybuff") {
			if (buffs.hasOwnProperty(event.name))
				buffs[event.name].active = true;
		}

		if (event.type == "removebuff") {
			if (buffs.hasOwnProperty(event.name))
				buffs[event.name].active = false;
		}

		if (event.type == "applydebuff") {
			if (buffs.hasOwnProperty(event.name))
				buffs[event.name].add(event.targetID);
		}

		if (event.type == "removedebuff") {
			if (buffs.hasOwnProperty(event.name))
				buffs[event.name].remove(event.targetID);
		}

		if (event.type == "cast") {
			if (event.name == "Blood Of The Dragon")
				botd.restart();

			if (botd.isActive()) {
				if (event.name == "Fang And Claw" || event.name == "Wheeling Thrust" || event.name == "Sonic Thrust")
					botd.extend(10, 30);
			}
		}
		buffs["Blood Of The Dragon"].active = botd.isActive();

		var extra = [];
		extra.push(`<span data-toggle="tooltip" title="${event.tooltip}">${potency == 0 ? "" : potency.toFixed(2)}</span>`);
		for (var b in colors) {
			extra.push(buffs[b].active ? `<div class="center status-block" style="background-color: ${colors[b]}"></div>` : ``);
		}

		event.extra = extra;
		event.potency = potency;
		prevTime = event.fightTime;

		result.events[e] = event;
	}

	return result;
}
	
	


function parseMachinist(response) {
	console.log("Parsing MCH");

	var prevTime = 0;

	//trackers
	var gauss = false;
	var ammunition = 3;
	var heat = 0;
	var heatChange = 0;
	var overheated = new Timer("Overheated", 10);
	var removeBarrel = false;
	var wildTarget = 0;
	var wildfirePot = 0;
	
	var cleanerShot = false;
	var enhancedSlugShot = false;

	var potencies = {
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
	}
	
	var enhanced_potencies = {
		'Slug Shot': 200,
		'Clean Shot': 240,
		'Cooldown': 230,
		'Heated Slug Shot': 230,
		'Heated Clean Shot': 270,
	}
	
	var petPotencies = {
		'Charged Volley Fire': 160,
		'Volley Fire': 80,
		'Aether Mortar': 60,
		'Charged Aether Mortar': 90,
		'Rook Overload': 800,
		'Bishop Overload': 600,
	}
	
	var dot_potencies = {
		"Flamethrower": 10,
		"Wildfire": 10,
	}
	
	var weaponskills = ['Hot Shot', 'Split Shot', 'Slug Shot', 'Spread Shot', 'Clean Shot', 'Cooldown', 'Heated Split Shot', 'Heated Slug Shot', 'Heated Clean Shot'];
	var petskills = ['Charged Volley Fire', 'Volley Fire', 'Aether Mortar', 'Charged Aether Mortar', 'Rook Overload', 'Bishop Overload'];
	
	var buffs = {
		"Trait": new Buff("Action Damage II", .20, true, ["Shot"]),
		"Hot Shot": new Buff("Hot Shot", .08, false, petskills),
		"Overheated": new Buff("Overheated", .20, false, petskills),
		"Vulnerability Up": new Debuff("Hypercharge", .05, false, petskills),
		"Reassembled" : new Buff("Reassembled", .45, false, [], weaponskills),
	}
	
	var colors = {
		"Hot Shot": "#6D2600",
		"Vulnerability Up": "#9BA275",
		"Overheated": "#A6391E",
	}
	
	var notgauss = false;
	//prescan first 20 seconds to see what buffs fall off or abilities are used to determine pre-fight buffs
	var start = response.events[0].timestamp;
	for (var e in response.events) {
		var event = response.events[e];
		
		if (event.ability.name == "Gauss Barrel") {
				notgauss = true;
		}
		if (event.ability.name == "Barrel Stabilizer" || event.ability.name == "Flamethrower") {
				gauss = true;
		}
		
		if(event.timestamp > start + 20000)
			break;

	}

	if(notgauss) gauss = false;
	
	for (var e in response.events) {
		//reseting triggers
		var ammoUsed = false;
		
		var event = response.events[e];
		//console.log(event);

		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		getBasicData(event, result.fight);
		var potency = 0;

		if (event.type == "damage" && event.amount != 0) {
			if (event.sourceID == result.player.ID) {
				if (event.dmgType == 64 || event.dmgType == 1) {		
					if (event.name == "Flamethrower")
						heatChange = 20;
						
					//dots
					potency = dot_potencies[event.name];
					event.tooltip = "DoT: " + event.name;
				} else {
					potency = potencies[event.name];
					//action specific
					if (heat >= 50 && event.name == "Cooldown")
						potency = enhanced_potencies[event.name];
					else if (cleanerShot && (event.name == "Clean Shot" || event.name == "Heated Clean Shot"))
						potency = enhanced_potencies[event.name];
					else if (enhancedSlugShot && (event.name == "Slug Shot" || event.name == "Heated Slug Shot"))
						potency = enhanced_potencies[event.name];

					event.tooltip = event.name + " Base: " + potency + "<br/>";
					
					if (weaponskills.indexOf(event.name) > -1) {
						if (ammunition > 0){
							potency += 25;
							event.tooltip += "Ammunition: +25 [" + potency.toFixed(0) + "]<br/>";
						}
					}
	
					potency = applyBuffs(potency, event, buffs);

					if(event.targetID == wildTarget)
						dot_potencies["Wildfire"] += potency * .25;
				}
			} else {
				potency = petPotencies[event.name];
				event.tooltip = event.name + " Base: " + potency + "<br/>";
				potency = applyBuffs(potency, event, buffs);
			}
			
			if (potency == undefined)
				potency = 0;
		}

		//update timers
		var ellapsed = event.fightTime - prevTime;
		overheated.update(ellapsed);
		
		if (!overheated.isActive()) {
			heat = Math.min(100, heat + heatChange);
			heatChange = 0;

			if (removeBarrel) {
				heat = 0;
				gauss = false;
				removeBarrel = false;
			}
			
			if (heat >= 100) {
				overheated.restart();
				removeBarrel = true; //mark barrel for removal
			}
		}
		buffs["Overheated"].active = overheated.isActive();

		if (event.type == "applybuff") {
			if(buffs.hasOwnProperty(event.name))
				buffs[event.name].active = true;
			
			else if(event.name == "Cleaner Shot")
				cleanerShot = true;
			else if(event.name == "Enhanced Slug Shot")
				enhancedSlugShot = true;		
		}
		
		if (event.type == "removebuff") {
			if(buffs.hasOwnProperty(event.name))
				buffs[event.name].active = false;
			
			else if(event.name == "Cleaner Shot")
				cleanerShot = false;
			else if(event.name == "Enhanced Slug Shot")
				enhancedSlugShot = false;
		}

		
		
		if (event.type == "applydebuff") {
			if(event.name == "Vulnerability Up")
				buffs[event.name].add(event.targetID);
		}

		if (event.type == "removedebuff") {
			if(event.name == "Vulnerability Up")
				buffs[event.name].remove(event.targetID);
		}


		if (event.type == "cast") {
			switch(event.name){
				case "Barrel Stabilizer":
					heat = 50;
					break;
				case "Hot Shot":
				case "Split Shot":
				case "Slug Shot":
				case "Spread Shot":
				case "Clean Shot":
				case "Heated Split Shot":
				case "Heated Slug Shot":
				case "Heated Clean Shot":
					if(ammunition > 0)
						ammunition--
					else if(gauss)
						heatChange = 5;
					break;
				case "Cooldown":
					heatChange = -25;
					break;
				case "Reload":
					ammunition = 3;
					break;
				case "Quick Reload":
					if(ammunition < 3) ammunition++;
					break;
				case "Gauss Barrel":
					gauss = true;
					break;
				case "Remove Barrel":
					gauss = false;
					break;
				case 'Wildfire':
					wildTarget = event.targetID;
					dot_potencies[event.name] = 0;
					break;
				case 'Flamethrower':
					dot_potencies[event.name] = applyBuffs(60, event, buffs);
					break;
			}

		}

		

		var extra = [];
		extra.push(`<span data-toggle="tooltip" title="${event.tooltip}">${potency == 0 ? "" : potency.toFixed(2)}</span>`);
		extra.push(gauss ? `<div class="center status-block" style="background-color: #A4786F"></div>` : ``);
		for (var b in colors) {
			extra.push(buffs[b].active ? `<div class="center status-block" style="background-color: ${colors[b]}"></div>` : ``);
		}
		extra.push(`<div class="center status-block">${ammunition}</div>`);

		event.extra = extra;
		event.potency = potency;
		prevTime = event.fightTime;
		
		result.events[e] = event;
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

function parseNinja(response) {
	console.log("Parsing NIN");

	var prevTime = 0;
	var totalPotency = 0;
	var totalDamage = 0;

	//trackers
	var shadowCast = false;
	var shadowDot = 40;
	var tenchijin = false;
	var trick = {};
	var shadowfang = {};
	var duality = false;

	var potencies = {
		'Attack': 80,
		'Spinning Edge': 150,
		'Gust Slash': 100,
		'Assassinate': 200,
		'Throwing Dagger': 120,
		'Mug': 140,
		'Trick Attack': 400,  //scan ahead for the vuln up state?
		'Aeolian Edge': (160*9 + 100)/10,
		'Jugulate': 80,
		'Shadow Fang': 100,
		'Death Blossom': 110,
		'Armor Crush': (160*9 + 100)/10,
		'Dream Within A Dream': 150,
		'Hellfrog Medium': 400,
		'Bhavacakra': 600,
		'Fuma Shuriken': 240,
		'Katon': 250,
		'Raiton': 360,
		'Hyoton': 140,
		'Doton': 40,
		'Suiton': 180
	}

	var combo_potencies = {
		'Gust Slash': 200,
		'Aeolian Edge': (340*9 + 280)/10,
		'Shadow Fang': 200,
		'Armor Crush': (300*9 + 240)/10,
	}

	var combo = {
		'Gust Slash': 'Spinning Edge',
		'Aeolian Edge': 'Gust Slash',
		'Shadow Fang': 'Gust Slash',
	}

	//anything that makes/breaks a combo
	var comboskills = ['Gust Slash', 'Spinning Edge','Aeolian Edge','Shadow Fang', 'Throwing Dagger', 'Death Blossom'];
	//all "WeaponSkills"
	var mudras = ['Fuma Shuriken', 'Katon', 'Raiton', 'Hyoton', 'Doton', 'Suiton'];
	var lastWS = '';

	var first = true;

	//prescan first couple attacks to see what buffs fall off
	for (var i = 0; i < 5; i++) {
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

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;

		if (result.events[e].type == "damage" && result.events[e].amount != 0) {
			if (combo[result.events[e].name] == lastWS)
				potency = combo_potencies[result.events[e].name];
			else
				potency = potencies[result.events[e].name];

			
			if (comboskills.indexOf(result.events[e].name) > -1 && !(result.events[e].name == "Shadow Fang" && !shadowCast) && !duality){
					lastWS = result.events[e].name;
			}
			
			//ten chi jin for mudras
			if(tenchijin && mudras.indexOf(result.events[e].name)>-1)
				potency *= 2;
			
			//trick attack
			if (trick[result.events[e].target] > 0)
				potency *= 1.1;
			//shadowfang resist
			if (shadowfang[result.events[e].target] > 0 && result.events[e].dmgType == 1)
				potency *= 1.1;
			
			//Dripping Blades II
			if(result.events[e].name != "Attack")
				potency *= 1.2;

			//shadow fang dot 
			if (result.events[e].name == "Shadow Fang") {
				if (shadowCast) {
					shadowDot = 40 * (1 + (trick[result.events[e].target] > 0 ? .1 : 0));
					shadowCast = false;
				} else {
					potency = shadowDot;
				}
			}
			
			
			if (result.events[e].amount == 0)
				potency = 0;
			if (potency == undefined)
				potency = 0;
		}

		//update timers
		var ellapsed = result.events[e].fightTime - prevTime;
		for(var i in trick){
			trick[i] = Math.max(0, trick[i] - ellapsed);
		}
		for(var i in shadowfang){
			shadowfang[i] = Math.max(0, shadowfang[i] - ellapsed);
		}

		if (result.events[e].type == "applydebuff") {
			if(result.events[e].name == "Vulnerability Up")
				trick[result.events[e].target] = 10;
			if(result.events[e].name == "Shadow Fang")
				shadowfang[result.events[e].target] = 21;
			
		}
		
		if (result.events[e].type == "refreshdebuff") {
			if(result.events[e].name == "Shadow Fang")
				shadowfang[result.events[e].target] = 21;
			
		}

		if (result.events[e].type == "applybuff") {
			switch(result.events[e].name){
				case "Duality":
					duality = true;
					break;
				case "Ten Chi Jin":
					tenchijin = true;
					break;
			}
		}

		if (result.events[e].type == "removedebuff") {
			if(result.events[e].name == "Vulnerability Up")
				trick[result.events[e].target] = 0;
			if(result.events[e].name == "Shadow Fang")
				shadowfang[result.events[e].target] = 0;
		}

		if (result.events[e].type == "removebuff") {
			switch(result.events[e].name){
				case "Duality":
					duality = false;
					break;
				case "Ten Chi Jin":
					tenchijin = false;
					break;
			}
		}

		if (result.events[e].type == "cast") {
			if(result.events[e].name == "Shadow Fang")
				shadowCast = true;
		}

		var extra = [];
		extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);

		var trickTD = '';
		for(var i in trick){
			if(trick[i] > 0)
				trickTD = `<div class="center status-block" style="background-color: #933630"></div>`;
		}
		extra.push(trickTD);
		
		var shadowTD = '';
		for(var i in shadowfang){
			if(shadowfang[i] > 0)
				shadowTD = `<div class="center status-block" style="background-color: #44B3DA"></div>`;
		}
		extra.push(shadowTD);
		extra.push(tenchijin ? `<div class="center status-block" style="background-color: #BA4B4A"></div>` : ``);
		
		
		
		
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

			//maim and mend II
			if (result.events[e].name != "Attack")
				potency *= 1.30;

			if (result.events[e].amount == 0)
				potency = 0;
			if (potency == undefined)
				potency = 0;
		}
		
		var ellapsed = result.events[e].fightTime - prevTime;
		//update timers

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

		

		var extra = [];

		extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);
		extra.push(embolden > 0 ? `<div class="center status-block" style="background-color: #C05F3F"></div>` : ``);

		result.events[e].extra = extra;
		result.events[e].potency = potency;
		prevTime = result.events[e].fightTime;
	}

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
				if (result.events[e].name == "Yukikaze")
					yukikaze[result.events[e].target] = 30;
		
				
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

		var ellapsed = result.events[e].fightTime - prevTime;

		if (jinpu > 0)
			jinpu = Math.max(0, jinpu - ellapsed);
		if (kaiten > 0)
			kaiten = Math.max(0, kaiten - ellapsed);
		for (var i in yukikaze) {
			yukikaze[i] = Math.max(0, yukikaze[i] - ellapsed);
		}
		
		
		if (result.events[e].type == "applybuff") {
			if (result.events[e].name == "Kaiten")
				kaiten = 10;
		}

		if (result.events[e].type == "cast") {
			if (result.events[e].name == "Higanbana")
				higanCast = true;
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


function parseSummoner(response) {
	console.log("Parsing SMN");

	var prevTime = 0;
	var totalPotency = 0;
	var totalDamage = 0;
	
	var playerDamage = 0;
	var petDamage = 0;
	
	var playerPotency = 0;
	var petPotency = 0;

	//trackers
	var infernoDot = 20;
	var bioDot = 0;
	var bioCast = false;
	var bio = {};
	var miasmaDot = 0;
	var miasmaCast = false;
	var miasma = {};
	var shadowDot = 0;
	var ruination = {};
	var trance = {};
	var magicDebuff = {}; //shining emerald or contagion
	

	var potencies = {
		'Attack': 40,
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
		'Tri-Bind': 20,
		//special case
		'Radiant Shield': 50,
	}
	
	var petPotencies = {
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
	}

	var first = true;

	//prescan first couple attacks to see what buffs fall off
	for (var i = 0; i < 5; i++) {
		var event = response.events[i];

	}

	for (var e in response.events) {
		var event = response.events[e];
		//console.log(event);

		//only events of self	pets	or targetted on self
		if (event.sourceID != result.player.ID) {
			if (result.player.pets.indexOf(event.sourceID) == -1 && event.type != "applybuff") {
				continue;
			}
		}

		result.events[e] = getBasicData(event, result.fight);
		var potency = 0;

		if (result.events[e].type == "damage" && result.events[e].amount != 0) {
			if(result.events[e].source == result.player.ID){
				potency = potencies[result.events[e].name];
				if(result.events[e].name == "Fester"){
					potency = 0 + (bio[result.events[e].target] > 0 ? 150:0)+ (miasma[result.events[e].target] > 0 ? 150:0);
				}
			
				if(ruination[result.events[e].target] > 0){
					if(result.events[e].name.indexOf('Ruin') > -1)
						potency += 20;
				}
				
				
			} else {
				potency = petPotencies[result.events[e].name];
				
				if(result.events[e].name == 'Inferno' && result.events[e].dmgType != 1){
					infernoDot = 20;
				}
			}
			
			//magic debuff from pet
			if(result.events[e].dmgType != 1 && magicDebuff[result.events[e].target] > 0){
				potency *= 1.1;
			}
			
			//dreadwyrm trance
			potency *=  trance[result.events[e].source] > 0 ? 1.1:1;
			//magic and mend
			potency *= 1.3;
			
			//pre calculated dots
			if (result.events[e].name == 'Inferno' && result.events[e].dmgType == 1) {
				potency = infernoDot;
			}

			switch(result.events[e].name){
				case 'Bio III':
					potency = bioDot;
					break;
				case 'Miasma III':
					if(!miasmaCast) 
						potency = miasmaDot;
					else
						miasmaCast = false;
					break;
				case 'Shadow Flare':
					potency = shadowDot;
					break;
				case 'Deathflare':
					trance[result.events[e].source] = 0;
					break;
			}

			if (potency == undefined)
				potency = 0;
		}
		
		//update timers
		var ellapsed = result.events[e].fightTime - prevTime;
		
		var ruinationTD = '';
		for(var i in ruination){
			ruination[i] = Math.max(0, ruination[i] - ellapsed);
			if(ruination[i] > 0)
				ruinationTD = `<div class="center status-block" style="background-color: #4BA1EC"></div>`;
		}
		var tranceTD = '';
		for(var i in trance){
			trance[i] = Math.max(0, trance[i] - ellapsed);
		}
		if(trance[result.player.ID] > 0)
				tranceTD = `<div class="center status-block" style="background-color: #C1294D"></div>`;
		
		var bioTD = '';
		for(var i in bio){
			bio[i] = Math.max(0, bio[i] - ellapsed);
			if(bio[i] > 0)
				bioTD = `<div class="center status-block" style="background-color: #56631E"></div>`;
		}
		var miasmaTD = '';
		for(var i in miasma){
			miasma[i] = Math.max(0, miasma[i] - ellapsed);
			if(miasma[i] > 0)
				miasmaTD = `<div class="center status-block" style="background-color: #4B494F"></div>`;
		}
		var magicTD = '';
		for(var i in magicDebuff){
			magicDebuff[i] = Math.max(0, magicDebuff[i] - ellapsed);
			if(magicDebuff[i] > 0)
				magicTD = `<div class="center status-block" style="background-color: #721DD7"></div>`;
		}
		
		

		
		if (result.events[e].type == "applybuff") {
			
		}

		if (result.events[e].type == "removebuff") {
			
		}

		
		
		if (result.events[e].type == "applydebuff") {
			if(result.events[e].name == 'Ruination')
				ruination[result.events[e].target] = 20;
			
			
		}

		if (result.events[e].type == "removedebuff") {
			if(result.events[e].name == 'Ruination')
				ruination[result.events[e].target] = 0;
			
			if(result.events[e].name == 'Shining Emerald' || result.events[e].name == 'Contagion')
				magicDebuff[result.events[e].target] = 0;
		}


		if (result.events[e].type == "cast") {
			var dotMod = 1 + (trance[result.events[e].source] > 0 ? .1:0)
			if(result.events[e].dmgType != 1 && magicDebuff[result.events[e].target] > 0)
				dotMod += .1;
			
			if(result.events[e].name == 'Shining Emerald' || result.events[e].name == 'Contagion')
				magicDebuff[result.events[e].target] = 15;
			
			if(result.events[e].name == "Tri-disaster"){
				bioDot = 50 * dotMod;
				miasmaDot = 50 * dotMod;
				bio[result.events[e].target] = 30;
				miasma[result.events[e].target] = 30;
			}
			if(result.events[e].name == "Shadow Flare"){
				shadowDot = 50 * dotMod;
			}
			if(result.events[e].name == "Miasma III"){
				miasmaDot = 50 * dotMod;
				miasma[result.events[e].target] = 30;
			}
			if(result.events[e].name == "Bio III"){
				bioDot = 50 * dotMod;
				bio[result.events[e].target] = 30;
			}
			if(result.events[e].name == 'Dreadwyrm Trance'){
				//console.log(result.events[e]);
				if(result.events[e].source == result.player.ID && result.events[e].source == result.events[e].target)
					trance[result.events[e].target] = 20;
			}
		}

		

		var extra = [];
		extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);
		extra.push(tranceTD);
		extra.push(ruinationTD);
		//extra.push(magicTD);
		extra.push(bioTD);
		extra.push(miasmaTD);
		
		
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

result.events[e] = getBasicData(event, result.fight);
var potency = 0;

if (result.events[e].type == "damage" && result.events[e].amount != 0) {
if (combo[result.events[e].name] == lastWS)
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

var extra = [];
extra.push(`${potency == 0 ? "" : potency.toFixed(2)}`);

result.events[e].extra = extra;
result.events[e].potency = potency;
prevTime = result.events[e].fightTime;
}

return result;
}
*/