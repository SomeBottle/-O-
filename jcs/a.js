/*Scripts for Animation - SomeBottle*/
"use strict";
window.noticen = 0;

function rlen(t) {
    return t.length;
}

function anichecker(element, func) { /*css3变换检查器(元素,执行完毕执行的函数)*/
    let chosenTester = '', testers = {
        'animation': 'animationend',
        'OAnimation': 'oAnimationEnd',
        'MozAnimation': 'animationend',
        'WebkitAnimation': 'webkitAnimationEnd'
    }; /*兼容多浏览器*/
    for (var i in testers) {
        if (element.style[i] !== undefined) {
            chosenTester = testers[i];
        }
    }
    function callBack() {
        element.removeEventListener(chosenTester, callBack);
        func();
    }
    element.addEventListener(chosenTester, callBack);
}

function notice(s, pop = false) { /*(消息，是否弹窗警示)*/
    window.noticen = parseInt(window.noticen) + 1;
    var nownt = window.noticen;
    var div = document.getElementById('nt');
    var h3 = document.createElement("h3");
    h3.id = 'n' + nownt;
    h3.className = 'n';
    h3.style.opacity = '0';
    h3.style.width = 2 + 20 * rlen(s) + 'px';
    div.appendChild(h3);
    document.getElementById('n' + nownt).innerHTML = s;
    document.getElementById('n' + nownt).style.display = 'block';
    document.getElementById('n' + nownt).style.top = 40 + 5 * (parseInt(window.noticen) - 1) + '%';
    var e = document.getElementById('n' + nownt);
    if (pop) alert(s); /*弹窗警示*/
    e.style.opacity = '0';
    e.style.animation = "playnotice 3s linear 1";
    anichecker(e, () => {
        div.removeChild(h3);
        window.noticen = parseInt(window.noticen) - 1;
    });
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