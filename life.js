// function ColorGrid(rows, columns, width) {
	// this.rows = rows;
	// this.columns = columns;
	// this.width = width;
	// this.gap = 0;
	// this.cells = createTwoDimensionalArray(nCellsPerSide, nCellsPerSide, function() { 
		// var eCell = document.createElement('div');
		// eCell.style.position = 'absolute';
		// eCell.style.left = (gap + c * width) + 'px';
		// eCell.style.top = (gap + r * width) + 'px';
		// eCell.style.width = (width - gap) + 'px';
		// eCell.style.height = (width - gap) + 'px';
		// // addCellDownHandler(eCell, r, c);
		// // addCellOverHandler(eCell, r, c);
		// // addCellUpHandler(eCell, r, c);
		// eBody.appendChild(eCell);
		// return {
			// color: 'rgb(0, 0, 0)',
			// display: eCell,
			// displayIsUpToDate: false });
// }

// ColorGrid.prototype.set(r, c, color) {
	// var cell = this.cells[r][c];
	// if (color != cell.color) {
		// cell.color = color;
		// cell.displayIsUpToDate = false;
	// }
// }

// ColorGrid.prototype.get(r, c, color) {
	// return this.cells[r][c].color;
// }

// ColorGrid.prototype.refreshDisplay() {
	// for (var r = 0; r < this.rows; ++r) {
		// for (var c = 0; c < this.columns; ++c) {
		// }
	// }
// }

function life() {
	cells = createTwoDimensionalArray(nCellsPerSide, nCellsPerSide, function() { return newCell(); });
	newStates = createTwoDimensionalArray(nCellsPerSide, nCellsPerSide, function() { return 0; });
	var w = 20;
	var eBody = getBody();
	for (var r = 0; r < nCellsPerSide; ++r) {
		for (var c = 0; c < nCellsPerSide; ++c) {
			var eCell = document.createElement('div');
			eCell.style.position = 'absolute';
			eCell.style.left = (41 + c * w) + 'px';
			eCell.style.top = (41 + r * w) + 'px';
			eCell.style.width = (w - 1) + 'px';
			eCell.style.height = (w - 1) + 'px';
			addCellDownHandler(eCell, r, c);
			addCellOverHandler(eCell, r, c);
			addCellUpHandler(eCell, r, c);
			eBody.appendChild(eCell);
			cells[r][c].display = eCell;
		}
	}
	scheduleInfinitelyRecurringAction(refreshDisplay, 0, 50);
	scheduleInfinitelyRecurringAction(play, 0, 50);
}

function play() {
	if (playing) {
		playOneRound();
	}
}
	
function playOneRound() {
	var neighbors = [
		[-1, -1], [-1, 0], [-1, 1],
		[0, -1], [0, 1],
		[1, -1], [1, 0], [1, 1]];
	var nNeighbors = neighbors.length;
	for (var r = 0; r < nCellsPerSide; ++r) {
		for (var c = 0; c < nCellsPerSide; ++c) {
			var neighborsOn = 0;
			for (var i = 0; i < nNeighbors; ++i) {
				var nr = r + neighbors[i][0];
				var nc = c + neighbors[i][1];
				if (nr >= 0 && nr < nCellsPerSide &&
					nc >= 0 && nc < nCellsPerSide &&
					cells[nr][nc].state == 1) {
					++neighborsOn;
				}
			}
			
			if (neighborsOn <= 1) {
				newStates[r][c] = 0;
			} else if (neighborsOn == 2) {
				newStates[r][c] = cells[r][c].state;
			} else if (neighborsOn == 3) {
				newStates[r][c] = 1;
			} else if (neighborsOn >= 4){
				newStates[r][c] = 0;
			}
		}
	}

	for (var r = 0; r < nCellsPerSide; ++r) {
		for (var c = 0; c < nCellsPerSide; ++c) {
			setCell(cells[r][c], newStates[r][c]);
		}
	}
}

function setCell(cell, state) {
	if (cell.state != state) {
		cell.state = state;
		cell.changed = lastChangeDisplayed + 1;
	}
}

function addCellDownHandler(eCell, r, c) {
	addEventHandler(eCell, 'mousedown', function() { cellDown(r, c); });
}

function addCellOverHandler(eCell, r, c) {
	addEventHandler(eCell, 'mouseover', function() { cellOver(r, c); });
}

function addCellUpHandler(eCell, r, c) {
	addEventHandler(eCell, 'mouseup', function() { cellUp(r, c); });
}

function cellDown(r, c) {
	var cell = cells[r][c];
	if (cell.state == 0) {
		cell.state = 1;
		drawing = true;
	} else {
		cell.state = 0;
		drawing = false;
	}
	cell.changed = lastChangeDisplayed + 1;
	mouseDown = true;
}

function cellOver(r, c) {
	if (mouseDown) {
		var cell = cells[r][c];
		if (cell.state == 0 && drawing) {
			cell.state = 1;
			cell.changed = lastChangeDisplayed + 1;
		} else if (cell.state == 1 && !drawing) {
			cell.state = 0;
			cell.changed = lastChangeDisplayed + 1;
		}
	}
}

function cellUp(r, c) {
	mouseDown = false;
	drawing = false;
}

function newCell() {
	return {
		state: 0,
		changed: 0 };
}

function refreshDisplay() {
	for (var r = 0; r < nCellsPerSide; ++r) {
		for (var c = 0; c < nCellsPerSide; ++c) {
			var cell = cells[r][c];
			if (cell.changed > lastChangeDisplayed) {
				cell.display.style.backgroundColor = cellColors[cell.state];
			}
		}
	}
	++lastChangeDisplayed;
}

function start() {
	playing = true;
}

function step() {
	playOneRound();
}

function stop() {
	playing = false;
}

function reset() {
	stop();
	for (var r = 0; r < nCellsPerSide; ++r) {
		for (var c = 0; c < nCellsPerSide; ++c) {
			var cell = cells[r][c];
			cell.state = 0;
			cell.changed = lastChangeDisplayed + 1;
		}
	}
}
	
var nCellsPerSide = 36;
var cells;
var newStates;
var cellColors = [
	'rgb(0, 64, 64)',
	'rgb(128, 255, 255)'];
var lastChangeDisplayed = -1;
var mouseDown = false;
var drawing = false;
var playing = false;

addInitializationAction(life);