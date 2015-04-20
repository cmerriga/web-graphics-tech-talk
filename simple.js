// tracing
var debug = true;
var dump = new Object();
var taTrace;
var nTraceDepth = 0;

function trace(s) {
	var sIndent = '';
	for (var i = 0; i < nTraceDepth; ++i) {
		sIndent += '   ';
	}
	taTrace.value = taTrace.value + sIndent + s + '\n';
}

function traceIn() {
	++nTraceDepth;
}

function traceOut() {
	--nTraceDepth;
	if (nTraceDepth < 0) {
		askContinue('Trace depth went below 0.');
	}
}

// context parsing

// reads next possibly-bracketed value
//     s - string to read
//     i - starting position
// returns {
//     Value | Comma | EndOfLine | In | Out | EndOfSource
//     value
//     new i 
function readValue(s, i) {
    i = skipWhitespace(s, i);
    var iNew = findValueEnd(s, i);
}

// finds the following patterns:
//     - <type> <unrecognized name>
//     - <unrecognized name> <type>
//     - <recognized name>
//     - <unrecognized name>
//     s - string to read
//     i - starting position
function parseLine(s, i) {
    var res = readValue(s, i);
    if (res.Value != null) {
        var chunk1 = res.value;
        i = res.iNew;
    }
}

function askContinue(s) {
	return confirm(s);
}

/*
function onDocumentLoad() {
	taTrace = element('taTrace');
	taTrace.value = '';
	trace('onDocumentLoad');
	traceIn();
	updateColor();
	if (trace == true) {
		taTrace.style.display = 'none';
 	} else {
		taTrace.style.display = 'inline';
	}
	traceOut();
}
*/

/*

<type> <name>
	<property> <value>
	<property> <value>, <property> <Value>
	<property> <value>, <value>, ...
	<value>
	<value>, ...
<line> := <value>, ... |
        

parse line: 
	get list of terms
		1. prototype name
		2. name prototype
		3. name value+
		4. prototype
		5. prototype 

rect r1 5x10
		in term term term out
rect 5x10
		in term term out
rect 5x10 blue
		in term term tem out
rect r1 5x10 blue
		in term term term term out
r1 rect 5x10 blue
		in term term term out
rect r1
	5x10
	blue
		in term term in in term out in term out out out
rect r1
	[hot spots]
		5 10
		10 15
		15 20
	blue
	100x100
		in term term in in term out in in term term out in term term out in term term out out in term out in term term out out out
rect r1
	[hot spots] 5 10, 10 15, 15 20
	blue
	100x100
		in term term in term (in) in term term out in term term out in term term out (out) out in term out in term out out out
rect
	blue
	100x100
r1 rect, display, tracked

parse for terms, ins, and outs

term separators
\t \n;,.
each sequence of them is equal in strength to the maximum strength one, point the number of those max strength ones

includers
{}()[]""[indents]

have to have mix of possible parsings, with probabilities
	<address2> := <city>, <state> <zip> |
			<city>, <state code> <zip> |
			{<city> <state> <zip>}
	address2 city state zip

parse has possible groupings
parse is aborted by disagreement

*/

/*
function skipItem(s, i) {
    while (i < s.length) {
        ++i;
    }
    return i;
}

function skipToItem(r) {
    while (r.i < r.s.length) {
        getNextChar(r);
        if (!isWhitespace(r.ch))
    }
}

function skipToChar(r, ch) {
    while (r.i < r.s.length) {
        getNextChar(r);
        if (r.ch == ch) {
            return;
        }
    }
}

// r(s, i, ch)
function getNextChar(r, ch) {
    if (r.s[r.i] == '\\') {
        ++r.i;
        r.bEscaped = true;
    } else {
	r.bEscaped = false;
    }
    r.ch = r.s[r.i];
    ++r.i;

    if (bEscaped) {
        if (ch == 'n') {
            r.ch = '\n';
        } else if (ch == 't') {
            r.ch = '\t';
        } else if (ch == 'r') {
            r.ch = '\r';
        }
    }
}

*/

