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
    this.getfileshas = function (token, repo, asyn, cb, hascommitsha = false) {
        this.getbasetree(token, repo, hascommitsha).then((data) => {
            return new Promise(function (res, rej) {
                window.gstate += 1;
                $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/git/trees/' + data.basetreesha + '?' + timestamp(), {}, {
                    success: function (msg) {
                        let t = JSON.parse(msg).tree;
                        cb.success(t);
                        res(t);
                        window.gstate -= 1;
                    },
                    failed: function (m) {
                        cb.failed(m);
                        res(m);
                        console.log('[GetBaseTree]Failed');
                        window.gstate -= 1;
                    }
                },
                    'get', 'token ' + token, asyn);
            });
        });
    }
    this.findfilesha = function (filetofind) {
        if (window.fileshas) {
            let fs = window.fileshas;
            for (var i in fs) {
                if (fs[i].path == filetofind) return fs[i].sha;
            }
        }
    }
    this.getfileblob = function (token, repo, sha, asyn, cb) {
        /*获得文件信息*/
        return new Promise(function (res, rej) {
            window.gstate += 1;
            $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/git/blobs/' + sha + '?' + timestamp(), {}, {
                success: function (msg) {
                    let t = JSON.parse(msg);
                    cb.success(t);
                    res(t);
                    window.gstate -= 1;
                },
                failed: function (m) {
                    cb.failed(m);
                    res(m);
                    console.log('[GetFileBlob]Failed');
                    window.gstate -= 1;
                }
            },
                'get', 'token ' + token, asyn);
        });
    }
    this.getbasetree = function (token, repo, hascommitsha = false) {/*获得basetree的sha，返回promise对象*/
        window.gstate += 1;
        return new Promise(function (res, rej) {
            let pushdata = {};
            if (!hascommitsha) {
                $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/git/ref/heads/main', "", {/*获得ref*/
                    success: function (m) {
                        pushdata.lastcommitsha = JSON.parse(m).object.sha;/*储存上次的commitsha*/
                        res(pushdata);
                    },
                    failed: function (m) {
                        console.log("[Push]Failed to get ref");
                        window.gstate -= 1;
                    }
                }, "get", 'token ' + token, true);
            } else {
                pushdata.lastcommitsha = hascommitsha;
                res(pushdata);
            }
        }).then((data) => {
            return new Promise(function (res, rej) {
                $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/git/commits/' + data.lastcommitsha, "", {
                    success: function (m) {
                        data.basetreesha = JSON.parse(m).tree.sha;
                        res(data);
                    },
                    failed: function (m) {
                        console.log("[Push]Failed to get basetree");
                        window.gstate -= 1;
                    }
                }, "get", 'token ' + token, true);
            })
        })
    }
    this.gpush = function (token, repo, treeconstruct, commitmsg, cb) {/*模拟git push部分提交更新仓库*/
        window.gstate += 1;
        this.getbasetree(token, repo).then((data) => {
            return new Promise(function (res, rej) {/*更新树*/
                $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/git/trees', {
                    "base_tree": data.basetreesha, // commit tree 的 sha
                    "tree": treeconstruct
                }, {
                    success: function (m) {
                        data.treesha = JSON.parse(m).sha;
                        res(data);
                    },
                    failed: function (m) {
                        console.log("[Push]Failed to update tree");
                        cb.failed(m);
                        window.gstate -= 1;
                    }
                }, "post", 'token ' + token, true);
            })
        }).then((data) => {
            return new Promise(function (res, rej) {/*创建提交*/
                $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/git/commits', {
                    "message": commitmsg,
                    "parents": [data.lastcommitsha],// 上次 commit 的sha
                    "tree": data.treesha
                }, {
                    success: function (m) {
                        data.commitsha = JSON.parse(m).sha;
                        res(data);
                    },
                    failed: function (m) {
                        console.log("[Push]Failed to make commit");
                        cb.failed(m);
                        window.gstate -= 1;
                    }
                }, "post", 'token ' + token, true);
            })
        }).then((data) => {/*调整指针指向最新commit*/
            $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/git/refs/heads/main', {
                "sha": data.commitsha,
                "force": true
            }, {
                success: function (m) {
                    data.commitsha = JSON.parse(m).sha;
                    cb.success(m);
                    window.gstate -= 1;
                },
                failed: function (m) {
                    console.log("[Push]Failed to update ref.");
                    cb.failed(m);
                    window.gstate -= 1;
                }
            }, "patch", 'token ' + token, true);
        })
    }
    this.getfile = function (token, repo, file, asyn, cb) {
        /*获得文件信息*/
        return new Promise(function (res, rej) {
            window.gstate += 1;
            $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/contents/' + file + '?' + timestamp(), {}, {
                success: function (msg) {
                    console.log('[GetFile]Successfully get ' + file);
                    let t = JSON.parse(msg);
                    cb.success(t);
                    res(t);
                    window.gstate -= 1;
                },
                failed: function (m) {
                    cb.failed(m);
                    res(m);
                    console.log('[GetFile]Failed');
                    window.gstate -= 1;
                }
            },
                'get', 'token ' + token, asyn);
        });
    }
    this.getusr = function (token, asyn, cb) {
        loadshow();
        $.aj('https://api.github.com/user', {}, {
            success: function (m) {
                loadhide();
                let j = JSON.parse(m);
                window.githubuser = j.login;
                cb.success();
            },
            failed: function (m) {
                loadhide();
                notice('获取用户信息失败');
                cb.failed();
            }
        },
            'get', 'token ' + token, asyn);
    }
    this.getrepo = function (token, repo, asyn, callback) {
        /*获得repo信息*/
        window.gstate += 1;
        $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '?' + timestamp(), {}, {
            success: function (msg) {
                let t = JSON.parse(msg);
                if (t.message == 'Not Found') {
                    t = 'empty';
                }
                callback.success(t);
                window.gstate -= 1;
            },
            failed: function (m) {
                callback.failed(m);
                console.log('[GetRepo]Failed');
                window.gstate -= 1;
            }
        },
            'get', 'token ' + token, asyn);
    }
    this.cr = async function (token, repo, content, callback) {
        /*创建blob*/
        window.gstate += 1;
        $.aj('https://api.github.com/repos/' + window.githubuser + '/' + repo + '/git/blobs' + '?' + timestamp(), {
            content: Base64.encode(content),
            encoding: "base64"
        }, {
            success: function (m) {
                callback.success(JSON.parse(m));
                console.log('[CreateBlob]Success');
                window.gstate -= 1;
            },
            failed: function (m, p) {
                callback.failed(JSON.parse(m));
                console.log('[CreateBlob]Failed');
                window.gstate -= 1;
            }
        }, 'post', 'token ' + token, true);
    }
    this.crypt = function (token, key, dec = false) {
        try {
            if (!$.ce(token) || !$.ce(key)) {
                return false;
            } else if (!dec) {
                return CryptoJS.RC4.encrypt(token, key);
            } else {
                let decrypt = CryptoJS.RC4.decrypt(token, key);
                return CryptoJS.enc.Utf8.stringify(decrypt);
            }
        } catch (e) {
            return '';
        }
    }
}
var blog = new gh();