/*Initialization - SomeBottle*/
"use strict";
$bueue.de(true);
$bueue.re(true); // 清空队列

function typer() { /*重定义typer*/
    let repo = SC('r').value;
    if ($.notEmpty(repo)) {
        window.githubRepo = repo;// 在window对象上注册githubRepo
        loadShow();
        blog.getRepo(repo).then(data => { // 能抓取到仓库信息，说明仓库存在
            loadHide();
            SC('f').style.marginTop = '1000px';
            SC('bt').style.opacity = 0;
            setTimeout(initialCheck, 1000);
            lc('githubrepo', repo);
        }, rej => { // 抓取不到仓库信息，说明仓库不存在
            listener();
            notice('No Such Repo.');
            loadHide();
        });
        document.onkeydown = function () {
            return true;
        }
    }
}

function initialCheck() { /*检查是否初始化*/
    let tj, parsed, repo = window.githubRepo;
    loadShow();
    notice('Checking...');
    blog.getFile(repo, 'template.json')
        .then(data => {
            tj = Base64.decode(data.content);
            window.tJson = tj; // 在window对象上注册templateJson变量(注意这里是原json文件)
            parsed = JSON.parse(tj);
            return Promise.resolve(true); // 让then方法继续往下执行
        }, rej => {
            $.ft('./template/template.json')
                .then(resp => resp.text(), rej => {
                    notice('尝试初始化失败');
                })
                .then(json => {
                    window.tJson = json;
                    initialization(); // 触发初始化
                })
            throw 'Turn to initialization';
        }).then(res => {
            return blog.getFile(repo, parsed['templatehtmls']['postitem'])
                .then(data => {
                    window.htmls['postitems.html'] = Base64.decode(data.content); // 获取并临时储存postitems.html
                    return Promise.resolve(true); // 让then方法继续往下执行
                }, rej => {
                    errShow();
                    throw 'Failed to get Necessary Template:';
                })
        }).then(res => {
            console.log('MainJson:', parsed['mainjson']);
            return blog.findFileSha(repo, parsed['mainjson'])
                .then(data => Promise.resolve(data), rej => {
                    errShow();
                    console.log(rej);
                    throw 'Failed to get Main Json sha.';
                });
        }).then(sha => {
            return blog.getFileBlob(repo, sha)
                .then(json => {
                    //注意!!!这里的修改!!!保证了和上面tJson风格统一，后面cp.js要好好改改
                    window.mainJson = Base64.decode(json.content.replace(/[\r\n]/g, "")); // 抓取并储存仓库的mainJson
                    loadHide();
                    PJAX.jump('editor.html'); /*Jump*/
                }, rej => {
                    errShow();
                    throw 'Failed to get Main Json.';
                });
        })
        .catch(e => {
            notice(e);
            console.log(e);
            loadHide();
        });
}

function initialization() { /*初始化*/
    let repo = window.githubRepo, tj = JSON.parse(window.tJson);
    if (confirm('即将帮您初始化博客，是否继续？\nReady for initialization, please confirm to continue.\n\n!!!注意!!!请保证博客仓库未经过初始化，否则会覆盖关键数据。')) {
        notice('Initializing...');
        loadShow();
        let templates = tj['alltp'], treeConstruct = [];
        for (var i in templates) {
            let currentTplt = templates[i];
            console.log('Uploading file: ' + currentTplt);
            (function (file) {
                $bueue.c(function () {
                    $.ft('./template/' + file).then(resp => resp.text(), rej => {
                        throw rej;
                    }).then(content => {
                        return blog.crBlob(repo, content).then(resp => {
                            treeConstruct.push({
                                path: file,
                                mode: '100644',
                                type: 'blob',
                                sha: resp.sha
                            });
                            notice(file + '已上传');
                            $bueue.next();
                        }, rej => {
                            throw rej;
                        })
                    }).catch(e => {
                        notice('初始化出错', true);
                        notice('请删除template.json.');
                        notice('重新初始化.');
                        console.log('Initialization failed: ' + e);
                        errShow();
                    })
                });
            })(currentTplt); /*闭包传参，终于解决了！>A<*/
            /*添加队列*/
        }
        $bueue.c(() => { notice("所有文件的Blob均已创建"); });
        $bueue.start(); /*队列启动*/
        let checker = setInterval(function () {
            if ($bueue.state == 3) {
                clearInterval(checker);
                blog.gPush(repo, treeConstruct, 'Initial commit of blog')
                    .then(resp => {
                        notice('Finished');
                        notice('即将进入编辑页面');
                        SC('t').style.opacity = 0;
                        setTimeout(initialCheck, 1000);
                        loadHide();
                    }, rej => {
                        notice("Commit提交失败", true);
                        errShow();
                    });
            }
        }, 1000);
    } else {
        alert('如果想好了，刷新页面初始化吧！');
    }
}