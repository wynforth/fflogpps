var parseFunctions = {
	//DPS
	'Bard': parseClass,//parseBard,
	
	'Dragoon': parseClass,//parseDragoon,
	
	'Monk': parseClass, //parseMonk,
	'Ninja': parseClass,	//parseNinja,
	'RedMage': parseClass,	//parseRedmage,
	'Samurai': parseClass,	//parseSamurai,
	'Machinist': parseMachinist, //overheat and pet
	'BlackMage': parseBlackmage, //astral/umbral math
	'Summoner': parseSummoner, //pet
	//TANKS
	'DarkKnight': parseClass,
	'Paladin': parseClass,
	'Warrior': parseClass,

}

function processReport(report) {
	var proc0 = performance.now();
	//console.log("Report:");
	//console.log(report);
	
	result = parseReport(report);
	var par1 = performance.now();
	console.log("Report parsing took " + (par1-proc0).toFixed(4) + "ms");
	//console.log(result);
	
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
	$('.summary').append(`<b>Reported Duration:</b> ${result.fight.duration} seconds.`)

	var url = base_url + "/report/events/" + result.report.reportID + "?translate=true";
	url += "&start=" + result.fight.start;
	url += "&end=" + result.fight.end;
	url += "&actorid=" + result.player.ID;
	url += "&api_key=" + api_key;
	//console.log(url);
	//console.log(result.fight.team);
	//console.log(result.fight.enemies);

	var callback = processGeneric;
	if (Object.keys(parseFunctions).indexOf(result.player.type) > -1)
		callback = processClass;

	fetchUrl(url, callback, result.player.type);
	
	var proc1 = performance.now();
	console.log("processReport took " + (proc1-proc0).toFixed(4) + "ms");
}

function updateEvent(data, fight) {
	
	tbl_row = '';

	//console.log(data);
	tbl_row += `<td class="center">${data.fightTime.toFixed(3)}s</td>`;
	tbl_row += `<td>${data.name}<span class="castType">${data.type}</span></td>`;
	//tbl_row += `<td>${data.name}<span class="castType">${data.type}</span></td>`;
	if(damageTypes[data.dmgType] == undefined){
		console.log("Damage Type: " + data.dmgType + " is undefined");
		console.log(data);
	}
	tbl_row += `<td>${data.amount == 0 ? '':data.amount} <span class="castType">${data.isDirect ? "Direct ":''}${data.hitType}</span><span class="damage-block ${damageTypes[data.dmgType]}"></span></td>`;
	
	if (data.sourceIsFriendly){
		tbl_row += `<td class="name">${fight.team[data.sourceID]}<span class="castType">-></span></td>`;
	} else {
		tbl_row += `<td class="name">${fight.enemies[data.sourceID]}<span class="castType">-></span></td>`;
	}
	
	
	tbl_row += '<td class="name">';
	if (!data.hasOwnProperty('targetID')) {
		tbl_row += 'self/ground';
	} else {
		if (data.targetIsFriendly)
			tbl_row += fight.team[data.targetID];
		else {
			if (data.hasOwnProperty("targetResources")) {
				tbl_row += `${fight.enemies[data.targetID]} <span class="castType">${((data.targetResources.hitPoints/data.targetResources.maxHitPoints)*100).toFixed(2)}%</span>`;
			} else {
				tbl_row += fight.enemies[data.targetID];
			}
		}
	}
	tbl_row += '</td>'
	
	if(data.hasOwnProperty('potency')){
		if(data.potency == 0)
			tbl_row += `<td></td>`;
		else
			tbl_row += `<td><div class="right"><span data-toggle="tooltip" title="${data.tooltip}">${data.potency}</span></div></td>`;
	}
	if (data.hasOwnProperty('extra')) {
		for (var i = 0; i < data.extra.length; i++) {
			tbl_row += `<td class="center">${data.extra[i]}</td>`;
		}
	}
	//console.log(tbl_row);
	return `<tr>${tbl_row}</tr>`;
	//$(".ranking-table tbody").append(`<tr>${tbl_row}</tr>`);
}

function processGeneric(response) {

	var totalDamage = 0;

	result = parseGeneric(response);

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
			totalDamage += event.amount == undefined ? 0 : event.amount;
		}
		lastEvent = event;
	}
	document.getElementById('rank-body').innerHTML = rows.join('')

	//update summary
	$(".summary").append(`<b>Total Damage:</b> ${totalDamage.toFixed(3)}</br>`);
	$(".summary").append(`<b>DPS:</b> ${(totalDamage / result.fight.duration).toFixed(2)}</br>`);
}

function processClass(response, spec) {

	//console.log("Processing " + spec);
	var t0 = performance.now();
	
	//console.log(response);
	if(['Dragoon','Ninja','Monk'].indexOf(spec) > -1)
		$('.summary').append(`<br/><b>Positionals:</b> Unless under True North positional potency is a weighted average assuming 9 in 10 hits are from the correct position.`)
	else if(spec == "Bard")
		$('.summary').append(`<br/><b>Pitch Perfect:</b> As DoT crits are not able to be tracked accurately the base potency for Pitch Perfect is only a guess.`)
	else if(spec == "Paladin")
		$('.summary').append(`<br/>Potency values for Spirits Within or Requiescat don't scale with health or mana respectively.`)
	else if(spec == "Warrior")
		$('.summary').append(`<br/><b>Berserk:</b> Bonus for Berserk is a guess based on observation, actual increase would depend on your current AP.`)
	
	if(response.hasOwnProperty("nextPageTimestamp"))
		console.log("WARNING     more time stamps exist     WARNING");
	
	$(".ranking-table tbody").html("");
	$(".ranking-table thead tr").append(`<td style="width: 90px">Potency</td>`);

	var buffDisplay = buff_display[spec];
	for(var b in buffDisplay){
		if(buffDisplay[b].hasOwnProperty('name'))
			$(".ranking-table thead tr").append(buffDisplay[b].asHeader());
	}
	var t1 = performance.now();
	console.log("header updates took " + (t1 - t0).toFixed(4) + "ms");
	
	t0 = performance.now();
	result = parseFunctions[spec](response);
	t1 = performance.now();
	console.log("Parseing took " + (t1 - t0).toFixed(4) + "ms");
	
	
	var totalPotency = 0;
	var totalDamage = 0;

	var lastEvent = {
		name: '',
		timestamp: '',
		target: '',
		amount: '',
		type: ''
	};

	
	var s0 = performance.now()
	var rows = [];
	
	for (var e in result.events) {
		var event = result.events[e];

		if (isSameEvent(event, lastEvent))
			continue;

		rows.push(updateEvent(event, result.fight));

		if (event.type != 'heal') {
			if(event.potency != ""){
				totalPotency += event.potency == "" ? 0 : event.potency;
				totalDamage += event.amount == undefined ? 0 : event.amount;
			}
		}
		lastEvent = event;
	}
	document.getElementById('rank-body').insertAdjacentHTML('beforeend', rows.join(''));
	var s1 = performance.now();
	console.log("building rows " + (s1 - s0).toFixed(4) + "ms");
	t0 = performance.now();
	//update summary
	var totalTime = 0;
	if (Object.keys(result.totals).length >= 1) {
		for (var k in result.totals) {
			var total = result.totals[k];
			if(total.potency > 0){
				$(".summary-table tbody").append(getSummaryRowMulti(total.name, total.amount, total.potency, total.time, totalDamage, totalPotency));
				totalTime = Math.max(totalTime, total.time);
			}
				
		}
		if (Object.keys(result.totals).length > 1)
			$(".summary-table tbody").append(getSummaryRow("Combined", totalDamage, totalPotency, totalTime));
	}
	else {
		console.log("displaying from summed");
		$(".summary-table tbody").append(getSummaryRow(result.player.name, totalDamage, totalPotency, result.fight.duration));
	}
	
	if(result.hasOwnProperty('role_actions')){
		$('.summary').append(`<br/><b>Role Actions Used:</b> ${result['role_actions'].join(", ")}`);
	}
	t1 = performance.now();
	console.log("updating summary took " + (t1-t0).toFixed(4) + "ms");
	
	s0 = performance.now();
	
	//performance hit to enable fancy tooltips :/
	$('[data-toggle="tooltip"]').tooltip({html: true})
	
	s1 = performance.now();
	console.log("enabling tooltips " + (s1 - s0).toFixed(4) + "ms");
}


function getSummaryRow(name, damage, potency, duration){
	return `<tr>
		<td><div class="center">${name}</div></td>
		<td><div class="center">${damage}</div></td>
		<td><div class="center">${duration.toFixed(2)}</div></td>
		<td><div class="center">${(damage / duration).toFixed(2)}</div></td>
		<td><div class="center">${potency}</div></td>
		<td><div class="center">${(potency / duration).toFixed(2)}</div></td>
		<td><div class="center">1:${(damage/potency).toFixed(2)}</div></td>
		</tr>`;
}

function getSummaryRowMulti(name, damage, potency, duration, totalDamage, totalPotency){
	return `<tr>
		<td><div class="center">${name}</div></td>
		<td><div class="center">${damage} <span class="castType">${((damage/totalDamage)*100).toFixed(1)}%</span></div></td>
		<td><div class="center">${duration.toFixed(2)}</div></td>
		<td><div class="center">${(damage / duration).toFixed(2)}</div></td>
		<td><div class="center">${potency} <span class="castType">${((potency/totalPotency)*100).toFixed(1)}%</span></div></td>
		<td><div class="center">${(potency / duration).toFixed(2)}</div></td>
		<td><div class="center">1:${(damage/potency).toFixed(2)}</div></td>
		</tr>`;
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
	//console.log(url);
	httpGetAsync(url, processReport);
}

getReportData();