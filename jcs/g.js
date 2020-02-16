/*Scripts for Github Actions - SomeBottle*/
 /*---------workers url---------------*/
const workers = 'https://xxxx.xxxx.workers.dev'; 
/*---------workers url end---------------*/
window.ua = '';
window.authstatu = false;
window.gstate = 0; /*任务完成状况*/
window.errnum = 0; /*出错次数*/

function timestamp() {
    var a = new Date().getTime();
    return a;
}

function gh() {
    this.login = function(workerpass, cb) {
        window.gstate += 1;
        $.aj(workers + '/?a=gettoken&p=' + $.param({ /*请求accesstoken*/
            pass: Base64.encode(workerpass)
        }, true), {}, {
            success: function(msg) {
                var t = JSON.parse(msg);
                cb.success(t);
                window.gstate -= 1;
            },
            failed: function(m) {
                cb.failed(m);
                window.gstate -= 1;
            }
        }, 'get', '', true);
    }
    this.getfile = function(token, repo, file, asyn, cb) { /*获得文件信息*/
        window.gstate += 1;
        $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/contents/' + file + '?' + timestamp(), {}, {
            success: function(msg) {
                var t = JSON.parse(msg);
                if (t.message == 'Not Found') {
                    t = 'empty';
                }
                cb.success(t);
                window.filestatu = true;
                window.gstate -= 1;
            },
            failed: function(m) {
                cb.failed(m);
                console.log('[GetSha]Failed');
                window.filestatu = 'failed';
                window.gstate -= 1;
                window.errnum += 1;
            }
        }, 'get', 'token ' + token, asyn);
    }
    this.getusr = function(token, asyn) {
        loadshow();
        $.aj('https://api.github.com/user', {}, {
            success: function(m) {
                loadhide();
                var j = JSON.parse(m);
                window.githubuser = j.login;
            },
            failed: function(m) {
                notice('获取用户信息失败');
            }
        }, 'get', 'token ' + token, asyn);
    }
    this.getrepo = function(token, repo, asyn, callback) { /*获得repo信息*/
        window.gstate += 1;
        $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '?' + timestamp(), {}, {
            success: function(msg) {
                var t = JSON.parse(msg);
                if (t.message == 'Not Found') {
                    t = 'empty';
                }
                callback.success(t);
                window.repostatu = true;
                window.gstate -= 1;
            },
            failed: function(m) {
                callback.failed(m);
                console.log('[GetRepo]Failed');
                window.repostatu = 'failed';
                window.gstate -= 1;
                window.errnum += 1;
            }
        }, 'get', 'token ' + token, asyn);
    }
    this.cr = function(token, repo, file, commit, content, callback) { /*创建/编辑文件*/
        window.gstate += 1;
        this.getfile(token, repo, file, true, {
            success: function(fi) {
                var shacode;
                if (fi !== 'empty') {
                    shacode = fi.sha;
                }
                $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/contents/' + file + '?' + timestamp(), {
                    message: commit,
                    content: Base64.encode(content),
                    sha: shacode
                }, {
                    success: function(m) {
                        callback.success(m);
                        window.createstatu = true;
                        console.log('[CreateFile]Success');
                        window.gstate -= 1;
                    },
                    failed: function(m, p) {
                        console.log('code:' + m);
                        if (parseInt(m) !== 201) { /*201 File Created*/
                            callback.failed(m);
                            window.createstatu = 'failed';
                            console.log('[CreateFile]Failed');
                            window.gstate -= 1;
                        } else {
                            this.success(p);
                        }
                    }
                }, 'put', 'token ' + token, true);
            },
            failed: function(m) {
                this.success(m); /*文件不存在，是船新版本*/
            }
        });
    }
    this.del = function(token, repo, file, commit, callback) { /*删除文件*/
        window.gstate += 1;
        this.getfile(token, repo, file, true, {
            success: function(fi) {
                var shacode;
                if (fi !== 'empty') {
                    shacode = fi.sha;
                    $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/contents/' + file + '?' + timestamp(), {
                        message: commit,
                        sha: shacode
                    }, {
                        success: function(m) {
                            callback.success(m);
                            console.log('[DeleteFile]Success');
                            window.gstate -= 1;
                        },
                        failed: function(m) {
                            callback.failed(m);
                            console.log('[DeleteFile]Failed');
                            window.gstate -= 1;
                            window.errnum += 1;
                        }
                    }, 'delete', 'token ' + token, true);
                } else {
                    console.log('[DeleteFile]Failed');
                }
            },
            failed: function(m) {
                callback.failed(m);
            }
        });
    }
}
var blog = new gh();