var parseFunctions = {
	'Bard': parseBard,
	'BlackMage': parseBlackmage,
	'Dragoon': parseDragoon,
	'Machinist': parseMachinist,
	'Monk': parseMonk,
	'Ninja': parseNinja,
	'RedMage': parseRedmage,
	'Samurai': parseSamurai,
	'Summoner': parseSummoner,

}

function processReport(report) {
	console.log(report);
	result = parseReport(report);
	console.log(result);
	
	var link = `https://www.fflogs.com/reports/${result.report.reportID}#fight=${result.report.fightID}&type=damage-done`;
	
	//$(".summary").append(`<b>${result.fight.team[result.player.ID]}</b> as a <span class="${result.player.type}">${result.player.type}</span> (<a href="${link}">FFLogs</a>)`);
	$(".container.summaries .header").html(`<b>${result.fight.team[result.player.ID]}</b> the ${result.player.type}`);
	$(".header").toggleClass(result.player.type, true);
	$(".container").toggleClass(result.player.type, true);
	
	if (result.player.pets.length > 0) {
		var pets = '';
		for (var p in result.player.pets) {
			pets += result.fight.team[result.player.pets[p]] + ', ';
		}
		$(".container.summaries .header").append(` with ${pets.slice(0,-2)}`);
	}

	var nme = '';
	for (var e in result.fight.enemies) {
		nme += result.fight.enemies[e] + ', ';
	}
	$(".container.summaries .header").append(` <b>VS.</b> ${nme.slice(0,-2)}`);
	
	$(".summary").append(`<span class="castType">Full report at <a href="${link}">FFLogs</a></span>`);
	$('.summary').append(`<b>Duration:</b> ${result.fight.duration} seconds<br/><br/>`)

	var url = base_url + "/report/events/" + result.report.reportID + "?translate=true";
	url += "&start=" + result.fight.start;
	url += "&end=" + result.fight.end;
	url += "&actorid=" + result.player.ID;
	url += "&api_key=" + api_key;
	console.log(url);
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
	return `<tr>${tbl_row}</tr>`;
	$(".ranking-table tbody").append(`<tr>${tbl_row}</tr>`);
}

function processGeneric(response) {

	var totalDamage = 0;

	result = parseGeneric(response);
	console.log(result);

	var lastEvent = {
		name: '',
		timestamp: '',
		target: '',
		amount: '',
		type: ''
	};
	for (var e in result.events) {
		var event = result.events[e];
		//var type = event.type;
		if (isSameEvent(event, lastEvent))
			continue;

		updateEvent(event, result.fight);

		if (event.type != 'heal')
			totalDamage += event.amount == undefined ? 0 : event.amount;
		lastEvent = event;
	}

	//update summary
	$(".summary").append(`<b>Total Damage:</b> ${totalDamage.toFixed(3)}</br>`);
	$(".summary").append(`<b>DPS:</b> ${(totalDamage / result.fight.duration).toFixed(2)}</br>`);
}

function processClass(response, spec) {

	console.log("Processing " + spec);
	
	$(".ranking-table tbody").html("");
	$(".ranking-table thead tr").append(`<td style="width: 90px">Potency</td>`);

	

	if (spec == "Bard") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/straight_shot.png" title="Straight Shot"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/foe_requiem.png" title="Foe Requiem"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/battle_voice.png" title="Battle Voice"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/raging_strikes.png" title="Raging Strikes"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/bard_song.png" title="Bard Song's"/></td>`);
	}
	
	if (spec == "BlackMage") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/enochian.png" title="Enochian"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/astral_umbral.png" title="A Song of Ice & Fire"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/thunder_iii.png" title="Thunder Dot"/></td>`);
	}
	
	if (spec == "Dragoon") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/blood_of_the_dragon.png" title="Blood of the Dragon"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/heavy_thrust.png" title="Heavy Thrust"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/blood_for_blood.png" title="Blood For Blood"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/right_eye.png" title="Dragon Sight"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/battle_litany.png" title="Battle Litany"/></td>`);
	}

	if (spec == "Machinist") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/gauss_barrel.png" title="Gauss Barrel"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/hot_shot.png" title="Hot Shot"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/hypercharge.png" title="Hypercharge"/></td>`);
	}

	if (spec == "Monk") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/greased_lightning.png" title="Greased Lightning! Go Greased Lightning!"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/twin_snakes.png" title="Twin Snakes"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/dragon_kick.png" title="Dragon Kick"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/internal_release.png" title="Internal Release"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/riddle_of_fire.png" title="Riddle of Fire"/></td>`);
	}
	
	if (spec == "Ninja") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/vulnerability_up.png" title="Trick Attack"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/shadow_fang.png" title="Shadow Fang"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/ten_chi_jin.png" title="Ten Chi Jin"/></td>`);
	}

	if (spec == "RedMage") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/embolden.png" title="Embolden"/></td>`);
	}

	if (spec == "Samurai") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/jinpu.png" title="Jinpu"/></td>`);
	}
	
	if (spec == "Summoner") {
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/dreadwyrm_trance.png" title="Dreadwyrm Trance"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/ruination.png" title="Ruination"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/bio_iii.png" title="Bio III"/></td>`);
		$(".ranking-table thead tr").append(`<td class=\"status-col\"><img src="img/miasma_iii.png" title="Miasma III"/></td>`);
	}

	result = parseFunctions[spec](response);
	
	var totalPotency = 0;
	var totalDamage = 0;

	var lastEvent = {
		name: '',
		timestamp: '',
		target: '',
		amount: '',
		type: ''
	};

	var rows = [];
	for (var e in result.events) {
		var event = result.events[e];

		if (isSameEvent(event, lastEvent))
			continue;

		rows.push(updateEvent(event, result.fight));
		//$(".ranking-table tbody").append(updateEvent(event, result.fight));
		
		if (event.type != 'heal') {
			totalPotency += event.potency == "" ? 0 : event.potency;
			totalDamage += event.amount == undefined ? 0 : event.amount;
		}
		lastEvent = event;
	}
	document.getElementById('rank-body').innerHTML = rows.join('')
	$('[data-toggle="tooltip"]').tooltip({html: true})
	//$(".ranking-table tbody").html(rows.join(''));

	//update summary
	
	
	/*
	$(".summary").append(`<b>Total Damage:</b> ${totalDamage.toFixed(3)}</br>`);
	$(".summary").append(`<b>DPS:</b> ${(totalDamage / result.fight.duration).toFixed(2)}</br>`);
	$(".summary").append(`<b>Total Potency:</b> ${totalPotency.toFixed(3)}</br>`);
	$(".summary").append(`<b>PPS:</b> ${(totalPotency / result.fight.duration).toFixed(2)}<br/>`);
	$(".summary").append(`<b>Potency Ratio:</b> 1:${(totalDamage/totalPotency).toFixed(2)}`);
	*/
	$(".summary-table tbody").append(`<tr>
		<td>${result.player.name}</td>
		<td>${totalDamage.toFixed(3)}</td>
		<td>${(totalDamage / result.fight.duration).toFixed(2)}</td>
		<td>${totalPotency.toFixed(3)}</td>
		<td>${(totalPotency / result.fight.duration).toFixed(2)}</td>
		<td>1:${(totalDamage/totalPotency).toFixed(2)}</td>
		</tr>`);
}

function isSameEvent(current, previous) {
	return ((current.name == previous.name) &&
		(current.timestamp == previous.timestamp) &&
		(current.target == previous.target) &&
		(current.amount == previous.amount) &&
		(current.type == previous.type));
}

function getReportData() {
	var url = base_url + "/report/fights/" + result.report.reportID + "?translate=true&api_key=" + api_key;
	console.log(url);
	httpGetAsync(url, processReport);
}

getReportData();