/*ControlPosts5.0.0 - SomeBottle202202*/
"use strict";
const mark = function (content) {
    return window.markdownit({ html: true, linkify: true })
        .use(window.markdownItAnchor, {
            permalink: window.markdownItAnchor.permalink.linkInsideHeader({
                symbol: '#',
                placement: 'before'
            })
        })
        .render(content);
}, pidReplacePattern = new RegExp('\\{\\s*?pid\\s*?\\}', 'gi');

const B = { /*Replace Part*/
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

var editPost = 'none',
    tpjs = JSON.parse(window.tJson), // 这样防止tpjs直接挂上tJson的引用导致问题(某种意义上的深复制)
    choice = 0,
    timer,
    configs = localStorage['oEditorConfigs']; // 获得面板配置

function loadConfigs(manual = false) { // 如果本地没有配置，就抓取配置(manual参数供手动下载配置)
    let repo = window.githubRepo;
    if (!configs || manual) {
        loadShow();
        blog.findFileSha(repo, barnDir + 'editorConfigs.json').then((sha) => {
            return blog.getFileBlob(repo, sha).then(resp => {
                let parsed = Base64.decode(resp.content);
                configs = parsed;
                localStorage['oEditorConfigs'] = configs; // 覆盖本地配置
                notice('成功从仓库下载配置');
            }, rej => {
                throw rej;
            })
        }, rej => {
            throw rej;
        }).catch(e => {
            console.log(`Failed to download config: ${e}`);
            if (manual) notice('下载配置失败'); // 如果是手动下载就提示一下
            loadHide();
        });
    }
}

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

function renderList() {
    let mj = JSON.parse(window.mainJson), /*获得json*/
        renderTp = '',
        maxRender = 20, /*最多加载多少最新文章*/
        dIndexes = mj['dateindex'] || [],
        dtSlice = dIndexes.slice(0, maxRender); // 对数组进行切片，取出最前面的20篇文章
    dtSlice.forEach((item) => {
        let pid = item[0], // 取出文章的id
            title = Base64.decode(mj['postindex'][pid]['title']); // 取出文章的标题
        renderTp += "<p class='postitemp'><a class='postitema' href='javascript:void(0);' onclick='postOpen(" + pid + ")'>" + title + "</a></p>";
    });
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
    let txt = new Array('编辑/发布', '预览', '保存草稿', '读取草稿', '删除', '更多配置', '生成归档', '取消');
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
                console.log('更多配置');
                //beforePreviewHtml();
                configShow();
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
function findDateIndex(dIndexes, postID) { // 根据文章id找出对应的日期数组下标2022.2.4
    for (let i = 0, len = dIndexes.length; i < len; i++) {
        if (dIndexes[0] == postID) { // 日期数组每个元素储存[文章ID,文章日期]
            return i;
        }
    }
    return -1;
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
        mainTp = window.htmls['index'], /*Tags*/
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
        mainTp = window.htmls['index'],
        itemTp = window.htmls['postitems'],
        dIndexes = mj['dateindex'],
        listRender = '',
        maxRender = parseInt(mj['posts_per_page']), /*每页最大渲染数*/
        nowRender = 0;
    itemTp = B.gt('PostItem', 'PostItemEnd', itemTp); /*有项目的模板*/
    for (let i = 0, len = dIndexes.length; i < len; i++) {
        if (nowRender < maxRender) {
            let item = dIndexes[i],
                pid = item[0],
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
    putter('oEditorTitle', title);
    putter('oEditorDate', date);
    putter('oEditorTag', tag);
    putter('oEditorContent', content);
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
        drafts = getter('oEditorTitle');
    for (let i in drafts) askWords += '序号:' + i + ' 保存时间:' + drafts[i]['t'] + '\n';
    let draftNo = parseInt(prompt('请输入要读取的草稿序号\n' + askWords + '\n\n这会覆盖你目前的内容', '')),
        value = getter('oEditorTitle', draftNo);
    if (value && draftNo >= 0) {
        SC('title').value = value['v'];
        SC('date').value = getter('oEditorDate', draftNo)['v'];
        SC('tag').value = getter('oEditorTag', draftNo)['v'];
        SC('content').value = getter('oEditorContent', draftNo)['v'];
    } else {
        notice('无此草稿');
    }
}

function preview() {
    let content = SC('content').value,
        restored = scriptRestore(content),
        preWin = window.open(''),
        parsedCfg = configs ? JSON.parse(configs) : { 'beforePreview': '' };
    preWin.opener = null;
    preWin.document.write(`<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1"><link href='https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown-light.css' rel="stylesheet" /></head><body>${parsedCfg['beforePreview']}<div class='markdown-body'>${mark(restored)}</div></body>`);
    preWin.document.close();
}

function coverDrawer() { /*提取当前content的封面图片*/
    let matching = new RegExp('<!-+?\\[cover:(.*?)\\]-+?>', 'gis').exec(SC('content').value);
    return matching ? matching[1] : '';
}

function linkValid(link) {
    let pattern = new RegExp('^(?<!\\.)[\\-_A-Za-z0-9][.\\-_A-Za-z0-9]+[\\-_A-Za-z0-9](?!\\.)$', 'gi');
    return (link.trim() !== 'index' && pattern.test(link)); // 链接不能是index.html，同时只能是. - _ 英文字母大小写 数字，且开头结尾不能是.
}

function edit() {
    let introLen = 100, // 截取内容长度
        postTp = tpjs['templatehtmls']['post'], /*获得配置的页面模板名，默认post.otp.html*/
        title = SC('title').value,
        dateVal = SC('date').value,
        tag = SC('tag').value,
        content = scriptCutter(SC('content').value),
        date = $.notEmpty(dateVal) ? dateVal : getDate(),// 如果日期为空就选用默认日期
        intro = mark(content)
            .replace(/<\/?.+?>/g, "")
            .substring(0, introLen)
            .replace(/[ ]/g, "")
            .replace(/[\r\n]/g, ""), // 提取文章前面小部分作为intro
        ifPage = $.isDate(date) ? false : true;/*是否是页面*/

    if (!$.notEmpty(title)) {
        notice('标题不能为空哦');
        return false;
    }
    if (content.length > introLen) {
        intro += '...';
    }
    if (ifPage) { // 如果是页面
        if (tpjs.alltp.includes(date + '.html')) {
            notice('链接名与模板重复！');
            notice('请更换');
            return false; /*跳出函数*/
        } else if (!linkValid(date)) { // 如果链接名不合法
            notice('链接名不合法');
            notice('只能是 . - _ 英文字母 数字');
            notice('不能以.开头或结尾');
            return false;
        }
        tag = ''; /*页面不显示标签*/
    }
    if (confirm('真的要发布嘛？')) {
        let mj = JSON.parse(window.mainJson), /*获得mainjson*/
            mainTp = window.htmls['index'], /*RenderArea*/
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
        /*处理文章索引*/
        mj['postnum'] = mj['postnum'] || 0;// 初始化文章数量
        mj['postindex'] = mj['postindex'] || new Object();// 初始化文章索引
        if (!mj['dateindex'] || !(mj['dateindex'] instanceof Array)) { // 初始化日期索引
            mj['dateindex'] = new Array(); // 日期索引是数组储存(有序)2022.2.4
        }
        if (mj[0] == 'initialized') { /*删除MainJson默认内容*/
            delete mj[0];
        }
        let currentNo = mj['postnum'], // 目前的文章序号
            commit = 'New Post', // Commit内容
            dIndexes = mj['dateindex'], // 日期索引
            postDateInd = dIndexes.length,
            pageLink = ifPage ? date : ''; /*指定编辑的页面的link(不带.html)*/
        date = ifPage ? getDate() : date; // 如果是页面，日期就是今天
        if (editPost !== 'none') { // 是编辑
            currentNo = editPost;
            postDateInd = findDateIndex(dIndexes, currentNo); // 找到当前文章对应的日期索引
            commit = 'Edit Post';
        } else { // 是发布
            mj['postnum'] += 1; // 文章数量+1
        }
        render = B.r(render, 'pid', currentNo, true); /*设定pid*/
        /*Render---------------------*/
        /*日期排序-------------------*/
        dIndexes[postDateInd] = [currentNo, date]; // 日期数组元素[文章序号,日期]
        dIndexes.sort((a, b) => { // 排序
            let factor1 = b[1] - a[1], // 因素1：日期新旧
                factor2 = b[0] - a[0]; // 因素2：文章序号大小
            return factor1 === 0 ? factor2 : factor1; // 因素1排不出时用因素2进行排序
        });
        /*日期排序结束-------------------*/
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
        let currentTime = timestamp(), // 毫秒级时间戳
            pubTime = currentPostObj['pubTime'] || currentTime; // 发布日期(不要改动此行位置)
        currentPostObj = {
            'title': Base64.encode(title),
            'date': date,
            'intro': Base64.encode(intro),
            'tags': tag,
            'editTime': currentTime // 上一次编辑的日期
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
        let fileName = 'post-' + currentNo + '.html';// 构建文件名
        /*登记发布时间和编辑时间*/
        render = B.r(render, 'pubtime', pubTime, true);
        render = B.r(render, 'edittime', currentTime, true);
        /*登记完成*/
        if (ifPage) { /*如果是页面则用指定链接*/
            currentPostObj['link'] = pageLink; /*如果是页面就储存pagelink*/
            fileName = pageLink + '.html';
        }
        currentPostObj['pubTime'] = pubTime; // 如果不存在发布日期，就储存当前日期
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
                        path: barnDir + tpjs['mainjson'], // MainJson作为博客核心文件放在barnDir/下
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
                        path: `${barnDir}template.json`, // TemplateJson作为博客核心文件放在barn/下
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
                "path": barnDir + prevMName,
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
            return blog.getBaseShas(repo, resp.object.sha) // 刷新fileShas缓存列表，详见g.js
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
            repo = window.githubRepo,
            postDateInd = findDateIndex(mj['dateindex'], id); // 找到当前文章在日期列表中的索引
        delete mj['postindex'][id]; // 删除postindex中文章对象
        delete mj['dateindex'][postDateInd]; // 删除dateindex中对应元素
        let indexPage = indexRenderer(mj), /*渲染首页*/
            prevMName = tpjs['mainjson']; /*上一次的main.json名字*/
        tpjs['mainjson'] = randomMJ(); /*获得随机的mainjson名字(解决jsdelivr的操蛋缓存)*/
        blog.crBlob(repo, JSON.stringify(mj)).then(resp => {
            let treeConstruct = [];
            treeConstruct.push({
                "path": barnDir + tpjs['mainjson'], // MainJson作为博客核心文件放在barn/下
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
                        "path": `${barnDir}template.json`, // TemplateJson作为博客核心文件放在barn/下
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
                "path": barnDir + prevMName,
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
    SC('sbrContent').innerHTML = renderTp;
}

function sbrShow() {
    SC('sbr').style.display = 'block';
    setTimeout(() => {
        SC('sbr').style.opacity = 1;
    }, 50);
}

function sbrClose() {
    wear(SC('sbr'), {
        'opacity': 0
    });
    aniChecker(SC('sbr'), () => {
        SC('sbr').style.display = 'none';
        SC('sbrContent').innerHTML = '';
    }, true);
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

async function configShow() { // 展示配置面板
    loadShow();
    let cache = window.htmls['configs'],
        configItems = await (cache ? Promise.resolve(cache) : $.ft('configs.html').then(resp => resp.text(), rej => {
            throw rej;
        })),
        template = `<div class="markdown-body">${configItems}</div>`,
        parsedCfg = '',
        cfgElems = SC('sbrContent').getElementsByClassName('cfgInput'); // 获得所有配置输入元素
    loadHide();
    window.htmls['configs'] = configItems; // 临时存着
    SC('sbrContent').innerHTML = template;
    if (!configs) { // 如果配置仍然未载入就采用默认配置
        parsedCfg = {
            'rss': false,
            'sitemap': false,
            'postLinkPattern': 'post-{pid}',
            'beforePreview': ''
        }
        configs = JSON.stringify(parsedCfg);
    } else {
        parsedCfg = JSON.parse(configs); // 配置存在
    }
    for (let elem of cfgElems) { // 填充配置
        let key = elem.getAttribute('data-id');
        elem.onchange = configUpdate; // 绑定change事件
        switch (elem.type) {
            case 'checkbox':
                elem.checked = parsedCfg[key];
                break;
            default:
                let value = parsedCfg[key];
                configValid(key, value); // 这里主要起刷新postPermanentLink预览的作用
                elem.value = value;
        }
    }
    sbrShow();
}

function useLinkPattern(link, pid) { // 套上文章链接pattern
    return link.replaceAll(pidReplacePattern, pid);
}

function configValid(key, val) { // 检查配置项是否合法
    if (key == 'postLinkPattern') {
        let applied = useLinkPattern(val, 'pid'); // 先去掉{pid}的{}以便linkValid判断
        if (linkValid(applied) && pidReplacePattern.test(val)) {
            SC('postPermanentLink').innerHTML = useLinkPattern(val, '450') + '.html';
            return true;
        } else {
            notice('链接无效');
            return false;
        }
    } else {
        return true;
    }
}

function configUpdate(e) { // 触发配置改变
    let elem = e.target, // 获得事件触发元素
        parsedCfg = JSON.parse(configs), // 这里默认configs是存在的！
        key = elem.getAttribute('data-id');
    switch (elem.type) {
        case 'checkbox':
            parsedCfg[key] = elem.checked;
            break;
        default:
            let value = elem.value;
            if (configValid(key, value)) {
                parsedCfg[key] = value;
            } else {
                notice('请重新设置')
                return false;
            }
    }
    configs = JSON.stringify(parsedCfg); // 更新配置
    localStorage['oEditorConfigs'] = configs; // 存入localStorage
    notice('配置已更新');
}

SC('date').value = getDate(); /*预设日期*/
document.addEventListener('keydown', function (e) {/*监听按键*/
    let actElem = document.activeElement;
    if (e.code == 'KeyS' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        tempSave();
    } else if (e.code == 'KeyV' && e.altKey && SC('content') == actElem) { // alt + V在指定地方插入视频标签
        e.preventDefault();
        let link = prompt('输入视频URL:', '');
        if (link) insertAtCursor(SC('content'), `<video controls="controls" style="max-width:100%" src="${link}"></video>`);
    } else if (e.key == 'Tab' && actElem.tagName.toLowerCase() == 'textarea') {
        e.preventDefault();
        insertAtCursor(actElem, '    '); // 一个Tab换四个空格
    } else if (e.key == 'Enter') { // 回车搜索
        let v = SC('search').value;
        if ($.notEmpty(v) && SC('search') == actElem) {
            sbrShow();
            SC('sbrContent').innerHTML = "<p class='scitemp'><a class='scitema' href='#Searching..'>搜索中...</a></p>";
            searchRender(v);
        }
    }
});

renderList(); // 渲染最新文章列表
loadConfigs(); // 如果本地没有配置就尝试从仓库下载