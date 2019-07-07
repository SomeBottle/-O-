/*Scripts for Animation - SomeBottle*/
window.noticen = 0;

function rlen(t) {
	return t.length;
}

function notice(s) {
	window.noticen = parseInt(window.noticen) + 1;
	var nownt = window.noticen;
	var div = document.getElementById('nt');
	var h3 = document.createElement("h3");
	h3.id = 'n' + nownt;
	h3.className = 'n';
	h3.style.opacity = '0';
	h3.style.width = 2+20 * rlen(s) + 'px';
	div.appendChild(h3);
	document.getElementById('n' + nownt).innerHTML = s;
	document.getElementById('n' + nownt).style.display = 'block';
	document.getElementById('n' + nownt).style.top = 40 + 5 * (parseInt(window.noticen) - 1) + '%';
	var e = document.getElementById('n' + nownt);
	setTimeout(function() {
		e.style.opacity = '1';
	}, 200);
	setTimeout(function() {
		e.style.opacity = '0';
	}, 1700);
	setTimeout(function() {
		div.removeChild(h3);
		window.noticen = parseInt(window.noticen) - 1;
	}, 2200);
}

function errshow() {
	SC('err').style.opacity = 1;
	SC('err').style.zIndex = 100;
}

function errhide() {
	SC('err').style.opacity = 0;
	SC('err').style.zIndex = 0;
}

function loadshow() {
	SC('ld').style.opacity = 1;
	SC('ld').style.zIndex = 100;
}

function loadhide() {
	SC('ld').style.opacity = 0;
	SC('ld').style.zIndex = 0;
}