// grid operations

function Position(y, x) {
	this.y = y;
	this.x = x;
}

Position.prototype = {
	equals: function(p) {
		return p.y == this.y && p.x == this.x;
	},

	lessThan: function(p) {
		if (p.y == this.y) {
			return this.x < p.x;
		} else {
			return this.y < p.y;
		}
	},

	lessThanOrEquals: function(p) {
		return !p.lessThan(this);
	},

	greaterThan: function(p) {
		return p.lessThan(this);
	},

	greaterThanOrEquals: function(p) {
		return !this.lessThan(p);
	},
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

// console

function Console(h, w) {
	this.change = 0;
	this.h = h;
	this.w = w;
	this.displays = [];
	this.cursor = new Position(0, 0);
	this.insertMode = Console.prototype.InsertMode.Insert;
	this.color = null;
	this.colorStack = [];
	this.heat = null;
	this.heatStack = [];
	this.lines = [];
	for (var i = 0; i < h; ++i) {
		this.lines.push(new Line(w));
	}
	this.commands = new Set();
	this.iCommand = 0;
	this.maxCommands = 50;
	this.inputPrefix = '';
	this.iPrefixMatch = 0;
	
	this.promptColor = 'rgb(255, 255, 0)';
	this.pushColor(this.promptColor);
	this.writeLine('Web command line');
	this.writeLine('Copyright 2011 Chadd Merrigan');
	this.writeLine();
	this.popColor();
	this.writePrompt();
	this.inputRegion = new SequentialRegion(this.cursor, 0);
	this.addCommand('');
}

Console.prototype = {
	InsertMode: {
		Insert: 0,
		Overwrite: 1
	},
	
	add: function(p, nChars) {
		var i = this.index(p);
		return this.position(i + nChars);
	},

	addCommand: function(s) {
		this.commands.remove(s);
		this.commands.add(s);
		this.iCommand = this.commands.count() - 1;
	},

	addCursorIf: function(n) {
		var pPossible = this.add(this.cursor, n);
		if (this.regionContains(this.inputRegion, pPossible)) {
			this.setCursor(pPossible);
			return true;
		}
		return false;
	},

	clear: function() {
		for (var i = 0; i < this.lines.length; ++i) {
			this.lines[i].clear();
		}
		this.cursor = new Position(0, 0);
	},
	
	// begins displaying this console on the given element
	display: function(e) {
		this.displays.push(new ConsoleDisplay(this, e));
	},

	// f must be a function that takes a char as an argument
	forAll: function(r, f) {
		for (var i = this.index(r); i < ap.length; ++i) {
			var p = this.position(i);
			f(this.lines[p.y].chars[p.x].color);
		}
	},
		
	// returns the Char displayed at the given position
	getChar: function(p) {
		return this.lines[p.y].getChar(p.x);
	},
	
	getText: function(region) {
		var s = '';
		var iBegin = this.index(region.p);
		for (var i = 0; i < region.length; ++i) {
			s += this.getChar(this.position(iBegin + i)).ch;
		}
		return s;
	},
	
	index: function(p) {
		return p.y * this.w + p.x;
	},

	// inserts a string where the cursor is
	insertInput: function(s) {
		//// what about tabs, newlines
		this.moveInputTail(this.index(this.cursor), s.length);
		this.write(s);
		this.inputPrefix = this.getText(this.inputRegion);
	},

	moveInputTail: function(i, n) {
		if (n < 0) {
			// moving backwards: copy first char first
			var iEnd = this.regionEndIndex(this.inputRegion);
			for (var iTo = i; iTo < iEnd + n; ++iTo) {
				this.setChar(this.position(iTo), this.getChar(this.position(iTo - n)).ch); 
			}

			// also erase what was there
			for (var iTo = iEnd + n; iTo < iEnd; ++iTo) {
				this.setChar(this.position(iTo), null);
			}
		} else if (n > 0) {
			// moving forwards: copy last char first
			var iLast = this.regionEndIndex(this.inputRegion) - 1;
			for (var iFrom = iLast; iFrom >= i; --iFrom) {
				this.setChar(this.position(iFrom + n), this.getChar(this.position(iFrom)).ch); 
			}
		}
		this.inputRegion.length += n;
	},
		
	onBackspace: function() {
		if (this.addCursorIf(-1)) {
			this.removeInput(this.cursor, 1);
		}
	},
		
	onDelete: function() {
		if (this.regionContains(this.inputRegion, this.cursor))
		{
			this.removeInput(this.cursor, 1);
		}
	},

	onDownArrow: function() {
		if (!this.addCursorIf(this.w)) {
			var c = this.commands.count();
			if (c > 0)
			{
				this.iCommand = limitedAdd(this.iCommand, 1, 0, c - 1);
				this.replaceInputRegion(this.commands.elementAt(this.iCommand));
				this.cursor = this.regionEnd(this.inputRegion);
			}
		}
	},
		
	onEnter: function() {
		var sMessage = this.getText(this.inputRegion);
		this.writeChar('\n');
		this.process(sMessage);
		this.writePrompt();
		this.inputPrefix = '';
		this.addCommand('');
	},

	onEnd: function() {
		this.cursor = this.regionEnd(this.inputRegion);
	},
	
	onEscape: function() {
		var p = this.inputRegion.p;
		this.replaceInputRegion('');
		this.cursor = p;
	},
	
	onF8: function() {
		if (this.commands.count() == 0) {
			return;
		}
		
		var l = this.commands.length;
		for (var i = 0; i < l; ++i) {
			var iToTry = this.iPrefixMatch + 1 + i;
			if (iToTry >= l) {
				iToTry -= l;
			}
			if (this.commands.elementAt(iToTry).match(new RegExp('\\b' + this.inputPrefix))) {
				this.iPrefixMatch = iToTry;
				this.replaceInputRegion(this.commands.element(iToTry));
				break;
			}
		}
	},
	
	onHome: function() {
		this.cursor = this.inputRegion.p;
	},
	
	onInsert: function() {
		if (this.insertMode == Console.prototype.InsertMode.Insert) {
			this.insertMode = Console.prototype.InsertMode.Overwrite;
		} else {
			this.insertMode = Console.prototype.InsertMode.Insert;
		}
	},
	
	onKeyDown: function(e) {
		var kc = getCharCode(e);
		if (kc == 8) {	// backspace
			this.onBackspace(e);
		} else if (kc == 27) {	// escape
			this.onEscape(e);
		} else if (kc == 35) {	// end
			this.onEnd(e);
		} else if (kc == 36) {	// home
			this.onHome(e);
		} else if (kc == 37) {	// left arrow
			this.onLeftArrow(e);
		} else if (kc == 38) {	// right arrow
			this.onUpArrow(e);
		} else if (kc == 39) {	// up arrow
			this.onRightArrow(e);
		} else if (kc == 40) {	// down arrow
			this.onDownArrow(e);
		} else if (kc == 45) {	// insert
			this.onInsert(e);
		} else if (kc == 46) {	// delete
			this.onDelete(e);
		} else if (kc == 119) {	 // F8
			this.onF8(e);
		} else {
			return;
		}
		eatEvent(e);
		this.reportChanged();
	},

	onKeyPress: function(e) {
		var s = null;
		var kc = getCharCode(e);
		if (kc >= 32 && kc < 128) {
			s = String.fromCharCode(kc);
			this.insertInput(s);
		} else if (kc == 13) {	// enter
			this.onEnter(e);
		} else {
			return;
		}
		eatEvent(e);
		this.reportChanged();
	},

	onLeftArrow: function() {
		this.addCursorIf(-1);
	},

	onRightArrow: function() {
		this.addCursorIf(1);
	},
	
	onUpArrow: function() {
		if (!this.addCursorIf(-this.w)) {
			var c = this.commands.count();
			if (c > 0) {
				this.iCommand = limitedAdd(this.iCommand, -1, 0, c - 1);
				this.replaceInputRegion(this.commands.elementAt(this.iCommand));
				this.cursor = this.regionEnd(this.inputRegion);
			}
		}
	},

	// returns a Position corresponding to the given absolute index
	position: function(i) {
		return new Position(Math.floor(i / this.w), i % this.w);
	},
	
	process: function(message) {
		this.addCommand(message);
		
		var trimmed = message.trim();
		if (trimmed == 'clear') {
			this.clear();
			return;
		}

		var f = this.tryTechTalkProcess(message);
		if (!f)
		{
			var res;
			try {
				res = window.eval(message);
			} catch (e) {
				try {
					this.eval(message);
				} catch (e) {
					res = stringify(e);
				}
				res = e;
			}
			if (res != undefined)
			{
				this.writeLine(stringify(res));
			}
		}
	},

	popColor: function() {
		this.color = this.colorStack.pop();
	},

	popHeat: function() {
		this.heat = this.heatStack.pop();
	},

	pushColor: function(c) {
		this.colorStack.push(this.color);
		this.color = c;
	},

	pushHeat: function(h) {
		this.heatStack.push(this.heat);
		this.heat = h;
	},

	regionContains: function(region, p) {
		var iBegin = this.index(region.p);
		var i = this.index(p);
		return (iBegin <= i && i < iBegin + region.length);
	},
	
	regionEndIndex: function(region) {
		return this.index(region.p) + region.length;
	},

	regionEnd: function(region) {
		return this.position(this.regionEndIndex(region));
	},
	
	removeInput: function(p, length) {
		this.moveInputTail(this.index(p) + 1, -length);
		},

	replaceInputRegion: function(s) {
		this.removeInput(this.inputRegion.p, this.inputRegion.length);
		var p = this.inputRegion.p;
		var l = this.writeAt(this.inputRegion.p, s);
		this.inputRegion = new SequentialRegion(p, l);
	},
	
	reportChanged: function() {
		// for (var i = 0; i < this.displays.length; ++i) {
			// this.displays[i].refresh();
		// }
		++this.change;
	},

	setChar: function(p, ch, color, heat) {
		this.lines[p.y].setChar(p.x, ch, color, heat);
	},

	setColor: function(region, c) {
		this.forAll(region, function(char) { char.color = c; });
	},

	setCursor: function(p) {
		this.cursor = p;
		this.reportChanged();
	},
	
	setHeat: function(region, h) {
		this.forAll(region, function(char) { char.heat = h; });
	},

	subtract: function(p1, p2) {
		return this.index(p1) - this.index(p2);
	},
	
	techTalkInput: function(message) {
		this.writePrompt();
		var c = this.cursor;
		this.write(message);
		this.inputRegion.length = this.subtract(this.cursor, c);
		var sMessage = this.getText(this.inputRegion);
		this.writeChar('\n');
		this.process(sMessage);
	},
	
	// techTalkReady: function(message) {
		// this.writePrompt();
		// var c = this.cursor;
		// this.write(message);
		// this.inputRegion.length = this.subtract(this.cursor, c);
	// },
	
	tryTechTalkProcess: function(message) {
		var i = message.indexOf(" ");
		var sFirst;
		var sRest;
		if (i < 0) {
			sFirst = message;
			sRest = '';
		} else {
			sFirst = message.substr(0, i).toLowerCase();
			sRest = message.substr(i + 1);
		}
		
		if (sFirst == 'slide') {
			f.style.visibility = 'visible';
			gw.style.visibility = 'hidden';
			f.src = sRest;
		} else if (sFirst == 'load') {
			f.style.visibility = 'visible';
			gw.style.visibility = 'hidden';
			if (!sRest.match(/\bhttp/i)) {
				sRest = 'http://' + sRest;
			}
			f.src = sRest;
		} else if (sFirst == 'canvas') {
			f.style.visibility = 'hidden';
			gw.style.visibility = 'visible';
			can.style.display = 'block';
			svg.style.display = 'none';
			svgText.style.display = 'none';
		} else if (sFirst == 'svg') {
			f.style.visibility = 'hidden';
			gw.style.visibility = 'visible';
			can.style.display = 'none';
			svg.style.display = 'block';
			svgText.style.display = 'block';
			svgText.innerText = sRest;
			element('svg-1').innerHTML = sRest;
		} else if (sFirst == 'next' || sFirst == 'n') {
            n = 1;
            if (sRest.length > 0) {
                n = parseInt(sRest);
            }
			stepForward(n);
			this.techTalkInput(aSteps[iStep]);
		} else if (sFirst == 'pre') {
            var iEnd = limitedAdd(iStep, 5, 0, aSteps.length - 1);
            for (var i = iStep; i < iEnd; ++i) {
                this.writeLine(aSteps[i]);
            }
		} else if (sFirst == 'back' || sFirst == 'b') {
            n = 1;
            if (sRest.length > 0) {
                n = parseInt(sRest);
            }
			stepForward(-n);
			this.techTalkInput(aSteps[iStep]);
		} else if (sFirst == 'step') {
			this.writeLine(iStep.toString());
		} else if (sFirst == 'go') {
            iStep = 0;
            stepForward(parseInt(sRest));
			this.techTalkInput(aSteps[iStep]);
		} else if (sFirst == 'clear-canvas') {
            this.techTalkInput('ctx.clearRect(0, 0, can.width, can.height)');
        } else {
			return false;
		}
		
		return true;
	},
	
	write: function(s) {
		if (s == null) {
			return 0;
		}
		
		var pPreserved = this.cursor;
		var l = s.length;
		for (var i = 0; i < l; ++i) {
			this.writeChar(s.charAt(i));
		}
		this.reportChanged();
		return this.subtract(this.cursor, pPreserved);
	},

	// writes sequentially starting at the given position
	writeAt: function(p, s) {
		var pPreserved = this.cursor;
		this.cursor = p;
		var l = this.write(s);
		this.cursor = pPreserved;
		return l;
	},

	// this should always take something that prints exactly one
	// character -- anything else should be handled in write()
	writeChar: function(ch) {
		if (ch == '\n') {
			for (var x = this.cursor.x; x < this.w; ++x) {
				this.lines[this.cursor.y].setChar(x, null, this.color, this.heat);
			}
			++this.cursor.y;
			this.cursor.x = 0;
		} else if (ch == '\t') {
			var nSpaces = 4 - (this.cursor.x % 4);
			for (var j = 0; j < nSpaces; ++j) {
				this.writeChar(' ');
			}
		} else {
			this.setChar(this.cursor, ch, this.color, this.heat);
			this.setCursor(this.add(this.cursor, 1));
		}
	},

	// writes the string sequentially within a given rectangle
	writeIn: function(rect, s) {
		//
	},
	
	writeLine: function(s) {
		this.write(s);
		this.write('\n');
	},
	
	writePrompt: function() {
		this.pushColor(this.promptColor);
		this.write('tech-talk>');
		this.popColor();
		this.inputRegion = new SequentialRegion(this.cursor, 0);
	},
};
 
function Char() {
	this.ch = null;
	this.color = null;
	this.heat = null; // 1 is room temperature; 0 is absolute zero
}

function Line(length) {
	this.length = length;
	this.change = 0;
	this.clear();
}

Line.prototype = {
	clear: function() {
		this.chars = [];
		for (var i = 0; i < this.length; ++i) {
			 this.chars.push(new Char());
		}
		++this.change;
	},

	getChar: function(i) {
		return this.chars[i];
	},
	
	setChar: function(i, ch, color, heat) {
		this.chars[i].ch = ch;
		this.chars[i].color = color; 
		this.chars[i].heat =  heat; // Math.random() * .6 + 0.7;
		++this.change;
	}
};

// console display

function ConsoleDisplay(console, el) {
	this.console = console;
	// var elPrintable = document.createElement('div');
	// elPrintable.style.marginRight = '20px';
	// el.appendChild(elPrintable);
	this.element = el;
	el.style.overflowX = 'hidden';
	el.style.overflowY = 'auto';
	el.style.whiteSpace = 'nowrap';
	this.lineDisplays = [];
	for (var i = 0; i < this.console.lines.length; ++i) {
		var div = document.createElement('div');
		el.appendChild(div);
		this.lineDisplays.push(new LineDisplay(this.console.lines[i], div));
	}
	this.cursorDisplay = new CursorDisplay(this);
	this.change = 0;
	var cd = this;
	
	// retarded: divs don't handle keyboard events unless you give them a tab index
	// and they get the focus
	el.tabIndex = 0;
	addEvent(el, 'keydown', function (ev) {
		cd.console.onKeyDown(getEvent(ev));
	});
	addEvent(el, 'keypress', function (ev) {
		cd.console.onKeyPress(getEvent(ev));
	});
	addEvent(el, 'resize', function (ev) {
		cd.onResize(getEvent(ev));
	});
	this.console.displays.push(this);
	Scheduler.current.schedule(Action.createRepeatedAction(function() { cd.refresh() }, 30));
}

ConsoleDisplay.prototype = {
	focus: function() {
		this.element.focus();
	},

	onResize: function(ev) {
		++this.change;
	},
	
	// returns a pixel for the given position
	pixel: function(p) {
		var x = this.element.offsetLeft + p.x * this.wChar + 6;
		var y = this.lineDisplays[p.y].element.offsetTop;
		return new Point(x, y);
	},

	refresh: function() {
		this.wChar = 1;
		this.hChar = 1;
		for (var i = 0; i < this.lineDisplays.length; ++i) {
			this.lineDisplays[i].refreshIf();
			if (i == 0) {
				this.wChar = this.lineDisplays[i].element.children['all-chars'].offsetWidth / this.lineDisplays[i].line.chars.length;
				this.hChar = this.lineDisplays[i].element.offsetHeight;
			}
		}
		this.cursorDisplay.refreshIf();
	},
}

function LineDisplay(line, e) {
	this.line = line;
	e.style.position = 'relative';
	e.style.height = '10pt';
	e.style.verticalAlign = 'middle';
	this.element = e;
	this.displayedChange = null;
	this.refresh();
}

LineDisplay.prototype = {
	indexAtPixel: function(x) {
		return (x - this.element.offsetLeft) / this.wChar;
	},

	// writes out the complete line to the appropriate div
	refresh: function() {
		var html = '<span id="all-chars"><span>';
		var chars = this.line.chars;
		var color = null;
		var heat = null;
		for (var i = 0; i < chars.length; ++i) {
			var char = chars[i];
			
			// make span transition if needed
			if (char.color != color ||
				char.heat != heat) {
				html += '</span><span';
				var fStyle = (char.color != null || char.heat != null);
				if (fStyle) {
					html += ' style="';
					if (char.color != null) {
						html += 'color: ' + char.color + ';';
					}
					if (char.heat != null) {
						html += 'font-size: ' + Math.floor (10 * char.heat + .5) + 'pt;';
					}
					html += '"';
				}
				html += '>';
				color = char.color;
				heat = char.heat;
			}
			
			// add char to current span
			if (char.ch == ' ' || char.ch == null) {
				html += '&nbsp;';
			} else if (char.ch == '<') {
				html += '&lt;';
			} else if (char.ch == '>') {
				html += '&gt;';
			} else if (char.ch == '&') {
				html += '&amp;';
			// } else if (char.ch == '-') {
				// html += '&minus;';
			} else {
				html += char.ch;
			}
		}
		html += '</span></span>';
		this.element.innerHTML = html;
		this.displayedChange = this.line.change;
	},

	refreshIf: function() {
		if (this.displayedChange == null || this.displayedChange < this.line.change) {
			this.refresh();
		}
	},
};

// region of characters--generally used for chars within a line
function SequentialRegion(p, length) {
	this.p = new Position(p.y, p.x);
	this.length = length;
}

// cursor

function CursorDisplay(cd) {
	this.consoleDisplay = cd;
	this.displayedChange = null;
	this.displayedLineIndex = null;
	this.displayedConsoleDisplayChange = null;
	this.box = document.createElement('div');
	this.box.id = 'cursor-display';
	this.box.style.backgroundColor = 'rgb(192, 192, 192)';
	this.box.style.position = 'absolute';
	var cursorDisplay = this;
	Scheduler.current.schedule(Action.createRepeatedAction(function() { cursorDisplay.blink() }, 500));
}

CursorDisplay.prototype = {
	blink: function() {
		if (this.box.style.visibility == 'hidden') {
			this.box.style.visibility = 'visible';
		} else {
			this.box.style.visibility = 'hidden';
		}
	},
	
	refresh: function() {
		// first move box to another line if appropriate
		var cursor = this.consoleDisplay.console.cursor;
		var iLine = cursor.y;
		if (this.displayedLineIndex == null ||
			this.displayedLineIndex != iLine) {
			if (this.displayedLineIndex != null &&
				this.box.parentNode != null) {
				this.box.parentNode.removeChild(this.box);
			}
			this.displayedLineIndex = iLine;
		}
		this.consoleDisplay.lineDisplays[iLine].element.appendChild(this.box);
		
		this.box.style.left = (cursor.x * this.consoleDisplay.wChar) + 'px';
		this.box.style.width = this.consoleDisplay.wChar + 'px';
		var h;
		if (this.consoleDisplay.console.insertMode == Console.prototype.InsertMode.Insert) {
			h = 3;
		} else {
			h = 6;
		}
		this.box.style.top = (this.consoleDisplay.hChar - h) + 'px';
		this.box.style.height = h + 'px';

		this.displayedChange = this.consoleDisplay.console.change;
		this.displayedConsoleDisplayChange = this.consoleDisplay.change;
	},

	refreshIf: function() {
		if (this.displayedChange == null || 
			this.displayedChange < this.consoleDisplay.console.change ||
			this.displayedConsoleDisplayChange == null ||
			this.displayedConsoleDisplayChange < this.consoleDisplay.change) {
			this.refresh();
		}
	},
};

