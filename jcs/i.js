/*Initialization - SomeBottle*/
$bueue.de(true);

function typer() { /*重定义typer*/
    var repo = SC('r').value;
    window.githubrepo = SC('r').value;
    loadshow();
    blog.getrepo(window.githubuser, repo, true, {
        success: function(m) {
            loadhide();
            SC('f').style.marginTop = '1000px';
            setTimeout(initialcheck, 1000);
            lc('githubrepo', window.githubrepo);
        },
        failed: function(m) {
            listener();
            notice('No Such Repo.');
            loadhide();
        }
    });
    document.onkeydown = function() {
        return true;
    }
}

function initialcheck() { /*检查是否初始化*/
    loadshow();
    blog.getfile(window.githubuser, window.githubrepo, 'main.json', true, {
        success: function(m) { /*已经初始化*/
            window.mainjson = m;
            if (!window.tjson) {
                blog.getfile(window.githubuser, window.githubrepo, 'template.json', true, { /*获得仓库模板内容*/
                    success: function(k) {
                        var j = Base64.decode(k['content']);
                        window.tjson = j;
                        loadhide();
                        PJAX.jump('editor.html');
                    },
                    failed: function(k) {
                        notice('Failed to get Templates.');
                        loadhide();
                        errshow();
                    }
                });
            } else {
                loadhide();
                PJAX.jump('editor.html'); /*Jump*/
            }
        },
        failed: function(m) {
            $.aj('./template/template.json', {}, { /*获得本地模板内容*/
                success: function(k) {
                    window.tjson = JSON.parse(k); /*储存模板json*/
                    initialization();
                },
                failed: function(k) {
                    notice('Initialize Failed.');
                }
            }, 'get', '', true);
        }
    });
    notice('Checking...');
}

function initialization() { /*初始化*/
    if (confirm('即将帮您初始化博客，是否继续？\nReady for initialization, please confirm to continue.')) {
        notice('Initializing...');
        var tm = window.tjson['alltp'];
        for (var it in tm) {
            console.log('file:' + tm[it]);
            /*$bueue.c(function() {
	$.aj('./template/' + tm[it], {}, {
		success: function(m) {
			notice(tm[it]);
			blog.cr(window.githubuser, window.githubrepo, tm[it], 'Initial Commit', m, {
				success: function(f) {
					$bueue.next();
				},
				failed:function(m){
					notice('初始化出错');notice('请删除main.json.');notice('重新初始化.');errshow();
				}
			});
		},
		failed: function(m) {
			notice('初始化出错');
			notice('请删除main.json.');
			notice('重新初始化.');
			errshow();
		}
	}, 'get', '', true);
});*/
            eval("$bueue.c(function(){$.aj('./template/" + tm[it] + "',{},{success:function(m){notice('" + tm[it] + "');blog.cr(window.githubuser,window.githubrepo,'" + tm[it] + "','Initial Commit',m,{success:function(f){$bueue.next()},failed:function(m){notice('初始化出错');notice('请删除main.json.');notice('重新初始化.');errshow();}})},failed:function(m){notice('初始化出错');notice('请删除main.json.');notice('重新初始化.');errshow()}},'get','',true)});"); /*添加队列*/
        }
        $bueue.start(); /*队列启动*/
        var checkt = setInterval(function() {
            if ($bueue.state == 3 && window.gstate <= 0) {
                notice('Finished');
                notice('三秒后将刷新页面');
                SC('t').style.opacity = 0;
                setTimeout(function() {
                    location.reload();
                },
                3000);
                loadhide();
                clearInterval(checkt);
            }
        },
        1000);
    } else {
        alert('如果想好了，刷新页面初始化吧！');
    }
}