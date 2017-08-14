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
		this.justFell = false;
	}
	
	restart(){
		this.current = this.duration;
	}
	
	restartOffset(){
		this.current += this.duration;
	}
	
	update(time){
		if(time != 0){
			var wasPos = this.current > 0;
			if(wasPos){
				this.current -= time;
			}
			if(this.current < 0)
				if(wasPos)
					this.justFell = true;
				else
					this.justFell = false;
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
	
	canRefresh() {
		return this.isActive() || this.justFell;
	}
}

class Buff {
	constructor(name, bonus, active, restricted){
		this.name = name;
		this.bonus = bonus;
		this.active = active == undefined ? false:active;
		this.restricted = restricted == undefined ? []:restricted;
	}
}

class Debuff {
	constructor(name, bonus, restricted){
		this.name = name;
		this.bonus = bonus;
		this.restricted = restricted == undefined ? []:restricted;
		this.targets = [];
	}
	
	add(targetID){
		if(this.targets.indexOf(targetID) == -1)
			this.targets.push(targetID);
	}
	
	remove(targetID){
		var index = this.targets.indexOf(targetID);
		if(index > -1)
			this.targets.splice(index, 1);
	}
	
	isTarget(targetID){
		return this.targets.indexOf(targetID) > -1;
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
	
	event.name = event.type == 'death' ? 'Death' : event.ability.name;
	event.fightTime = (event.timestamp - fight.start) / 1000,
	event.hitType = event.hitType == undefined ? '' : hitTypes[event.hitType],
	event.dmgType = event.amount == undefined ? 0 : event.ability.type,
	event.amount = event.amount == undefined ? 0 : event.amount,
	event.isDirect = event.multistrike == undefined ? false: event.multistrike
	return event;
	
	var data = {};
	data = {
		'type': event.type,
		'name': event.type == 'death' ? 'Death' : event.ability.name,
		'timestamp': event.timestamp,
		'fightTime': (event.timestamp - fight.start) / 1000,
		'target': event.targetID == undefined ? '' : event.targetID,
		'isTargetFriendly': event.targetIsFriendly,
		'source': event.sourceID == undefined ? '' : event.sourceID,
		'isSourceFriendly': event.sourceIsFriendly,
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
// OLD pre August 8 parses
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
	512: "air",
	1024: "ruin",
}

//post Aug 8 parses
damageTypes = {
	0: "",
	1: "dot_phys",
	//2: "lightning",
	//4: "fire",
	//8: "sprint",
	//16: "water",
	//32: "unaspected",
	64: "dot_magic",
	128: "phys",
	//512: "air",
	1024: "magic",
}

console.log("Shared Loaded");