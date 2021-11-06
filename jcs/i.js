/*Initialization - SomeBottle*/
"use strict";
$bueue.de(true);

function typer() { /*重定义typer*/
    var repo = SC('r').value;
    if ($.ce(repo)) {
        window.githubrepo = SC('r').value;
        loadshow();
        blog.getrepo(window.accesstoken, repo, true, {
            success: function (m) {
                loadhide();
                SC('f').style.marginTop = '1000px';
                setTimeout(initialcheck, 1000);
                lc('githubrepo', window.githubrepo);
            },
            failed: function (m) {
                listener();
                notice('No Such Repo.');
                loadhide();
            }
        });
        document.onkeydown = function () {
            return true;
        }
    }
}

function initialcheck() { /*检查是否初始化*/
    loadshow();
    var j, mj, pi;
    new Promise(function (res, rej) {
        console.log('Trying to get templatejson from the remote repo.');
        blog.getfile(window.accesstoken, window.githubrepo, 'template.json', true, { /*获得仓库模板内容*/
            success: function (k) {
                j = Base64.decode(k['content']);
                window.tjson = j;
                mj = JSON.parse(j);
                res(k);
            },
            failed: function (m) { /*未初始化*/
                console.log('No template.json in the remote repo.');
                $.ft('./template/template.json', {}, { /*获得本地模板内容*/
                    success: function (k) {
                        window.tjson = JSON.parse(k); /*储存模板json*/
                        initialization();
                    },
                    failed: function (k) {
                        notice('Initialization Failed.');
                    }
                }, 'get', '');
            }
        });
    }).then(function (d) {
        return new Promise(function (res, rej) {
            blog.getfile(window.accesstoken, window.githubrepo, mj['templatehtmls']['postitem'], true, { /*获得postitem模板内容*/
                success: function (k) {
                    pi = Base64.decode(k['content']);
                    window.htmls['postitem.html'] = pi;
                    res(k);
                },
                failed: function (k) {
                    notice('Failed to get Necessary Template.');
                    loadhide();
                    errshow();
                }
            });
        });
    }).then(function (d) {
        return new Promise(function (res, rej) { /*check main.json*/
            blog.getfileshas(window.accesstoken, window.githubrepo, true, {
                success: function (m) { /*已经初始化*/
                    window.fileshas = m;
                    let mainJsonSha = blog.findfilesha(mj['mainjson']);
                    console.log('mainJsonSha: ' + mainJsonSha);
                    if (mainJsonSha) {
                        res(mainJsonSha);/*返回MainJson的sha值*/
                    } else {
                        notice('Retrying to get file shas.');
                        window.test += 1;
                        rej('failed');
                    }
                },
                failed: function (msg) {
                    notice('Failed to get file shas.');
                    loadhide();
                    errshow();
                }
            });
        });
    }).catch(e => {
        initialcheck();
        throw 'failed, retrying';
    }).then(function (d) {
        blog.getfileblob(window.accesstoken, window.githubrepo, d, true, {
            success: function (m) { /*已经初始化*/
                window.mainjson = m;
                loadhide();
                PJAX.jump('editor.html'); /*Jump*/
            },
            failed: function (msg) {
                notice('Failed to get Main.json.');
                loadhide();
                errshow();
            }
        });
    })
    notice('Checking...');
}

function initialization() { /*初始化*/
    if (confirm('即将帮您初始化博客，是否继续？\nReady for initialization, please confirm to continue.')) {
        notice('Initializing...');
        var tm = window.tjson['alltp'], treeconstruct = [];
        for (var it in tm) {
            console.log('file:' + tm[it]);
            (function (tmt) {
                $bueue.c(function () {
                    $.ft('./template/' + tmt, {}, {
                        success: function (m) {
                            notice(tmt);
                            blog.cr(window.accesstoken, window.githubrepo, m, {
                                success: function (f) {
                                    treeconstruct.push({
                                        "path": tmt,
                                        "mode": "100644",
                                        "type": "blob",
                                        "sha": f.sha
                                    });
                                    $bueue.next();
                                },
                                failed: function (m) {
                                    notice('初始化出错', true);
                                    notice('请删除template.json.');
                                    notice('重新初始化.');
                                    errshow();
                                }
                            });
                        },
                        failed: function (m) {
                            notice('初始化出错', true);
                            notice('请删除template.json.');
                            notice('重新初始化.');
                            errshow();
                        }
                    }, 'get', '');
                });
            })(tm[it]); /*闭包传参，终于解决了！>A<*/
            /*添加队列*/
        }
        $bueue.c(() => { notice("All template blobs have been made"); });
        $bueue.start(); /*队列启动*/
        var checkt = setInterval(function () {
            if ($bueue.state == 3 && window.gstate <= 0) {
                blog.gpush(window.accesstoken, window.githubrepo, treeconstruct, "Initial commit of -O-", {
                    success: (m) => {
                        notice('Finished');
                        notice('五秒后将刷新页面');
                        SC('t').style.opacity = 0;
                        setTimeout(function () {
                            location.reload();
                        }, 5000);
                        loadhide();
                        clearInterval(checkt);
                    }, failed: (m) => {
                        notice("Commit提交失败", true);
                        errshow();
                    }
                });/*push commit*/
            }
        }, 1000);
    } else {
        alert('如果想好了，刷新页面初始化吧！');
    }
}