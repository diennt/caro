const boxSize = 30;
var mySign;
var myTurn;
var globalBoard;

var socket = io.connect('/');

socket.on("initialize", function (data) {
	mySign = data.mySign;
	myTurn = data.myTurn;
});

socket.on("serverPush", function (data) {
	board.playStep(data.i, data.j, data.sign);
	myTurn = true;
});

var Point = function (i, j) {
	this.x = i * boxSize;
	this.y = j * boxSize;
}

var Box = function (context, i, j) {
	const borderColor = "#403333", highlightColor = "#98FC03", 
				hoverColor = "#FC3903", oColor = "#0000FF",
				xColor = "#FF0000", margin = 4;

	var value = null;
	var startPoint = new Point(i, j);
	var endPoint = new Point(i + 1, j + 1);
	
	this.getValue = function () {
		return value;
	}

	this.setValue = function (val) {
		value = val;
	}

	this.draw = function (hover, highlight) {
		context.beginPath();
		context.clearRect(startPoint.x, startPoint.y, boxSize, boxSize);
		context.rect(startPoint.x, startPoint.y, boxSize, boxSize);
		if (hover || highlight) {
			context.strokeStyle = hoverColor;
		} else {
			context.strokeStyle = borderColor;
		}
		context.lineWidth = 1;
		context.stroke();
		context.closePath();
		if (value != undefined) {
			this.drawMove(highlight);
		}
	}

	this.drawMove = function(highlight) {
		context.beginPath();
		if (highlight === true) {
			context.fillStyle = highlightColor;
			context.fillRect(startPoint.x + 1, startPoint.y + 1, boxSize - 2, boxSize - 2);
		}
		if (value == 'x') {
			context.moveTo(startPoint.x + margin, startPoint.y + margin);
			context.lineTo(endPoint.x - margin, endPoint.y - margin);
			context.moveTo(startPoint.x + margin, endPoint.y - margin);
			context.lineTo(endPoint.x - margin, startPoint.y + margin);
			context.strokeStyle = xColor;
		} else {
			context.arc(startPoint.x + boxSize / 2, startPoint.y + boxSize / 2 , boxSize / 2 - margin, 0, 2 * Math.PI);
			context.strokeStyle = oColor;
		}
		context.lineWidth = 4;
		context.stroke();
		context.closePath();
	}
}

var Board = function (id) {
	board = this;
	const maxX = 30, maxY = 20;
	var canvas = document.getElementById(id);
	canvas.width = boxSize * maxX;
	canvas.height = boxSize * maxY;
	var context = canvas.getContext("2d");
	var lastMove = {i : -1, j: -1};
	var current = {i: -1, j : -1};

	var boxes = [];

	this.getBoxes = function () {
		return boxes;
	}

	this.draw = function () {
		for (var i = 0; i < maxX; i++) {
			boxes[i] = [];
			for (var j = 0; j < maxY; j++) {
				box = new Box(context, i, j);
				box.draw(false, false);
				boxes[i][j] = box;
			}
		}
	}

	function newStep (i, j, val) {
		var tmp = {i: lastMove.i, j: lastMove.j};
	
		lastMove.i = i;
		lastMove.j = j;
		if (tmp.i != -1 && tmp.j != -1) {
			boxes[tmp.i][tmp.j].draw();
		}

		boxes[i][j].setValue(val);
		boxes[i][j].draw(false, true);
	}

	this.playStep = newStep;

	canvas.addEventListener('mousedown', function (e) {
		var mouse = getMousePosition(this, e);

		if (mouse.x != undefined && mouse.y != undefined && myTurn) {
			var i = Math.floor(mouse.x / boxSize);
			var j = Math.floor(mouse.y / boxSize);
			if (boxes[i][j].getValue() == undefined) {
				newStep(i, j, mySign);
				myTurn = false;
				socket.emit("clientPush", {i: i, j: j, sign: mySign});
			}
		}
	});

	canvas.addEventListener('mousemove', function (e) {
		var mouse = getMousePosition(this, e);

		if (mouse.x != undefined && mouse.y != undefined) {
			var i = Math.floor(mouse.x / boxSize);
			var j = Math.floor(mouse.y / boxSize);
			var tmp = {i: current.i, j: current.j};
			current.i = i;
			current.j = j;

			if (current.i != tmp.i || current.j != tmp.j) {
				if (tmp.i != -1 && tmp.j != -1) {
					if (tmp.i == lastMove.i && tmp.j == lastMove.j) {
						boxes[tmp.i][tmp.j].draw(false, true);
					} else {
						boxes[tmp.i][tmp.j].draw(false, false);
					}
				}
				
				if (current.i == lastMove.i && current.j == lastMove.j) {
					boxes[current.i][current.j].draw(true, true);
				} else {
					boxes[current.i][current.j].draw(true, false);
				}
			}
		}
	});

	function getMousePosition(canvas, e) {
		var xPos = e.clientX;
		var yPos = e.clientY;
		var rect = canvas.getBoundingClientRect();

		return {
			x: xPos - rect.left,
			y: yPos - rect.top
		}
	}
}
