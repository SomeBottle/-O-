/*ControlPosts - SomeBottle*/
var md = new showdown.Converter();
var editpost = 'none';
var tpjs = JSON.parse(window.tjson); /*编辑的文章*/
if (!window.mainjson) {
    loadshow();
    blog.getfile(window.githubuser, window.githubrepo, 'main.json', true, {
        success: function(fi) {
            console.log('ok');
            window.mainjson = fi;
            renderlist(); /*渲染最新文章列表*/
            loadhide();
        },
        failed: function(m) {
            loadhide();
            errshow();
        }
    });
} else {
    renderlist(); /*渲染最新文章列表*/
    loadhide();
}
var choose = 0;
var timer;

function getdate() { /*获得今天日期*/
    var dt = new Date();
    var month = dt.getMonth() + 1;
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    return dt.getFullYear() + month.toString() + (dt.getDate()).toString();
}
var B = { /*Replace Part*/
    r: function(a, o, p, g = true) { /*(All,Original,ReplaceStr,IfReplaceAll)*/
        if (a) {
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
    gt: function(p1, p2, ct = false) { /*htmlget*/
        var e;
        if (!ct) {
            e = document.getElementsByTagName('html')[0].innerHTML;
        } else {
            e = ct;
        }
        var k = e.split(p1)[1];
        var d = k.split(p2)[0];
        return d;
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
        if (choose >= 7) {
            choose = 7;
        }
        if (choose == 5) {
            SC('fbtn').style.backgroundColor = '#FA5858';
        } else {
            SC('fbtn').style.backgroundColor = '#0080ff';
        }
        var txt = new Array('编辑/发布', '预览', '保存草稿', '读取草稿', '删除', '生成归档', '取消');
        SC('fbtn').innerHTML = txt[choose - 1];
        clearTimeout(timer);
        timer = setTimeout(function() {
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
                    console.log('生成归档');
                    tagarchive();
                    break;
                case 7:
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
                prc = '/*' + sc + '*/'; /*加上总体注释*/
                ss[i].innerHTML = prc;
            }
        }
        var rh = c.innerHTML;
        return rh;
    }

    function tagarchive() { /*生成tag和归档页面*/
        var pageh1 = tpjs['templatehtmls']['tags']; /*获得配置的页面链接，默认tags.html*/
        var pageh2 = tpjs['templatehtmls']['archives']; /*获得配置的页面链接，默认archives.html*/
        var pageg1 = tpjs['generatehtmls']['tags']; /*获得配置的页面链接，默认tag.html*/
        var pageg2 = tpjs['generatehtmls']['archives']; /*获得配置的页面链接，默认archive.html*/
        var tj = JSON.parse(Base64.decode(window.mainjson.content.replace(/[\r\n]/g, ""))); /*获得json*/
        var m = window.htmls['index.html']; /*Tags*/
        var rendert1 = B.r(m, '{[title]}', 'Tags');
        var rendert2 = B.r(rendert1, '{[sitename]}', tj['name']);
        var rendert3 = B.r(rendert2, '{[keywords]}', tj['name'] + ',tag');
        var rendert4 = B.r(rendert3, '{[description]}', 'Tag Page');
        var rendert5 = B.r(rendert4, '{[type]}', pageh1); /*Archives*/
        var rendera1 = B.r(m, '{[title]}', 'Archives');
        var rendera2 = B.r(rendera1, '{[sitename]}', tj['name']);
        var rendera3 = B.r(rendera2, '{[keywords]}', tj['name'] + ',archive');
        var rendera4 = B.r(rendera3, '{[description]}', 'Archive Page');
        var rendera5 = B.r(rendera4, '{[type]}', pageh2);
        if (confirm('确定要生成标签和归档页面？')) {
            loadshow();
            blog.cr(window.githubuser, window.githubrepo, pageg1, 'Generate Tag Page', rendert5, {
                success: function(m) {
                    blog.cr(window.githubuser, window.githubrepo, pageg2, 'Generate Archive Page', rendera5, {
                        success: function(m) {
                            notice('Successful:D');
                            loadhide();
                        },
                        failed: function(m) {
                            notice('生成失败');
                            loadhide();
                        }
                    });
                },
                failed: function(m) {
                    notice('生成失败');
                    loadhide();
                }
            });
        }
    }

    function indexrenderer(js) {
        var pageh = tpjs['templatehtmls']['postlist']; /*获得配置的页面链接，默认postlist.html*/
        /*首页渲染者*/
        var tj = js;
        var m = window.htmls['index.html'];
        var item = window.htmls['postitem.html'];
        var postids = tj['dateindex'];
        var listrender = '';
        var maxrender = parseInt(tj['posts_per_page']); /*每页最大渲染数*/
        var nowrender = 0;
        for (var i in postids) {
            if (nowrender < maxrender) {
                var pid = i.replace('post', '');
                var pt = tj['postindex'][pid];
                if (!pt['link']) { /*排除页面在外*/
                    var render1 = B.r(item, '{[postitemtitle]}', Base64.decode(pt.title));
                    var render2 = B.r(render1, '{[postitemintro]}', Base64.decode(pt.intro) + '...');
                    var render3 = B.r(render2, '{[postitemdate]}', pt.date);
                    var render4 = B.r(render3, '{[postitemlink]}', 'post-' + pid + '.html');
                    listrender += render4; /*渲染到列表模板*/
                } else {
                    nowrender -= 1;
                }
                nowrender += 1;
            } else {
                break;
            }
        }
        var renderi1 = B.r(m, '{[title]}', '');
        var renderi2 = B.r(renderi1, '{[description]}', '');
        var renderi3 = B.r(renderi2, '{[keywords]}', tj['name']); /*站点名字加入keywords*/
        var renderi4 = B.r(renderi3, '{[type]}', pageh);
        var renderi5 = B.r(renderi4, '{[sitename]}', tj['name']); /*设定title*/
        var renderi6 = B.r(renderi5, '{[content]}', listrender); /*注入灵魂*/
        return renderi6;
    }

    function tempsave() {
        var title = SC('title').value;
        var date = SC('date').value;
        var tag = SC('tag').value;
        var content = SC('content').value;
        localStorage.otitle = title;
        localStorage.odate = date;
        localStorage.otag = tag;
        localStorage.ocontent = content;
        notice('保存成功');
    }

    function readsave() {
        if (confirm('真的要读取草稿吗？\n这会覆盖你目前的内容')) {
            SC('title').value = localStorage.otitle;
            SC('date').value = localStorage.odate;
            SC('tag').value = localStorage.otag;
            SC('content').value = localStorage.ocontent = content;
        }
    }

    function preview() {
        var content = SC('content').value;
        SC('sbr').style.zIndex = 50;
        SC('sbr').style.opacity = 1;
        SC('sbr').innerHTML = '<a class=\'closebtn\' href=\'javasccript:void(0);\' onclick=\'sbrclose()\'>×<\/a><h2>Preview:<\/h2>' + md.makeHtml(content);
    }

    function edit() {
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
        var intro = ((((md.makeHtml(content)).replace(/<\/?.+?>/g, "")).substring(0, 100)).replace(/[ ]/g, "")).replace(/[\r\n]/g, ""); /*防止回车造成的json解析失败*/
        if (content.length >= 70) {
            intro += '...';
        }
        if (confirm('真的要发布嘛？')) {
            var tj = JSON.parse(Base64.decode(window.mainjson.content.replace(/[\r\n]/g, ""))); /*获得json*/
            var m = window.htmls['index.html']; /*RenderArea*/
            var render1 = B.r(m, '{[title]}', title);
            var render2 = B.r(render1, '{[date]}', date);
            var render3 = B.r(render2, '{[tags]}', tag);
            var render4 = B.r(render3, '{[content]}', content);
            var render5 = B.r(render4, '{[description]}', intro.replace(/<\/?.+?>/g, "")); /*去除html标签作为description*/
            var render6 = B.r(render5, '{[keywords]}', tag + ',' + tj['name']); /*站点名字加入keywords*/
            var render7 = B.r(render6, '{[type]}', pageh);
            var render8 = B.r(render7, '{[sitename]}', tj['name']); /*设定title*/
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
            if (!tj['dateindex'] || typeof(tj['dateindex']) !== 'object') {
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
            var render9 = B.r(render8, '{[pid]}', nownum); /*设定pid*/
            var pagelink = ''; /*指定编辑的页面的link(不带.html)*/
            if (ifpage) { /*如果是页面直接获取当前时间*/
                pagelink = date;
                date = getdate();
            }
            tj['dateindex']['post' + nownum] = date + nownum.toString(); /*利用date进行排序*/
            var datearray = new Array();
            for (var dts in tj['dateindex']) {
                datearray.push(Array(dts, parseInt(tj['dateindex'][dts]))); /*转二维数组*/
            }
            tj['dateindex'] = new Object();
            datearray = (datearray.sort(function(a, b) {
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
            blog.cr(window.githubuser, window.githubrepo, filename, commit, render9, {
                success: function(m) {
                    blog.cr(window.githubuser, window.githubrepo, 'main.json', commit, JSON.stringify(tj), {
                        success: function(m) {
                            blog.cr(window.githubuser, window.githubrepo, 'index.html', commit, indexpage, {
                                success: function(m) {
                                    if (recentlink !== '' && recentlink !== pagelink) { /*更新页面时如果更改链接,删除先前存在的页面*/
                                        blog.del(window.githubuser, window.githubrepo, recentlink + '.html', 'Delete recent page', {
                                            success: function(m) {},
                                            failed: function(m) {
                                                notice('页面更新出错');
                                                loadhide();
                                            }
                                        });
                                    }
                                },
                                failed: function(m) {
                                    notice('首页刷新失败');
                                    loadhide();
                                }
                            });
                        },
                        failed: function(m) {
                            notice('编辑/发布失败');
                            loadhide();
                        }
                    }); /*上载索引*/
                },
                failed: function(m) {
                    notice('编辑/发布失败');
                    loadhide();
                }
            }); /*上载文章*/
            window.mainjson.content = Base64.encode(JSON.stringify(tj)); /*更新本地json*/
            var tm = setInterval(function() {
                if (window.gstate <= 0) {
                    window.gstate = 0;
                    notice('编辑/发布成功');
                    renderlist(); /*渲染最新文章列表*/
                    if (editpost !== 'none') {
                        window.htmls['post-' + editpost + '.html'] = Base64.encode(render9); /*更新变量储存的post*/
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
            blog.del(window.githubuser, window.githubrepo, filename, 'Delete post', {
                success: function(m) {
                    window.mainjson.content = Base64.encode(JSON.stringify(tj));
                    blog.cr(window.githubuser, window.githubrepo, 'main.json', 'Delete post', JSON.stringify(tj), {
                        success: function(m) {
                            addnew();
                            renderlist(); /*渲染最新文章列表*/
                            blog.cr(window.githubuser, window.githubrepo, 'index.html', 'Delete post', indexpage, { /*渲染首页*/
                                success: function(m) {
                                    loadhide();
                                    notice('删除成功');
                                },
                                failed: function(m) {
                                    loadhide();
                                    notice('首页更新失败');
                                }
                            });
                        },
                        failed: function(m) {
                            notice('编辑/发布失败');
                            loadhide();
                        }
                    }); /*上载索引*/
                },
                failed: function(f) {
                    notice('删除失败TAT');
                    loadhide();
                }
            });
        }
    }

    function postopen(id) { /*编辑文章*/
        loadshow();
        var tj = JSON.parse(Base64.decode(window.mainjson.content.replace(/[\r\n]/g, ""))); /*获得json*/
        var ifpage = false;
        if (tj['postindex'][id]['link']) {
            ifpage = true; /*是页面*/
        }
        this.loadpost = function(ct) {
            loadhide();
            var ht = Base64.decode(ct);
            var title = Base64.decode(tj['postindex'][id]['title']);
            if (ifpage) {
                var date = tj['postindex'][id]['link'];
            } else {
                var date = tj['postindex'][id]['date'];
            }
            var tags = tj['postindex'][id]['tags'];
            var content = (B.gt('<!--[PostContent]-->', '<!--[PostContentEnd]-->', ht)).trim(); /*去除内容首尾的空格*/
            SC('content').value = content;
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
            blog.getfile(window.githubuser, window.githubrepo, filename, true, {
                success: function(fi) {
                    ot.loadpost(fi.content);
                    window.htmls[filename] = fi.content; /*已经加载过的文章先存着*/
                },
                failed: function(m) {
                    loadhide();
                    notice('加载文章失败');
                    notice('No such post.');
                }
            });
        } else {
            this.loadpost(window.htmls[filename]);
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
document.onkeydown = function(event) { /*Search Enter Listener*/
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
    rendertp = "<a class='closebtn' href='javasccript:void(0);' onclick='sbrclose()'>×</a>" + rendertp; /*关闭按钮*/
    SC('sbr').innerHTML = rendertp;
}

function sbrclose() {
    SC('sbr').style.zIndex = -1;
    SC('sbr').style.opacity = 0;
    SC('sbr').innerHTML = '';
}

function addshow() {
    SC('adbtn').style.display = 'block';
    setTimeout(function() {
        SC('adbtn').style.opacity = 1;
    },
    100);
}

function addhide() {
    SC('adbtn').style.opacity = 0;
    setTimeout(function() {
        SC('adbtn').style.display = 'none';
    },
    1000);
}
SC('date').placeholder = getdate(); /*预设日期*/
