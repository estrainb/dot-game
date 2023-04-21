var turn = 1;
var currentSelectedNode = new Object();
var countTotalConnections = 0;
var firstNode = new Object();
var lastNode = new Object();
var existingPoints = [];
var originNode = "";

var firstAvailablePoints = [];
var lastAvailablePoints = [];

function processIncomingRequest(request) {
    let incomingMesage = request.msg;
    let incomingBody = request.body;

    if (incomingMesage == "INITIALIZE") {
        return processInitialize();
    } else if (incomingMesage == "NODE_CLICKED") {
        return processNodeClicked(incomingBody);
    } else {
        throw new Exception("Error!" + incomingMesage);
    }
}

function processInitialize() {
    var outgoing = new Object();
    outgoing.msg = "INITIALIZE";
    outgoing.body = new Object();
    outgoing.body.newLine = null;
    outgoing.body.heading = "Player 1";
    outgoing.body.message = "";
    turn = 1;

    currentSelectedNode = null;
    return outgoing;
}

function processNodeClicked(body) {
    var outgoing = new Object();
    outgoing.body = new Object();

    if (currentSelectedNode == null) {
        //In case the selected node is start point
        if (countTotalConnections < 1) {
            //When the line starts
            outgoing.msg = "VALID_START_NODE";
            outgoing.body.newLine = null;
            outgoing.body.heading = "Player " + turn;
            outgoing.body.message = "";
            currentSelectedNode = body;
        } else if ((body.x == firstNode.x) && (body.y == firstNode.y) || (body.x == lastNode.x) && (body.y == lastNode.y)) {
            originNode = (body.x == firstNode.x) && (body.y == firstNode.y) ? "first" : "last";

            outgoing.msg = "VALID_START_NODE";
            outgoing.body.newLine = null;
            outgoing.body.heading = "Player " + turn;
            outgoing.body.message = "";
            currentSelectedNode = body;
        } else {
            outgoing.msg = "INVALID_END_NODE";
            outgoing.body.newLine = null;
            outgoing.body.heading = "Player " + turn;
            outgoing.body.message = "Not a valid starting position.";
            currentSelectedNode = null;
        }
    } else if (body.x == currentSelectedNode.x && body.y == currentSelectedNode.y) {
        //In case the selected node is same with the start point
        outgoing.msg = "INVALID_START_NODE";
        outgoing.body.newLine = null;
        outgoing.body.heading = "Player " + turn;
        outgoing.body.message = "Invalid move. Try again.";
        currentSelectedNode = null;
    } else if (checkLineDirection(currentSelectedNode, body)) {
        var intermediatePoint = getIntermediatePoint(currentSelectedNode, body);
        if (containsPoint(intermediatePoint)) {
            outgoing.msg = "INVALID_END_NODE";
            outgoing.body.newLine = null;
            outgoing.body.heading = "Player " + turn;
            outgoing.body.message = "Invalid move. Try again.";
            currentSelectedNode = null;
        } else {
            if (existingPoints.length == 0) {
                existingPoints.push(currentSelectedNode);
            }
            countTotalConnections++;
            if (countTotalConnections == 1) {
                firstNode = currentSelectedNode;
            }
            if (originNode == "first") {
                firstNode = body;
            } else {
                lastNode = body;
            }
            existingPoints.push(intermediatePoint, body);
            turn = (turn % 2) + 1;

            if (checkWinner()) {
                outgoing.msg = "GAME_OVER";
                outgoing.body.newLine = getLine(currentSelectedNode, body);;
                outgoing.body.heading = "Game Over";
                outgoing.body.message = "Player " + turn + " wins!";
                currentSelectedNode = null;
            } else {
                outgoing.msg = "VALID_END_NODE";
                outgoing.body.newLine = getLine(currentSelectedNode, body);;
                outgoing.body.heading = "Player " + turn;
                outgoing.body.message = "";
                currentSelectedNode = null;
            }           
        }
    } else {
        outgoing.msg = "INVALID_END_NODE";
        outgoing.body.newLine = null;
        outgoing.body.heading = "Player " + turn;
        outgoing.body.message = "Invalid move. Try again.";
        currentSelectedNode = null;
    }

    return outgoing;
}

function checkLineDirection(start, end) {
    var diffX = Math.abs(start.x - end.x);
    var diffY = Math.abs(start.y - end.y);

    // In case the selected point is already in the line
    if (containsPoint(end)) {
        return false;
    }

    //In case the selected line direction is not 90, 0, 45 degree
    if (diffX / diffY !== Infinity && diffX / diffY !== 0 && diffX / diffY !== 1) {
        return false;
    }

    return true;
}

function containsPoint(toCheck) {

    for (let i = 0; i < existingPoints.length; i++) {

        var p = existingPoints[i];
        if (p.x == toCheck.x && p.y == toCheck.y) {
            return true;
        }

    }
    return false;

}

function getIntermediatePoint(start, end) {
    var intermediateX = (start.x + end.x) / 2;
    var intermediateY = (start.y + end.y) / 2;
    return { x: intermediateX, y: intermediateY };
}

function getLine(start, end) {
    var newLine = new Object();
    newLine.start = start;
    newLine.end = end;

    return newLine;
};

function checkWinner() {
    if (firstNode.x + 1 <= 3) firstAvailablePoints.push({x: firstNode.x + 1, y: firstNode.y});
    if (firstNode.x + 1 <= 3 && firstNode.y + 1 <= 3) firstAvailablePoints.push({x: firstNode.x + 1, y: firstNode.y + 1});    
    if (firstNode.y + 1 <= 3) firstAvailablePoints.push({x: firstNode.x, y: firstNode.y + 1});
    if (firstNode.x - 1 >= 0 && firstNode.y + 1 <= 3) firstAvailablePoints.push({x: firstNode.x - 1, y: firstNode.y + 1});
    if (firstNode.x - 1 >= 0) firstAvailablePoints.push({x: firstNode.x - 1, y: firstNode.y});
    if (firstNode.x - 1 >= 0 && firstNode.y - 1 >= 0) firstAvailablePoints.push({x: firstNode.x - 1, y: firstNode.y - 1});
    if (firstNode.y - 1 >= 0) firstAvailablePoints.push({x: firstNode.x, y: firstNode.y - 1});
    if (firstNode.x + 1 <= 3 && firstNode.y - 1 >= 0) firstAvailablePoints.push({x: firstNode.x + 1, y: firstNode.y - 1});

    if (lastNode.x + 1 <= 3) lastAvailablePoints.push({x: lastNode.x + 1, y: lastNode.y});
    if (lastNode.x + 1 <= 3 && lastNode.y + 1 <= 3) lastAvailablePoints.push({x: lastNode.x + 1, y: lastNode.y + 1});    
    if (lastNode.y + 1 <= 3) lastAvailablePoints.push({x: lastNode.x, y: lastNode.y + 1});
    if (lastNode.x - 1 >= 0 && lastNode.y + 1 <= 3) lastAvailablePoints.push({x: lastNode.x - 1, y: lastNode.y + 1});
    if (lastNode.x - 1 >= 0) lastAvailablePoints.push({x: lastNode.x - 1, y: lastNode.y});
    if (lastNode.x - 1 >= 0 && lastNode.y - 1 >= 0) lastAvailablePoints.push({x: lastNode.x - 1, y: lastNode.y - 1});
    if (lastNode.y - 1 >= 0) lastAvailablePoints.push({x: lastNode.x, y: lastNode.y - 1});
    if (lastNode.x + 1 <= 3 && lastNode.y - 1 >= 0) lastAvailablePoints.push({x: lastNode.x + 1, y: lastNode.y - 1});

    var firstLength = firstAvailablePoints.length;
    var lastLength = lastAvailablePoints.length;

    for (let i = 0; i < firstAvailablePoints.length; i++) {
        if (containsPoint(firstAvailablePoints[i])) firstLength--;
    }

    for (let i = 0; i < lastAvailablePoints.length; i++) {
        if (containsPoint(lastAvailablePoints[i])) lastLength--;
    }

    if (firstLength == 0 && lastLength == 0) {
        return true;
    }

    firstAvailablePoints = [];
    lastAvailablePoints = [];

    return false;
} 
