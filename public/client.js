// Przygotuj Main canvas
var canvasMain = document.getElementById("canvas_main");
var ctxm = canvasMain.getContext("2d");
ctxm.fillStyle = "white";
ctxm.fillRect(0, 0, canvasMain.width, canvasMain.height);

// Settings object
var settings = {brush: 3, mode: "d", size: 0};

// Init page
var btnD = document.getElementById("btn_d")
btnD.onclick = function () {
	settings.mode = "d";
}

var btnR = document.getElementById("btn_r")
btnR.onclick = function () {
	settings.mode = "r";
}

var btnC = document.getElementById("btn_c")
btnC.onclick = function () {
	ctxm.fillStyle = "white";
	ctxm.fillRect(0, 0, canvasMain.width, canvasMain.height);
}

var slider = document.getElementById("size");
slider.oninput = function () {
	setSize();
}

slider.onchange = function () {
	setCanvas();
}

// Set initial values, objects, etc.
setSize();
setCanvas();

// Standalone functions
function setSize() {
	settings.size = slider.value;
	document.getElementById("value").textContent = slider.value;
}

function setCanvas() {
	var size = canvasMain.width;
	var realSize = size * settings.size + "px";
	document.getElementById("container").style.width = realSize;
	canvasMain.style.width = realSize;
	canvasMain.style.height = realSize;
}

// Czas na rysowanko
var mouseFlag = 0;
var mX, mY;
var interval;
canvasMain.onmousedown = function (e) {
	mouseFlag = 1;
	ctxm.beginPath();
	ctxm.lineWidth = 3;
	ctxm.moveTo(e.offsetX / settings.size, e.offsetY / settings.size);
	interval = setInterval(sendData, 1000);
};

canvasMain.onmouseup = function () {
	clearInterval(interval);
	ctxm.stroke();
	ctxm.closePath();
	mouseFlag = 0;
	sendData();
};

canvasMain.onmousemove = function (e) {
	if (mouseFlag === 1) {
		if (settings.mode === "d") {
			ctxm.fillStyle = "black";
			//ctxm.fillRect(e.offsetX / settings.size, e.offsetY / settings.size, settings.brush, settings.brush);
			ctxm.strokeStyle = "black";
			ctxm.lineTo(e.offsetX / settings.size, e.offsetY / settings.size);
			ctxm.stroke();
			ctxm.moveTo(e.offsetX / settings.size, e.offsetY / settings.size);
		}
		else if (settings.mode === "r") {
			ctxm.fillStyle = "white";
			ctxm.fillRect(e.offsetX / settings.size, e.offsetY / settings.size, settings.brush, settings.brush);
		}
	}
};

function prepareCanvasData(canvas) {
	var data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
	var preparedData = new Uint8Array(56 * 56);
	for(var i = 0; i < preparedData.length; ++i) {
		preparedData[i] = data[i*4] < 128 ? 0 : 1;
	}
	return preparedData;
}

function sendData() {
	var data = prepareCanvasData(canvasMain);
	var request = new XMLHttpRequest();
	request.open("POST", "predict", true);
	request.setRequestHeader("Content-Type", "application/octet-stream");
	request.send(data);
	request.onload = function() {
		var val = document.getElementById("res");
		val.textContent = request.responseText;
	};
}
