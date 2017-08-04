function processReport(report) {
	console.log(report);
	result = parseReport(report);
	console.log(result);

	$(".summary").append(`<b>Player:</b> ${result.fight.team[result.player.ID]}</br>`);
	if (result.player.pets.length > 0) {
		var pets = `<ul><li><b>Pets:</b></li>`;
		for (var p in result.player.pets) {
			pets += `<li>${team[result.player.pets[p]]}</li>`;
		}
		$(".summary").append(pets + `</ul>`);
	}
	var nme = `<ul><li><b>Enemies:</b></li>`;
	for (var e in result.fight.enemies) {

		nme += `<li>${result.fight.enemies[e]}</li>`;
	}
	$('.summary').append(nme + '</ul>');
	$('.summary').append(`<b>Duration:</b> ${result.fight.duration} seconds<br/>`)

	var url = base_url + "/report/events/" + result.report.reportID + "?translate=true";
	url += "&start=" + result.fight.start;
	url += "&end=" + result.fight.end;
	url += "&actorid=" + result.player.ID;
	url += "&api_key=" + api_key;
	//console.log(result.fight.team);
	//console.log(result.fight.enemies);
	
	var callback = processGeneric;
	if (result.player.type == "BlackMage")
		callback = processBlackmage;
	else if (result.player.type == "Samurai")
		callback = processSamurai;
	
	httpGetAsync(url, callback);
}

function updateEvent(data, fight) {
	tbl_row = '';

	tbl_row += `<td>${data.name}<span class="castType">${data.type}</span></td>`;
	tbl_row += `<td><span class="damage-block ${damageTypes[data.dmgType]}"></span>${data.amount == 0 ? '':data.amount} <span class="castType">${data.isDirect ? "Direct ":''}${data.hitType}</span></td>`;
	if(data.isTargetFriendly)
		tbl_row += `<td>${fight.team[data.target]}</td>`;
	else
		tbl_row += `<td>${fight.enemies[data.target]}</td>`;
	tbl_row += `<td>${data.fightTime}</td>`;

	if (data.extra != undefined) {
		for (var i = 0; i < data.extra.length; i++) {
			tbl_row += `<td>${data.extra[i]}</td>`;
		}
	}
	$(".ranking-table tbody").append(`<tr>${tbl_row}</tr>`);
}



function processGeneric(response) {
	
	var totalDamage = 0;

	result = parseGeneric(response);
	console.log(result);
	
	for (var e in result.events) {
		var event = result.events[e];
		//var type = event.type;

		updateEvent(event, result.fight);

		if (event.type != 'heal')
			totalDamage += event.amount == undefined ? 0 : event.amount
	}

	//update summary
	$(".summary").append(`<b>Total Damage:</b> ${totalDamage.toFixed(3)}</br>`);
	$(".summary").append(`<b>DPS:</b> ${(totalDamage / result.fight.duration).toFixed(2)}</br>`);
}

function processBlackmage(response) {
	console.log("Processing BLM");

	result = parseBlackmage(response);
	console.log(result);
	$(".ranking-table tbody").html("");

	$(".ranking-table thead tr").append(`<td>Potency</td>`);
	$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/enochian.png"/></td>`);
	$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/astral_umbral.png"/></td>`);
	$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/thunder_iii.png"/></td>`);

	var totalPotency = 0;
	var totalDamage = 0;

	for (var e in result.events) {
		var event = result.events[e];
		
		updateEvent(event, result.fight);
		
		if (event.type != 'heal'){
			totalPotency += event.potency == "" ? 0 : event.potency;
			totalDamage += event.amount == undefined ? 0 : event.amount
		}

		
	}

	//update summary
	$(".summary").append(`<b>Total Damage:</b> ${totalDamage.toFixed(3)}</br>`);
	$(".summary").append(`<b>DPS:</b> ${(totalDamage / result.fight.duration).toFixed(2)}</br>`);
	$(".summary").append(`<b>Total Potency:</b> ${totalPotency.toFixed(3)}</br>`);
	$(".summary").append(`<b>PPS:</b> ${(totalPotency / result.fight.duration).toFixed(2)}<br/>`);
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

function getReportData() {
	var url = base_url + "/report/fights/" + result.report.reportID + "?translate=true&api_key=" + api_key;
	httpGetAsync(url, processReport);
}

getReportData();