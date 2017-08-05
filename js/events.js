parseFunctions = {
	'BlackMage': parseBlackmage,
	'Samurai': parseSamurai,
	'Monk': parseMonk
}

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
	if (Object.keys(parseFunctions).indexOf(result.player.type) > -1)
		callback = processClass;
	
	fetchUrl(url, callback, result.player.type);
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


function processClass(response, spec) {

	console.log("Processing " + spec);
	result = parseFunctions[spec](response);
	console.log(result);

	$(".ranking-table tbody").html("");
	$(".ranking-table thead tr").append(`<td>Potency</td>`);
	
	if (spec == "BlackMage") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/enochian.png"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/astral_umbral.png"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/thunder_iii.png"/></td>`);
	}

	if (spec == "Samurai") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/jinpu.png"/></td>`);
	}
	
	if (spec == "Monk") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/greased_lightning.png"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/twin_snakes.png"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/dragon_kick.png"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/internal_release.png"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/riddle_of_fire.png"/></td>`);
	}

	var totalPotency = 0;
	var totalDamage = 0;

	for (var e in result.events) {
		var event = result.events[e];

		updateEvent(event, result.fight);

		if (event.type != 'heal') {
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
}

function getReportData() {
	var url = base_url + "/report/fights/" + result.report.reportID + "?translate=true&api_key=" + api_key;
	httpGetAsync(url, processReport);
}

getReportData();