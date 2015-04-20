function cloneArray(a) {
	var newArray = [];
	var l = a.length;
	for (var i = 0; i < l; ++i) {
		newArray.push(a[i]);
	}
	return newArray;
}
	
function random(n) {
	return Math.floor(Math.random() * n);
}

function circularAdd(r1, r2, max) {
	var sum = r1 + r2;
	if (sum >= max) {
		sum %= max;
	}
	while (sum < 0) {
		sum += max;
	}
	return sum;
}

function limitedAdd(r1, r2, min, max) {
	var sum = r1 + r2;
	if (sum > max) {
		sum = max;
	}
	if (sum < min) {
		sum = min;
	}
	return sum;
}

function round(r) {
	return Math.floor(r + .5);
}

function stringify(v) {
	return '' + v;
}

function element(sName) {
	var el = document.getElementById(sName);
	if (el == null) {
		alert('asked for non-existent element "' + sName + '"');
		return null;
	} else {
		return el;
	}
}

function addEvent(e, name, f) {
	if (e.addEventListener) {
		e.addEventListener(name, f, false);
	} else {
		e.attachEvent('on' + name, f);
	}
}

function getEvent(ev) {
	if (!ev) {
		return window.event;
	} else {
		return ev;
	}
}

function eatEvent(ev) {
	ev.cancelBubble = true;
	ev.returnValue = false;
	if (ev.stopPropagation) {
		ev.stopPropagation();
		ev.preventDefault();
	}
}

function getCharCode(ev) {
	if (ev.which) {
		return ev.which;
	} else {
		return ev.keyCode;
	}
}

function now() {
	if (!Date.now) {
		return new Date();
	} else {
		return Date.now();
	}
}

function Set() {
	this.elements = [];
	this.lessThan = function(e1, e2) {
		e1 < e2;
	};
}

Set.prototype = {
	add: function(e) {
		var i = this.index(e);
		if (i < 0) {
			this.elements.push(e);
		}
	},

	clone: function() {
		var s = new Set();
		s.elements = cloneArray(this.elements);
		s.lessThan = this.lessThan;
		return s;
	},

	containsElement: function(e) {
		return this.index(e) >= 0;
	},

	containsSet: function(s) {
		var l = s.elements.length;
		for (var i = 0; i < l; ++i) {
			if (!this.containsElement(s.elements[i])) {
				return false;
			}
		}
		return true;
	},

	count: function() {
		return this.elements.length;
	},

	elementAt: function(i) {
		return this.elements[i];
	},

	index: function(e) {
		var l = this.elements.length;
		for (var i = 0; i < l; ++i) {
			if (this.elements[i] == e) {
				return i;
			}
		}
		return -1;
	},

	intersect: function(s) {
		var newElements = [];
		var l = s.elements.length;
		for (var i = 0; i < l; ++i) {
			if (this.containsElement(s.elements[i])) {
				newElements.push(s.elements[i]);
			}
		}
		this.elements = newElements;
	},

	remove: function(e) {
		var i = this.index(e);
		if (i >= 0) {
			this.elements.splice(i, 1);
		}
	},

	subtract: function(s) {
		var l = s.elements.length;
		for (var i = 0; i < l; ++i) {
			var iFound = this.index(s.elements[i]);
			if (iFound >= 0) {
				this.elements.splice(i, 1);
			}
		}
	},

	toString: function() {
		var s = '{';
		for (var i = 0; i < this.elements.length; ++i) {
			if (i != 0) {
				s += ', ';
			}
			s += stringify(this.elements[i]);
		}
		s += '}';
		return s;
	},

	union: function(s) {
		var l = s.elements.length;
		for (var i = 0; i < l; ++i) {
			if (!this.containsElement(s.elements[i])) {
				this.elements.push(s.elements[i]);
			}
		}
	},
};

Set.intersect = function(s1, s2) {
	var newSet = s1.clone();
	newSet.intersect(s2);
	return newSet;
};

Set.subtract = function(s1, s2) {
	var newSet = s1.clone();
	newSet.subtract(s2);
	return newSet;
};

Set.union = function(s1, s2) {
	var newSet = s1.clone();
	newSet.union(s2);
	return newSet;
};

