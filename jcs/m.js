"use strict";
const barnDir = 'barn/'; // 博客核心文件相对目录，请不要修改
var step = 1;
window.htmls = new Array(); /*TemplatePreload*/

function lc(v, t) {
    if (t == null || t == undefined) {
        return localStorage[v];
    } else {
        localStorage[v] = t;
    }
}

function typer() {
    if (step == 1) {
        let code = lc('secretcode'), btnElems = SC('b');
        if ($.notEmpty(code)) {
            SC('n').style.display = 'none';
        }
        wear(btnElems, {
            'margin-top': '500px',
            'opacity': 0
        });
        SC('f').style.display = 'block';
        aniChecker(btnElems, () => {
            wear(btnElems, {
                'margin-top': '0px',
                'opacity': 1,
                'top': 'auto',
                'bottom': '20px'
            });
            SC('bt').value = '→';
            SC('f').style.marginTop = '0px';
            listener();
        }, true);
        step += 1;
    } else if (step >= 2) {/*get/set tokencode*/
        let pass = SC('p').value, code = lc('secretcode'), token, tokenInput = SC('n').value;
        if ($.notEmpty(pass)) {
            if ($.notEmpty(code)) {
                token = $.crypt(code, pass, true);// RC4加密
            } else if ($.notEmpty(tokenInput)) {
                token = tokenInput;
                lc('secretcode', $.crypt(token, pass));
            }
        } else {
            notice('请输入密码');
            return false;
        }
        loadShow();
        window.blog = new gh(token); // 初始化github部分
        blog.getUsr().then(res => {
            PJAX.sel('container');
            PJAX.jump('./check.html');
            loadHide();
        }, rej => {
            SC('n').style.display = 'block';/*弹出token键入框*/
            notice('请检查token是否正确');
            lc('secretcode', ''); // 清除本地储存的token
            loadHide();
        });
    }
}

function listener() { /*回车监听*/
    document.onkeydown = function (event) {
        if (event.key == 'Enter') {
            typer();
        }
    };
}

if (!lc('secretcode')) {/*初始化本地储存*/
    lc('secretcode', '');
}
if (!lc('githubrepo')) {/*初始化本地储存*/
    lc('githubrepo', '');
}

if (!window.htmls['index']) {
    $.ft('./template/index.html')
        .then(resp => resp.text(), rej => {
            errShow();
            throw 'Failed to get the template: ' + rej;
        })
        .then(resp => {
            window.htmls['index'] = resp;
        });
}
/*TemplatePreloadFinished*/
setTimeout(function () {
    SC('t').style.opacity = 1;
    SC('b').style.opacity = 1;
}, 500);
window.addEventListener('pjaxstart', function () { /*加载动画*/
    loadShow();
}, false);
window.addEventListener('pjaxfinish', function () {
    loadHide();
}, false);
