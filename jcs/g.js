/*
Scripts for Github Actions - SomeBottle
感谢文章点明道路：https://zhuanlan.zhihu.com/p/54877720
*/
"use strict";
/*任务完成状况*/

function timestamp() {
    var a = new Date().getTime();
    return a;
}

function gh(token) {
    var accessToken = token,// 私有属性
        githubUser = '',
        fileShas = {}, // sha列表缓存
        branch = 'main'; // git分支
    this.getBaseShas = function (repo, hasCommitSha = false) { // 获取根目录文件的sha列表(仓库名，主动提供上一次的commitSha)
        return this.getBaseTree(repo, hasCommitSha)
            .then(data => $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '/git/trees/' + data.baseTreeSha + '?' + timestamp(), 'get', 'token ' + accessToken))
            .then(resp => resp.json(), rej => {
                notice('获取BaseTree失败');
                console.log('Failed to get BaseTree:' + rej);
                throw rej;
            })
            .then(json => {
                for (let key in fileShas) {
                    if (key.includes(repo)) delete fileShas[key]; // 删除和仓库名相关的sha列表缓存
                }
                return Promise.resolve(json.tree);
            })
            .catch(e => Promise.reject(e));
    }
    this.getTreeShas = function (pathIncRepo, treeSha) { // (包括仓库名的目录,当前目录treeSha)
        let pathArr = pathIncRepo.split('/'),
            repo = pathArr[0]; // 取出仓库名
        return pathArr.length > 1 ? (
            $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '/git/trees/' + treeSha + '?' + timestamp(), 'get', 'token ' + accessToken)
                .then(resp => resp.json(), rej => {
                    notice('获取指定Tree失败');
                    console.log('Failed to get specific Tree:' + rej);
                    throw rej;
                })
                .then(json => {
                    delete fileShas[pathIncRepo]; // 删掉目录对应的sha列表缓存
                    return Promise.resolve(json.tree);
                })
                .catch(e => Promise.reject(e))
        ) : this.getBaseShas(repo); // 如果只有一层，则直接获取仓库根目录的sha列表
    }
    this.findFileSha = function (repo, file2find, treeSha = false) { // 根据文件找到对应sha(仓库名,文件路径)
        let pathSplit = file2find.split('/'), // 考虑要找的文件不一定在根目录下
            target = pathSplit.shift(); // 当前要找的目录/文件名，同时削掉file2find路径里的第一个目录，为递归准备
        return (fileShas[repo] ? Promise.resolve(fileShas[repo]) : this.getTreeShas(repo, treeSha))
            .then(data => {
                let found = false;
                fileShas[repo] = data;
                Object.keys(data).forEach(i => {
                    let current = data[i];
                    if (current.path == target) {
                        found = data[i].sha;
                    }
                })
                if (pathSplit.length > 0 && found) { // 路径还有剩余且能找到目录sha
                    return this.findFileSha(repo + '/' + target, pathSplit.join('/'), found); // 递归寻找文件sha
                } else {
                    return new Promise((res, rej) => {
                        found ? res(found) : rej('Failed to find fileSha');
                    });
                }
            });
    }
    this.getFileBlob = function (repo, sha) {// 获得文件Blob数据
        return $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '/git/blobs/' + sha + '?' + timestamp(), 'get', 'token ' + accessToken)
            .then(resp => resp.json(), rej => {
                notice('获取文件Blob失败');
                console.log('Failed to get Blob:' + rej);
                throw rej;
            })
            .then(json => Promise.resolve(json))
            .catch(e => Promise.reject(e));
    }
    this.getBaseTree = function (repo, hasCommitSha = false) {/*获得basetree的sha，返回promise对象*/
        let pushData = {
            'lastCommitSha': hasCommitSha
        };
        return (
            hasCommitSha ? Promise.resolve(pushData) : $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '/git/ref/heads/' + branch, 'get', 'token ' + accessToken)
                .then(resp => resp.json(), rej => {
                    notice('无法获得上一个CommitSha');
                    console.log('Failed to get the last commit sha:' + rej);
                    throw rej;
                }).then(json => {
                    pushData['lastCommitSha'] = json.object.sha;// 获得上一次的sha
                    return Promise.resolve(pushData);
                })
        ).then(data => {
            return $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '/git/commits/' + data.lastCommitSha, 'get', 'token ' + accessToken)
                .then(resp => resp.json(), rej => {
                    notice('获取CommitBaseTreeSha失败');
                    console.log('Failed to get the commit\'s base tree sha:' + rej);
                    throw rej;
                })
                .then(json => {
                    data['baseTreeSha'] = json.tree.sha;
                    return Promise.resolve(data);
                })
        }).catch(e => Promise.reject(e));// 接住所有的错误并reject
    }
    this.gPush = function (repo, treeConstruct, commitMsg) {/*模拟git push部分提交更新仓库*/
        return this.getBaseTree(repo)
            .then(data => {
                return $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '/git/trees?' + timestamp(), 'post', 'token ' + accessToken, {
                    'base_tree': data.baseTreeSha,
                    'tree': treeConstruct
                }).then(resp => resp.json(), rej => {
                    notice('生成tree失败');
                    console.log('Failed to generate tree:' + rej);
                    throw rej;
                }).then(json => {
                    data.treeSha = json.sha;
                    return Promise.resolve(data);
                })
            }).then(data => {
                return $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '/git/commits?' + timestamp(), 'post', 'token ' + accessToken, {
                    'message': commitMsg,
                    'parents': [data.lastCommitSha],// 上一次的commitSha
                    'tree': data.treeSha
                }).then(resp => resp.json(), rej => {
                    notice('生成commit失败');
                    console.log('Failed to generate commit:' + rej);
                    throw rej;
                }).then(json => {
                    data.commitSha = json.sha;
                    return Promise.resolve(data);
                })
            }).then(data => { // 将指针指向最新的commit
                return $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '/git/refs/heads/' + branch + '?' + timestamp(), 'patch', 'token ' + accessToken, {
                    'sha': data.commitSha,
                    'force': true
                }).then(resp => resp.json(), rej => {
                    notice('更新ref失败');
                    console.log('Failed to update ref:' + rej);
                    throw rej;
                }).then(json => {
                    return Promise.resolve(json);
                })
            }).catch(e => Promise.reject(e));// 接住所有的错误并reject
    }
    this.getFile = function (repo, file) {
        /*获得文件内容，本API最多只支持1M大小文件 https://docs.github.com/en/rest/reference/repos#get-repository-content , file支持相对路径*/
        return $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '/contents/' + file + '?' + timestamp(), 'get', 'token ' + accessToken)
            .then(resp => resp.json(), rej => {
                notice('获取文件失败');
                console.log('[getFile]Failed to get file:' + rej);
                throw rej;
            })
            .then(json => {
                console.log('[getFile]Successfully get ' + file);
                return Promise.resolve(json);
            })
            .catch(e => Promise.reject(e));
    }
    this.getUsr = function () { // 获得用户信息
        return $.ft('https://api.github.com/user?' + timestamp(), 'get', 'token ' + accessToken)
            .then(resp => resp.json(), rej => {
                notice('获取用户信息失败');
                console.log('[getUsr]Failed to get user info:' + rej);
                throw rej;
            })
            .then(json => {
                githubUser = json.login;
                return Promise.resolve(json);
            })
            .catch(e => Promise.reject(e));
    }
    this.getRepo = function (repo) { // 获得仓库信息
        return $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '?' + timestamp(), 'get', 'token ' + accessToken)
            .then(resp => resp.json(), rej => {
                notice('获取仓库信息失败');
                console.log('[getRepo]Failed to get repo info:' + rej);
                throw rej;
            })
            .then(json => {
                return Promise.resolve(json);
            })
            .catch(e => Promise.reject(e));
    }
    this.crBlob = function (repo, content) { // 创建blob https://docs.github.com/en/rest/reference/git#create-a-blob
        return $.ft('https://api.github.com/repos/' + githubUser + '/' + repo + '/git/blobs?' + timestamp(), 'post', 'token ' + accessToken, {
            'accept': 'application/vnd.github.v3+json',
            'content': content,
            'encoding': 'utf-8' // 通过utf8编码可以轻松传输二进制文件
        }).then(resp => resp.json(), rej => {
            notice('创建blob失败');
            console.log('[createBlob]Failed to create blob:' + rej);
            throw rej;
        }).then(json => {
            console.log('[createBlob]Successfully created the blob');
            return Promise.resolve(json);
        }).catch(e => Promise.reject(e));
    }
}