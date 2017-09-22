var api_key;
var zones;
var classes;
var allPages;
var currentPage = 0;

function fetchClasses(){
	classes = cacheJS.get('classes');
	if(classes != null)
		updateClasses()
	else
		httpGetAsync(base_url + "/classes?api_key=" + api_key, processClassResponse);	
}

function processClassResponse(response){
	console.log("Classes: caching response and updateing");
	classes = {};
	for(var k in response){
		for (var s in response[k].specs){
			classes[response[k].specs[s].id] = response[k].specs[s].name;
		}
	}
	
	cacheJS.set('classes',classes);
	updateClasses();
}

function updateClasses(){
	console.log(classes);
	var newOptions = {'': 0};
	
	for(var id in classes){
		newOptions[classes[id]] = id;
	}
	updateSelect("#class_select", newOptions);
}

function fetchZones(){
	zones = cacheJS.get('zones');
	if(zones != null)
		updateZones()
	else
		httpGetAsync(base_url + "/zones?api_key=" + api_key, processZoneResponse);	
}

function processZoneResponse(response){
	console.log("Zones: caching response and updateing");
	zones = {};
	for(var k in response){
		zones[response[k].id] = response[k];
	}
	
	cacheJS.set('zones',zones);
	updateZones();
}

function updateZones(){
	var newOptions = {'': 0};
	
	for(var id in zones){
		newOptions[zones[id].name] = id;
	}
	updateSelect("#zone_select", newOptions);
}

function updateEncounters(zone){
	var encOptions = {
		'': 0
	};
	for (var e in zone.encounters) {
		encOptions[zone.encounters[e].name] = zone.encounters[e].id;
	}
	updateSelect("#encounter_select", encOptions);
}

function updateBrackets(zone){
	var bracketOptions = {
		'': 0
	};
	for (var e in zone.brackets) {
		bracketOptions[zone.brackets[e].name] = zone.brackets[e].id;
	}
	updateSelect("#bracket_select", bracketOptions);
}

function onZoneSelect(id) {
	updateEncounters(zones[id]);
	updateBrackets(zones[id]);
}

function updateSelect(id, newOptions){
	var option = $('<option></option>').attr("value", "option value").text("Text");
	$(id).empty().append(option);
	
	$(id).toggleClass('disabled', true);
	$(id).prop('disabled', true);
	
	var $el = $(id);
	$el.empty(); // remove old options
	$.each(newOptions, function (key, value) {
		$el.append($("<option></option>")
			.attr("value", value).text(key));
	});
	$(id).toggleClass('disabled', false);
	$(id).prop('disabled', false);
}

function buildRankingsURL() {
	var url = base_url + "/rankings/encounter/";

	url += $("#encounter_select").val() + "?metric=dps";

	var bracket = $("#bracket_select").val();
	if (bracket != 0)
		url += "&bracket=" + bracket;

	var spec = $("#class_select").val();
	if (spec != 0)
		url += "&spec=" + spec;

	var region = $("#region_select").val();
	if (region != "")
		url += "&region=" + region;

	
	url += "&page=" + $("#page_number").val();
	url += "&filter=date.1502168400000.9999999999999"; //type format change - August 8, 2017
	//url += "&filter=date.1505843288000.9999999999999"; //event data test format change - September 19, 2017
	url += "&api_key=" + api_key

	//console.log(url);
	return url;
}

function buildCompareURL() {
	var url = "compare.html";

	url += '?encounter=' + $("#encounter_select").val() + "&metric=dps";

	var bracket = $("#bracket_select").val();
	if (bracket != 0)
		url += "&bracket=" + bracket;

	var spec = $("#class_select").val();
	if (spec != 0)
		url += "&spec=" + spec;

	var region = $("#region_select").val();
	if (region != "")
		url += "&region=" + region;

	
	url += "&page=" + $("#page_number").val();
	url += "&filter=date.1502168400000.9999999999999"; //type format change - August 8, 2017
	//url += "&filter=date.1505843288000.9999999999999"; //event data test format change - September 19, 2017
	url += "&api_key=" + api_key

	//console.log(url);
	return url;
}

function canSearch(){
	if($("#zone_select").val() == "0"){
		$("#zone_select").toggleClass("missing", true);
		return false;
	} else {
		$("#zone_select").toggleClass("missing", false);
	}

	if($("#encounter_select").val() == "0"){
		$("#encounter_select").toggleClass("missing", true);
		return false;
	} else {
		$("#encounter_select").toggleClass("missing", false);
	}
	return true;
}

function getRankings(){
	if(canSearch())
		httpGetAsync(buildRankingsURL(), displayRankings);
}

function displayRankings(response){
	var ranks = response['rankings']
	console.log(response);
	
	var compareurl = buildCompareURL();
	console.log(compareurl);
	
	$(".ranking-table thead").html(`<tr><td>Player</td><td>DPS</td><td>Duration</td><td>Region</td><td>Server</td><td>FFLog Link</td></tr>`);
	
	
	var tbl_body = '';
	
	tbl_body += `<tr><td><a href="${compareurl}">Compare All</a></td><td></td><td></td><td></td><td></td><td></td></tr>`;
	for(var key in ranks){
		var rank = ranks[key];
		//console.log(JSON.stringify(rank));
		if(rank.hidden != 0)
			continue;
		var link = `https://www.fflogs.com/reports/${rank.reportID}#fight=${rank.fightID}&type=damage-done`;
		
		var tbl_row = "";
		//git hub
		tbl_row += `<td><a href="events.html?name=${rank.name}&report=${rank.reportID}&fight=${rank.fightID}&api_key=${api_key}">${rank.name}</a><span class="damage-block ${classes[rank.spec].replace(' ','')}"></span></td>`;
		//local
		//tbl_row += `<td><a href="/events?name=${rank.name}&report=${rank.reportID}&fight=${rank.fightID}&api_key=${api_key}">${rank.name}</a></td>`;
		tbl_row += `<td>${rank.total}</td>`;
		tbl_row += `<td>${(rank.duration/1000).toFixed(2)}s</td>`;
		//tbl_row += `<td>${rank.spec}</td>`;
		//tbl_row += `<td>${rank.reportID}</td>`;
		//tbl_row += `<td>${rank.fightID}</td>`;
		tbl_row += `<td>${rank.region}</td>`;
		tbl_row += `<td>${rank.server}</td>`;
		tbl_row += `<td><a href="${link}">${rank.reportID}</a></td>`;
		
		tbl_body += `<tr>${tbl_row}</tr>`;
	}
	$(".ranking-table tbody").html(tbl_body);
	
}

function updateRankingFetch(){
	var res = canSearch();
	
	$('#ranking_submit').toggleClass('disabled', !res);
	$('#ranking_submit').prop('disabled', !res);
}

function canSearchReport(){
	var valid = true;
	if($("#report_api_key").val().length != 32){
		$("#report_api_key").toggleClass("missing", true);
		valid = false;
	} else {
		$("#report_api_key").toggleClass("missing", false);
	}
	
	if($("#report_key").val().length != 16){
		$("#report_key").toggleClass("missing", true);
		valid = false;
	} else {
		$("#report_key").toggleClass("missing", false);
	}
	return valid;
}

function getReport(){
	if(canSearchReport()){
		var url = base_url + '/report/fights/' + $("#report_key").val() + '?translate=true&api_key=' + $("#report_api_key").val();
		httpGetAsync(url, displayReport);
	}
}

function displayReport(response){
	console.log(response);
	
	var reportID = $("#report_key").val();
	
	var results = {}
	
	
	$(".ranking-table thead").html(`<tr><td>Player</td><td>Target</td><td>Zone</td><td>Duration</td><td>Kill</td><td>FFLog Link</td></tr>`)
	$(".ranking-table tbody").html(``);
	var tbl_body = '';
	
	var fights = {};
	for(var f in response.fights){
		var fight = response.fights[f];
		fights[fight.id] = fight;
	}
	
	for(var i in response.friendlies){
		var player = response.friendlies[i]
		
		if(player.name == "Multiple Players" || player.name == "Limit Break")
			continue;
		
		for(var f in player.fights){
			var fight = fights[player.fights[f].id];
			var link = `https://www.fflogs.com/reports/${reportID}#fight=${player.fights[f].id}&type=damage-done`;
			
			if(fight.name == "Striking Dummy")
				continue;
			
			var tbl_row = '';
			tbl_row += `<td><a href="events.html?name=${player.name}&report=${reportID}&fight=${player.fights[f].id}&api_key=${api_key}">${player.name}</a><span class="damage-block ${player.type}"></span></td>`;
			tbl_row += `<td>${fight.name}</td>`;
			tbl_row += `<td>${fight.zoneName}</td>`;
			tbl_row += `<td>${((fight.end_time-fight.start_time)/1000).toFixed(2)}s</td>`;
			if(fight.hasOwnProperty('kill')){
				if(fight.kill)
					tbl_row += `<td>Kill</td>`;
				else
					tbl_row += `<td>${(fight.fightPercentage/100).toFixed(2)}%</td>`;
			} else 
				tbl_row += `<td>N/A</td>`;
			tbl_row += `<td><a href="${link}">${reportID}</a></td>`;
		
			tbl_body += `<tr>${tbl_row}</tr>`;	
			$(".ranking-table tbody").append(`<tr>${tbl_row}</tr>`);
		}
	}
	//.html(tbl_body);
	
}



//cacheJS.removeByKey('zones');
//fetchZones();
//cacheJS.removeByKey('classes');
//fetchClasses();


$("#zone_select").change(function () {
	var val = $(this).val();
	if (val == 0) {
		updateEncounters({
			'encounters': {}
		});
		updateBrackets({
			'brackets': {}
		});
	} else {
		updateEncounters(zones[val]);
		updateBrackets(zones[val]);
	}
	updateRankingFetch();
});

$("#encounter_select").change(function () {
	updateRankingFetch();
});



$("#api_key").change(function () {
	var val = $(this).val();
	if(val.length == 32){
		api_key = val;
		fetchZones();
		fetchClasses();
	}
	updateRankingFetch();
});

$("#report_api_key").change(function () {
	var val = $(this).val();
	if(val.length == 32){
		api_key = val;
		//fetchClasses();
	}
	canSearchReport()
});

$("#report_key").change(function () {
	canSearchReport()
});
