function processRankings(response) {
	var proc0 = performance.now();
	//console.log("Report:");
	//console.log(report);
	
	var rankings = response.rankings;
	//console.log(rankings);
	//rankings.length
	for (var i=0; i < rankings.length; i++){
		console.log(rankings[i]);
		var fightID = rankings[i].fightID;
		var reportURL = base_url + "/report/fights/" + rankings[i].reportID + "?translate=true&api_key=" + api_key;
		//console.log(reportURL);
		fetchUrl(reportURL, processReport, rankings[i]);
		sleep(1000);
			
		//return;
	}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function processReport(response, ranking){
	var proc0 = performance.now();
	//console.log("Report:");
	//console.log(response);
	var result = {
		report: {
			reportID: ranking.reportID,
			fightID: ranking.fightID,
		},
		fight: {
			team: {},
			enemies: {}
		},
		player: {
			name: ranking.name,
			pets: []
		},
		events: {},
		totals: {},
	}
	var reportResult = parseReport(response, result);
	var par1 = performance.now();
	//console.log("Report parsing took " + (par1-proc0).toFixed(4) + "ms");

	var url = base_url + "/report/events/" + result.report.reportID + "?translate=true";
	url += "&start=" + result.fight.start;
	url += "&end=" + result.fight.end;
	url += "&actorid=" + result.player.ID;
	url += "&api_key=" + api_key;
	
	fetchUrl(url, processClass, result);
	
	var proc1 = performance.now();
	//console.log("processReport took " + (proc1-proc0).toFixed(4) + "ms");
}

function processClass(response, result) {

	//console.log("Processing " + spec);
	var spec = result.player.type;
	var t0 = performance.now();
	
	t0 = performance.now();
	result = parseFunctions[spec](response, result);
	t1 = performance.now();
	console.log("Parseing took " + (t1 - t0).toFixed(4) + "ms");
	
	//console.log(result);
	var tbl_row = '<tr>';

	var damage = 0;
	var potency = 0;
	var time = 0;
	
	
	if (Object.keys(result.totals).length > 1) {
		var time = 0;
		for (var k in result.totals) {
			damage += result.totals[k].amount;
			potency += result.totals[k].potency;
			time = Math.max(time, result.totals[k].time);
		}
		
	}
	else {
		damage = result.totals[result.player.ID].amount;
		potency = result.totals[result.player.ID].potency;
		time = result.totals[result.player.ID].time;
	}
	tbl_row += `<td><a href="events.html?name=${result.player.name}&report=${result.report.reportID}&fight=${result.report.fightID}&api_key=${api_key}">${result.player.name}</a><span class="damage-block ${result.player.type}"></span></td>`;
	tbl_row += `<td>${time}</td>`; //damage
	tbl_row += `<td>${damage}</td>`; //damage
	tbl_row += `<td>${(damage/time).toFixed(2)}</td>`; //dps
	tbl_row += `<td>${potency}</td>`; //damage
	tbl_row += `<td>${(potency/time).toFixed(2)}</td>`; //dps
	tbl_row += `<td>${(damage/potency).toFixed(2)}</td>`; //damage:potency
	tbl_row += '</tr>';


	$(".ranking-table tbody").append(tbl_row);
}

function getRankingsData() {
	var url = base_url + '/rankings/encounter/' + getUrlParameter('encounter') + '?';	

	var opts = ['bracket', 'spec', 'region','metric','page','filter','api_key'];
	var terms = [];
	for(var i=0; i < opts.length; i++)
		if(getUrlParameter(opts[i]) != undefined)
			terms.push(`${opts[i]}=${getUrlParameter(opts[i])}`);
	url += terms.join('&');
	
	console.log(url);
	httpGetAsync(url, processRankings);
}

getRankingsData();