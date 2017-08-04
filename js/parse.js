
function parseEvents(events){
	var parse = {};
	console.log(events);
	
	for (var e in events) {
		var event = events[e];

		//only events of self, pets, or targetted on self
		if (event.sourceID != playerID) {
			if (petIDs.indexOf(event.sourceID) == -1 && event.type != 'applybuff') {
				continue;
			}
		}

		parse[e] = getBasicData(event);
	}	
	console.log("PARSE");
	console.log(parse);
}