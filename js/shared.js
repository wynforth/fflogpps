var base_url = "https://www.fflogs.com:443/v1";

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

var api_key = getUrlParameter('api_key');

class Timer {
	constructor(name, duration){
		this.name = name;
		this.duration = duration;
		this.current = 0;
	}
	
	restart(){
		this.current = this.duration;
	}
	
	restartOffset(){
		this.current += this.duration;
	}
	
	update(time){
		if(this.current > 0){
			this.current -= time;
		}
	}
	
	set(time){
		this.current = time;
	}
	
	stop(){
		this.current = 0;
	}
	
	isActive(){
		return this.current > 0;
	}
	
	extend(add, max){
		this.current = Math.min(max, this.current + add);
	}
}



function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function fetchUrl(theUrl, callback, args)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText), args);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


function getBasicData(event, fight) {
	var data = {};
	
	data = {
		'type': event.type,
		'name': event.type == 'death' ? 'Death' : event.ability.name,
		'timestamp': event.timestamp,
		'fightTime': (event.timestamp - fight.start) / 1000,
		'target': event.targetID == undefined ? '' : event.targetID,
		'isTargetFriendly': event.targetIsFriendly,
		'hitType': event.hitType == undefined ? '' : hitTypes[event.hitType],
		'dmgType': event.amount == undefined ? 0 : event.ability.type,
		'amount': event.amount == undefined ? 0 : event.amount,
		'isDirect' : event.multistrike == undefined ? false: event.multistrike
	}
	//console.log(event);
	//console.log(data);

	/*
	if (event.multistrike)
		data.hitType = `*${data.hitType}*`;
	*/

	/*
	if (data.target != undefined) {
		/*
		if (data.target == playerID)
			data.target = "self";
		else
		
		data.target = event.targetIsFriendly ? fight.team[data.target] : fight.enemies[data.target];
		if (event.targetInstance > 1)
			data.target += ` [${event.targetInstance}]`;
	}
	*/
	

	//console.log(data);
	return data;
}

var hitTypes = {
	0: "Miss",
	1: "Hit",
	2: "Crit"
}

var damageTypes = {
	0: "",
	1: "physical",
	2: "lightning",
	4: "fire",
	8: "sprint",
	16: "water",
	32: "unaspected",
	64: "ice",
	128: "earth",
	512: "air"
}

console.log("Shared Loaded");