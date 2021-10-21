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
var editpost = 'none';
var tpjs = JSON.parse(window.tjson); /*编辑的文章*/
renderlist(); /*渲染最新文章列表*/
loadhide();
var choose = 0;
var timer;

function rmj() { /*获得随机的mainjson文件名*/
    var str = Math.random().toString(36).substr(5);
    return 'main.' + str + '.json';
}

function getdate() { /*获得今天日期*/
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
    r: function (a, o, p, tp = false, g = true) { /*(All,Original,ReplaceStr,IfTemplate(false,'[','('),IfReplaceAll)*/
        if (a) {
            if (tp) return tp == '(' ? a.replace(new RegExp('\\{\\(' + o + '\\)\\}', (g ? 'g' : '') + 'i'), p) : a.replace(new RegExp('\\{\\[' + o + '\\]\\}', (g ? 'g' : '') + 'i'), p); /*20201229替换{[xxx]}和{(xxx)}一类模板，这样写目的主要是利用正则忽略大小写进行匹配*/
            if (g) {
                while (a.indexOf(o) !== -1) {
                    a = a.replace(o, p);
                }
            } else {
                a = a.replace(o, p);
            }
        }
        return a;
    },
    gt: function (p1, p2, ct = false, ntp = false) { /*htmlget(between,and,content,NotTemplate=false)*/
        var e;
        if (!ct) {
            e = document.getElementsByTagName('html')[0].innerHTML;
        } else {
            e = ct;
        }
        try { /*ntp=false，也就是模板中匹配的时候，默认匹配{(xxx)}和{(xxx)}之间的内容*/
            var k = ntp ? e.split(p1)[1] : e.split(new RegExp('\\{\\(' + p1 + '\\)\\}', 'i'))[1]; /*正则支持大小写忽略*/
            var d = ntp ? k.split(p2)[0] : k.split(new RegExp('\\{\\(' + p2 + '\\)\\}', 'i'))[0];
            return d;
        } catch (e) {
            return false;
        }
    }
}

function renderlist() {
    var tj = JSON.parse(Base64.decode(window.mainjson.content.replace(/[\r\n]/g, ""))); /*获得json*/
    var rendertp = '';
    var nowrender = 0;
    var maxrender = 8; /*最多加载多少最新文章*/
    for (var i in tj['dateindex']) {
        if (nowrender >= maxrender) {
            break;
        }
        var id = parseInt(i.replace('post', ''));
        var title = Base64.decode(tj['postindex'][id]['title']);
        rendertp += "<p class='postitemp'><a class='postitema' href='javascript:void(0);' onclick='postopen(" + id + ")'>" + title + "</a></p>";
        nowrender += 1;
    }
    if (rendertp == '') {
        rendertp += '<p class=\'postitemp\'><a class=\'postitema\' href=\'javascript:void(0);\'>还没有文章呢</a></p>';
    }
    SC('rp').innerHTML = rendertp;
}

function eswitch() {
    choose += 1;
    if (choose >= 8) {
        choose = 8;
    }
    if (choose == 5) {
        SC('fbtn').style.backgroundColor = '#FA5858';
    } else {
        SC('fbtn').style.backgroundColor = '#0080ff';
    }
    var txt = new Array('编辑/发布', '预览', '保存草稿', '读取草稿', '删除', '预览前置', '生成归档', '取消');
    SC('fbtn').innerHTML = txt[choose - 1];
    clearTimeout(timer);
    timer = setTimeout(function () {
        switch (choose) {
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
                tempsave();
                break;
            case 4:
                console.log('读取草稿');
                readsave();
                break;
            case 5:
                console.log('删除');
                if (editpost == 'none') {
                    notice('现在没有编辑任何文章');
                } else {
                    if (confirm('真的要删除当前文章吗？！')) {
                        delpost(editpost);
                    }
                }
                break;
            case 6:
                console.log('预览前置');
                beforePreviewHtml();
                break;
            case 7:
                console.log('生成归档');
                tagarchive();
                break;
            case 8:
                console.log('取消');
                break;
        }
        SC('fbtn').innerHTML = 'O_o?';
        SC('fbtn').style.backgroundColor = '#0080ff';
        choose = 0;
    },
        1000);
}

function scriptcutter(h) { /*处理script标签*/
    var c = document.createElement('div');
    c.innerHTML = h;
    var ss = c.getElementsByTagName('script');
    for (var i in ss) {
        var sc = ss[i].innerHTML;
        if (sc !== undefined) {
            sc = B.r(sc, '/*', ''); /*去除原有注释*/
            sc = B.r(sc, '*/', '');
            let prc = '/*' + sc + '*/'; /*加上总体注释*/
            ss[i].innerHTML = prc;
        }
    }
    var rh = c.innerHTML;
    return rh;
}
function beforePreviewHtml() {
    localStorage.OBeforePreview = localStorage.OBeforePreview || '';
    let getPre = prompt('请输入你在预览body部分中要插入的前置html\n（用于文章中需要外部js库的脚本预览)', localStorage.OBeforePreview);
    localStorage.OBeforePreview = getPre;
}
function enhtml(h) { /*转义html*/
    var temp = h.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    return temp;
}

function dehtml(h) { /*反转义html*/
    var temp = h.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#039;/g, "\'").replace(/&quot;/g, "\"");
    return temp;
}

function tagarchive() { /*生成tag和归档页面*/
    var pageh1 = tpjs['templatehtmls']['tags']; /*获得配置的页面链接，默认tags.html*/
    var pageh2 = tpjs['templatehtmls']['archives']; /*获得配置的页面链接，默认archives.html*/
    var pageg1 = tpjs['generatehtmls']['tags']; /*获得配置的页面链接，默认tag.html*/
    var pageg2 = tpjs['generatehtmls']['archives']; /*获得配置的页面链接，默认archive.html*/
    var tj = JSON.parse(Base64.decode(window.mainjson.content.replace(/[\r\n]/g, ""))); /*获得json*/
    var m = window.htmls['index.html']; /*Tags*/
    var rendert1 = B.r(m, 'title', 'Tags', true);
    rendert1 = B.r(rendert1, 'titlemiddle', '-', true);
    var rendert2 = B.r(rendert1, 'sitename', tj['name'], true);
    var rendert3 = B.r(rendert2, 'keywords', tj['name'] + ',tag', true);
    var rendert4 = B.r(rendert3, 'description', 'Tag Page', true);
    var rendert5 = B.r(rendert4, 'type', pageh1, true); /*Archives*/
    var rendera1 = B.r(m, 'title', 'Archives', true);
    rendera1 = B.r(rendera1, 'titlemiddle', '-', true);
    var rendera2 = B.r(rendera1, 'sitename', tj['name'], true);
    var rendera3 = B.r(rendera2, 'keywords', tj['name'] + ',archive', true);
    var rendera4 = B.r(rendera3, 'description', 'Archive Page', true);
    var rendera5 = B.r(rendera4, 'type', pageh2, true);
    if (confirm('确定要生成标签和归档页面？')) {
        loadshow();
        new Promise((res, rej) => {
            blog.cr(window.accesstoken, window.githubrepo, rendert5, {
                success: (m) => {
                    let treeconstruct = [];
                    treeconstruct.push({
                        "path": pageg1,
                        "mode": "100644",
                        "type": "blob",
                        "sha": m.sha
                    });
                    res(treeconstruct);
                }, failed: (m) => {
                    notice('生成失败', true);
                    loadhide();
                }
            })
        }).then((data) => {
            return new Promise((res, rej) => {
                blog.cr(window.accesstoken, window.githubrepo, rendera5, {
                    success: (m) => {
                        data.push({
                            "path": pageg2,
                            "mode": "100644",
                            "type": "blob",
                            "sha": m.sha
                        });
                        res(data);
                    }, failed: (m) => {
                        notice('生成失败', true);
                        loadhide();
                    }
                })
            })
        }).then((data) => {
            blog.gpush(window.accesstoken, window.githubrepo, data, "Add Archives Page and Tags Page", {
                success: (m) => {
                    notice('生成成功');
                    loadhide();
                }, failed: (m) => {
                    notice('生成push失败', true);
                    loadhide();
                }
            });
        });
    }
}

function covercutter(rc) { /*从内容中去除所有<ifcover>的部分*/
    var rst = rc;
    while (rst.indexOf('<ifcover>') !== -1) {
        var coverhtml = B.gt('<ifcover>', '</ifcover>', rst, true);
        rst = B.r(rst, '<ifcover>' + coverhtml + '</ifcover>', ''); /*没有封面图就删掉整段*/
    }
    return rst;
}

function transdate(v) { /*date transformer*/
    let dt = String(v),
        md = dt.slice(-4),
        d = md.slice(-2),
        m = md.substring(0, 2),
        y = dt.replace(md, ''),
        changed = y + '-' + m + '-' + d;
    return changed;
}

function indexrenderer(js) {
    var pageh = tpjs['templatehtmls']['postlist']; /*获得配置的页面链接，默认postlist.html*/
    /*首页渲染者*/
    var tj = js;
    var m = window.htmls['index.html'];
    var item = window.htmls['postitem.html'];
    item = B.gt('PostItem', 'PostItemEnd', item); /*有项目的模板*/
    var postids = tj['dateindex'];
    var listrender = '';
    var maxrender = parseInt(tj['posts_per_page']); /*每页最大渲染数*/
    var nowrender = 0;
    for (var i in postids) {
        if (nowrender < maxrender) {
            var pid = i.replace('post', '');
            var pt = tj['postindex'][pid];
            if (!pt['link']) { /*排除页面在外*/
                var render1 = B.r(item, 'postitemtitle', Base64.decode(pt.title), true);
                var render2 = B.r(render1, 'postitemintro', Base64.decode(pt.intro) + '...', true);
                var render3 = B.r(render2, 'postitemdate', transdate(pt.date), true);
                var render35 = B.r(render3, 'postitemtags', pt.tags.replace(/,/g, '·'), true); /*20201229加入对于文章列表单项模板中tags的支持*/
                var render4 = B.r(render35, 'postitemlink', 'post-' + pid + '.html', true);
                if (pt['cover']) {
                    render4 = B.r(render4, 'postcover', pt['cover'], true); /*如果有封面图就渲染一下*/
                } else {
                    render4 = covercutter(render4); /*没有封面图就删掉整段*/
                }
                listrender += render4; /*渲染到列表模板*/
            } else {
                nowrender -= 1;
            }
            nowrender += 1;
        } else {
            break;
        }
    }
    var renderi1 = B.r(m, 'title', '', true);
    renderi1 = B.r(renderi1, 'titlemiddle', '', true);
    var renderi2 = B.r(renderi1, 'description', '', true);
    var renderi3 = B.r(renderi2, 'keywords', tj['name'], true); /*站点名字加入keywords*/
    var renderi4 = B.r(renderi3, 'type', pageh, true);
    var renderi5 = B.r(renderi4, 'sitename', tj['name'], true); /*设定title*/
    var renderi6 = B.r(renderi5, 'content', enhtml(listrender), true); /*注入灵魂*/
    return renderi6;
}

function tempsave() {
    var title = SC('title').value;
    var date = SC('date').value;
    var tag = SC('tag').value;
    var content = SC('content').value;

    function putter(key, value) { /*放值器20200808*/
        var j = localStorage[key] || '[]',
            pj = JSON.parse(j),
            savev = {};
        savev['v'] = value;
        savev['t'] = new Date();
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

function readsave() {
    function getter(key, pkey = false) { /*取值器20200808*/
        var j = localStorage[key] || '[]',
            pj = JSON.parse(j);
        if (parseInt(pkey) >= 0) return pj[pkey] || false
        else return pj;
    }
    var askword = '',
        alld = getter('otitle');
    for (var i in alld) askword += '序号:' + i + ' 保存时间:' + alld[i]['t'] + '\n';
    var t = parseInt(prompt('请输入要读取的草稿序号\n' + askword + '\n\n这会覆盖你目前的内容', '')),
        value = getter('otitle', t);
    if (value && t >= 0) {
        SC('title').value = value['v'];
        SC('date').value = getter('odate', t)['v'];
        SC('tag').value = getter('otag', t)['v'];
        SC('content').value = getter('ocontent', t)['v'];
    } else {
        notice('无此草稿');
    }
}

function preview() {
    var content = SC('content').value, sc = B.r(content, '/*', '');
    sc = B.r(sc, '*/', '');
    /*SC('sbr').style.zIndex = 50;
    SC('sbr').style.opacity = 1;
    SC('sbr').innerHTML = '<a class=\'closebtn\' href=\'javascript:void(0);\' onclick=\'sbrclose()\'>×<\/a><h2>Preview:<\/h2><style>img{max-width:100%;}</style>' + md.makeHtml(content);*/
    var prwindow = window.open('');
    prwindow.opener = null;
    prwindow.document.write(`<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1"><link href='https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown-light.css' rel="stylesheet" /></head><body>${localStorage.OBeforePreview || ''}<div class='markdown-body'>${mark(sc)}</div></body>`);
    prwindow.document.close();
}

function coverdrawer() { /*提取当前content的封面图片*/
    return B.gt('-[cover:', ']-', SC('content').value, true);
}

function edit() {
    window.editprogress = 'doing'; /*设定发布/编辑状态-正在发布*/
    var pageh = tpjs['templatehtmls']['post']; /*获得配置的页面链接，默认post.html*/
    var title = SC('title').value;
    if (title.match(/^[ ]+$/) || title == '') {
        notice('标题不能为空哦');
        return false;
    }
    var date = SC('date').value;
    if (date.match(/^[ ]+$/) || date == '') {
        date = getdate();
    }
    var tag = SC('tag').value;
    var content = scriptcutter(SC('content').value); /*scriptcutter先处理一下*/
    var ifpage = false; /*是否是页面*/
    if (isNaN(date)) {
        ifpage = true;
        if (tpjs.alltp.indexOf(date + '.html') !== -1) {
            notice('链接名与模板重复！');
            notice('请更换');
            return false; /*跳出函数*/
        }
        tag = ''; /*页面不显示标签*/
    }
    var intro = ((((mark(content)).replace(/<\/?.+?>/g, "")).substring(0, 100)).replace(/[ ]/g, "")).replace(/[\r\n]/g, ""); /*防止回车造成的json解析失败*/
    if (content.length >= 70) {
        intro += '...';
    }
    if (confirm('真的要发布嘛？')) {
        var tj = JSON.parse(Base64.decode(window.mainjson.content.replace(/[\r\n]/g, ""))); /*获得json*/
        var m = window.htmls['index.html']; /*RenderArea*/
        var render1 = B.r(m, 'title', title, true);
        render1 = B.r(render1, 'titlemiddle', '-', true);
        var render2 = B.r(render1, 'date', date, true);
        var render3 = B.r(render2, 'tags', tag, true);
        var render4 = B.r(render3, 'content', enhtml(content), true);
        var render5 = B.r(render4, 'description', intro.replace(/<\/?.+?>/g, ""), true); /*去除html标签作为description*/
        var render6 = B.r(render5, 'keywords', tag + ',' + tj['name'], true); /*站点名字加入keywords*/
        var render7 = B.r(render6, 'type', pageh, true);
        var render8 = B.r(render7, 'sitename', tj['name'], true); /*设定title*/
        /*RenderFinish*/
        if (tj[0] == 'initialized') { /*删除默认内容*/
            delete tj[0];
        } /*处理文章索引*/
        if (!tj['postnum']) { /*未初始化*/
            tj['postnum'] = 0;
        }
        if (!tj['postindex']) {
            tj['postindex'] = new Object();
        }
        if (!tj['dateindex'] || typeof (tj['dateindex']) !== 'object') {
            tj['dateindex'] = new Object();
        }
        var nownum = tj['postnum'];
        var commit = 'New post';
        if (editpost !== 'none') { /*是发布，还是编辑？*/
            nownum = editpost;
            commit = 'Edit post';
        } else {
            tj['postnum'] += 1;
        }
        var render9 = B.r(render8, 'pid', nownum, true); /*设定pid*/
        /*Render---------------------*/
        var pagelink = ''; /*指定编辑的页面的link(不带.html)*/
        if (ifpage) { /*如果是页面直接获取当前时间*/
            pagelink = date;
            date = getdate();
        }
        tj['dateindex']['post' + nownum] = date + nownum.toString(); /*利用date进行排序*/
        /*排查日期序列最长length*/
        var maxdatelength = 0;
        for (var i in tj['dateindex']) {
            var lens = (tj['dateindex'][i]).toString().length;
            if (lens > maxdatelength) {
                maxdatelength = lens;
            }
        } /*自动补全日期序列不足的*/
        for (var i in tj['dateindex']) {
            var ndt = tj['dateindex'][i];
            var lens = (ndt).toString().length;
            if (lens < maxdatelength) {
                var pid = (i.replace('post', '')).toString();
                var leftlen = maxdatelength - lens;
                var st = 0;
                var zeroes = '';
                while (st < leftlen) {
                    zeroes += (0).toString();
                    st += 1;
                }
                var datelength = getdate().toString().length; /*千年虫？*/
                var ldt = ndt.toString().substring(0, datelength);
                var rdt = ndt.toString().substring(lens - pid.length); /*先把日期和pid拆解*/
                var rpid = rdt.toString().replace(pid, zeroes + pid); /*单独处理pid,位数不够，用零来凑*/
                tj['dateindex'][i] = parseInt(ldt + rpid);
            }
        }
        var datearray = new Array();
        for (var dts in tj['dateindex']) {
            datearray.push(Array(dts, parseInt(tj['dateindex'][dts]))); /*转二维数组*/
        }
        tj['dateindex'] = new Object();
        datearray = (datearray.sort(function (a, b) {
            return a[1] - b[1];
        })).reverse(); /*二维数组排序，感谢Ghosin*/
        window.testarray = datearray;
        for (var d in datearray) { /*丢回对象*/
            var ditem = datearray[d];
            tj['dateindex'][ditem[0]] = ditem[1];
        }
        var recentlink = ''; /*如果是页面，储存修改之前的页面名*/
        if (editpost !== 'none' && !ifpage && tj['postindex'][nownum]['link']) { /*不能将页面转为文章*/
            notice('你正在编辑页面');
            notice('不能转为文章');
            return false; /*跳出函数*/
        }
        if (editpost !== 'none' && ifpage) {
            recentlink = tj['postindex'][nownum]['link'];
            if (!recentlink) { /*不能将文章转为页面*/
                notice('你正在编辑文章');
                notice('不能转为页面');
                return false; /*跳出函数*/
            }
        }
        tj['postindex'][nownum] = new Object();
        tj['postindex'][nownum]['title'] = Base64.encode(title);
        tj['postindex'][nownum]['date'] = date;
        var pcover = coverdrawer(); /*文章封面支持20190810*/
        if (pcover) {
            tj['postindex'][nownum]['cover'] = pcover; /*储存文章封面*/
            var rp = '';
            if (pcover == 'none' && tj['postindex'][nownum]['cover']) {
                delete tj['postindex'][nownum]['cover']; /*如果是none就删除文章封面*/
                rp = '';
            }
            render9 = B.r(render9, 'cover', pcover, true); /*设定封面(此处会有none值)*/
            /*Render---------------------*/
        } else {
            render9 = B.r(render9, 'cover', 'none', true); /*没有封面也要替换掉占位符*/
        }
        if (ifpage) {
            tj['postindex'][nownum]['link'] = pagelink; /*储存pagelink*/
        }
        tj['postindex'][nownum]['intro'] = Base64.encode(intro); /*去除html标签的Intro*/
        tj['postindex'][nownum]['tags'] = tag;
        loadshow();
        var filename = 'post-' + nownum + '.html';
        if (ifpage) { /*如果是页面则用指定链接*/
            filename = pagelink + '.html';
        }
        var indexpage = indexrenderer(tj); /*渲染首页*/
        var recentmjn = tpjs['mainjson']; /*上一次的main.json名字*/
        tpjs['mainjson'] = rmj(); /*获得随机的mainjson名字(解决jsdelivr的操蛋缓存)*/
        /*Promise NB!*/
        new Promise((res, rej) => {
            blog.cr(window.accesstoken, window.githubrepo, render9, {
                success: (m) => {
                    let treeconstruct = [];
                    treeconstruct.push({
                        "path": filename,
                        "mode": "100644",
                        "type": "blob",
                        "sha": m.sha
                    });
                    res(treeconstruct);
                }, failed: (m) => {
                    notice('编辑/发布失败', true);
                    loadhide();
                }
            });
        }).then((data) => {
            return new Promise((res, rej) => {
                blog.cr(window.accesstoken, window.githubrepo, JSON.stringify(tj), {
                    success: (m) => {
                        data.push({
                            "path": tpjs['mainjson'],
                            "mode": "100644",
                            "type": "blob",
                            "sha": m.sha
                        });
                        res(data);
                    }, failed: (m) => {
                        notice('索引上载失败', true);
                        loadhide();
                    }
                });
            })
        }).then((data) => {
            return new Promise((res, rej) => {
                blog.cr(window.accesstoken, window.githubrepo, indexpage, {
                    success: (m) => {
                        data.push({
                            "path": 'index.html',
                            "mode": "100644",
                            "type": "blob",
                            "sha": m.sha
                        });
                        res(data);
                    }, failed: (m) => {
                        notice('首页更新失败', true);
                        loadhide();
                    }
                });
            })
        }).then((data) => {
            return new Promise((res, rej) => {
                blog.cr(window.accesstoken, window.githubrepo, JSON.stringify(tpjs), {
                    success: (m) => {
                        data.push({
                            "path": 'template.json',
                            "mode": "100644",
                            "type": "blob",
                            "sha": m.sha
                        });
                        res(data);
                    }, failed: (m) => {
                        notice('模板索引更新失败', true);
                        loadhide();
                    }
                });
            })
        }).then((data) => {
            data.push({/*从树中移除文件，移除旧索引*/
                "path": recentmjn,
                "mode": "160000",
                "type": "commit",
                "sha": null
            });
            if (recentlink !== '' && recentlink !== pagelink) { /*更新页面时如果更改链接,删除先前存在的页面*/
                data.push({/*从树中移除文件，移除旧索引*/
                    "path": recentlink + '.html',
                    "mode": "160000",
                    "type": "commit",
                    "sha": null
                });
            }
            return new Promise((res, rej) => {
                blog.gpush(window.accesstoken, window.githubrepo, data, commit, {
                    success: (m) => {
                        res(JSON.parse(m));
                    }, failed: (m) => {
                        notice('更新push失败', true);
                        loadhide();
                    }
                });
            })
        }).then((data) => {
            blog.getfileshas(window.accesstoken, window.githubrepo, true, {
                success: (m) => { /*已经初始化*/
                    window.fileshas = m;
                    window.editprogress = 'finish'; /*设定发布/编辑状态-完成*/
                    window.mainjson.content = Base64.encode(JSON.stringify(tj)); /*更新本地json*/
                    window.tjson = JSON.stringify(tpjs);
                }, failed: (m) => {
                    notice('刷新临时文件sha列表失败', true);
                    loadhide();
                }
            }, data.object.sha);
        });
        var tm = setInterval(function () {
            if (window.editprogress == 'finish') { /*发布完成进行下一步*/
                window.gstate = 0;
                window.editprogress = ''; /*清空发布/编辑状态*/
                notice('编辑/发布成功');
                renderlist(); /*渲染最新文章列表*/
                if (editpost !== 'none') {
                    window.htmls[(ifpage ? pagelink + '.html' : 'post-' + editpost + '.html')] = Base64.encode(render9); /*更新变量储存的post*/
                } else {
                    postopen(nownum); /*发布文章后跳转到编辑模式*/
                }
                loadhide();
                clearInterval(tm);
            }
        },
            1500);
    }
}

function delpost(id) { /*删除文章*/
    var tj = JSON.parse(Base64.decode(window.mainjson.content.replace(/[\r\n]/g, ""))); /*获得json*/
    if (tj['postindex'][id]) {
        var t = tj['postindex'][id];
        var dt = t.date;
        var ifpage = false;
        if (t.link) {
            ifpage = true; /*是页面*/
        }
        delete tj['postindex'][id];
        delete tj['dateindex']['post' + id];
        loadshow();
        var filename = 'post-' + id + '.html';
        if (ifpage) {
            filename = t.link + '.html';
        }
        var indexpage = indexrenderer(tj); /*渲染首页*/
        var recentmjn = tpjs['mainjson']; /*上一次的main.json名字*/
        tpjs['mainjson'] = rmj(); /*获得随机的mainjson名字(解决jsdelivr的操蛋缓存)*/
        new Promise((res, rej) => {
            blog.cr(window.accesstoken, window.githubrepo, JSON.stringify(tj), {
                success: (m) => {
                    let treeconstruct = [];
                    treeconstruct.push({
                        "path": tpjs['mainjson'],
                        "mode": "100644",
                        "type": "blob",
                        "sha": m.sha
                    });
                    res(treeconstruct);
                }, failed: (m) => {
                    notice('更新索引失败', true);
                    loadhide();
                }
            })
        }).then((data) => {
            return new Promise((res, rej) => {
                blog.cr(window.accesstoken, window.githubrepo, JSON.stringify(tpjs), {
                    success: (m) => {
                        data.push({
                            "path": 'template.json',
                            "mode": "100644",
                            "type": "blob",
                            "sha": m.sha
                        });
                        res(data);
                    }, failed: (m) => {
                        notice('更新索引模板失败', true);
                        loadhide();
                    }
                })
            })
        }).then((data) => {
            return new Promise((res, rej) => {
                blog.cr(window.accesstoken, window.githubrepo, indexpage, {
                    success: (m) => {
                        data.push({
                            "path": 'index.html',
                            "mode": "100644",
                            "type": "blob",
                            "sha": m.sha
                        });
                        res(data);
                    }, failed: (m) => {
                        notice('首页更新失败', true);
                        loadhide();
                    }
                })
            })
        }).then((data) => {
            data.push({/*从树中移除文件，*/
                "path": filename,
                "mode": "160000",
                "type": "commit",
                "sha": null
            });
            data.push({/*移除旧索引*/
                "path": recentmjn,
                "mode": "160000",
                "type": "commit",
                "sha": null
            });
            blog.gpush(window.accesstoken, window.githubrepo, data, "Delete post/page", {
                success: (m) => {
                    window.mainjson.content = Base64.encode(JSON.stringify(tj));
                    window.tjson = JSON.stringify(tpjs);/*更新本地的json*/
                    renderlist(); /*渲染最新文章列表*/
                    notice('删除成功');
                    loadhide();
                }, failed: (m) => {
                    notice('删除:更新push失败', true);
                    loadhide();
                }
            })
        })
    }
}

function postopen(id) { /*编辑文章*/
    loadshow();
    var tj = JSON.parse(Base64.decode(window.mainjson.content.replace(/[\r\n]/g, ""))); /*获得json*/
    var ifpage = false;
    if (tj['postindex'][id]['link']) {
        ifpage = true; /*是页面*/
    }
    let loadpost = function (ct) {
        loadhide();
        var ht = Base64.decode(ct);
        var title = Base64.decode(tj['postindex'][id]['title']);
        if (ifpage) {
            var date = tj['postindex'][id]['link'];
        } else {
            var date = tj['postindex'][id]['date'];
        }
        var tags = tj['postindex'][id]['tags'];
        var content = (B.gt('PostContent', 'PostContentEnd', ht)).trim(); /*去除内容首尾的空格*/
        SC('content').value = dehtml(content);
        SC('tag').value = tags;
        SC('title').value = title;
        SC('date').value = date;
        addshow();
        editpost = id; /*设定当前编辑文章*/
    }
    var filename = 'post-' + id + '.html';
    if (ifpage) { /*如果是页面*/
        filename = tj['postindex'][id]['link'] + '.html';
    }
    if (!window.htmls[filename]) {
        var ot = this;

        blog.getfileblob(window.accesstoken, window.githubrepo, blog.findfilesha(filename), true, {
            success: function (m) { /*已经初始化*/
                loadpost(m.content);
                window.htmls[filename] = m.content; /*已经加载过的文章先存着*/
            },
            failed: function (msg) {
                loadhide();
                notice('加载文章失败');
                notice('No such post.');
            }
        });
    } else {
        loadpost(window.htmls[filename]);
    }
}

function addnew() {
    addhide();
    editpost = 'none'; /*设定当前无编辑*/
    SC('content').value = '';
    SC('tag').value = '';
    SC('title').value = '';
    SC('date').value = '';
}
document.onkeydown = function (event) { /*Search Enter Listener*/
    var e = event || window.event;
    if (e && e.keyCode == 13) {
        var v = SC('search').value;
        if (v !== '' && SC('search') == document.activeElement) {
            SC('sbr').style.zIndex = 50;
            SC('sbr').style.opacity = 1;
            SC('sbr').innerHTML = "<p class='scitemp'><a class='scitema' href='#Searching..'>搜索中...</a></p>";
            searchrender(v);
        } else {
            return true;
        }
    } else {
        return true;
    }
};

function searchrender(v) {
    var rendertp = '';
    var tj = JSON.parse(Base64.decode(window.mainjson.content.replace(/[\r\n]/g, ""))); /*获得json*/
    var pt = tj['postindex'];
    for (var i in pt) {
        var tt = (Base64.decode(pt[i]['title'])).toLowerCase();
        var cc = (Base64.decode(pt[i]['intro'])).toLowerCase();
        var dd = (pt[i]['date']).toLowerCase();
        var tg = (pt[i]['tags']).toLowerCase();
        v = v.toLowerCase();
        if (tt.indexOf(v) !== -1 || cc.indexOf(v) !== -1 || dd.indexOf(v) !== -1 || tg.indexOf(v) !== -1) {
            rendertp += "<p class='scitemp'><a class='scitema' href='javascript:void(0);' onclick='postopen(" + i + ")'>" + tt + "</a></p>";
        }
    }
    if (rendertp == '') {
        rendertp += "<h2>啥都没找到TAT</h2>";
    }
    rendertp = "<a class='closebtn' href='javascript:void(0);' onclick='sbrclose()'>×</a>" + rendertp; /*关闭按钮*/
    SC('sbr').innerHTML = rendertp;
}

function sbrclose() {
    SC('sbr').style.zIndex = -1;
    SC('sbr').style.opacity = 0;
    SC('sbr').innerHTML = '';
}

function addshow() {
    SC('adbtn').style.display = 'block';
    setTimeout(function () {
        SC('adbtn').style.opacity = 1;
    },
        100);
}

function addhide() {
    SC('adbtn').style.opacity = 0;
    setTimeout(function () {
        SC('adbtn').style.display = 'none';
    },
        1000);
}
SC('date').placeholder = getdate(); /*预设日期*/
document.addEventListener('keydown', function (e) {/*监听ctrl+S保存*/
    if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        tempsave();
    }
});