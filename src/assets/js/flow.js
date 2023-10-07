var colorList;
var count;
$(function () {
	count = 3;
	loadFlow(count);
	checkColor(colorList);
})

function methodBtn(index, method, end) {
	var fFor;
	if (end != true) {
		if (method == "back") {
			if (index == 1) {
				fFor = ".for" + String.fromCharCode(index + 65);
			} else {
				fFor = ".for" + String.fromCharCode(index + 64);
			}
			$(fFor).removeClass("for-cur");
			loadFlowDiv(index - 1);
			checkColor("default");
		} else if (method == "forward") {
			fFor = ".for" + String.fromCharCode(index + 65);
			$(fFor).addClass("for-cur");
			loadFlowDiv(index + 1);
			checkColor(colorList);
		}
	} else if (end == true) {}
}

function checkColor(color) {
	if (color != "default") {
		$(".flowList.for-cur").css({
			"border": "2px solid #338ff8"
		});
		$(".flowList.for-cur,.flowListBox .for-cur em").css({
			"background-color": "#338ff8"
		});
		$(".flowListBox .for-cur em").css({
			"border": "0px none #000"
		});
	} else {
		$this = $('.flowList:not(.for-cur)');
		$this.css({
			"border": "2px solid #ccc",
			"background-color": "#ccc"
		});
		$this.children("em").css({
			"background-color": "#ccc"
		});
	}
	var obj = $('.for-cur:last');
	obj.css({
		"border": "2px solid #34495e",
		"background-color": "#34495e"
	});
	obj.children("em").css({
		"background-color": "#34495e"
	});
}

function fixWidth(count) {
	var part = parseInt(100 / count) + "%";
	$(".flowListBox .flowList").css("width", part);
}

function loadFlow(count) {
	var flowFor;
	var flowVar = "";
	for (var i = 1; i <= count; i++) {
		flowFor = "for" + String.fromCharCode(i + 64);
		if (i == 1) {
			flowVar += "<div class='flowList for-cur " + flowFor + "' style='position:relative'>\n";
			flowVar += "	<em style='position:absolute;left:45%'>" + i + "</em><br/>\n";
			flowVar += "</div>\n";
		} else {
			flowVar += "<div class='flowList " + flowFor + "' style='position:relative'>\n";
			flowVar += "	<em style='position:absolute;left:45%'>" + i + "</em><br/>\n";
			flowVar += "</div>\n";
		}
	}
	$(".flowListBox").html(flowVar);
	fixWidth(count);
	loadFlowDiv(1);
	checkBtn(1, count);
}

function loadFlowDiv(index) {
	if (index == 1) {
		$("#contA").removeClass("contentList");
		$("#contA").siblings().addClass("contentList")
	}
	if (index == 2) {
		$("#contB").removeClass("contentList");
		$("#contB").siblings().addClass("contentList")
	}
	if (index == 3) {
		$("#contC").removeClass("contentList");
		$("#contC").siblings().addClass("contentList")
	}
	if (index == 4) {
		$("#contD").removeClass("contentList");
		$("#contD").siblings().addClass("contentList")
	}
}
var maxstep = 1;

function checkBtn(index, count) {
	$("#btnBack").addClass("disabled");
	$("#btnBack").hide();
	$("#btnNext").click(function () {
		methodBtn(index++, 'forward', false);
		if (index > maxstep) {
			maxstep = index;
		}
		if (index != 1) {
			$("#btnBack").removeClass("disabled");
			$("#btnBack").show();
		}
		if (index >= count) {
			$("#btnNext").hide();
			$("#btnBack").show();
			$("#btnok").show();
		}
		refreshBack(index);
	});
	$("#btnBack").click(function () {
		if (refreshBack(index) > 1) {
			methodBtn(index--, 'back', false);
			$("#btnNext").show();
			if (index == 1) {
				$("#btnBack").addClass("disabled");
			}
		}
	});
}

function refreshBack(index) {
	return index;
}
