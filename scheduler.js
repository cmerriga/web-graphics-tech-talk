function Scheduler() {
	this.period = 20;
	this.actions = [];
	var scheduler = this;
	setTimeout(function() { scheduler.run(); }, 0);
	this.speed = 1; // 0 is stopped; 1 is full; >1 is fast 
}

Scheduler.prototype = {
	run: function() {
		var i = 0;
		var maxActions = this.actions.length;
		var millisecond = now();
		var newActions = [];
		while (i < maxActions) {
			var a = this.actions[i];
			if (a.millisecond > millisecond) {
				break;
			}
			
			a.run();
			var nextMillisecond = a.nextMillisecond(millisecond);
			if (nextMillisecond != null) {
				var adjusted;
				if (this.speed > 0) {
					adjusted = millisecond + ((nextMillisecond - millisecond) / this.speed);
				} else {
					adjusted = nextMillisecond;
				}
				a.millisecond = adjusted;
				newActions.push(a);
			}
			
			++i;
		}

		// delete everything processed
		this.actions.splice(0, i);
		
		// add new ones
		for (var i = 0; i < newActions.length; ++i) {
			this.schedule(newActions[i], 0);
		}
		
		var nextRunMilliseconds = this.period;
		if (this.actions.length > 0) {
			nextRunMilliseconds = this.actions[0].millisecond - millisecond;
			if (nextRunMilliseconds < 0) {
				nextRunMilliseconds = 0;
			}
		}
		if (nextRunMilliseconds > this.period) {
			nextRunMilliseconds = this.period;
		}
		var scheduler = this;
		setTimeout(function() { scheduler.run(); }, nextRunMilliseconds);
	},

	schedule: function(a, iFirstPossible) {
		var iBegin = iFirstPossible;
		if (iFirstPossible === undefined) {
			iFirstPossible = 0;
		}			
		for (var i = iFirstPossible; i <= this.actions.length; ++i) {
			if (i == this.actions.length ||
			    (a.millisecond == null && this.actions[i].millisecond != null) ||
			    this.actions[i].millisecond >= a.millisecond) {
				this.actions.splice(i, 0, a);
				break;
			}
		}
	},
};

Scheduler.current = new Scheduler();

function Action(f) {
	this.f = f;
	this.millisecond = now();
}

Action.prototype = {
	nextMillisecond: function() {
		return null;
	},

	run: function() {
		try {
			this.f();
		} catch (e) {
		}
	},
};

Action.createRepeatedAction = function(f, period) {
	var a = new Action(f);
	a.period = period;
	a.nextMillisecond = function(now) {
		return now + a.period;
	};
	return a;
}



