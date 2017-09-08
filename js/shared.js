var base_url = "https://www.fflogs.com:443/v1";

var percentColors = [
    { pct: 0.0, color: { r: 0x00, g: 0xCC, b: 0x11 } },
    { pct: 0.5, color: { r: 0xCC, g: 0xCC, b: 0x11 } },
    { pct: 0.99, color: { r: 0xCC, g: 0x00, b: 0x11 } },
	{ pct: 1.0, color: { r: 0xFF, g: 0x00, b: 0x11 } }	];

var getColorForPercentage = function(pct) {
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    // or output as hex if preferred
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
	constructor(name, bonus, active, restricted, exclusive){
		this.name = name;
		this.bonus = bonus;
		this.active = active == undefined ? false:active;
		this.restricted = restricted == undefined ? []:restricted;
		this.exclusive = exclusive == undefined ? []:exclusive;
		//console.log(this.name);
		//console.log(this.restricted);
	}
	
	isAllowed(event){
		if(!this.active) 
			return false;
		if(this.restricted.length == 0 && this.exclusive.length == 0)
			return true;
		
		var valid = true;
		if(this.exclusive.length > 0)
			valid = this.exclusive.indexOf(event.name) > -1; //have to be ON the list
		if(this.restricted.length > 0)
			valid = this.restricted.indexOf(event.name) == -1; //have to be OFF the list
		
		return valid;
	}
	
	apply(potency, event){
		if(this.isAllowed(event)){
			
			return Math.trunc(potency * (1 + this.getBonus()));
		}
		return potency;
	}
	
	getDisplay(){
		return (this.getBonus() * 100).toFixed(0) + "%";
	}
	
	getBonus(){
		return this.bonus;
	}
	
	applybuff(){
		this.active = true;
	}
}

class BuffDirect extends Buff{
	constructor(name, bonus, active, restricted, exclusive){
		super(name, bonus, active, restricted, exclusive);
	}
	
	apply(potency, event){
		if(this.isAllowed(event)){
			return potency + this.getBonus();
		}
		return potency;
	}
	
	getDisplay(){
		return this.getBonus();
	}
}

class BuffStack extends Buff{
	constructor(name, initial, stackbonus, maxStacks,  baseStacks, active, restricted, exclusive){
		super(name, initial, active, restricted, exclusive);
		this.maxStacks = maxStacks;
		this.baseStacks = baseStacks;
		this.stacks = baseStacks;
		this.stackBonus = stackbonus == undefined ? 0:stackbonus;
	}
	
	isAllowed(event){
		if(this.stacks > 0)
			return super.isAllowed(event);
		return false;
	}
	
	getBonus(){
		//console.log(this);
		return this.bonus + (this.stackBonus * this.stacks);
	}
	
	addStacks(num){
		this.stacks = Math.min(this.maxStacks, this.stacks + num);
		this.active = this.stacks > 0;
	}
	
	remStacks(num){
		this.stacks = Math.max(0, this.stacks - num);
		this.active = this.stacks > 0;
	}
	
	setStacks(num){
		if(num < 0)
			this.stacks = 0;
		else{
			super.applybuff();
			this.stacks = Math.min(this.maxStacks, num);
		}
	}
	
	applybuff(){
		super.applybuff();
		if(this.stacks <= 0)
			this.stacks = this.baseStacks;
	}
}

class BuffDirectConsumedStack extends BuffStack{
	constructor(name, initial, stackbonus, maxStacks, baseStacks, active, restricted, exclusive){
		super(name, initial, stackbonus, maxStacks,  baseStacks, active, restricted, exclusive);
	}
	
	getBonus(){
		//console.log(this);
		return this.bonus + (this.stackBonus * this.stacks);
	}
	
	apply(potency, event){
		if(this.isAllowed(event)){
			var ret = potency + this.getBonus();
			this.stacks--;
			this.active = this.stacks > 0;
			return ret;
		}
		return potency;
	}
	
	getDisplay(){
		return this.getBonus();
	}
}

class BuffTimed extends Buff {
	constructor(name, bonus, duration, restricted, exclusive){
		super(name, bonus, false, restricted, exclusive);
		this.duration = duration;
		this.current = 0;
	}
	
	applyBuff(event){
		super.applyBuff(event);
		this.current = event.fightTime + this.duration;
		this.active = Object.keys(this.targets).length > 0;
	}
	
	update(event){
		if(this.current != 0){
			if(this.current <= event.fightTime){
				this.current = 0;
				this.active = false;
			}
		}
	}
	
	isAllowed(event){
		return this.current >= event.fightTime && super.isAllowed(event);
	}
}

class Debuff extends Buff{
	constructor(name, bonus, restricted, exclusive){
		super(name, bonus, false, restricted, exclusive);
		this.targets = [];
	}
	
	add(event){
		if(event.targetID == null)
			console.log(event);
		if(this.targets.indexOf(event.targetID) == -1)
			this.targets.push(event.targetID);
		this.active = this.targets.length > 0;
	}
	
	remove(event){
		var index = this.targets.indexOf(event.targetID);
		if(index > -1)
			this.targets.splice(index, 1);
		this.active = this.targets.length > 0;
	}
	
	clear(){
		this.targets = [];
	}
	
	isTarget(targetID){
		return this.targets.indexOf(targetID) > -1;
	}
	
	isAllowed(event){
		if(this.isTarget(event.targetID))
			return super.isAllowed(event);
		return false;
	}
	
	apply(potency, event){
		if(this.isAllowed(event))
			return super.apply(potency, event);
		return potency;
	}
}

class DebuffTimed extends Debuff {
	constructor(name, bonus, duration, restricted, exclusive){
		super(name, bonus, false, restricted, exclusive);
		this.duration = duration;
		this.targets = {};
	}
	
	add(event){
		this.targets[event.targetID] = event.fightTime + this.duration;
		this.active = Object.keys(this.targets).length > 0;
	}
	
	remove(targetID){
		//noop only removed when time runs out
		this.active = Object.keys(this.targets).length > 0;
	}
	
	update(event){
		for(var t in this.targets){
			if(this.targets[t] <= event.fightTime)
				delete this.targets[t];
		}
		this.active = Object.keys(this.targets).length > 0;
	}
	
	clear(){
		this.targets = {};
	}
	
	isTarget(targetID){
		return this.targets.hasOwnProperty(targetID);
	}
}

class DebuffDirect extends Debuff{
	constructor(name, bonus, restricted, exclusive){
		super(name, bonus, restricted, exclusive);
	}
	
	apply(potency, event){
		if(this.isAllowed(event)){
			return potency + this.getBonus();
		}
		return potency;
	}
	
	getDisplay(){
		return this.getBonus();
	}
}

class BuffDisplay{
	constructor(name, color, image){
		this.name = name;
		this.color = color;
		if(image == undefined)
			this.image = this.name.toLowerCase().replace(/ /g,'_') + '.png';
		else
			this.image = image;
	}
	
	asHeader(){
		return `<td class=\"status-col\"><img src="img/${this.image}" title="${this.name}"/></td>`
	}
	
	display(event, buff){
		if(buff == undefined) return undefined;
		if(buff.active)
			if(event.name == this.name)
				return `<div class="center status-block" style="background-color: ${this.color}"><img src="img/${this.image}"/></div>`
			else
				return `<div class="center status-block" style="background-color: ${this.color}"></div>`
		return '';
	}
}

class BuffDisplayCount extends BuffDisplay{
	constructor(name, image){
		super(name, '', image);
	}
	
	display(event, buff){
		return `<div class="center status-block">${buff.stacks}</div>`
	}
}

class BuffDisplayGradient extends BuffDisplay{
	constructor(name, image){
		super(name, '', image);
	}
	
	display(event, buff){
		return `<div title="Value: ${buff.stacks}" class="center status-block" style="background-color: ${getColorForPercentage(buff.stacks/buff.maxStacks)}"></div>`
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
	8: "heal",
	//16: "water",
	//32: "unaspected",
	64: "dot_magic",
	128: "phys",
	//512: "air",
	1024: "magic",
}

console.log("Shared Loaded");