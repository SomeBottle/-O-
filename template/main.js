/*FrontMainJS ver3.1.0 - SomeBottle*/
 /*q.js*/
var md;
if (typeof($) !== 'object') {
    $ = new Object();
    $.ls = new Array();
    $.lss = '';
    $.loadset = new Object(); /*加载页配置*/
    $.aj = function(p, d, sf, m, proxy, as) { /*(path,data,success or fail,method,proxyurl,async)*/
        if (p !== 'false' && p) { /*奇妙的false问题*/
            var xhr = new XMLHttpRequest();
            var hm = '';
            for (var ap in d) {
                hm = hm + ap + '=' + d[ap] + '&';
            }
            if (proxy !== '') {
                p = proxy + p;
            }
            hm = hm.substring(0, hm.length - 1);
            if (m == 'get') {
                xhr.open('get', p, as);
            } else {
                xhr.open('post', p, as);
            } /*PS:此处ajax代码相较后台进行了简化，去除了前台无用语句*/
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(hm);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    sf.success(xhr.responseText, p);
                } else if (xhr.readyState == 4 && xhr.status !== 200) {
                    sf.failed(xhr.status, p);
                }
            };
            if (!as) {
                if (xhr.responseText !== undefined) {
                    sf.success(xhr.responseText, p);
                } else {
                    sf.failed(xhr.status, p);
                }
            }
        }
    }
    var SC = function(e) { /*元素选择器*/
        if (e == 'body') {
            return document.body;
        } else if (e == 'html') {
            return document.getElementsByTagName('html')[0];
        } else {
            return document.getElementById(e);
        }
    }
    $.script = function(url) { /*外部js加载器，页面已经加载的不会重复加载*/
        if (!$.scripturl) {
            $.scripturl = [];
        }
        var script = document.createElement("script");
        var exist = false;
        for (var up in $.ls) {
            if ($.ls[up] == url) {
                exist = true;
                break;
            }
        }
        if (!exist && $.scripturl.indexOf(url) == -1) {
            $.ls[$.ls.length] = url;
            script.type = "text/javascript";
            script.src = url;
            $.scripturl.push(url);
            document.body.appendChild(script);
        }
        script = null;
    }
    $.ht = function(h, e, scinclude = true) { /*元素内容设置器(html,element,run script or not when ht)*/
        var ht = SC(e);
        if (!ht) {
            console.log('Unable to find the Element:' + e);
            return false;
        }
        ht.innerHTML = h;
        os = ht.getElementsByTagName('script');
        for (var o = 0; o < os.length; o++) {
            if (os[o].src !== undefined && os[o].src !== null && os[o].src !== '') {
                $.script(os[o].src);
            } else {
                try { /*Oh...No Errors!*/
                    var h = os[o].innerHTML;
                    if (scinclude) { /*是否去除注释执行*/
                        h = B.r(h, '/*', '');
                        h = B.r(h, '*/', '');
                    }
                    setTimeout(h, 0);
                } catch (e) {
                    console.log('Page script Error: ' + e.message);
                }
            }
        }
        ht = os = null; /*释放*/
    }
    $.tr = function(url) { /*PreventURLProblem(Fuck QQ Querying URI*/
        var a = url;
        b = a.split('?');
        if (b[1]) {
            return b[0];
        } else {
            return a;
        }
    }
    $.dt = function(v) { /*date transformer*/
        if (Number(v) >= 10000000) {
            var dt = String(v),
                md = dt.slice(-4),
                d = md.slice(-2),
                m = md.substring(0, 2),
                y = dt.replace(md, ''),
                changed = y + '-' + m + '-' + d;
            return changed;
        } else {
            return v;
        }
    }
    $.rmhead = function(html) { /*去头并返回处理后的内容*/
        var tp = document.createElement('html');
        tp.innerHTML = html;
        var head = tp.getElementsByTagName('clothhead')[0]; /*获得cloth.html内的头*/
        head.parentNode.removeChild(head);
        var rt = [tp.innerHTML, head.innerHTML];
        tp.remove(); /*移除临时元素*/
        head = tp = null;
        return rt;
    }
    $.addhead = function(hd) { /*接头霸王*/
        var e = SC('html'),
            head = e.getElementsByTagName('head')[0],
            clothhead = head.getElementsByTagName('clothhead');
        if (head.parentNode.tagName.toLowerCase() !== 'html') return false; /*父级元素不是html就算了*/
        if (clothhead.length <= 0) { /*还没有渲染cloth的头部*/
            var cloth = document.createElement('clothhead');
            cloth.innerHTML = hd;
            head.appendChild(cloth);
            cloth = null;
        } else { /*渲染过了，直接改*/
            clothhead[0].innerHTML = hd;
        }
        head = clothhead = null;
    }
    $.title = function(t) { /*修改页面<title>*/
        var e = SC('html'),
            head = e.getElementsByTagName('head')[0],
            title = head.getElementsByTagName('title');
        if (title.length <= 0) { /*还没有加过<title>*/
            var te = document.createElement('title');
            te.innerHTML = t;
            head.appendChild(te);
        } else {
            title[0].innerHTML = t;
        }
    }
    $.ldparse = function(ld) { /*解析loading页面*/
        var ht = document.createElement('html');
        ht.innerHTML = ld;
        var obj = ht.getElementsByTagName('loadset'),
            set = obj ? JSON.parse(obj[0].innerHTML) : false; /*获得设置JSON*/
        if (set) {
            $.loadset = set;
        } else { /*获取配置失败*/
            console.log('Failed to initialize loading page.');
        }
        ht.remove(); /*移除临时元素*/
        ht = obj = null;
    }
    $.ecls = function(v, clsv, rmv = false, returne = false) { /*元素class应用(选择器,值,是否移除,是否返回元素)*/
        var ps = v.split(':'),
            content = document.getElementsByTagName('html')[0],
            es;
        switch (ps[0]) {
            case 'id':
                es = document.getElementById(ps[1]);
                break;
            case 'class':
                es = content.getElementsByClassName(ps[1]);
                break;
            case 'tag':
                es = content.getElementsByTagName(ps[1]);
                break;
        }
        if (returne) return es; /*返回元素*/
        if (!(es instanceof Element)) {
            for (var i in es) {
                es[i] instanceof Element ? (rmv ? es[i].classList.remove(clsv) : es[i].classList.add(clsv)) : es = es;
            }
        } else {
            rmv ? es.classList.remove(clsv) : es.classList.add(clsv);
        }
        es = content = null;
    }
}
if (!B) { /*PreventInitializingTwice*/
    /*Include LoadingPage*/
    if (localStorage['obottle-ldpage']) {
        var e = SC('html').innerHTML,
            ldlocalused = true;
        $.ldparse(localStorage['obottle-ldpage']); /*解析加载页*/
        SC('html').innerHTML = e.replace('<!--[LoadingArea]-->', localStorage['obottle-ldpage']);
    } else {
        var ldlocalused = false;
    }
    $.aj('./loading.html', '', {
        success: function(m, p) {
            if (!ldlocalused) { /*如果本地已经有了就不热更新了20200808*/
                B.hr('<!--[LoadingArea]-->', m);
                $.ldparse(m); /*解析加载页*/
            }
            localStorage['obottle-ldpage'] = m;
        },
        failed: function(m) { /*Failed*/
            console.log('LoadingPage Load Failed');
        }
    }, 'get', '', true);
    $.script('./library.js'); /*Include Library Once*/
    window.htmls = new Object();
    var B = { /*B Part*/
        moreperpage: 0,
        r: function(a, o, p, tp = false, g = true) { /*别改这里！，没有写错！(All,Original,ReplaceStr,IfReplaceAll,IfTemplate(false,'[','('))*/
            if (tp) return tp == '(' ? a.replace(new RegExp('\\{\\(' + o + '\\)\\}', (g ? 'g' : '') + 'i'), p) : a.replace(new RegExp('\\{\\[' + o + '\\]\\}', (g ? 'g' : '') + 'i'), p); /*20201229替换{[xxx]}和{(xxx)}一类模板，这样写目的主要是利用正则忽略大小写进行匹配*/
            if (g) {
                while (a.indexOf(o) !== -1) {
                    a = a.replace(o, p);
                }
            } else {
                a = a.replace(o, p);
            }
            return a;
        },
        navlist: {
            statu: false,
            conf: {}
        },
        navcurrent: function(v = '') { /*getcurrentnav*/
            return ((-1 == v.indexOf('http') ? v = v : (v.replace(window.location.protocol + '//' + window.location.hostname, ''))) || window.location.pathname).replace('.html', ''); /*割掉尾巴*/
        },
        navcheck: function() { /*modify html*/
            var c = document.body,
                o = this,
                cl = o.navlist.conf;
            if (o.navlist.statu) {
                var e = c.getElementsByClassName(cl.navclass),
                    path = o.navcurrent();
                for (var i in e) { /*20201229更改算法*/
                    var p = o.navcurrent(e[i].href),
                        pathpos = path.lastIndexOf(p),
                        pathlen = path.length,
                        hreflen = p.length;
                    if ((path == p || (pathpos + hreflen == pathlen && pathpos !== -1)) && e[i] instanceof Element) {
                        e[i].classList.add(cl.activeclass); /*设置为焦点*/
                    } else if (e[i] instanceof Element) {
                        (e[i].classList.contains(cl.activeclass)) ? (e[i].classList.remove(cl.activeclass)) : p = p; /*取消其他的焦点*/
                    }
                }
                e = null;
            }
            c = null;
        },
        nav: function(v) {
            var o = this;
            o.navlist.statu = true;
            o.navlist.conf = v;
        },
        scrolltop: function(maxspeed, minspeed) {
            var nt = document.body.scrollTop;
            var stages = Math.floor(parseInt(nt) / 3); /*分成加速、匀速、减速三段*/
            var v1 = maxspeed; /*加速到maxspeed px/s*/
            var vmin = minspeed; /*最小减速到minspeed px/s*/
            var a1 = (Math.pow(v1, 2)) / (stages * 2); /*2ax=V²*/
            var vn = 0; /*当前速度*/
            var st = setInterval(function() {
                var ntnow = document.body.scrollTop;
                if (parseInt(ntnow) > (stages * 2)) {
                    vn += a1;
                    document.body.scrollTop = parseInt(ntnow) - vn;
                } else if (parseInt(ntnow) > (stages)) { /*第二阶段*/
                    document.body.scrollTop = parseInt(ntnow) - vn;
                } else if (parseInt(ntnow) <= (stages)) { /*第三阶段*/
                    vn -= a1;
                    if (vn <= vmin) {
                        vn = vmin;
                    }
                    if (parseInt(ntnow) <= 0) {
                        document.body.scrollTop = 0;
                        clearInterval(st);
                    } else {
                        document.body.scrollTop = parseInt(ntnow) - vn;
                    }
                }
            }, 10);
        },
        hc: function(v) { /*反转义html的某些字符*/
            v = ((v.replace(/&amp;/g, "&")).replace(/&lt;/g, "<")).replace(/&gt;/g, ">");
            return v;
        },
        hr: function(o, p) { /*htmlreplace*/
            var e = SC('html').innerHTML;
            SC('html').innerHTML = this.r(e, o, p);
        },
        unrnspace: function(h) { /*文章空格换行替换还原*/
            h = h.replace(/{{s}}/g, " ");
            h = h.replace(/{{rn}}/g, "\r\n");
            h = h.replace(/{{n}}/g, "\n");
            return h;
        },
        deltemptags: function(h) { /*删除模板多余的标识符，像{(xxx)}一类*/
            return h.replace(/\{\((.*?)\)\}/g, '');
        },
        preventscript: function() {
            var e = SC('html');
            var sc = e.getElementsByTagName('script');
            for (var i in sc) {
                if (sc[i].src && $.scripturl.indexOf(sc[i].src) == -1) {
                    $.scripturl.push(sc[i].src);
                }
            }
            sc = null;
        },
        dehtml: function(h) { /*decodehtml*/
            var temp = h.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#039;/g, "\'").replace(/&#39;/g, "\'").replace(/&quot;/g, "\"");
            return temp;
        },
        gt: function(p1, p2, ct = false, ntp = false) { /*htmlget(between,and,content,NotTemplate=false)*/
            var e;
            if (!ct) {
                e = SC('html').innerHTML;
            } else {
                e = ct;
            }
            try { /*ntp=false，也就是模板中匹配的时候，默认匹配{(xxx)}和{(xxx)}之间的内容*/
                var k = ntp ? e.split(p1)[1] : e.split(new RegExp('\\{\\(' + p1 + '\\)\\}', 'i'))[1]; /*正则支持大小写忽略*/
                var d = ntp ? k.split(p2)[0] : k.split(new RegExp('\\{\\(' + p2 + '\\)\\}', 'i'))[0];
                return this.dehtml(d);
            } catch (e) {
                return false;
            }
        },
        lazypre: function(c) { /*处理Lazyload图片*/
            var i = document.createElement('div');
            i.innerHTML = c;
            var s = i.getElementsByTagName('img');
            for (var p in s) {
                if (s[p].src) {
                    var sr = s[p].src;
                    s[p].src = 'data:image/gif;base64,R0lGODlhkAGQAYAAAP///wAAACH5BAEAAAAALAAAAACQAZABAAL/hI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuC8fyTNf2jef6zvf+DwwKh8Si8YhMKpfMpvMJjUqn1Kr1is1qt9yu9wsOi8fksvmMTqvX7Lb7DY/L5/S6/Y7P6/f8vv8PGCg4SFhoeIiYqLjI2Oj4CBkpOUlZaXmJmam5ydnp+QkaKjpKWmp6ipqqusra6voKGys7S1tre4ubq7vL2+v7CxwsPExcbHyMnKy8zNzs/AwdLT1NXW19jZ2tvc3d7f0NHi4+Tl5ufo6err7O3u7+Dh8vP09fb3+Pn6+/z9/v/w8woMCBBAsaPIgwocKFDBs6fAgxosSJFCtavIgxo8aN/xw7evwIMqTIkSRLmjyJMqXKlSxbunwJM6bMmTRr2ryJM6fOnTx7+vwJNKjQoUSLGj2KNKnSpUybOn0KNarUqVSrWr2KNavWrVy7ev0KNqzYsWTLmj2LNq3atWzbun0LN67cuXTr2r2LN6/evXz7+v0LOLDgwYQLGz6MOLHixYwbO34MObLkyZQrW76MObPmzZw7e/4MOrTo0aRLmz6NOrXq1axbu34NO7bs2bRr276NO7fu3bx7+/4NPLjw4cSLGz+OPLny5cybO38OPbr06dSrW7+OPbv27dy7e/8OPrz48eTLmz+PPr369ezbu38PP778+fTr27+PP7/+/fz7+03/D2CAAg5IYIEGHohgggouyGCDDj4IYYQSTkhhhRZeiGGGGm7IYYcefghiiCKOSGKJJp6IYooqrshiiy6+CGOMMs5IY4023ohjjm0UAAA7';
                    if (s[p].style.width !== '') {
                        sr = sr + '[width]' + s[p].style.width; /*记录元素原本的样式*/
                    }
                    s[p].setAttribute('data-src', '[lazy]' + sr);
                    s[p].style.width = '100%';
                }
            }
            var rt = i.innerHTML;
            i.remove(); /*移除临时元素*/
            i = s = null;
            return rt;
        },
        lazycheck: function() { /*包租婆————怎么没水了呢？*/
            var H = window.innerHeight;
            var S = document.documentElement.scrollTop || document.body.scrollTop;
            var es = document.getElementsByTagName('img');
            for (var i in es) {
                var cty = es[i].offsetTop;
                if (H + S > cty) {
                    var lazy = es[i].getAttribute('data-src');
                    if (lazy !== 'undefined' && lazy) {
                        es[i].setAttribute('data-src', '');
                        var mainsrc = lazy.split('[lazy]')[1];
                        if (mainsrc.indexOf('[width]') !== -1) {
                            var sp = mainsrc.split('[width]');
                            es[i].src = sp[0];
                            es[i].style.width = sp[1]; /*恢复原来的width样式*/
                        } else {
                            es[i].src = lazy.split('[lazy]')[1];
                            es[i].style.width = 'auto';
                        }
                    }
                }
            }
            es = null;
        },
        templonload: 0,
        /*LoadedTemplates*/
        templateloaded: new Array(),
        tpcheckstatu: false,
        /*模板拼接状态*/
        loadstatu: false,
        /*加载div显示状态*/
        tpcheck: function(re = false, ct = false) { /*template check(re=是否轮询,ct=是否指定内容)*/
            var ot = this,
                o = this;
            if (!ot.tpcheckstatu || re) { /*防止短时间内重复检查模板20200805*/
                ot.tpcheckstatu = true; /*正在检查模板*/
                ot.loadshow();
                var pagetype = ot.gt('PageType', 'PageTypeEnd', ct); /*Get Page Type*/
                if (!window.templjson) {
                    $.aj('template.json', '', {
                        success: function(m) {
                            window.templjson = JSON.parse(m);
                            return ot.tpcheck(true, ct);
                        },
                        failed: function(m) { /*Failed*/
                            console.log('TemplateJson Load Failed.');
                        }
                    }, 'get', '', true);
                } else if (!window.mainjson && window.templjson['usemain'].indexOf(pagetype) !== -1) { /*Some pages are in need of Main.json*/
                    if (!window.mainjsonrequest) { /*Include Mainjson*/
                        window.mainjsonrequest = true; /*make request flag*/
                        $.aj(window.templjson['mainjson'], '', {
                            success: function(m) {
                                window.mainjson = JSON.parse(m.replace(/[\r\n]/g, ""));
                                ot.moreperpage = parseInt(window.mainjson['more_per_page']); /*Update moreperpage*/
                            },
                            failed: function(m) { /*Failed*/
                                console.log('MainJson Load Failed');
                            }
                        }, 'get', '', true);
                    }
                    setTimeout(function() {
                        return o.tpcheck(true, ct);
                    },
                    50);
                } else if (typeof showdown !== 'object') { /*Markdown is not ready!*/
                    setTimeout(function() {
                        return o.tpcheck(true, ct);
                    },
                    50);
                } else if (!localStorage['obottle-ldpage']) { /*loadingpage is not ready!*/
                    setTimeout(function() {
                        return o.tpcheck(true, ct);
                    },
                    50);
                } else {
                    ot.preventscript(); /*剔除已加载scripts*/
                    var j = window.templjson;
                    j['necessary'].push(pagetype); /*Pagetype Pushed*/
                    if (pagetype == j['templatehtmls']['postlist']) {
                        j['necessary'].push(j['templatehtmls']['postitem']); /*Extra Load*/
                    }
                    for (var i in j['necessary']) {
                        if (o.templateloaded.indexOf(j['necessary'][i]) == -1) {
                            o.templonload += 1;
                            var usecache = false;
                            var cache = q('r', 'template-' + j['necessary'][i], '', '', ''); /*Test Cache*/
                            if (cache['c']) { /*如果有缓存，先装载缓存*/
                                usecache = true;
                                var p = j['necessary'][i];
                                console.log('Template using cache:' + p);
                                window.htmls[p] = cache['c'];
                                o.templateloaded.push(p);
                                o.templonload -= 1;
                            }
                            $.aj(j['necessary'][i], '', {
                                success: function(m, p) {
                                    window.htmls[p] = m;
                                    if (!usecache) {
                                        o.templateloaded.push(p);
                                        o.templonload -= 1;
                                        q('w', 'template-' + p, m, timestamp(), '');
                                    } else if (cache['c'] !== m) { /*缓存需要更新*/
                                        q('w', 'template-' + p, m, timestamp(), '');
                                    } else { /*增加缓存读取次数*/
                                        q('e', 'template-' + p, '', '', 1);
                                    }
                                },
                                failed: function(m) { /*Failed*/
                                    console.log('Necessary HTML Load Failed...');
                                }
                            }, 'get', '', true);
                        }
                    }
                    var timer = setInterval(function() {
                        if (o.templonload <= 0) {
                            clearInterval(timer);
                            o.renderer(ct); /*Call the renderer*/
                        }
                    },
                    50); /*加快页面速度，我也是加把劲骑士！*/
                    j = null; /*释放*/
                }
            }
        },
        itempage: 0,
        switchpage: 0,
        nowpage: 0,
        realpage: 1,
        searchw: '',
        hashexist: false,
        rendering: false,
        /*渲染状态，同时队列中只能有一次渲染20200805*/
        itempagefixer: function() {
            var ot = this;
            var tj = window.mainjson; /*get json*/
            var counter = 1; /*项目计数*/
            for (var po in tj['dateindex']) {
                var nip = ot.itempage; /*重要！不要调换位置*/
                var pid = po.replace('post', '');
                var pt = tj['postindex'][pid];
                if (counter <= nip) {
                    if (pt['link']) {
                        ot.itempage += 1;
                    }
                }
                counter += 1;
            }
            ot.itempage -= 1; /*项目会多计算一个，减去*/
        },
        cd: function(rc) { /*covercutter封面<ifcover>去除器*/
            var rst = rc;
            while (rst.indexOf('<ifcover>') !== -1) {
                var coverhtml = B.gt('<ifcover>', '</ifcover>', rst, true);
                rst = B.r(rst, '<ifcover>' + coverhtml + '</ifcover>', ''); /*没有封面图就删掉整段*/
            }
            return rst;
        },
        clothmainrendered: false,
        /*渲染过的cloth,main放在这里*/
        checkfirstrender: function() { /*检查是不是第一次渲染，如果是就渲染cloth,main并喷到网页上*/
            var ot = this,
                j = window.templjson,
                cloth = window.htmls[j['templatehtmls']['cloth']],
                main = window.htmls[j['templatehtmls']['main']];
            if (!ot.clothmainrendered) { /*还没有渲染cloth,main模板*/
                console.log('first render');
                var render1 = ot.r(main, 'contents', '<div id=\'contentcontainer\'></div>', true); /*预设好id以便后面调用*/
                var render2 = ot.r(cloth, 'main', render1, true);
                var ghead = $.rmhead(render2); /*把cloth内的头部去掉，咱分头行动*/
                $.ht(ot.deltemptags(ghead[0]), 'container'); /*先把外皮给渲染出来*/
                $.addhead(ghead[1]); /*把头接到head里面去*/
                ot.clothmainrendered = true;
            }
        },
        back: function() { /*返回上一页*/
            window.history.go(-1);
        },
        renderer: function(fcontent = false) { /*(fcontent=是否指定内容)*/
            var ot = this;
            if (!ot.rendering) {
                ot.rendering = true; /*示意正在渲染20200805*/
                var j = window.templjson;
                md = new showdown.Converter();
                var comment = window.htmls[j['templatehtmls']['comment']];
                var pagetype = ot.gt('PageType', 'PageTypeEnd', fcontent); /*Get Page Type*/
                var tj = window.mainjson; /*get json*/
                if (pagetype == j['templatehtmls']['post']) {
                    var content = ot.gt('PostContent', 'PostContentEnd', fcontent); /*Get Post Content*/
                    var title = ot.gt('PostTitle', 'PostTitleEnd', fcontent); /*Get Post Title*/
                    var date = ot.gt('PostDate', 'PostDateEnd', fcontent); /*Get Post Date*/
                    var tags = ot.gt('PostTag', 'PostTagEnd', fcontent); /*Get Post Content*/
                    var pid = ot.gt('PostID', 'PostIDEnd', fcontent); /*Get Post ID*/
                    var cover = ot.gt('PostCover', 'PostCoverEnd', fcontent); /*Get Post Cover*/
                    var pagetitle = (ot.gt('MainTitle', 'MainTitleEnd', fcontent)).replace(/<\/?.+?>/g, ""); /*Get Page Title(No html characters)*/
                    var post = window.htmls[j['templatehtmls']['post']];
                    var render11 = ot.r(post, 'postcontent', ot.lazypre(md.makeHtml(ot.hc(ot.unrnspace(content.trim())))), true); /*unescape and Analyse md*/
                    var render12 = ot.r(render11, 'posttitle', title, true);
                    var alltags = [];
                    if (isNaN(date)) {
                        tags = '页面';
                    } else { /*Tag Process*/
                        alltags = tags.split(',');
                        tags = '';
                        alltags.forEach(function(i, v) {
                            tags = tags + '<a href="' + j['generatehtmls']['tags'] + '#' + encodeURIComponent(i) + '" class="taglink">' + i + '</a>,';
                        });
                        tags = tags.substr(0, tags.length - 1); /*去掉末尾逗号*/
                    }
                    var render13 = ot.r(render12, 'posttags', tags, true);
                    var render14 = ot.r(render13, 'postdate', $.dt(date), true);
                    var render15 = ot.r(render14, 'comments', comment, true); /*LoadCommentsForPost*/
                    var render16 = ot.r(render15, 'pid', pid, true); /*SetPid*/
                    render16 = ot.r(render16, 'pagetype', pagetype, true); /*SetPageType*/
                    render16 = ot.r(render16, 'PageType', '<!--[PageType]', '(', false); /*SetPageType*/
                    render16 = ot.r(render16, 'PageTypeEnd', '[PageTypeEnd]-->', '(', false); /*SetPageType*/
                    /*CoverProcess*/
                    if (cover && cover !== 'none' && cover !== '') {
                        render16 = ot.r(render16, 'postcover', cover, true); /*设定封面*/
                    } else { /*没有封面，按标签一起删掉*/
                        render16 = ot.cd(render16);
                    }
                    if (isNaN(date)) { /*不是页面，就不显示评论了*/
                        var r7 = render16.split('{(:PostEnd)}')[0] + '<!--PostEnd-->';
                        var r8 = '<!--Footer-->' + render16.split('{(Footer:)}')[1];
                        render16 = r7 + r8;
                    }
                    ot.checkfirstrender(); /*检查是否已经在页面中渲染cloth和main 20210125*/
                    $.title(pagetitle); /*设置title*/
                    $.ht(ot.deltemptags(render16), 'contentcontainer');
                    anichecker($.ecls($.loadset['listening'], '', false, true), function() {
                        ot.lazycheck(); /*LazyLoad初次检测*/
                    });
                    render16 = tj = null; /*释放*/
                } else if (pagetype == j['templatehtmls']['postlist']) {
                    var content = ot.gt('PostContent', 'PostContentEnd', fcontent); /*Get Post Content*/
                    var pagetitle = (ot.gt('MainTitle', 'MainTitleEnd', fcontent)).replace(/<\/?.+?>/g, ""); /*Get Page Title(No html characters)*/
                    var realtitle = pagetitle.replace('-', ''); /*Remove - */
                    var pt = window.htmls[j['templatehtmls']['postlist']];
                    var ptt = ot.gt('PostListTemplate', 'PostListTemplateEnd', pt),
                        morebtn = ot.gt('MoreBtn', 'MoreBtnEnd', pt),
                        backbtn = ot.gt('BackBtn', 'BackBtnEnd', pt);
                    ptt = ot.r(ptt, 'morebtn', '<div id=\'morebtn\'>' + morebtn + '</div>', true);
                    ptt = ot.r(ptt, 'backbtn', '<div id=\'backbtn\'>' + backbtn + '</div>', true);
                    var render11 = ot.r(ptt, 'postitems', '<div id=\'postitems\'>' + md.makeHtml(ot.unrnspace((content.trim()))) + '</div>', true); /*Analyse md*/
                    var render12 = ot.r(render11, 'pagetype', pagetype, true); /*SetPageType*/
                    render12 = ot.r(render12, 'PageType', '<!--[PageType]', '(', false); /*SetPageType*/
                    render12 = ot.r(render12, 'PageTypeEnd', '[PageTypeEnd]-->', '(', false); /*SetPageType*/
                    ot.itempage = parseInt(tj['posts_per_page']);
                    ot.itempagefixer(); /*修复因忽略页面而造成的列表重复*/
                    ot.checkfirstrender(); /*检查是否已经在页面中渲染cloth和main 20210125*/
                    $.title(realtitle); /*设置标题*/
                    $.ht(ot.deltemptags(render12), 'contentcontainer');
                    render12 = null; /*释放*/
                    var timer = setInterval(function() { /*CheckIndexPage*/
                        if (ot.gt('<!--[PageType]', '[PageTypeEnd]-->', false, true) !== j['templatehtmls']['postlist']) { /*跳离index页了*/
                            console.log('jumped out of index');
                            PJAX.sel('contentcontainer');
                            PJAX.start(); /*修复more按钮的bug - 20190727*/
                            ot.switchpage = 0;
                            clearInterval(timer);
                            return false;
                        }
                        ot.indexpagechecker();
                    },
                    100);
                } else if (pagetype == j['templatehtmls']['archives']) {
                    var pagetitle = (ot.gt('MainTitle', 'MainTitleEnd', fcontent)).replace(/<\/?.+?>/g, ""),
                        /*Get Page Title(No html characters)*/
                        ar = window.htmls[j['templatehtmls']['archives']],
                        /*get entire html*/
                        archivemain = ot.gt('Archives', 'ArchivesEnd', ar),
                        /*Get archive main html*/
                        archivetemp = ot.gt('ArchiveTemplate', 'ArchiveTemplateEnd', ar),
                        /*get section template*/
                        archiveitemtemp = ot.gt('ArchiveItemTemplate', 'ArchiveItemTemplateEnd', ar),
                        /*get item template*/
                        /*Generate Archives*/
                        din = tj['dateindex'],
                        renderar = '',
                        /*archive section render*/
                        renderarit = '',
                        /*archive item render*/
                        year = 0;
                    for (var td in din) {
                        var t = (din[td].toString()).substring(0, 4); /*get years*/
                        if (t !== year) {
                            year = t;
                            if (renderarit !== '') renderar = ot.r(renderar, 'archiveitems', renderarit, true), renderarit = ''; /*apply items to section*/
                            renderar += ot.r(archivetemp, 'archiveyear', t, true); /*render year section*/
                        }
                        var pid = td.replace('post', ''),
                            title = Base64.decode(tj['postindex'][pid]['title']),
                            date = tj['postindex'][pid]['date'],
                            itemlink = '';
                        if (!tj['postindex'][pid]['link']) { /*render items*/
                            itemlink = 'post-' + pid + '.html';
                        } else {
                            itemlink = tj['postindex'][pid]['link'] + '.html';
                        }
                        var itemrender = ot.r(archiveitemtemp, 'archiveitemlink', itemlink, true),
                            itemrender = ot.r(itemrender, 'archiveitemtitle', title, true),
                            itemrender = ot.r(itemrender, 'archiveitemdate', $.dt(date), true);
                        renderarit += itemrender;
                    }
                    if (renderarit !== '') renderar = ot.r(renderar, 'archiveitems', renderarit, true); /*apply items to section#2*/
                    renderar += '</ul>'; /*Generate Finish*/
                    var render11 = ot.r(archivemain, 'archives', renderar, true); /*渲染模板部分*/
                    //var render4 = ot.r(render3, 'title', pagetitle, true);
                    var render12 = ot.r(render11, 'pagetype', pagetype, true); /*SetPageType*/
                    render12 = ot.r(render12, 'PageType', '<!--[PageType]', '(', false); /*SetPageType*/
                    render12 = ot.r(render12, 'PageTypeEnd', '[PageTypeEnd]-->', '(', false); /*SetPageType*/
                    ot.checkfirstrender(); /*检查是否已经在页面中渲染cloth和main 20210125*/
                    $.title(pagetitle); /*设置标题*/
                    $.ht(ot.deltemptags(render12), 'contentcontainer');
                    render12 = null; /*释放*/
                } else if (pagetype == j['templatehtmls']['tags']) {
                    var pagetitle = (ot.gt('MainTitle', 'MainTitleEnd', fcontent)).replace(/<\/?.+?>/g, ""),
                        /*Get Page Title(No html characters)*/
                        tgs = window.htmls[j['templatehtmls']['tags']],
                        tagmain = ot.gt('Tags', 'TagsEnd', tgs),
                        /*Get tag main html*/
                        tagitemtemp = ot.gt('TagItemTemplate', 'TagItemTemplateEnd', tgs),
                        /*get item template*/
                        href = $.tr(window.location.href),
                        /*Generate Tags*/
                        rendertg = '',
                        pts = tj['postindex'],
                        tagarr = new Array();
                    for (var i in pts) {
                        var t = pts[i]['tags'].split(',');
                        t.forEach(function(item, index) {
                            if (item !== '' && tagarr.indexOf(item) == -1) {
                                tagarr.push(item);
                            }
                        });
                    }
                    tagarr.forEach(function(item, index) {
                        var g = ot.r(tagitemtemp, 'tagitemtitle', item, true); /*replace and render*/
                        g = ot.r(g, 'tagitemlink', '#' + encodeURIComponent(item), true);
                        rendertg += g;
                    });
                    ot.alltaghtml = rendertg;
                    if (href.indexOf('#') !== -1) {
                        var pg = href.split('#')[1];
                        ot.nowtag = pg;
                        if (pg !== 'alltags') {
                            rendertg = '<script>B.taguper(\'' + pg + '\');PJAX.sel(\'contentcontainer\');PJAX.start();</script>';
                        }
                    } /*Generate Finish*/
                    var timer = setInterval(function() { /*CheckTagPage*/
                        if (window.location.href.indexOf(j['generatehtmls']['tags']) == -1 && window.location.href.indexOf((j['generatehtmls']['tags']).replace('.html', '')) == -1) { /*跳离tag页了*/
                            PJAX.sel('contentcontainer');
                            PJAX.start();
                            clearInterval(timer);
                            return false;
                        }
                        ot.tagpagechecker();
                    },
                    100);
                    var render11 = ot.r(tagmain, 'tags', '<div id=\'contenttags\'>' + rendertg + '</div>', true);
                    var render12 = ot.r(render11, 'pagetype', pagetype, true); /*SetPageType*/
                    render12 = ot.r(render12, 'PageType', '<!--[PageType]', '(', false); /*SetPageType*/
                    render12 = ot.r(render12, 'PageTypeEnd', '[PageTypeEnd]-->', '(', false); /*SetPageType*/
                    ot.checkfirstrender(); /*检查是否已经在页面中渲染cloth和main 20210125*/
                    $.title(pagetitle); /*设置标题*/
                    $.ht(ot.deltemptags(render12), 'contentcontainer');
                    render12 = null; /*释放*/
                }
                ot.tpcheckstatu = false; /*模板检查拼接完毕*/
                ot.rendering = false; /*渲染完毕，空出队列20200805*/
                /*PJAX监听刷新*/
                PJAX.autoprevent();
                PJAX.sel('contentcontainer');
                PJAX.start();
                ot.navcheck(); /*进行导航栏检查*/
                window.dispatchEvent(PJAX.PJAXFinish); /*调用事件隐藏loading浮层20201229*/
            }
        },
        nowtag: '',
        alltaghtml: '',
        taguper: function(tg) { /*渲染特定标签索引的文章列表*/
            tg = decodeURIComponent(tg);
            var eh = SC('html').innerHTML,
                ot = this,
                j = window.templjson,
                tgs = window.htmls[j['templatehtmls']['tags']],
                /*get main tag html*/
                taglisttemp = ot.gt('TagListTemplate', 'TagListTemplateEnd', tgs),
                /*get item template*/
                taglistitemtemp = ot.gt('TagListItemTemplate', 'TagListItemTemplateEnd', tgs),
                /*get item template*/
                tj = window.mainjson; /*get json*/
            var dti = tj['dateindex'];
            var pts = tj['postindex'];
            var postlist = new Array();
            var rendertgs = '';
            for (var i in dti) { /*Sel Posts in the order of date*/
                var pid = i.replace('post', '');
                if (pts[pid]['tags'].indexOf(tg) !== -1) {
                    postlist.push(pid);
                }
            }
            rendertgs += '<ul>';
            postlist.forEach(function(it, id) {
                var post = pts[it];
                var lk = 'post-' + it + '.html',
                    date = $.dt(post['date']);
                if (post['link']) {
                    lk = post['link'] + '.html';
                }
                var g = ot.r(taglistitemtemp, 'taglistitemlink', lk, true);
                g = ot.r(g, 'taglistitemtitle', Base64.decode(post['title']), true);
                g = ot.r(g, 'taglistitemdate', $.dt(date), true);
                rendertgs += g;
            });
            rendertgs = ot.r(taglisttemp, 'taglist', rendertgs, true);
            rendertgs = ot.r(rendertgs, 'tagcurrent', tg, true);
            SC('contenttags').innerHTML = rendertgs;
            rendertgs = null; /*释放*/
        },
        tagpagechecker: function() { /*标签页hash更新检查器*/
            var ot = this;
            var eh = SC('html').innerHTML; /*Get All html*/
            var href = $.tr(window.location.href);
            if (href.indexOf('#') == -1) {
                PJAX.pause();
                window.location.replace(href + '#alltags'); /*利用replace防止浏览器记录history导致无法回退的bug*/
                PJAX.start();
            } else {
                var pg = href.split('#')[1];
                if (ot.nowtag !== pg) {
                    ot.nowtag = pg;
                    if (pg == 'alltags') {
                        if (SC('contenttags')) {
                            SC('contenttags').innerHTML = ot.alltaghtml;
                        }
                    } else {
                        ot.taguper(pg);
                    }
                    PJAX.start();
                }
            }
        },
        indexpagechecker: function() {
            var eh = SC('html').innerHTML; /*Get All html*/
            var j = window.templjson;
            var href = $.tr(decodeURIComponent(window.location.href));
            var tj = window.mainjson; /*get json*/
            var maxrender = parseInt(tj['posts_per_page']);
            var ot = this;
            if (href.indexOf('#') !== -1) {
                ot.hashexist = true;
                var pg = href.split('#')[1];
                if (href.indexOf('#!') == -1) {
                    if (!isNaN(pg)) {
                        var pnum = parseInt(pg) - 1;
                        if (ot.nowpage !== pnum) {
                            console.log('hash changed');
                            ot.searchw = ''; /*不在搜索模式,重置搜索词*/
                            ot.nowpage = pnum;
                            var allps = maxrender * pnum * ot.moreperpage; /*根据页码计算当前页*/
                            ot.itempage = allps;
                            ot.itempagefixer(); /*修复因忽略页面而造成的列表重复*/
                            SC('postitems').innerHTML = '';
                            ot.more(true); /*顺序不要颠倒!*/
                            ot.realpage = pnum + 1;
                            ot.switchpage = 0;
                        }
                    }
                } else { /*Search mode*/
                    var rendertp = '';
                    var item = window.htmls[j['templatehtmls']['postitem']],
                        ptitem = ot.gt('PostItem', 'PostItemEnd', item),
                        /*有项目的模板*/
                        noitem = ot.gt('NoItem', 'NoItemEnd', item); /*无项目的模板*/
                    var v = href.split('#!')[1];
                    if (v !== ot.searchw) {
                        ot.searchw = v;
                        var pt = tj['postindex'];
                        for (var i in pt) {
                            var tt = (Base64.decode(pt[i]['title'])).toLowerCase();
                            var cc = (Base64.decode(pt[i]['intro'])).toLowerCase();
                            var dd = (pt[i]['date']).toLowerCase();
                            var tags = pt[i]['tags'],
                                tg = tags.toLowerCase();
                            v = v.toLowerCase(); /*大小写忽略*/
                            if (tt.indexOf(v) !== -1 || cc.indexOf(v) !== -1 || dd.indexOf(v) !== -1 || tg.indexOf(v) !== -1) {
                                var render1 = B.r(ptitem, 'postitemtitle', tt, true);
                                var render2 = B.r(render1, 'postitemintro', cc + '...', true);
                                var render3 = B.r(render2, 'postitemdate', $.dt(dd), true);
                                var render35 = B.r(render3, 'postitemtags', tags.replace(/,/g, '·'), true); /*20201229加入对于文章列表单项模板中tags的支持*/
                                var render4;
                                if (!pt[i]['link']) {
                                    render4 = B.r(render35, 'postitemlink', 'post-' + i + '.html', true); /*把页面也算入*/
                                } else {
                                    render4 = B.r(render35, 'postitemlink', pt[i]['link'] + '.html', true);
                                }
                                if (pt[i]['cover']) { /*如果有封面*/
                                    render4 = B.r(render4, 'postcover', pt[i]['cover'], true); /*把页面也算入*/
                                } else {
                                    render4 = ot.cd(render4); /*没有封面就删掉整段<ifcover>*/
                                }
                                rendertp += render4; /*渲染到列表模板*/
                                render4 = null; /*释放*/
                            }
                        }
                        if (rendertp == '') {
                            rendertp = noitem;
                        }

                        function process() { /*局部函数*/
                            if (SC('postitems') && SC('morebtn')) {
                                window.scrollTo(0, 0);
                                SC('postitems').innerHTML = rendertp;
                                SC('morebtn').style.display = 'none';
                                PJAX.start(); /*refresh pjax links*/
                            } else {
                                setTimeout(function() {
                                    return process();
                                }, 200); /*如果没有需要的元素存在滞留一下*/
                            }
                        }
                        if (!ot.tpcheckstatu && !ot.loadstatu) { /*如果页面加载完,模板拼接完毕就可以打印搜索结果了*/
                            process();
                        }
                    }
                    if (ot.tpcheckstatu || ot.loadstatu) { /*如果模板未拼接完毕，清理搜索词延续循环(外层setInterval)*/
                        ot.searchw = '';
                    }
                }
            } else {
                ot.searchw = ''; /*不在搜索模式,重置搜索词*/
                if (ot.hashexist) {
                    ot.realpage = 1;
                    ot.switchpage = 0;
                    ot.hashexist = false;
                }
            }
        },
        loadshow: function() {
            this.loadstatu = true; /*加载未就绪*/
            if ($.loadset['animations']) {
                var es = $.loadset['animations']['in'],
                    eo = $.loadset['animations']['out'];
                for (var i in es) {
                    $.ecls(i, es[i]);
                }
                for (var i in eo) {
                    $.ecls(i, eo[i], true); /*移除元素*/
                }
            }
        },
        loadhide: function() {
            this.loadstatu = false; /*加载就绪*/
            var es = $.loadset['animations']['out'],
                eo = $.loadset['animations']['in'];
            for (var i in es) {
                $.ecls(i, es[i]);
            }
            for (var i in eo) {
                $.ecls(i, eo[i], true); /*移除元素*/
            }
        },
        morehtmls: {},
        more: function(nochangehash = false) { /*(是否阻止改变hash(用于适配indexpagechecker20200812)*/
            var ot = this;
            var j = window.templjson;
            var start = ot.itempage + 1; /*当前列表起始文章id*/
            var counter = 0;
            var itemid = 0;
            var listrender = '';
            var tj = window.mainjson; /*get json*/
            var item = window.htmls[j['templatehtmls']['postitem']],
                ptitem = ot.gt('PostItem', 'PostItemEnd', item),
                /*有项目的模板*/
                noitem = ot.gt('NoItem', 'NoItemEnd', item); /*无项目的模板*/
            var maxrender = parseInt(tj['posts_per_page']);
            var end = start + maxrender;
            var postids = tj['dateindex'];
            var overpages = 0;
            for (var i in postids) {
                if (start <= itemid) {
                    if (counter < maxrender) {
                        var pid = i.replace('post', '');
                        var pt = tj['postindex'][pid];
                        if (!pt['link']) { /*排除页面在外*/
                            var render1 = B.r(ptitem, 'postitemtitle', Base64.decode(pt.title), true);
                            var render2 = B.r(render1, 'postitemintro', Base64.decode(pt.intro) + '...', true);
                            var render3 = B.r(render2, 'postitemdate', $.dt(pt.date), true);
                            var render35 = B.r(render3, 'postitemtags', pt.tags.replace(/,/g, '·'), true); /*20201229加入对于文章列表单项模板中tags的支持*/
                            var render4 = B.r(render35, 'postitemlink', 'post-' + pid + '.html', true);
                            if (pt['cover']) { /*如果有封面*/
                                render4 = B.r(render4, 'postcover', pt['cover'], true); /*把页面也算入*/
                            } else {
                                render4 = ot.cd(render4); /*没有封面就删掉所有<ifcover>*/
                            }
                            listrender += render4; /*渲染到列表模板*/
                        } else {
                            ot.itempage += 1;
                            counter -= 1;
                        }
                        counter += 1;
                    } else {
                        overpages += 1; /*剩余没加载文章数量*/
                    }
                } else {
                    itemid += 1;
                }
            }
            if (listrender == '') { /*没有更多文章了*/
                listrender = noitem;
                SC('morebtn').style.display = 'none';
            } else {
                SC('morebtn').style.display = 'block';
            }
            ot.itempage = ot.itempage + maxrender;
            if (ot.switchpage >= (ot.moreperpage - 1) && !nochangehash) { /*nochangehash搭配indexpagefixer20200812*/
                SC('postitems').innerHTML = listrender;
                ot.scrolltop(20, 2);
                ot.switchpage = 0;
                ot.realpage += 1;
                PJAX.pause();
                window.location.href = '#' + ot.realpage;
            } else {
                SC('postitems').innerHTML = SC('postitems').innerHTML + listrender;
                ot.switchpage += 1;
            }
            if (SC('backbtn')) {
                if (ot.realpage == 1) {
                    SC('backbtn').style.display = 'none';
                } else {
                    SC('backbtn').style.display = 'block';
                }
            }
            PJAX.start(); /*refresh pjax links*/
        }
    };
    window.addEventListener('scroll', B.lazycheck, false); /*LazyLoadCheck*/
    window.addEventListener('pjaxstart',

    function() { /*加载动画*/
        B.loadshow();
    },
    false);
    window.addEventListener('pjaxfinish',

    function() {
        B.loadhide();
    },
    false);
}

function anichecker(e, func) { /*css3变换检查器(元素,执行完毕执行的函数)*/
    var ts = '';
    var tss = {
        'animation': 'animationend',
        'OAnimation': 'oAnimationEnd',
        'MozAnimation': 'animationend',
        'WebkitAnimation': 'webkitAnimationEnd'
    }; /*兼容多浏览器*/
    for (var i in tss) {
        if (e.style[i] !== undefined) {
            ts = tss[i];
        }
    }

    function doit() {
        func();
        e.removeEventListener(ts, doit);
    }
    e.addEventListener(ts, doit);
} /*Simple PJAX For Front MAIN - SomeBottle*/
var mainhost = window.location.host;
var dt = new Date().getTime();
if (PJAX == undefined || PJAX == null) { /*防止重初始化*/
    var PJAX = {
        index: window.history.state === null ? 1 : window.history.state.page,
        PJAXStart: new CustomEvent('pjaxstart'),
        PJAXFinish: new CustomEvent('pjaxfinish'),
        LoadedPage: {},
        lasthref: window.location.href,
        preventurl: new Array(),
        recenturl: '',
        replace: '',
        statu: true,
        sel: function(r) {
            this.replace = r;
        },
        jump: function(href) {
            var ehref = encodeURIComponent(href);
            var ts = this;
            var usecache = false; /*是否使用缓存*/
            var e = ts.replace;
            if (e == '') {
                e = 'contentcontainer'; /*默认指定container*/
            }
            var listener; /*初始化监听器*/
            if (ts.recenturl.indexOf('#') !== -1 && href.indexOf('#') !== -1) { /*防止Tag页面的跳转问题*/
                return false;
            } else if (ts.recenturl.indexOf('#') == -1 && href.indexOf('#') !== -1) {
                B.nowpage = 0; /*防止页码bug*/
            }
            window.dispatchEvent(ts.PJAXStart); /*激活事件来显示加载动画*/
            anichecker($.ecls($.loadset['listening'], '', false, true), function() {
                window.scrollTo(0, 0); /*滚动到头部*/
                if (ts.LoadedPage[ehref]) { /*临时缓存*/
                    ts.clearevent(); /*清除之前的监听器*/
                    B.tpcheck(false, ts.LoadedPage[ehref]); /*因为tpcheck末尾已经有loadhide，此处没必要anichecker20201229*/
                } else {
                    var cache = q('r', ehref, '', '', ''); /*获取缓存信息*/
                    if (cache['c']) { /*如果有缓存*/
                        usecache = true; /*本地缓存使用模式*/
                        ts.clearevent(); /*清除之前的监听器*/
                        B.tpcheck(false, cache['c']); /*预填装缓存*/
                    }
                    $.aj(href, {}, {
                        success: function(m) {
                            ts.recenturl = href;
                            ts.LoadedPage[ehref] = m;
                            if (!usecache) { /*如果没有使用本地缓存就缓存传输过来的数据*/
                                ts.clearevent(); /*清除之前的监听器*/
                                B.tpcheck(false, m);
                                q('w', ehref, m, timestamp(), '');
                            } else {
                                if (cache['c'] !== m) { /*缓存需要更新了，把新数据写入本地*/
                                    q('w', ehref, m, timestamp(), '');
                                    ts.clearevent();
                                    B.tpcheck(false, m);
                                } else {
                                    q('e', ehref, '', '', 1); /*更新缓存读取次数*/
                                }
                            } /*因为tpcheck末尾已经有loadhide，此处没必要anichecker20201229*/
                        },
                        failed: function(m) {
                            window.dispatchEvent(ts.PJAXFinish);
                        }
                    }, 'get', '', true);
                }
            });
        },
        pjaxautojump: function() {
            if (PJAX.recenturl.split('#')[0] == window.location.href) { /*用于处理首页没有hash和有hash页码时回退跳转的问题20200808*/
                window.history.replaceState(null, null, window.location.href + '#1'); /*从https://xxx/#2回退到https://xxx/时自动变成https://xxx/#1跳转到页码1(不改变历史)20200808*/
                PJAX.jump(window.location.href + '#1');
            }
            if (window.location.href.indexOf(mainhost) !== -1) { /*回退时跳转20200808*/
                PJAX.jump(window.location.href);
            }
        },
        clickevent: function(e) {
            if (PJAX.preventurl.indexOf(this.href) !== -1 || !this.href || this.href == '') {
                return true;
            } else {
                window.history.pushState(null, null, this.href); /*加入历史*/
                e.preventDefault();
                PJAX.jump(this.href);
            }
        },
        clearevent: function() { /*移除所有a标签事件*/
            var ts = this,
                p = document.getElementsByTagName("a");
            for (var i in p) {
                if (typeof(p[i].removeEventListener) == 'function') { /*防止不是函数的凑数*/
                    p[i].removeEventListener('click', ts.clickevent); /*取消监听A标签*/
                }
            }
            p = null;
        },
        start: function() {
            var ts = this;
            ts.statu = true; /*启动*/
            ts.recenturl = window.location.href;
            ts.clearevent(); /*先清除之前的监听器*/
            var p = document.getElementsByTagName("a");
            for (var i in p) {
                var onc = p[i] instanceof Element ? p[i].getAttribute('onclick') : null; /*检查a标签是否有onclick属性20210126*/
                if (typeof(p[i].addEventListener) == 'function' && !onc) { /*防止不是元素的凑数，a标签带onclick属性就不监听了20210126*/
                    p[i].setAttribute('pjax', ''); /*设置标识*/
                    p[i].addEventListener('click', ts.clickevent, false); /*监听A标签*/
                }
            } /*回退时触发*/
            window.addEventListener('popstate', PJAX.pjaxautojump, false);
            p = null;
        },
        pause: function() {
            this.statu = false; /*暂停*/
            window.removeEventListener('popstate', PJAX.pjaxautojump); /*移除实践，暂停pjax*/
        },
        autoprevent: function() {
            var ts = this;
            var p = document.getElementsByTagName("a");
            var h = window.location.host;
            for (var i in p) {
                if (p[i].href !== undefined) {
                    if (p[i].href.indexOf(h) == -1) {
                        ts.preventurl.push(p[i].href);
                    }
                }
            }
            p = null;
        }
    };
} /*CacheArea - Thank you OBottle*/

function q(md, k, c, t, rt) { /*(mode,key,content,timestamp,readtime)*/
    /*初始化本地cache*/
    if (typeof localStorage.obottle == 'undefined') {
        localStorage.obottle = '{}';
    }
    var timestamp = 0,
        cache = '',
        caches = JSON.parse(localStorage.obottle),
        rs = new Array();
    if (typeof caches[k] !== 'undefined') {
        timestamp = caches[k].t;
        cache = caches[k].h;
    }
    if (md == 'w') {
        var caches = JSON.parse(localStorage.obottle);
        var cc = new Object();
        cc.h = c;
        cc.t = t;
        cc.rt = 0; /*使用缓存次数*/
        caches[k] = cc;
        try {
            localStorage.obottle = JSON.stringify(caches);
        } catch (e) {
            for (var d in caches) {
                if (Number(caches[d].rt) <= 20 || Number(t) - Number(caches[d].t) >= 172800) { /*自动清理缓存空间*/
                    delete caches[d];
                }
            }
            localStorage.obottle = JSON.stringify(caches);
        }
    } else if (md == 'r') {
        rs['t'] = timestamp;
        rs['c'] = cache;
        return rs;
    } else if (md == 'e') {
        var caches = JSON.parse(localStorage.obottle);
        caches[k].rt = Number(caches[k].rt) + rt;
        localStorage.obottle = JSON.stringify(caches);
    }
} /*GetTimestamp*/

function timestamp() {
    var a = new Date().getTime();
    return a;
}
B.tpcheck(); /*Activate Template Checker*/
