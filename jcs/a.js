/*Scripts for Animation - SomeBottle*/
"use strict";
function aniChecker(element, func, transition = false) { /*css3动画检查器(元素,执行完毕执行的函数,是否检查的是transition)*/
    let chosenTester = '', testers = transition ?
        {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        } : {
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
function wear(element, style) { //(元素,样式)
    Object.keys(style).forEach(i => {
        element.style[i] = style[i];
    });
}
function notice(msg, pop = false) {//(消息，是否弹窗警示) 2022.1.18重写
    if (pop) alert(msg);
    let div = document.getElementById('noticeWrapper'),
        wrapped = document.createElement("h3");
    wrapped.innerHTML = msg;
    div.appendChild(wrapped);
    wrapped.style.animation = "playNotice 3s ease 1";
    ((element) => {
        aniChecker(element, () => {
            div.removeChild(element);
        })
    })(wrapped);
}

function errShow() {
    SC('err').style.opacity = 1;
    SC('err').style.zIndex = 100;
}

function errHide() {
    SC('err').style.opacity = 0;
    SC('err').style.zIndex = 0;
}

function loadShow() {
    SC('ld').style.opacity = 1;
    SC('ld').style.zIndex = 100;
}

function loadHide() {
    SC('ld').style.opacity = 0;
    SC('ld').style.zIndex = 0;
}