// general

function arrayContains(a, o) {
    var length = a.length;
    for (i = 0; i < length; ++i) {
        if (a[i] == o) {
            return true;
        }
    }
    return false;
}

function asString(v, depth) {
    if (depth === undefined) {
        depth = 0;
    }

    if (typeof v == 'object') {
        var indent = '';
        for (var n = 0; n < depth; ++n) {
            indent += '\t';
        }
        
        var s = '';
        for (propertyName in v) {
            var subvalue = v[propertyName];
            if (typeof subvalue == 'object') {
                s += indent;
                if (isNumericString(propertyName)) {
                    s += '[' + propertyName + ']\n';
                } else {
                    s += propertyName + ': \n';
                }
                s += asString(subvalue, depth + 1) + '\n';
            } else {
                if (isNumericString(propertyName)) {
                    s += indent + '[' + propertyName + '] ' + v[propertyName] + '\n';
                } else {
                    s += indent + propertyName + ': ' + v[propertyName] + '\n';
                }
            }
        }
        return s;
    } else {
        return String(v);
    }
}

function createTwoDimensionalArray(rows, columns, initializer) {
    var array = new Array(rows);
    for (var r = 0; r < rows; ++r) {
        var row = new Array(columns);
        array[r] = row;
        for (var c = 0; c < columns; ++c) {
            row[c] = initializer();
        }
    }
    return array;
}

//// untested
function merge(o, override) {
    for (property in override) {
        if (o.property === undefined) {
            o.property = override[property];
        } else {
            merge(o.property, override[property]);
        }
    }
}

// math

function max(v1, v2) {
    if (v1 < v2) {
        return v2;
    } else {
        return v1;
    }
}

function min(v1, v2) {
    if (v1 < v2) {
        return v1;
    } else {
        return v2;
    }
}

// strings

function isNumericString(s) {
    return !isNaN(parseInt(s));
}

function right(s, nCharacters) {
    return s.substr(max(s.length - nCharacters, 0), nCharacters);
}

function left(s, nCharacters) {
    return s.substr(0, min(nCharacters, s.length));
}

function endsWith(s, ending) {
    return (right(s, ending.length) == ending);
}

function startsWith(s, starting) {
    return (left(s, starting.length) == starting);
}

// http

function go(url) {
    document.location = url;
}

// function queryString() {
    // alert('running queryString');
    // return appendQueryString('', arguments);
// }

// returns new URL based off of s
function appendQueryString(s) {
    // alert('appending query string to "' + s + '"');
    // alert('' + arguments.length + ' arguments');
    if (arguments.length > 1) {
        var i = 1;
        while (i < arguments.length) {
            var argument = arguments[i];
            if (typeof argument == 'object') {
                // alert('argument ' + i + ' is an object');
                for (key in argument) {
                    var subargument = argument[key];
                    if (typeof subargument == 'object') {
                        s = appendQueryString(s, subargument);
                    } else {
                        s = appendQueryString(s, key, subargument);
                    }
                }
                ++i;
                continue;
            }
            
            // alert('argument ' + i + ' is not an object: ' + argument);
            if (hasQuery(s)) {
                s += '&';
            } else {
                s += '?';
            }
            s += argument + '=' + arguments[i + 1];
            i += 2;
        }
    }
    return s;
}

function hasQuery(s) {
    return s.indexOf('?') >= 0;
}

// html

function getElement(id) {
    return document.getElementById(id);
}

function getElements(re) {
    ////
}

function getBody() {
    return document.getElementsByTagName('body')[0];
}

function getDivElements() {
    return document.getElementsByTagName('div');
}

function getInput(name) {
    return document.getElementById(inputElementName(name));
}

function inputElementName(name) {
    return name + 'Input';
}

function changeImage(img, newUrl) {
    img.src = newUrl;
}

function getSelection(selectID) {
    var select = getElement(selectID);
    return select.options[select.selectedIndex].value;
}

// returns the value
function userValue(name) {
    var element = getInput(name);
    if (element === null) {
        return null;
    } else {
        return element.value;
    }
}

// puts together a URL with a query string for the given fields
function submit(url, userValueNames) {
    if (userValueNames !== null) {
        var nNames = userValueNames.length;
        for (var i = 0; i < nNames; ++i) {
            var name = userValueNames[i];
            if (i == 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += name + '=' + userValue(name);
        }
    }
    go(url);
}

function setUserValue(name, value) {
    var element = document.getElementById(inputElementName(name));
    if (element !== null) {
        element.value = value;
    }
}

function urlValue(name) {
    return window.data.query[name];
}

function ensureClassList(e) {
    if (e.classList !== undefined) {
        return;
    }
    
    if (e.className === undefined) {
        //// what's wrong here? i don't know. Text objects can't have a property assigned to them
        // alert('about to assign class list for e: ' + e);
        e.classList = new Array();
    } else {
        e.classList = e.className.split(' ');
    }
}

function hasClass(e, className) {
    ensureClassList(e);
    return e.classList !== undefined && arrayContains(e.classList, className);
}

function isEmailAddressValid(address) {
    if (address === null ||
        address.length == 0) {
        return null;
    }
    
    //alert('trying address ' + address);
    return /^\w+@\w+.\w+$/.test(address);
}

function refreshInstructionStatus(status, number) {
    var doneDisplay = document.getElementById('status-' + number + '-done');
    if (doneDisplay === null) {
        alert('no green checkmark' + 'status-' + number + '-done');
    }
    var errorDisplay = document.getElementById('status-' + number + '-error');
    if (errorDisplay === null) {
        alert('no red x ' + 'status-' + number + '-error');
    }
    
    if (status === null) {
        hide(doneDisplay);
        hide(errorDisplay);
    } else if (status) {
        showInline(doneDisplay);
        hide(errorDisplay);
    } else {
        hide(doneDisplay)
        showInline(errorDisplay);
    }
}

function showInline(element) {
    element.style.display = 'inline';
}

function showBlock(element) {
    element.style.display = 'block';
}

function hide(element) {
    element.style.display = 'none';
}

// dhtml positioning

//// deprecated
function isWindow(e) {
    return hasClass(e, 'window');
}

//// deprecated
function isHorizontalCenter(e) {
    return hasClass(e, 'horizontal-center');
}

//// deprecated
function isVerticalCenter(e) {
    return hasClass(e, 'vertical-center');
}

//// deprecated
function fixUpWindows() {
    var divs = document.getElementsByTagName('div');
    var nDivs = divs.length;
    for (var i = 0; i < nDivs; ++i) {
        var div = divs[i];
        if (isWindow(div)) {
            parentNode = div.parentNode;
            //div.style.left = parentNode.style.offsetLeft + 'px';
            div.style.width = parentNode.clientWidth + 'px';
            //div.style.top = parentNode.style.offsetTop + 'px';
            div.style.height = parentNode.clientHeight + 'px';
        }
    }
}

//// deprecated
function fixUpHorizontalCenters() {
    var divs = document.getElementsByTagName('div');
    var nDivs = divs.length;
    for (var i = 0; i < nDivs; ++i) {
        var div = divs[i];
        if (isHorizontalCenter(div)) {
            div.style.left = (div.parentNode.clientWidth - div.offsetWidth) / 2 + 'px';
        }
    }
}

//// deprecated
function fixUpVerticalCenters() {
    var divs = document.getElementsByTagName('div');
    var nDivs = divs.length;
    for (var i = 0; i < nDivs; ++i) {
        var div = divs[i];
        if (isVerticalCenter(div)) {
            div.style.top = (div.parentNode.clientHeight - div.offsetHeight) / 2 + 'px';
        }
    }
}

function fixUpPositioning() {
    //// deprecated
    fixUpWindows();
    fixUpVerticalCenters();
    fixUpHorizontalCenters();
    
    var n = 0;
    while (true) {
        var status = fixUpElementPositioning(getBody());
        if (status == 0) {
            break;    
        }
        ++n;
        if (n >= 100) {
            alert('circular dependency encountered');
            break;
        }
    }
}

// fixes up the element and all its children
// returns
//    0 - all done
//    1 - needs another round for dependencies
//    2 - needs shrinkage
///// reduce width by box model bogusness: margins don't work right now
//// margins may be collapsed so maybe it's okay not to count them
var alreadySaidHuh = false;
function fixUpElementPositioning(e) {
    var status = 0;

    if (e.position !== undefined) {
        // if (e.id == 'starLineName0') {
            // var starLineName0 = true;
        // }
        var p = e.position;
        
        // figure out the fudge factors involved
        if (p.borderAndMarginWidth === undefined) {
            if (typeof e.offsetWidth != 'number') {
                if (!alreadySaidHuh) {
                    alert('huh...typeof e.offsetWidth = ' + (typeof e.offsetWidth));
                }
                alreadySaidHuh = true;
            }
            e.position.borderAndMarginWidth = e.offsetWidth;
        }
        if (p.borderAndMarginHeight === undefined) {
            // if (typeof e.offsetHeight != 'int') {
                // alert('huh');
            // }
            e.position.borderAndMarginHeight = e.offsetHeight;
        }
        
        // horizontal
        var absoluteLeft = null;            // distance right from parent left edge
        var absoluteLeftPin = null;
        var absoluteRight = null;            // distance right from parent right edge
        var absoluteRightPin = null;
        var absoluteWidth = null;
        var missingDependency = false;
        var missingPinDependency = false;
        if (p.left !== null) {
            absoluteLeft = getLength(p.left, e, 'width', 'parent');
            if (absoluteLeft === null) {
                missingDependency = true;
            }
        }
        if (p.leftPin != null) {
            absoluteLeftPin = getLength(p.leftPin, e, 'width', 'self');
            if (absoluteLeftPin === null) {
                missingPinDependency = true;
            }
        }
        if (p.right !== null) {
            absoluteRight = getLength(p.right, e, 'width', 'parent');
            if (absoluteRight === null) {
                missingDependency = true;
            }
        }
        if (p.rightPin != null) {
            absoluteRightPin = getLength(p.rightPin, e, 'width', 'self');
            if (absoluteRightPin === null) {
                missingPinDependency = true;
            }
        }
        if (p.width !== null) {
            absoluteWidth = getLength(p.width, e, 'width', 'parent');
            if (absoluteWidth === null) {
                missingDependency = true;
            }
        }
        p.widthDecided = false;
        var parentWidth = e.parentNode.clientWidth;
        var leftPixels = null;
        var rightPixels = null;
        var widthPixels = null;
        if (!missingDependency) {
            // resolve the left, right, and widths
            if (absoluteWidth === null) {
                if (absoluteLeft === null && absoluteRight === null) {
                    // full width
                    leftPixels = 0;
                    widthPixels = parentWidth;
                } else if (absoluteLeft === null) {
                    rightPixels = absoluteRight;
                } else if (absoluteRight === null) {
                    leftPixels = absoluteLeft;
                } else {
                    leftPixels = absoluteLeft
                    widthPixels = parentWidth - absoluteLeft - absoluteRight;
                }
            } else {
                widthPixels = absoluteWidth;
                if (absoluteLeft === null && absoluteRight === null) {
                    // centered
                    leftPixels = (parentWidth - absoluteWidth) / 2;
                } else if (absoluteLeft === null) {
                    rightPixels = absoluteRight;
                } else if (absoluteRight === null) {
                    leftPixels = absoluteLeft;
                } else {
                    var totalNeeded = absoluteLeft + absoluteWidth + absoluteRight;
                    if (totalNeeded > parentWidth) {
                        //// report starvation
                    }
                    leftPixels = absoluteLeft;
                }
            }
            
            if (leftPixels !== null) {
                if (absoluteLeftPin !== null) {
                    leftPixels -= absoluteLeftPin;
                }
                e.style.left = leftPixels + 'px';
            } else {
                e.style.left = 'auto';
            }
            if (rightPixels !== null) {
                if (absoluteRightPin !== null) {
                    rightPixels += absoluteRightPin;
                }
                e.style.right = rightPixels + 'px';
            } else {
                e.style.right = 'auto';
            }
            if (widthPixels !== null) {
                e.style.width = max((widthPixels - p.borderAndMarginWidth), 0) + 'px';
            } else {
                e.style.width = 'auto';
            }
            
            p.widthDecided = true;
        }

        // vertical
        var absoluteTop = null;             // distance down from parent top edge
        var absoluteTopPin = null;        
        var absoluteBottom = null;            // distance down from parent bottom edge
        var absoluteBottomPin = null;
        var absoluteHeight = null;
        missingDependency = false;
        if (p.top !== null) {
            absoluteTop = getLength(p.top, e, 'height', 'parent');
            if (absoluteTop === null) {
                missingDependency = true;
            }
        }
        if (p.topPin != null) {
            absoluteTopPin = getLength(p.topPin, e, 'height', 'self');
            if (absoluteTopPin === null) {
                missingPinDependency = true;
            }
        }
        if (p.bottom !== null) {
            absoluteBottom = getLength(p.bottom, e, 'height', 'parent');
            if (absoluteBottom === null) {
                missingDependency = true;
            }
        }
        if (p.bottomPin != null) {
            absoluteBottomPin = getLength(p.bottomPin, e, 'height', 'self');
            if (absoluteBottomPin === null) {
                missingPinDependency = true;
            }
        }
        if (p.height !== null) {
            absoluteHeight = getLength(p.height, e, 'height', 'parent');
            if (absoluteHeight === null) {
                missingDependency = true;
            }
        }
        p.heightDecided = false;
        var parentHeight = e.parentNode.clientHeight;
        var topPixels = null;
        var bottomPixels = null;
        var heightPixels = null;
        if (!missingDependency) {
            // resolve the top, bottom, and heights
            if (absoluteHeight === null) {
                if (absoluteTop === null && absoluteBottom === null) {
                    // full height
                    topPixels = 0;
                    heightPixels = parentHeight;
                } else if (absoluteTop === null) {
                    bottomPixels = absoluteBottom;
                } else if (absoluteBottom === null) {
                    topPixels = absoluteTop;
                } else {
                    topPixels = absoluteTop;
                    heightPixels = parentHeight - absoluteTop - absoluteBottom;
                }
            } else {
                heightPixels = absoluteHeight;
                if (absoluteTop === null && absoluteBottom === null) {
                    // centered
                    topPixels = (parentHeight - absoluteHeight) / 2;
                } else if (absoluteTop === null) {
                    bottomPixels = absoluteBottom;
                } else if (absoluteBottom === null) {
                    topPixels = absoluteTop;
                } else {
                    var totalNeeded = absoluteTop + absoluteHeight + absoluteBottom;
                    if (totalNeeded > parentHeight) {
                        //// report starvation
                    }
                    topPixels = absoluteTop;
                }
            }

            if (topPixels !== null) {
                if (absoluteTopPin !== null) {
                    topPixels -= absoluteTopPin;
                }
                e.style.top = topPixels + 'px';
            } else {
                e.style.top = 'auto';
            }
            if (bottomPixels !== null) {
                if (absoluteBottomPin !== null) {
                    bottomPixels += absoluteBottomPin;
                }
                e.style.bottom = bottomPixels + 'px';
            } else {
                e.style.bottom = 'auto';
            }
            if (heightPixels !== null) {
                e.style.height = max((heightPixels - p.borderAndMarginHeight), 0) + 'px';
            } else {
                e.style.height = 'auto';
            }
            p.heightDecided = true;
        }

        if (p.widthDecided && p.heightDecided && !missingPinDependency) {
            e.style.visibility = 'visible';
        } else {
            status = 1;
        }
    }
    
    // fix up all children too
    var nChildren = e.childNodes.length;
    for (var i = 0; i < nChildren; ++i) {
        var childStatus = fixUpElementPositioning(e.childNodes[i]);
        if (childStatus == 1) {
            status = 1;
        }
    }

    return status;
}

function getLength(length, e, side, relative) {
    var desired = length.desired;
    if (desired == null) {
        desired = '0px';
    }
    var n = parseInt(desired);
    var absolute = null;
    var isPercentage = false;
    
    if (endsWith(desired, 'em')) {
        alert('em not implemented yet');
        absolute = 10 * n; //// approximation
    } else if (endsWith(desired, '%')) {
        isPercentage = true;
    }
        
    // fix up any defaults
    var relativeTo = length.relativeTo;
    if (relativeTo === null && isPercentage) {
        relativeTo = relative;
    }
    
    if (relativeTo === null) {
        absolute = n;
    } else {
        var relativeSide = length.relativeSide;
        if (relativeSide === null) {
            relativeSide = side;
        }
        
        // find relative element
        var eRelative = null;
        if (relativeTo == 'parent') {
            eRelative = e.parentNode;
        } else if (relativeTo == 'self') {
            eRelative = e;
        } else {
            eRelative = getElement(relativeTo);
        }
        if (eRelative === null) {
            return 0;
        }

        if (relativeSide == 'left' ||
            relativeSide == 'right' ||
            relativeSide == 'width') {
            // check for width not decided
            if (eRelative.position !== undefined &&
                !eRelative.position.widthDecided) {
                return null;
            }
            
            // the parent might have padding so use the client area only
            var relativeWidth;
            if (relativeTo == 'parent') {
                relativeWidth = eRelative.clientWidth;
                //alert('client ' + eRelative.clientWidth + ' offset ' + eRelative.offsetWidth);
            } else {
                relativeWidth = eRelative.offsetWidth;
            }
            
            var offset;
            if (isPercentage) {
                offset = relativeWidth * n / 100;
            } else {
                offset = n;
            }

            if (relativeSide == 'left') {
                absolute = eRelative.offsetLeft + offset;
            } else if (relativeSide == 'right') {
                absolute = eRelative.offsetLeft + relativeWidth + offset;
            } else {
                absolute = offset;
            }
        } else {
            // check for height not decided
            if (eRelative.position !== undefined &&
                !eRelative.position.heightDecided) {
                return null;
            }

            // the parent might have padding so use the client area only
            var relativeHeight;
            if (relativeTo == 'parent') {
                relativeHeight = eRelative.clientHeight;
            } else {
                relativeHeight = eRelative.offsetHeight;
            }
            
            var offset;
            if (isPercentage) {
                offset = relativeHeight * n / 100;
            } else {
                offset = n;
            }
            
            if (relativeSide == 'top') {
                absolute = eRelative.offsetTop + offset;
            } else if (relativeSide == 'bottom') {
                absolute = eRelative.offsetTop + relativeHeight + offset;
            } else {
                absolute = offset;
            }
        }
    }
    
    // min/max considerations
    if (length.min !== null) {
        absoluteMin = parseInt(length.min);
        if (absolute < absoluteMin) {
            absolute = absoluteMin;
        }
    }
    if (length.max !== null) {
        absoluteMax = parseInt(length.max);
        if (absolute > absoluteMax) {
            absolute = absoluteMax;
        }
    }
    
    return absolute;
}

// data 

function dataValue(path) {
    var names = path.split('.');
    var o = window.data;
    for (var i = 0; i < names.length; ++i) {
        o = o[names[i]];
    }
    return o;
}

// scheduling

// scheduled action (action, nextUtcMilliseconds, endUtcMilliseconds, intervalMilliseconds)
function scheduleAction(action, startMilliseconds) {
    var scheduledAction = new Object();
    scheduledAction.action = action;
    scheduledAction.nextUtcMilliseconds = new Date().getTime() + startMilliseconds;
    scheduledAction.intervalMilliseconds = null;
    scheduledAction.endUtcMilliseconds = null;
    addActionToQueue(scheduledAction);
}

function scheduleInfinitelyRecurringAction(action, startMilliseconds, intervalMilliseconds) {
    var scheduledAction = new Object();
    scheduledAction.action = action;
    scheduledAction.nextUtcMilliseconds = new Date().getTime() + startMilliseconds;
    scheduledAction.intervalMilliseconds = intervalMilliseconds;
    scheduledAction.endUtcMilliseconds = null;
    addActionToQueue(scheduledAction);
}

function scheduleRecurringAction(action, startMilliseconds, intervalMilliseconds, lengthMilliseconds) {
    var scheduledAction = new Object();
    scheduledAction.action = action;
    scheduledAction.nextUtcMilliseconds = new Date().getTime() + startMilliseconds;
    scheduledAction.intervalMilliseconds = intervalMilliseconds;
    scheduledAction.endUtcMilliseconds = scheduledAction.nextUtcMilliseconds + lengthMilliseconds;
    addActionToQueue(scheduledAction);
}

function addActionToQueue(scheduledAction) {
    var actionQueue = window.data.actionQueue;
    var nActions = actionQueue.length;
    
    // find first action that is later than the one we're putting in
    var i = 0;
    while (i < nActions) {
        if (actionQueue[i].nextUtcMilliseconds > scheduledAction.nextUtcMilliseconds) {
            break;
        }
        ++i;
    }
    
    actionQueue.splice(i, 0, scheduledAction);
    
    ///// check the ordering
    for (var i = 0; i < actionQueue.length - 1; ++i) {
        if (actionQueue[i].nextUtcMilliseconds > actionQueue[i + 1].nextUtcMilliseconds) {
            alert('queue is messed up');
        }
    }
}

function runActions() {
    var now = new Date().getTime();
    var nKnownActions = window.data.actionQueue.length;
    var i = 0;
    while (i < nKnownActions) {
        var scheduledAction = window.data.actionQueue[0];
        if (scheduledAction.nextUtcMilliseconds > now) {
            break;
        }
    
        // the action has no business in the front of the queue anymore
        window.data.actionQueue.splice(0, 1);
        
        // don't bother running if the action has ended
        if (scheduledAction.endUtcMilliseconds === null ||
            scheduledAction.endUtcMilliseconds > now) {
            scheduledAction.action();
            
            // schedule another iteration for later
            if (scheduledAction.intervalMilliseconds !== null) {
                scheduledAction.nextUtcMilliseconds = now + scheduledAction.intervalMilliseconds;
                addActionToQueue(scheduledAction);
            }
        }
        ++i;
    }
    
    if (window.data.actionQueue.length > 0) {
        setTimeout('runActions()', window.data.actionQueue[0].nextUtcMilliseconds - now);
    } else {
        setTimeout('runActions()', 250);
    }
}

// returns [0.0, 1.0]
function portionDone(scheduledAction, now) {
    if (scheduledAction.endUtcMilliseconds === null ||
        scheduledAction.endUtcMilliseconds > now ||
        (scheduledAction.endUtcMilliseconds - scheduledAction.startUtcMilliseconds) <= 0) {
        return 1.0;
    }
    return (now - scheduledAction.startUtcMilliseconds) / (scheduledAction.endUtcMilliseconds - scheduledAction.startUtcMilliseconds);
}

function standardizeData() {
    if (typeof undefined !== 'undefined') {
        alert('someone is redefining "undefined" around here');
    }
    if (window.data === undefined) {
        window.data = new Object();
    }
    if (window.data.query === undefined) {
        window.data.query = new Object();
    }
    if (window.data.elementProperties === undefined) {
        window.data.elementProperties = new Array();
    }
    if (window.data.elementPositions === undefined) {
        window.data.elementPositions = new Array();
    }
    if (window.data.elementEvents === undefined) {
        window.data.elementEvents = new Array();
    }
    if (window.data.scheduledActions === undefined) {
        window.data.scheduledActions = new Array();
    }
    if (window.data.actionQueue === undefined) {
        window.data.actionQueue = new Array();
    }
}

function applyElementProperties() {
    var elementProperties = window.data.elementProperties;
    var l = elementProperties.length;
    for (var i = 0; i < l; ++i) {
        var property = elementProperties[i];
        if (property['htmlID'] === null) {
            window[property['htmlID']] = property['value'];
        } else {
            var e = getElement(property['htmlID']);
            if (e != null) {
                e[property['name']] = property['value'];
            }
        }
    }
}

function applyElementPositions() {
    var nElements = window.data.elementPositions.length;
    for (var i = 0; i < nElements; ++i) {
        var override = window.data.elementPositions[i];
        var e = getElement(override.htmlID);
        if (e === null) {
            continue;
        }

        var position = new Position();
        for (property in override.position) {
            var value = override.position[property];
            if (property == 'left' ||
                property == 'leftPin' ||
                property == 'right' ||
                property == 'rightPin' ||
                property == 'width' ||
                property == 'top' ||
                property == 'topPin' ||
                property == 'bottom' ||
                property == 'bottomPin' ||
                property == 'height') {
                value = fillOutLength(value);
            }
            position[property] = value;
        }
        e.position = position;
        
        setDefaultPositionStyles(e);
    }
}

//// also do 'clip' = true|false
function Position() {
    return {
        criticality: 0,
        left: null,
        leftPin: null,
        right: null,
        rightPin: null,
        width: null,
        widthStarvation: 'hide',
        widthDecided: false,
        top: null,
        topPin: null,
        bottom: null,
        bottomPin: null,
        height: null,
        heightStarvation: 'hide',
        heightDecided: false };
}

function fillOutLength(length) {
    if (length.desired === undefined) {
        length.desired = null;
    }
    if (length.relativeTo === undefined) {
        length.relativeTo = null;
    }
    if (length.relativeSide === undefined) {
        length.relativeSide = null;
    }
    if (length.min === undefined) {
        length.min = null;
    }
    if (length.max === undefined) {
        length.max = null;
    }
    return length;
}

function setDefaultPositionStyles(e) {
    e.style.position = 'absolute';
    e.style.left = 'auto';
    e.style.right = 'auto';
    e.style.width = '0px';    // used temporarily to calculate border and margin factor
    e.style.minWidth = null;
    e.style.maxWidth = 'none';
    e.style.top = 'auto';
    e.style.bottom = 'auto';
    e.style.height = '0px';    // used temporarily to calculate border and margin factor
    e.style.minHeight = null;
    e.style.maxHeight = 'none';
    e.style.visibility = 'hidden';
//    e.style.overflow = 'hidden';
}

function applyElementEvents() {
    var elementEvents = window.data.elementEvents;
    var l = elementEvents.length;
    for (var i = 0; i < l; ++i) {
        var event = elementEvents[i];
        var e = getElement(event['htmlID']);
        if (event['htmlID'] == 'window' && event['name'] == 'load') {
            window[event['action']]();
        } else if (e != null) {
            addEventHandler(e, event['name'], window[event['action']]);
        }
    }
}

function applyScheduledActions() {
    var l = window.data.scheduledActions.length;
    for (var i = 0; i < l; ++i) {
        var scheduledAction = window.data.scheduledActions[i];
        if (scheduledAction.lengthMilliseconds !== null) {
            scheduleRecurringAction(
                window[scheduledAction.functionName],
                scheduledAction.startMilliseconds,
                scheduledAction.intervalMilliseconds,
                scheduledAction.lengthMilliseconds);
        } else if (scheduledAction.intervalMilliseconds !== null) {
            scheduleInfinitelyRecurringAction(
                window[scheduledAction.functionName],
                scheduledAction.startMilliseconds,
                scheduledAction.intervalMilliseconds);    
        } else {
            scheduleAction(
                window[scheduledAction.functionName],
                scheduledAction.startMilliseconds);
        }
    }
}

var initializationActions = new Array();

function addInitializationAction(action) {
    initializationActions.push(action);
}

function handleWindowLoad() {
    var nActions = initializationActions.length;
    for (var i = 0; i < nActions; ++i) {
        initializationActions[i]();
    }
}

// for example: addEventHandler(window, 'load', fixUpDocument);
function addEventHandler(o, eventName, handler) {
    if (o.addEventListener) {
        // not IE
        o.addEventListener(eventName, handler, false);
    } else {
        // IE
        o.attachEvent('on' + eventName, handler);
    }
}

// first event handlers will be run last
addEventHandler(window, 'load', handleWindowLoad);

//// or maybe it would be better to have a regular refresh
addEventHandler(window, 'resize', fixUpPositioning);

addInitializationAction(standardizeData);
addInitializationAction(applyElementProperties);
addInitializationAction(applyElementPositions);
addInitializationAction(fixUpPositioning);
addInitializationAction(applyElementEvents);
addInitializationAction(applyScheduledActions);
addInitializationAction(runActions);

