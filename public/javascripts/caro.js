// Define caro map variables
var boxWidth = 30;
var boxHeight = 30;

// Point Object
var Point = function (i, j) {
	var xPos = i * boxWidth;
	var yPos = j * boxHeight;

	return {
		xPos: xPos,
		yPos: yPos,
	}
}

var Box = function (drawer, i, j) {
	var p1 = new Point(i, j);
	var p2 = new Point(i + 1, j + 1);
	var margin = 3;
	var val;

	return {
		i: i,
		j: j,
		val: val,
		draw: function () {
			drawer.beginPath();
			drawer.moveTo(p1.xPos, p1.yPos);
			drawer.lineTo(p1.xPos, p2.yPos);
			drawer.lineTo(p2.xPos, p2.yPos);
			drawer.lineTo(p2.xPos, p1.yPos);
			drawer.lineTo(p1.xPos, p1.yPos);
			drawer.stroke();
			drawer.closePath();
		},
		drawWithX: function(val) {
			drawer.beginPath();
			drawer.moveTo(p1.xPos + margin, p1.yPos + margin);
			drawer.lineTo(p2.xPos - margin, p2.yPos - margin);
			drawer.moveTo(p1.xPos + margin, p2.yPos - margin);
			drawer.lineTo(p2.xPos - margin, p1.yPos + margin);
			drawer.stroke();
			this.val = val;
			drawer.closePath();
		},
		drawWithO: function() {

		}
	};
}

var Map = function (canvasId) {
	var canvas = $('#' + canvasId).get(0);
	canvas.width = 750;
	canvas.height = 600;
	var drawer = canvas.getContext("2d");
	var boxes = [];	
	var maxX = 25;
	var maxY = 20;

	canvas.addEventListener('mousedown', function(e) {
		var mouseX, mouseY;
		if (e.offsetX && e.offsetY) {
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		} else if (e.layerX && e.layerY) {
			mouseX = e.layerX;
			mouseY = e.layerY;
		}

		if (mouseX != undefined && mouseY != undefined) {
			var a = Math.round(mouseX / boxWidth);
			var b = Math.round(mouseY / boxHeight);
			boxes[a][b].drawWithX('x');
			console.log(boxes[a][b].val);
		}

	});

	var drawMap = function () {
		drawer.moveTo(0,0);
		for (var i = 0; i < maxX; i++) {
			boxes[i] = [];
			for (var j = 0; j < maxY; j++) {
				var box = new Box(drawer, i, j);
				box.draw();
				boxes[i][j] = box;
			}
		}
	}

	drawMap();

	return {
		boses: boxes,
		drawMap: drawMap
	};
}

$(function() {
	var map = new Map('caroCanvas');
});