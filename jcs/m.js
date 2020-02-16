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
if (lc('workerpass') == undefined) { /*初始化本地储存*/
    lc('workerpass', '');
}
if (lc('githubrepo') == undefined) {
    lc('githubrepo', '');
}

function typer() {
    if (step == 1) {
        SC('b').style.marginTop = '500px';
        SC('b').style.opacity = 0;
        SC('f').style.marginTop = '0px';
        SC('n').value = lc('workerpass');
        setTimeout(function() {
            SC('b').style.marginTop = '0px';
            SC('b').style.top = 'auto';
            SC('b').style.bottom = '20px';
            SC('bt').value = 'Get';
            SC('b').style.opacity = 100;
            listener();
        }, 1000);
        step += 1;
    } else if (step >= 2) {
        window.workerpass = document.getElementById('n').value;
        loadshow();
        blog.login(window.workerpass, {
            success: function(m) {
                var code = Number(m.code);
                if (code == 1) {
                    window.accesstoken = Base64.decode(m.data.access_token);
					SC('f').style.marginTop = '1000px';
                    SC('b').style.opacity = 0;
                    notice('成功获得accesstoken');
                    lc('workerpass', window.workerpass);
                    setTimeout(function() {
                        PJAX.sel('container');
                        PJAX.jump('./check.html');
                    }, 1000);
                } else {
                    notice('获取accesstoken失败，请重试');
                }
                listener();
                loadhide();
            },
            failed: function(m) {
                listener();
                notice('Login Failed');
                loadhide();
            }
        }); /*发送表单登录*/
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