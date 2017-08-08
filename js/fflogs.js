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
	url += "&api_key=" + api_key

	return url;
}

function getRankings(){
		if($("#zone_select").val() == "0"){
		$("#zone_select").toggleClass("missing", true);
		return;
	} else {
		$("#zone_select").toggleClass("missing", false);
	}

	if($("#encounter_select").val() == "0"){
		$("#encounter_select").toggleClass("missing", true);
		return;
	} else {
		$("#encounter_select").toggleClass("missing", false);
	}
		
	httpGetAsync(buildRankingsURL(), displayRankings);
	
}

function displayRankings(response){
	var ranks = response['rankings']
	
	var tbl_body = '';
	for(var key in ranks){
		var rank = ranks[key];
		console.log(rank);
		var tbl_row = "";
		//git hub
		tbl_row += `<td><a href="events.html?name=${rank.name}&report=${rank.reportID}&fight=${rank.fightID}&api_key=${api_key}">${rank.name}</a></td>`;
		//local
		//tbl_row += `<td><a href="/events?name=${rank.name}&report=${rank.reportID}&fight=${rank.fightID}&api_key=${api_key}">${rank.name}</a></td>`;
		tbl_row += `<td>${rank.total}</td>`;
		tbl_row += `<td>${(rank.duration/1000).toFixed(2)}s</td>`;
		tbl_row += `<td>${rank.spec}</td>`;
		tbl_row += `<td>${rank.reportID}</td>`;
		tbl_row += `<td>${rank.fightID}</td>`;
		tbl_row += `<td>${rank.region}</td>`;
		tbl_row += `<td>${rank.server}</td>`;
		
		tbl_body += `<tr>${tbl_row}</tr>`;
	}
	$(".ranking-table tbody").html(tbl_body);
	
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
});

/*
$("#all_pages").change(function () {
	var val = $(this).is(':checked');
	$("#page_number_label").toggleClass("disabled", val);
	$("#page_number").toggleClass('disabled', val);
	$("#page_number").prop('disabled', val);

});
*/

$("#api_key").change(function () {
	var val = $(this).val();
	if(val.length == 32){
		api_key = val;
		fetchZones();
		fetchClasses();
	}

});

