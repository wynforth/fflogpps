var base_url = "https://www.fflogs.com:443/v1";

class Timer {
	constructor(name, duration){
		this.name = name;
		this.duration = duration;
		var current = 0;
	}
	
	restart(){
		this.current = this.duration;
	}
	
	restartOffset(){
		this.current += this.duration;
	}
	
	tick(time){
		if(this.isActive()){
			this.current -= time;
		}
	}
	
	stop(){
		this.current = 0;
	}
	
	isActive(){
		return this.count > 0;
	}
}



function httpGetAsync(theUrl, callback)
{
	/*
	if(theUrl.indexOf("?") > -1)
		theUrl += "&api_key=";
	else
		theUrl += "?api_key=";
	*/
	
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
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
	512: "pet"
}