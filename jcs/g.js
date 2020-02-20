/*Scripts for Github Actions - SomeBottle*/
window.ua = '';
window.authstatu = false;
window.gstate = 0;
/*任务完成状况*/

function timestamp() {
    var a = new Date().getTime();
    return a;
}

function gh() {
    this.getfile = function(token, repo, file, asyn, cb) {
        /*获得文件信息*/
        return new Promise(function(res, rej) {
            window.gstate += 1;
            $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/contents/' + file + '?' + timestamp(), {}, {
                    success: function(msg) {
                        var t = JSON.parse(msg);
                        if (t.message == 'Not Found') {
                            t = 'empty';
                        }
                        cb.success(t);
                        res(t);
                        window.gstate -= 1;
                    },
                    failed: function(m) {
                        cb.failed(m);
                        res(m);
                        console.log('[GetSha]Failed');
                        window.gstate -= 1;
                    }
                },
                'get', 'token ' + token, asyn);
        });
    }
    this.getusr = function(token, asyn, cb) {
        loadshow();
        $.aj('https://api.github.com/user', {}, {
                success: function(m) {
                    loadhide();
                    var j = JSON.parse(m);
                    window.githubuser = j.login;
                    cb.success();
                },
                failed: function(m) {
                    loadhide();
                    notice('获取用户信息失败');
                    cb.failed();
                }
            },
            'get', 'token ' + token, asyn);
    }
    this.getrepo = function(token, repo, asyn, callback) {
        /*获得repo信息*/
        window.gstate += 1;
        $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '?' + timestamp(), {}, {
                success: function(msg) {
                    var t = JSON.parse(msg);
                    if (t.message == 'Not Found') {
                        t = 'empty';
                    }
                    callback.success(t);
                    window.gstate -= 1;
                },
                failed: function(m) {
                    callback.failed(m);
                    console.log('[GetRepo]Failed');
                    window.gstate -= 1;
                }
            },
            'get', 'token ' + token, asyn);
    }
    this.cr = async function(token, repo, file, commit, content, callback) {
        /*创建/编辑文件*/
        window.gstate += 1;
        var back = await this.getfile(token, repo, file, true, {
            success: function() {},
            failed: function() {}
        });
        if (back !== 'empty') {
            this.shacode = back.sha;
        }
        $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/contents/' + file + '?' + timestamp(), {
                message: commit,
                content: Base64.encode(content),
                sha: this.shacode
            }, {
                success: function(m) {
                    callback.success(m);
                    console.log('[CreateFile]Success');
                    window.gstate -= 1;
                },
                failed: function(m, p) {
                    console.log('code:' + m);
                    if (parseInt(m) !== 201) {
                        callback.failed(m);
                        console.log('[CreateFile]Failed');
                        window.gstate -= 1;
                    } else {
                        this.success(p);
                    }
                }
            },
            'put', 'token ' + token, true);
    }
    this.del = async function(token, repo, file, commit, callback) {
        /*删除文件*/
        window.gstate += 1;
        var back = await this.getfile(token, repo, file, true, {
            success: function() {},
            failed: function() {}
        });
        if (back !== 'empty') {
            shacode = back.sha;
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
                    }
                },
                'delete', 'token ' + token, true);
        } else {
            console.log('[DeleteFile]Failed');
        }
    }
    this.crypt = function(token, key, dec = false) {
        try {
            if (!$.ce(token) || !$.ce(key)) {
                return false;
            } else if (!dec) {
                return CryptoJS.RC4.encrypt(token, key);
            } else {
                var decrypt = CryptoJS.RC4.decrypt(token, key);
                return CryptoJS.enc.Utf8.stringify(decrypt);
            }
        } catch (e) {
            return '';
        }
    }
}
var blog = new gh();