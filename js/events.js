var base_url = "https://www.fflogs.com:443/v1";

function getBasicData(event) {
	var data = {};
	data = {
		'type': event.type,
		'name': event.type == 'death' ? 'death' : event.ability.name,
		'timestamp': event.timestamp,
		'fightTime': (event.timestamp - start) / 1000,
		'target': event.targetID == undefined ? '' : event.targetID,
		'hitType': event.hitType == undefined ? '' : hitTypes[event.hitType],
		'dmgType': event.amount == undefined ? 0 : event.ability.type,
		'amount': event.amount
	}

	if (event.multistrike)
		data.hitType = `*${data.hitType}*`;

	if (data.target != undefined) {
		if (data.target == playerID)
			data.target = "self";
		else
			data.target = event.targetIsFriendly ? team[data.target] : enemies[data.target];
		if (event.targetInstance > 1)
			data.target += "." + event.targetInstance;
	}

	console.log(data);
	return data;
}

var getUrlParameter = function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
	sURLVariables = sPageURL.split('&'),
	sParameterName,
	i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

var name = getUrlParameter('name');
var reportID = getUrlParameter('report');
var fightID = getUrlParameter('fight');
var api_key = getUrlParameter('api_key');
var start = 0;
var end = 0;
var playerID = 0;
var petIDs = [];
var playerClass = "";
var team = {};
var enemies = {};

function getReportData(reportID) {
	var url = base_url + "/report/fights/" + reportID + "?translate=true&api_key=" + api_key;
	httpGetAsync(url, processReport);
}

function processReport(report) {
	console.log(report);
	for (var k in report.fights) {
		var fight = report.fights[k];
		if (fight.id == fightID) {
			start = fight.start_time;
			end = fight.end_time;
		}
	}

	for (var k in report.friendlies) {
		var friend = report.friendlies[k];
		for (var j in friend.fights) {
			if (friend.fights[j].id == fightID) {
				if (friend.hasOwnProperty('name')) {
					team[friend.id] = friend.name;
				}

				if (friend.name == name) {
					playerID = friend.id;
					playerClass = friend.type;
				}
			}
		}
	}

	for (var k in report.enemies) {
		var enemy = report.enemies[k];
		for (var j in enemy.fights) {
			if (enemy.fights[j].id == fightID) {
				if (enemy.hasOwnProperty('name')) {
					console.log(friend);
					enemies[enemy.id] = enemy.name;
				}
			}
		}
	}

	for (var k in report.friendlyPets) {
		var pet = report.friendlyPets[k];

		for (var j in pet.fights) {
			if (pet.fights[j].id == fightID) {
				if (pet.hasOwnProperty('name')) {
					team[pet.id] = pet.name;
				}

				if (pet.petOwner == playerID) {
					petIDs.push(pet.id)
					break;
				}
			}
		}
	}

	$(".summary").append(`<b>Player:</b> ${team[playerID]}</br>`);
	if (petIDs.length > 0) {
		var pets = `<ul><li><b>Pets:</b></li>`;
		for (var p in petIDs) {
			pets += `<li>${team[petIDs[p]]}</li>`;
		}
		$(".summary").append(pets + `</ul>`);
	}
	var nme = `<ul><li><b>Enemies:</b></li>`;
	for (var e in enemies) {

		nme += `<li>${enemies[e]}</li>`;
	}
	$('.summary').append(nme + '</ul>');
	$('.summary').append(`<b>Duration:</b> ${(end-start)/1000} seconds<br/>`)

	var url = base_url + "/report/events/" + reportID + "?translate=true";
	url += "&start=" + start;
	url += "&end=" + end;
	url += "&actorid=" + playerID;
	url += "&api_key=" + api_key;
	console.log(team);
	console.log(enemies);
	if (playerClass == "BlackMage")
		httpGetAsync(url, processBlackmage);
	else if (playerClass == "Samurai")
		httpGetAsync(url, processSamurai);
	else
		httpGetAsync(url, processEvents);
}

function updateEvent(data, extra) {
	tbl_row = '';

	tbl_row += `<td>${data.name}<span class="castType">${data.type}</span></td>`;
	tbl_row += `<td><span class="damage-block ${damageTypes[data.dmgType]}"></span>${data.amount == undefined ? '':data.amount} <span class="castType">${data.hitType}</span></td>`;
	tbl_row += `<td>${data.target}</td>`;
	tbl_row += `<td>${data.fightTime}</td>`;

	if (extra != undefined) {
		for (var i = 0; i < extra.length; i++) {
			tbl_row += `<td>${extra[i]}</td>`;
		}
	}
	$(".ranking-table tbody").append(`<tr>${tbl_row}</tr>`);
}

function processEvents(events) {
	console.log(events);

	var tbl_body = '';
	var totalDamage = 0;

	for (var e in events.events) {
		var tbl_row = "";
		var event = events.events[e];
		//var type = event.type;

		if (event.sourceID != playerID) {
			if (petIDs.indexOf(event.sourceID) == -1 && event.type != 'applybuff') {
				//Logger.log(event);
				continue;
			}
		}

		var data = getBasicData(event);

		updateEvent(data);

		if (data.type != 'heal')
			totalDamage += data.amount == undefined ? 0 : data.amount
	}

	//update summary
	$(".summary").append(`<b>Total Damage:</b> ${totalDamage.toFixed(3)}</br>`);
	$(".summary").append(`<b>DPS:</b> ${(totalDamage / ((end - start) / 1000)).toFixed(2)}</br>`);
}

function processBlackmage(events) {
	console.log("Processing BLM");

	$(".ranking-table tbody").html("");

	$(".ranking-table thead tr").append(`<td>Potency</td>`);
	$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/enochian.png"/></td>`);
	$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/astral_umbral.png"/></td>`);
	$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/thunder_iii.png"/></td>`);

	var enoch = 0;
	var astral = 0;
	var umbral = 0;
	var prevTime = 0;
	var thundercloud = 0;
	var sharpcast = 0;
	var canThundercloud = true;
	var totalPotency = 0;
	var totalDamage = 0;
	var castState = "";
	var thunder = 0;


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

	for (var e in events.events) {
		var event = events.events[e];
		//var type = event.type;

		if (event.sourceID != playerID) {
			if (petIDs.indexOf(event.sourceID) == -1 && event.type != 'applybuff') {
				//Logger.log(event);
				continue;
			}
		}

		var data = getBasicData(event);

		if (first) {
			first = false;
			if (data.type == "damage") {
				if (event.ability.name == "Blizzard III")
					umbral = 13;
				if (event.ability.name == "Fire")
					astral = 13;
			}

		}

		if (data.type == "damage") {
			var potency = potencies[event.ability.name];
			if (potency == undefined)
				potency = 0;

			if (event.ability.name == "Thunder III") {
				if (data.dmgType == 1)
					potency = 40;
				else if (thundercloud > 0 && canThundercloud) {
					potency += (40 * 8);
					thundercloud = 0;
				}
			}

			if (enoch > 0 && data.dmgType != 1)
				potency *= 1.05

				if (data.name.startsWith("Fire") || data.name == "Flare") {
					if (castState == "astral") {
						//if(astral > 0)
						potency *= 1.8
					}
					if (castState == "umbral") {
						//if(umbral > 0)
						potency *= .7
					}
				}
			if (data.name.startsWith("Blizzard") || data.name == "Freeze") {
				if (castState == "astral")
					potency *= .7
			}

			if (umbral > 0)
				castState = "umbral";
			if (astral > 0)
				castState = "astral";
			
			//magic and mend
			if(data.type != 1 && data.type != 8)
				potency *= 1.30;

		} else {
			potency = 0;
		}

		var ellapsed = data.fightTime - prevTime;

		if (thundercloud > 0)
			thundercloud = Math.max(0, thundercloud - ellapsed);
		if (thunder > 0)
			thunder = Math.max(0, thunder - ellapsed);
		if (sharpcast > 0)
			sharpcast = Math.max(0, sharpcast - ellapsed);
		if (umbral > 0)
			umbral = Math.max(0, umbral - ellapsed);
		if (astral > 0)
			astral = Math.max(0, astral - ellapsed);

		if (enoch > 0) {
			enoch = enoch - ellapsed;
			if (astral <= 0 && umbral <= 0)
				enoch = 0
			else if (enoch <= 0)
				enoch += 30;
		}

		if (data.type == "applybuff" || data.type == "refreshbuff") {
			switch (data.name) {
			case "Thundercloud":
				thundercloud = 12;
				break;
			case "Sharpcast":
				sharpcast = 15;
				break
			default:
				break;
			}
		}

		if (data.type == "removebuff") {
			switch (data.name) {
			case "Thundercloud":
				thundercloud = 0.001;
				break;
			default:
				break;
			}
		}

		if (data.type == "begincast") {
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

		if (data.type == "cast") {
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
					thundercloud = 12;
				thunder = 24;
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
		extra.push(thunder > 0 ? `<div class="center status-block" style="background-color: #C0B02F"></div>` : ``);

		prevTime = data.fightTime;
		totalPotency += potency == "" ? 0 : potency;
		totalDamage += event.amount == undefined ? 0 : event.amount

		updateEvent(data, extra);
	}

	//update summary
	$(".summary").append(`<b>Total Damage:</b> ${totalDamage.toFixed(3)}</br>`);
	$(".summary").append(`<b>DPS:</b> ${(totalDamage / ((end - start) / 1000)).toFixed(2)}</br>`);
	$(".summary").append(`<b>Total Potency:</b> ${totalPotency.toFixed(3)}</br>`);
	$(".summary").append(`<b>PPS:</b> ${(totalPotency / ((end - start) / 1000)).toFixed(2)}<br/>`);
	$(".summary").append(`<b>Potency Ratio:</b> 1:${(totalDamage/totalPotency).toFixed(2)}`);
	//updateEvents(additonal_headers, rows)

}

function processSamurai(events) {
	console.log("Processing BLM");

	$(".ranking-table tbody").html("");

	$(".ranking-table thead tr").append(`<td>Potency</td>`);
	$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/jinpu.png"/></td>`);
	//$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/yukikaze.png"/></td>`);


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

	for (var e in events.events) {
		var tbl_row = "";
		var event = events.events[e];
		//var type = event.type;

		if (event.sourceID != playerID) {
			if (petIDs.indexOf(event.sourceID) == -1 && event.type != 'applybuff') {
				//Logger.log(event);
				continue;
			}
		}

		if (event.targetInstance > 1 && event.type != 'damage')
			continue;
		//data.target += "." + event.targetInstance;

		var data = getBasicData(event);
		var potency = 0;

		if (data.type == "damage") {
			if (data.name == "Higanbana" && !higanCast) {
				potency = higanDot;

			} else {
				if (combo[data.name] == lastWS)
					potency = combo_potencies[data.name];
				else
					potency = potencies[data.name];

				if (jinpu > 0)
					potency *= 1.10;

				if (yukikaze[data.target] > 0 && data.dmgType == 1)
					potency *= 1.10;

				if (data.name == 'Jinpu')
					jinpu = 30;

				if (data.name == 'Yukikaze')
					yukikaze[data.target] = 30;

				if(data.name == "Higanbana"){
					higanDot = 35 * ( 1 + (kaiten > 0 ? .5:0) + (jinpu > 0 ? .1:0) + (yukikaze[data.target] > 0 ? .1:0));
					higanCast = false;
				}
				
				if (kaiten > 0 && weaponskills.indexOf(data.name) > -1) {
					
					potency *= 1.5;
					kaiten = 0;
				} 

				//combo
				if (comboskills.indexOf(data.name) > -1)
					lastWS = data.name;
			}
			if(data.amount == 0)
				potency = 0;
			if (potency == undefined)
				potency = 0;
		}
		
		if(data.type == "applybuff"){
			if(data.name == "Kaiten")
				kaiten = 10;
		}
		
		if(data.type == "cast"){
			if(data.name == "Higanbana")
				higanCast = true;
		}
		
		var ellapsed = data.fightTime - prevTime;

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

		prevTime = data.fightTime;
		totalPotency += potency == "" ? 0 : potency;
		totalDamage += data.amount == undefined ? 0 : data.amount

		updateEvent(data, extra);
	}

	//update summary
	$(".summary").append(`<b>Total Damage:</b> ${totalDamage.toFixed(3)}</br>`);
	$(".summary").append(`<b>DPS:</b> ${(totalDamage / ((end - start) / 1000)).toFixed(2)}</br>`);
	$(".summary").append(`<b>Total Potency:</b> ${totalPotency.toFixed(3)}</br>`);
	$(".summary").append(`<b>PPS:</b> ${(totalPotency / ((end - start) / 1000)).toFixed(2)}<br/>`);
	$(".summary").append(`<b>Potency Ratio:</b> 1:${(totalDamage/totalPotency).toFixed(2)}`);
}
getReportData(reportID);