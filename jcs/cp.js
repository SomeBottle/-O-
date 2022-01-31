/*ControlPosts4.5.0 - SomeBottle20211021*/
"use strict";
var mark = function (content) {
    return window.markdownit({ html: true, linkify: true })
        .use(window.markdownItAnchor, {
            permalink: window.markdownItAnchor.permalink.linkInsideHeader({
                symbol: '#',
                placement: 'before'
            })
        })
        .render(content);
}
var editPost = 'none',
    tpjs = JSON.parse(window.tJson), // 这样防止tpjs直接挂上tJson的引用导致问题(某种意义上的深复制)
    choice = 0,
    timer;
renderList(); /*渲染最新文章列表*/

function randomMJ() { /*获得随机的mainJson文件名*/
    let str = Math.random().toString(36).substring(5);
    return 'main.' + str + '.json';
}

function getDate() { /*获得今天日期*/
    var dt = new Date();
    var month = dt.getMonth() + 1,
        day = dt.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (day >= 1 && day <= 9) {
        day = "0" + day;
    }
    return dt.getFullYear() + month.toString() + day.toString();
}
var B = { /*Replace Part*/
    r: function (origin, from, to, forTemplate = false, replaceAll = true) { /*别改这里！，没有写错！(All,Original,ReplaceStr,IfTemplate[false,'['(true),'('],IfReplaceAll)*/
        if (forTemplate) {
            origin = (forTemplate == '(') ? origin.replace(new RegExp('\\{\\(' + from + '\\)\\}', (replaceAll ? 'g' : '') + 'i'), () => to) : origin.replace(new RegExp('\\{\\[' + from + '\\]\\}', (replaceAll ? 'g' : '') + 'i'), () => to); /*20201229替换{[xxx]}和{(xxx)}一类模板，这样写目的主要是利用正则忽略大小写进行匹配*/
        } else if (replaceAll) {
            while (origin.indexOf(from) !== -1) {
                origin = origin.replace(from, to);
            }
        } else {
            origin = origin.replace(from, to);
        }
        return origin;
    },
    gt: function (between, and, useContent = false, notTemplate = false) { /*htmlget(between,and,content,NotTemplate=false)*/
        let element = useContent ? useContent : SC('html').innerHTML;
        try { /*notTemplate=false，也就是模板中匹配的时候，默认匹配{(xxx)}和{(xxx)}之间的内容*/
            let contentAfter = notTemplate ? element.split(between)[1] : element.split(new RegExp('\\{\\(' + between + '\\)\\}', 'i'))[1], /*正则支持大小写忽略*/
                contentBetween = notTemplate ? contentAfter.split(and)[0] : contentAfter.split(new RegExp('\\{\\(' + and + '\\)\\}', 'i'))[0];
            return contentBetween;
        } catch (e) {
            return false;
        }
    }
}

function renderList() {
    let mj = JSON.parse(window.mainJson), /*获得json*/
        renderTp = '',
        nowRender = 0,
        maxRender = 8; /*最多加载多少最新文章*/
    for (let i in mj['dateindex']) { // 找最新的几篇文章
        if (nowRender >= maxRender) {
            break;
        }
        let id = parseInt(i.replace('post', '')),
            title = Base64.decode(mj['postindex'][id]['title']);
        renderTp += "<p class='postitemp'><a class='postitema' href='javascript:void(0);' onclick='postOpen(" + id + ")'>" + title + "</a></p>";
        nowRender += 1;
    }
    if (renderTp == '') {
        renderTp += '<p class=\'postitemp\'><a class=\'postitema\' href=\'javascript:void(0);\'>还没有文章呢</a></p>';
    }
    SC('rp').innerHTML = renderTp;
}

function chooseSth() {
    choice += 1;
    if (choice == 5) {
        SC('fbtn').style.backgroundColor = '#FA5858';
    } else {
        SC('fbtn').style.backgroundColor = '#0080ff';
    }
    let txt = new Array('编辑/发布', '预览', '保存草稿', '读取草稿', '删除', '预览前置', '生成归档', '取消');
    SC('fbtn').innerHTML = txt[choice - 1] || txt.slice(-1);
    clearTimeout(timer);
    timer = setTimeout(function () {
        switch (choice) {
            case 1:
                edit();
                console.log('编辑/发布');
                break;
            case 2:
                console.log('预览');
                preview();
                break;
            case 3:
                console.log('保存草稿');
                tempSave();
                break;
            case 4:
                console.log('读取草稿');
                readSave();
                break;
            case 5:
                console.log('删除');
                if (editPost == 'none') {
                    notice('现在没有编辑任何文章');
                } else {
                    if (confirm('真的要删除当前文章吗？！')) {
                        delPost(editPost);
                    }
                }
                break;
            case 6:
                console.log('预览前置');
                beforePreviewHtml();
                break;
            case 7:
                console.log('生成归档');
                tagArchive();
                break;
            default: // 2022.1.17
                console.log('取消');
                break;
        }
        SC('fbtn').innerHTML = 'O_o?';
        SC('fbtn').style.backgroundColor = '#0080ff';
        choice = 0;
    }, 1000);
}
function scriptRestore(h) {/*script标签去注释，用上正则2021.11.6*/
    return h.replace(new RegExp('(<script[\\s\\S]*?>)(?:\\/\\*)([\\s\\S]*?)(?:\\*\\/)(<\/script>)', 'gi'), (match, p1, p2, p3) => {
        return p1 + p2 + p3;
    });
}
function scriptCutter(h) { /*处理script标签，用上正则2021.11.6*/
    return scriptRestore(h).replace(new RegExp('(<script[\\s\\S]*?>)([\\s\\S]*?)(<\/script>)', 'gi'), (match, p1, p2, p3) => {
        return p2.trim() ? p1 + '/*' + p2 + '*/' + p3 : match;
    });
}
function beforePreviewHtml() {
    localStorage.OBeforePreview = localStorage.OBeforePreview || '';
    let getPre = prompt('请输入你在预览body部分中要插入的前置html\n（用于文章中需要外部js库的脚本预览)', localStorage.OBeforePreview);
    localStorage.OBeforePreview = getPre;
}
function enHtml(h) { /*转义html*/
    var temp = h.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    return temp;
}

function deHtml(h) { /*反转义html*/
    var temp = h.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#039;/g, "\'").replace(/&quot;/g, "\"");
    return temp;
}

function tagArchive() { /*生成tag和归档页面*/
    let tagPageTp = tpjs['templatehtmls']['tags'], /*获得配置的页面模板名字，默认tags.otp.html*/
        arcPageTp = tpjs['templatehtmls']['archives'], /*获得配置的页面模板名，默认archives.otp.html*/
        tagPagePath = tpjs['generatehtmls']['tags'], /*获得配置的页面文件名，默认tag.html*/
        arcPagePath = tpjs['generatehtmls']['archives'], /*获得配置的页面文件名，默认archive.html*/
        repo = window.githubRepo,
        mj = JSON.parse(window.mainJson), /*获得json*/
        mainTp = window.htmls['index.html'], /*Tags*/
        renderTg = B.r(mainTp, 'title', 'Tags', true),
        renderArc = B.r(mainTp, 'title', 'Archives', true);
    renderTg = B.r(renderTg, 'titlemiddle', '-', true);
    renderTg = B.r(renderTg, 'sitename', mj['name'], true);
    renderTg = B.r(renderTg, 'keywords', mj['name'] + ',tag', true);
    renderTg = B.r(renderTg, 'description', 'Tag Page', true);
    renderTg = B.r(renderTg, 'type', tagPageTp, true); /*Archives*/
    renderArc = B.r(renderArc, 'titlemiddle', '-', true);
    renderArc = B.r(renderArc, 'sitename', mj['name'], true);
    renderArc = B.r(renderArc, 'keywords', mj['name'] + ',archive', true);
    renderArc = B.r(renderArc, 'description', 'Archive Page', true);
    renderArc = B.r(renderArc, 'type', arcPageTp, true);
    if (confirm('确定要生成标签和归档页面？')) {
        loadShow();
        blog.crBlob(repo, renderTg).then(resp => {
            let treeConstruct = [];
            treeConstruct.push({
                'path': tagPagePath,
                'mode': '100644',
                'type': 'blob',
                'sha': resp.sha
            });
            return Promise.resolve(treeConstruct);
        }, rej => {
            throw rej;
        }).then(treeConstruct => {
            return blog.crBlob(repo, renderArc).then(resp => {
                treeConstruct.push({
                    'path': arcPagePath,
                    'mode': '100644',
                    'type': 'blob',
                    'sha': resp.sha
                });
                return Promise.resolve(treeConstruct);
            }, rej => {
                throw rej;
            });
        }).then(treeConstruct => {
            blog.gPush(repo, treeConstruct, 'Add Archives Page and Tags Page').then(resp => {
                notice('标签和归档页面生成成功！');
                loadHide();
            }, rej => {
                throw rej;
            });
        }).catch(e => {
            notice('生成失败', true);
            loadHide();
        });
    }
}

function coverCutter(rc) { /*从内容中去除所有<ifcover>的部分*/
    let pattern = new RegExp('<ifcover.*?>(.*?)</ifcover.*?>', 'gis');
    return rc.replaceAll(pattern, '');
}

function transDate(v) { /*date transformer*/
    let dt = String(v),
        md = dt.slice(-4),
        d = md.slice(-2),
        m = md.substring(0, 2),
        y = dt.replace(md, ''),
        changed = y + '-' + m + '-' + d;
    return changed;
}

function indexRenderer(mj) { // 首页渲染者
    let pageTp = tpjs['templatehtmls']['postlist'], /*获得配置的页面模板名，默认postlist.otp.html*/
        mainTp = window.htmls['index.html'],
        itemTp = window.htmls['postitems.html'],
        postIDs = mj['dateindex'],
        listRender = '',
        maxRender = parseInt(mj['posts_per_page']), /*每页最大渲染数*/
        nowRender = 0;
    itemTp = B.gt('PostItem', 'PostItemEnd', itemTp); /*有项目的模板*/
    for (let i in postIDs) {
        if (nowRender < maxRender) {
            let pid = i.replace('post', ''),
                pt = mj['postindex'][pid];
            if (!pt['link']) { /*排除页面在外*/
                let render = B.r(itemTp, 'postitemtitle', Base64.decode(pt.title), true);
                render = B.r(render, 'postitemintro', Base64.decode(pt.intro) + '...', true);
                render = B.r(render, 'postitemdate', transDate(pt.date), true);
                render = B.r(render, 'postitemtags', pt.tags.replace(/,/g, '·'), true); /*20201229加入对于文章列表单项模板中tags的支持*/
                render = B.r(render, 'postitemlink', 'post-' + pid + '.html', true);
                if (pt['cover']) {
                    render = B.r(render, 'postcover', pt['cover'], true); /*如果有封面图就渲染一下*/
                } else {
                    render = coverCutter(render); /*没有封面图就删掉整段*/
                }
                listRender += render; /*渲染到列表模板*/
            } else {
                nowRender -= 1; // 是页面就不算入渲染数量
            }
            nowRender += 1;
        } else {
            break;
        }
    }
    let renderm = B.r(mainTp, 'title', '', true);
    renderm = B.r(renderm, 'titlemiddle', '', true);
    renderm = B.r(renderm, 'description', '', true);
    renderm = B.r(renderm, 'keywords', mj['name'], true); /*站点名字加入keywords*/
    renderm = B.r(renderm, 'type', pageTp, true);
    renderm = B.r(renderm, 'sitename', mj['name'], true); /*设定title*/
    renderm = B.r(renderm, 'content', enHtml(listRender), true); /*注入灵魂*/
    return renderm;
}

function tempSave() { // 保存草稿
    let title = SC('title').value,
        date = SC('date').value,
        tag = SC('tag').value,
        content = SC('content').value;

    function putter(key, value) { /*放值器20200808*/
        let j = localStorage[key] || '[]',
            pj = JSON.parse(j),
            savev = {
                'v': value,
                't': new Date()
            };
        if (pj.length >= 10) { /*草稿数量保持在十个内*/
            pj.shift();
        }
        pj.push(savev);
        localStorage[key] = JSON.stringify(pj);
    }
    putter('otitle', title);
    putter('odate', date);
    putter('otag', tag);
    putter('ocontent', content);
    notice('保存成功');
}

function readSave() {
    function getter(key, pkey = false) { /*取值器20200808*/
        let j = localStorage[key] || '[]',
            pj = JSON.parse(j);
        if (parseInt(pkey) >= 0) return pj[pkey] || false
        else return pj;
    }
    let askWords = '',
        drafts = getter('otitle');
    for (let i in drafts) askWords += '序号:' + i + ' 保存时间:' + drafts[i]['t'] + '\n';
    let draftNo = parseInt(prompt('请输入要读取的草稿序号\n' + askWords + '\n\n这会覆盖你目前的内容', '')),
        value = getter('otitle', draftNo);
    if (value && draftNo >= 0) {
        SC('title').value = value['v'];
        SC('date').value = getter('odate', draftNo)['v'];
        SC('tag').value = getter('otag', draftNo)['v'];
        SC('content').value = getter('ocontent', draftNo)['v'];
    } else {
        notice('无此草稿');
    }
}

function preview() {
    var content = SC('content').value, restored = scriptRestore(content);
    /*SC('sbr').style.zIndex = 50;
    SC('sbr').style.opacity = 1;
    SC('sbr').innerHTML = '<a class=\'closebtn\' href=\'javascript:void(0);\' onclick=\'sbrClose()\'>×<\/a><h2>Preview:<\/h2><style>img{max-width:100%;}</style>' + md.makeHtml(content);*/
    let preWin = window.open('');
    preWin.opener = null;
    preWin.document.write(`<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1"><link href='https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown-light.css' rel="stylesheet" /></head><body>${localStorage.OBeforePreview || ''}<div class='markdown-body'>${mark(restored)}</div></body>`);
    preWin.document.close();
}

function coverDrawer() { /*提取当前content的封面图片*/
    let matching = new RegExp('<!-+?\\[cover:(.*?)\\]-+?>', 'gis').exec(SC('content').value);
    return matching ? matching[1] : '';
}

function edit() {
    let postTp = tpjs['templatehtmls']['post'], /*获得配置的页面模板名，默认post.otp.html*/
        title = SC('title').value,
        date = SC('date').value,
        tag = SC('tag').value,
        content = scriptCutter(SC('content').value),
        ifPage = false;/*是否是页面*/
    if (!$.notEmpty(title)) {
        notice('标题不能为空哦');
        return false;
    }
    if (!$.notEmpty(date)) { // 如果日期为空就选用默认日期
        date = getDate();
    }
    if (!$.isDate(date)) { // 判断是不是页面
        ifPage = true;
        if (tpjs.alltp.includes(date + '.html')) {
            notice('链接名与模板重复！');
            notice('请更换');
            return false; /*跳出函数*/
        }
        tag = ''; /*页面不显示标签*/
    }
    let intro = (((mark(content).replace(/<\/?.+?>/g, "")).substring(0, 100)).replace(/[ ]/g, "")).replace(/[\r\n]/g, ""); // 提取文章前面小部分作为intro
    if (content.length >= 70) {
        intro += '...';
    }
    if (confirm('真的要发布嘛？')) {
        let mj = JSON.parse(window.mainJson), /*获得mainjson*/
            mainTp = window.htmls['index.html'], /*RenderArea*/
            render = B.r(mainTp, 'title', title, true);
        render = B.r(render, 'titlemiddle', '-', true);
        render = B.r(render, 'date', date, true);
        render = B.r(render, 'tags', tag, true);
        render = B.r(render, 'content', enHtml(content), true);
        render = B.r(render, 'description', intro, true); /*去除html标签作为description*/
        render = B.r(render, 'keywords', tag + ',' + mj['name'], true); /*站点名字加入keywords*/
        render = B.r(render, 'type', postTp, true);
        render = B.r(render, 'sitename', mj['name'], true); /*设定title*/
        /*RenderFinish*/
        if (mj[0] == 'initialized') { /*删除默认内容*/
            delete mj[0];
        } /*处理文章索引*/
        if (!mj['postnum']) { // 初始化文章数量
            mj['postnum'] = 0;
        }
        if (!mj['postindex']) { // 初始化文章索引
            mj['postindex'] = new Object();
        }
        if (!mj['dateindex'] || typeof (mj['dateindex']) !== 'object') { // 初始化日期索引
            mj['dateindex'] = new Object();
        }
        let currentNo = mj['postnum'], // 目前的文章序号
            commit = 'New post'; // Commit内容
        if (editPost !== 'none') { /*是发布，还是编辑？*/
            currentNo = editPost;
            commit = 'Edit post';
        } else {
            mj['postnum'] += 1; // 文章数量+1
        }
        render = B.r(render, 'pid', currentNo, true); /*设定pid*/
        /*Render---------------------*/
        let pageLink = ''; /*指定编辑的页面的link(不带.html)*/
        if (ifPage) { /*如果是页面直接获取当前时间*/
            pageLink = date; // 此时日期一栏填的是页面链接
            date = getDate();
        }
        mj['dateindex']['post' + currentNo] = date + currentNo.toString(); /*利用date进行排序*/
        /*排查日期序列最长length*/
        let maxDateLen = 0;
        for (let i in mj['dateindex']) {
            var lens = (mj['dateindex'][i]).toString().length;
            if (lens > maxDateLen) {
                maxDateLen = lens;
            }
        } /*自动补全日期序列不足的*/
        for (let i in mj['dateindex']) {
            var ndt = mj['dateindex'][i];
            var lens = (ndt).toString().length;
            if (lens < maxDateLen) {
                var pid = (i.replace('post', '')).toString();
                var leftlen = maxDateLen - lens;
                var st = 0;
                var zeroes = '';
                while (st < leftlen) {
                    zeroes += (0).toString();
                    st += 1;
                }
                var datelength = getDate().toString().length; /*千年虫？*/
                var ldt = ndt.toString().substring(0, datelength);
                var rdt = ndt.toString().substring(lens - pid.length); /*先把日期和pid拆解*/
                var rpid = rdt.toString().replace(pid, zeroes + pid); /*单独处理pid,位数不够，用零来凑*/
                mj['dateindex'][i] = parseInt(ldt + rpid);
            }
        }
        var datearray = new Array();
        for (var dts in mj['dateindex']) {
            datearray.push(Array(dts, parseInt(mj['dateindex'][dts]))); /*转二维数组*/
        }
        mj['dateindex'] = new Object();
        datearray = (datearray.sort(function (a, b) {
            return a[1] - b[1];
        })).reverse(); /*二维数组排序，感谢Ghosin*/
        window.testarray = datearray;
        for (var d in datearray) { /*丢回对象*/
            var ditem = datearray[d];
            mj['dateindex'][ditem[0]] = ditem[1];
        }
        let recentLink = '', /*如果是页面，储存修改之前的页面名*/
            currentPostObj = mj['postindex'][currentNo] || new Object(); // 目前正在操作的postindex对象
        if (editPost !== 'none') {
            recentLink = currentPostObj['link'] || '';
            if (!ifPage && recentLink) {
                notice('你正在编辑页面');
                notice('不能转为文章');
                return false; /*跳出函数*/
            } else if (ifPage && !recentLink) {
                notice('你正在编辑文章');
                notice('不能转为页面');
                return false; /*跳出函数*/
            }
        }
        currentPostObj = {
            'title': Base64.encode(title),
            'date': date,
            'intro': Base64.encode(intro),
            'tags': tag
        };
        let editCover = coverDrawer(); /*文章封面支持20190810*/
        if (editCover) { // 编辑器里指定了封面
            currentPostObj['cover'] = editCover; /*储存文章封面*/
            if (editCover == 'none' && currentPostObj['cover']) {
                delete currentPostObj['cover']; /*如果是none就删除文章封面*/
            }
            render = B.r(render, 'cover', editCover, true); /*设定封面(此处会有none值)*/
            /*Render---------------------*/
        } else {
            render = B.r(render, 'cover', 'none', true); /*没有封面也要替换掉占位符*/
        }
        loadShow();
        let fileName = 'post-' + currentNo + '.html';
        if (ifPage) { /*如果是页面则用指定链接*/
            currentPostObj['link'] = pageLink; /*如果是页面就储存pagelink*/
            fileName = pageLink + '.html';
        }
        mj['postindex'][currentNo] = currentPostObj; /*储存文章信息*/
        let indexPage = indexRenderer(mj), /*渲染首页*/
            prevMName = tpjs['mainjson'], /*上一次的main.json名字*/
            repo = window.githubRepo;
        tpjs['mainjson'] = randomMJ(); /*获得随机的mainjson名字(解决jsdelivr的操蛋缓存)*/
        blog.crBlob(repo, render).then(resp => {
            let treeConstruct = [];
            treeConstruct.push({
                path: fileName,
                mode: "100644",
                type: "blob",
                sha: resp.sha
            });
            return Promise.resolve(treeConstruct);
        }, rej => {
            throw rej;
        }).then(treeConstruct => {
            return blog.crBlob(repo, JSON.stringify(mj))
                .then(resp => {
                    treeConstruct.push({
                        path: tpjs['mainjson'],
                        mode: "100644",
                        type: "blob",
                        sha: resp.sha
                    });
                    return Promise.resolve(treeConstruct);
                }, rej => {
                    throw rej;
                })
        }).then(treeConstruct => {
            return blog.crBlob(repo, indexPage)
                .then(resp => {
                    treeConstruct.push({
                        path: 'index.html',
                        mode: "100644",
                        type: "blob",
                        sha: resp.sha
                    });
                    return Promise.resolve(treeConstruct);
                }, rej => {
                    throw rej;
                })
        }).then(treeConstruct => {
            return blog.crBlob(repo, JSON.stringify(tpjs))
                .then(resp => {
                    treeConstruct.push({
                        path: 'template.json',
                        mode: "100644",
                        type: "blob",
                        sha: resp.sha
                    });
                    return Promise.resolve(treeConstruct);
                }, rej => {
                    throw rej;
                })
        }).then(treeConstruct => {
            treeConstruct.push({
                "path": prevMName,
                "mode": "160000",
                "type": "commit",
                "sha": null
            });
            if (recentLink !== '' && recentLink !== pageLink) { /*更新页面时如果更改链接,删除先前存在的页面*/
                treeConstruct.push({
                    "path": recentLink + '.html',
                    "mode": "160000",
                    "type": "commit",
                    "sha": null
                })
                delete window.htmls[recentLink + '.html']; // 删除本地储存的页面
            }
            return blog.gPush(repo, treeConstruct, commit)
                .then(resp => Promise.resolve(resp), rej => {
                    throw rej;
                })
        }).then(resp => {
            return blog.getFileShas(repo, resp.object.sha) // 刷新fileShas缓存列表，详见g.js
                .then(res => {
                    window.mainJson = JSON.stringify(mj); /*更新本地json*/
                    window.tJson = JSON.stringify(tpjs);
                    notice('编辑/发布成功');
                    renderList(); /*渲染最新文章列表*/
                    loadHide();
                    if (editPost !== 'none') {
                        window.htmls[fileName] = Base64.encode(render); /*更新变量储存的post*/
                    } else {
                        postOpen(currentNo); /*发布文章后跳转到编辑模式*/
                    }
                }, rej => {
                    throw rej;
                })
        }).catch(e => {
            notice('编辑/发布失败', true);
            loadHide();
            console.log(e);
        });
    }
}

function delPost(id) { /*删除文章*/
    let mj = JSON.parse(window.mainJson), /*获得json*/
        currentPostObj = mj['postindex'][id] || '';
    if (currentPostObj) {
        loadShow();
        let ifPage = currentPostObj.link ? true : false, // 是不是页面
            fileName = ifPage ? currentPostObj.link + '.html' : 'post-' + id + '.html',
            repo = window.githubRepo;
        delete mj['postindex'][id]; // 删除postindex中文章对象
        delete mj['dateindex']['post' + id]; // 删除dateindex中文章元素
        let indexPage = indexRenderer(mj), /*渲染首页*/
            prevMName = tpjs['mainjson']; /*上一次的main.json名字*/
        tpjs['mainjson'] = randomMJ(); /*获得随机的mainjson名字(解决jsdelivr的操蛋缓存)*/
        blog.crBlob(repo, JSON.stringify(mj)).then(resp => {
            let treeConstruct = [];
            treeConstruct.push({
                "path": tpjs['mainjson'],
                "mode": "100644",
                "type": "blob",
                "sha": resp.sha
            });
            return Promise.resolve(treeConstruct);
        }, rej => {
            throw rej;
        }).then(treeConstruct => {
            return blog.crBlob(repo, JSON.stringify(tpjs))
                .then(resp => {
                    treeConstruct.push({
                        "path": 'template.json',
                        "mode": "100644",
                        "type": "blob",
                        "sha": resp.sha
                    })
                    return Promise.resolve(treeConstruct);
                }, rej => {
                    throw rej;
                })
        }).then(treeConstruct => {
            return blog.crBlob(repo, indexPage)
                .then(resp => {
                    treeConstruct.push({
                        "path": 'index.html',
                        "mode": "100644",
                        "type": "blob",
                        "sha": resp.sha
                    })
                    return Promise.resolve(treeConstruct);
                }, rej => {
                    throw rej;
                })
        }).then(treeConstruct => {
            treeConstruct.push({ // 从树中移除文件
                "path": fileName,
                "mode": "160000",
                "type": "commit",
                "sha": null
            }, {// 移除旧索引
                "path": prevMName,
                "mode": "160000",
                "type": "commit",
                "sha": null
            });
            return blog.gPush(repo, treeConstruct, 'Delete post or page')
                .then(res => {
                    window.mainJson = JSON.stringify(mj);
                    window.tJson = JSON.stringify(tpjs);/*更新本地的json*/
                    delete window.htmls[fileName];// 删除变量储存的post
                    renderList(); /*渲染最新文章列表*/
                    notice('删除成功');
                    addNew(); // 清空文章编辑区
                    loadHide();
                }, rej => {
                    throw rej;
                })
        }).catch(e => {
            notice('删除失败', true);
            loadHide();
            console.log(e);
        });
    }
}

function postOpen(id) { /*编辑文章*/
    loadShow();
    let mj = JSON.parse(window.mainJson), /*获得json*/
        ifPage = mj['postindex'][id]['link'] ? true : false,
        fileName = ifPage ? mj['postindex'][id]['link'] + '.html' : 'post-' + id + '.html',
        repo = window.githubRepo;
    let loadPost = function (html) {
        loadHide();
        let ht = Base64.decode(html),
            currentPostObj = mj['postindex'][id],
            title = Base64.decode(currentPostObj['title']),
            date = ifPage ? currentPostObj['link'] : currentPostObj['date'],
            tags = currentPostObj['tags'],
            content = (B.gt('PostContent', 'PostContentEnd', ht)).trim(); /*去除内容首尾的空格*/
        SC('content').value = deHtml(content); // html标签解码
        SC('tag').value = tags;
        SC('title').value = title;
        SC('date').value = date;
        addShow(); // 显示"+"按钮
        editPost = id; /*设定当前编辑文章*/
    }
    if (!window.htmls[fileName]) {
        blog.findFileSha(repo, fileName)
            .then(fileSha => {
                return blog.getFileBlob(repo, fileSha)
                    .then(resp => {
                        loadPost(resp.content);
                        window.htmls[fileName] = resp.content; //已经加载过的文章先存着
                    }, rej => {
                        throw rej;
                    })
            }, rej => {
                throw rej;
            }).catch(e => {
                loadHide();
                notice('加载文章失败');
                notice('No such post.');
                console.log(e);
            })
    } else {
        loadPost(window.htmls[fileName]); // 加载过的直接从本地读取
    }
}

function addNew() { // 清空文章编辑区
    addHide(); // 隐藏"+"按钮
    editPost = 'none'; /*设定当前无编辑*/
    SC('content').value = '';
    SC('tag').value = '';
    SC('title').value = '';
    SC('date').value = getDate();
}
document.onkeydown = function (event) { /*Search Enter Listener*/
    if (event.key == 'Enter') {
        let v = SC('search').value;
        if (v !== '' && SC('search') == document.activeElement) {
            SC('sbr').style.zIndex = 50;
            SC('sbr').style.opacity = 1;
            SC('sbr').innerHTML = "<p class='scitemp'><a class='scitema' href='#Searching..'>搜索中...</a></p>";
            searchRender(v);
        } else {
            return true;
        }
    } else {
        return true;
    }
};

function searchRender(v) {
    let renderTp = '',
        mj = JSON.parse(window.mainJson), /*获得json*/
        pt = mj['postindex'];
    for (let i in pt) {
        let tt = (Base64.decode(pt[i]['title'])).toLowerCase(),
            cc = (Base64.decode(pt[i]['intro'])).toLowerCase(),
            dd = (pt[i]['date']).toLowerCase(),
            tg = (pt[i]['tags']).toLowerCase();
        v = v.toLowerCase();
        if (tt.indexOf(v) !== -1 || cc.indexOf(v) !== -1 || dd.indexOf(v) !== -1 || tg.indexOf(v) !== -1) {
            renderTp += "<p class='scitemp'><a class='scitema' href='javascript:void(0);' onclick='postOpen(" + i + ")'>" + tt + "</a></p>";
        }
    }
    if (renderTp == '') {
        renderTp += "<h2>啥都没找到TAT</h2>";
    }
    renderTp = "<a class='closebtn' href='javascript:void(0);' onclick='sbrClose()'>×</a>" + renderTp; /*关闭按钮*/
    SC('sbr').innerHTML = renderTp;
}

function sbrClose() {
    wear(SC('sbr'), {
        'opacity': 0,
        'zIndex': -1
    });
    SC('sbr').innerHTML = '';
}

function addShow() {
    SC('adbtn').style.display = 'block';
    setTimeout(function () {
        SC('adbtn').style.opacity = 1;
    }, 100);
}

function addHide() {
    SC('adbtn').style.opacity = 0;
    aniChecker(SC('adbtn'), () => {
        SC('adbtn').style.display = 'none';
    }, true);
}
function insertAtCursor(e, str) { // 在输入指针处插入字符串
    let startPos = e.selectionStart,
        insertLen = str.length,
        strLen = e.value.length,
        beforeStr = e.value.substring(0, startPos),
        afterStr = e.value.substring(startPos, strLen);
    e.value = beforeStr + str + afterStr;
    e.selectionStart = e.selectionEnd = startPos + insertLen;
}
SC('date').placeholder = getDate(); /*预设日期*/
SC('date').value = getDate();
document.addEventListener('keydown', function (e) {/*监听ctrl+S保存*/
    if (e.code == 'KeyS' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        tempSave();
    } else if (e.code == 'KeyV' && e.altKey && SC('content') == document.activeElement) { // alt + V在指定地方插入视频标签
        e.preventDefault();
        let link = prompt('输入视频URL:', '');
        if (link) insertAtCursor(SC('content'), `<video controls="controls" style="max-width:100%" src="${link}"></video>`);
    } else if (e.key == 'Tab' && SC('content') == document.activeElement) {
        e.preventDefault();
        insertAtCursor(SC('content'), '    '); // 一个Tab换四个空格
    }
});