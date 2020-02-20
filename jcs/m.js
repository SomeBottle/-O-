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
if (lc('secretcode') == undefined) {/*初始化本地储存*/
    lc('secretcode', '');
}
if (lc('githubrepo') == undefined) {/*初始化本地储存*/
    lc('githubrepo', '');
}

function typer() {
    if (step == 1) {
		var code=lc('secretcode');
		if(code!==''){
			SC('n').style.display='none';
		}
        SC('b').style.marginTop = '500px';
        SC('b').style.opacity = 0;
        SC('f').style.marginTop = '0px';
        setTimeout(function() {
            SC('b').style.marginTop = '0px';
            SC('b').style.top = 'auto';
            SC('b').style.bottom = '20px';
            SC('bt').value = 'Get';
            SC('b').style.opacity = 100;
            listener();
        }, 1000);
        step += 1;
    } else if (step >= 2) {/*get/set tokencode*/
		var pass=SC('p').value,code=lc('secretcode'),token;
        if(code!==''){
			token=blog.crypt(code,pass,true);
		}else{
			token=SC('n').value,
			lc('secretcode', blog.crypt(token,pass));
		}
		if(code!==''&&$.ce(pass)||code==''&&$.ce(pass)&&$.ce(token)){
		window.accesstoken=token;
		blog.getusr(window.accesstoken,true,{
			success:function(){
				PJAX.sel('container');
                PJAX.jump('./check.html');
			},failed:function(){
				SC('n').style.display='block';/*弹出token键入框*/
				notice('请检查token是否正确');
				lc('secretcode','');
			}
		});
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