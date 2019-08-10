window.htmls = new Array(); /*TemplatePreload*/
if (!window.htmls['index.html']) {
    $.aj('./template/index.html', '', {
        success: function(m) {
            window.htmls['index.html'] = m;
        },
        failed: function(m) { /*Failed*/
            errshow();
        }
    }, 'get', '', true);
} /*TemplatePreloadFinished*/
setTimeout(function() {
    SC('t').style.opacity = 1;
    SC('b').style.opacity = 1;
}, 500);
var step = 1;
window.addEventListener('pjaxstart', function() { /*加载动画*/
    loadshow();
}, false);
window.addEventListener('pjaxfinish', function() {
    loadhide();
}, false);

function lc(v, t) {
    if (t == null || t == undefined) {
        return localStorage[v];
    } else {
        localStorage[v] = t;
    }
}
if (lc('githubuser') == undefined) { /*初始化本地储存*/
    lc('githubuser', '');
}
if (lc('githubrepo') == undefined) {
    lc('githubrepo', '');
}

function typer() {
    if (step == 1) {
        SC('b').style.marginTop = '500px';
        SC('b').style.opacity = 0;
        SC('f').style.marginTop = '0px';
        SC('n').value = lc('githubuser');
        setTimeout(function() {
            SC('b').style.marginTop = '0px';
            SC('b').style.top = 'auto';
            SC('b').style.bottom = '20px';
            SC('bt').value = 'Submit';
            SC('b').style.opacity = 100;
            listener();
        }, 1000);
        step += 1;
    } else if (step >= 2) {
        window.githubuser = document.getElementById('n').value;
        loadshow();
        blog.login(window.githubuser, document.getElementById('p').value, {
            success: function(m) {
                loadhide();
                SC('f').style.marginTop = '1000px';
                SC('b').style.opacity = 0;
                lc('githubuser', window.githubuser);
                setTimeout(function() {
                    PJAX.sel('container');
                    PJAX.jump('./check.html');
                }, 1000);
            },
            failed: function(m) {
                listener();
                notice('Login Failed');
                loadhide();
            }
        }); /*发送表单登录*/
        document.onkeydown = function() {
            return false;
        }
    }
}

function listener() { /*回车监听*/
    document.onkeydown = function(event) {
        var e = event || window.event;
        if (e && e.keyCode == 13) {
            typer();
        }
    };
}