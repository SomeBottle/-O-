/*FrontMainJS - SomeBottle*/
/*q.js*/
var md;
if (typeof($) !== 'object') {
    $ = new Object();
    $.ls = new Array();
    $.lss = '';
    $.aj = function(p, d, sf, m, proxy, as) {
        /*(path,data,success or fail,method,proxyurl,async)*/
        if (p !== 'false' && p) {
            /*奇妙的false问题*/
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
    var SC = function(e) {
        /*元素选择器*/
        if (e == 'body') {
            return document.body;
        } else if (e == 'html') {
            return document.getElementsByTagName('html')[0];
        } else {
            return document.getElementById(e);
        }
    }
    $.script = function(url) {
        /*外部js加载器，页面已经加载的不会重复加载*/
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
    }
    $.ht = function(h, e, scinclude = true) {
        /*元素内容设置器(html,element,run script or not when ht)*/
        var ht = SC(e);
        if (!ht) {
            console.log('Unable to find the Element:' + e);
            return false;
        }
        ht.innerHTML = h;
        os = ht.getElementsByTagName('script');
        var scr = '';
        for (var o = 0; o < os.length; o++) {
            if (os[o].src !== undefined && os[o].src !== null && os[o].src !== '') {
                $.script(os[o].src);
            } else {
                try {
                    /*Oh...No Errors!*/
                    var h = os[o].innerHTML;
                    if (scinclude) {
                        /*是否去除注释执行*/
                        h = B.r(h, '/*', '');
                        h = B.r(h, '*/', '');
                    }
                    eval(h);
                } catch (e) {
                    console.log('Page script Error: ' + e.message);
                }
            }
        }
    }
    $.tr = function(url) {
        /*PreventURLProblem(Fuck QQ Querying URI*/
        var a = url;
        b = a.split('?');
        if (b[1]) {
            return b[0];
        } else {
            return a;
        }
    }
    $.dt = function(v) {
        /*date transformer*/
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
	$.rmhead=function(html){/*去头并返回处理后的内容*/
         var tp=document.createElement('html');
	     tp.innerHTML=html;
	     var head=tp.getElementsByTagName('head')[0];
	     head.parentNode.removeChild(head);
	     return [tp.innerHTML,head.innerHTML];
    }
	$.addhead=function(hd){/*接头霸王*/
        var e=SC('html'),head=e.getElementsByTagName('head')[0],clothstyle=head.getElementsByTagName('clothstyle');
		if(clothstyle.length<=0){/*还没有渲染cloth的头部*/
		    var cloth=document.createElement('clothstyle');
			cloth.innerHTML=hd;
			head.appendChild(cloth);
		}else{/*渲染过了，直接改*/
			clothstyle[0].innerHTML=hd;
		}
    }
}
if (!B) {
    /*PreventInitializingTwice*/
    /*Include LoadingPage*/
    if (localStorage['obottle-ldpage']) {
        var e = SC('html').innerHTML;
        SC('html').innerHTML = e.replace('<!--[LoadingArea]-->', localStorage['obottle-ldpage']);
    }
    $.aj('./loading.html', '', {
        success: function(m, p) {
            B.hr('<!--[LoadingArea]-->', m);
            localStorage['obottle-ldpage'] = m;
        },
        failed: function(m) {
            /*Failed*/
            console.log('LoadingPage Load Failed');
        }
    }, 'get', '', true);
    $.script('./library.js'); /*Include Library Once*/
    window.htmls = new Object();
    var B = {
        /*B Part*/
        moreperpage: 0,
        r: function(a, o, p, g = true) {
            /*(All,Original,ReplaceStr,IfReplaceAll)*/
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
        navcurrent: function(v = '') {
            /*getcurrentnav*/
            return ((-1 == v.indexOf('http') ? v = v : (v.replace(window.location.protocol + '//' + window.location.hostname, ''))) || window.location.pathname).replace('.html', ''); /*割掉尾巴*/
        },
        navcheck: function() {
            /*modify html*/
            var c = document.body,
                o = this,
                cl = o.navlist.conf;
            if (o.navlist.statu) {
                var e = c.getElementsByClassName(cl.navclass),
                    path = o.navcurrent();
                for (var i in e) {
                    var p = o.navcurrent(e[i].href);
                    if (path == p && e[i] instanceof Element) {
                        e[i].classList.add(cl.activeclass); /*设置为焦点*/
                    } else if (e[i] instanceof Element) {
                        (e[i].classList.contains(cl.activeclass)) ? (e[i].classList.remove(cl.activeclass)) : p = p; /*取消其他的焦点*/
                    }
                }
            }
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
                } else if (parseInt(ntnow) > (stages)) {
                    /*第二阶段*/
                    document.body.scrollTop = parseInt(ntnow) - vn;
                } else if (parseInt(ntnow) <= (stages)) {
                    /*第三阶段*/
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
        hc: function(v) {
            /*反转义html的某些字符*/
            v = ((v.replace(/&amp;/g, "&")).replace(/&lt;/g, "<")).replace(/&gt;/g, ">");
            return v;
        },
        hr: function(o, p) {
            /*htmlreplace*/
            var e = SC('html').innerHTML;
            SC('html').innerHTML = this.r(e, o, p);
        },
        unrnspace: function(h) {
            /*文章空格换行替换还原*/
            h = h.replace(/{{s}}/g, " ");
            h = h.replace(/{{rn}}/g, "\r\n");
            h = h.replace(/{{n}}/g, "\n");
            return h;
        },
        deltemptags: function(h) {
            /*删除模板多余的标识符，像{(xxx)}一类*/
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
        },
        dehtml: function(h) {
            /*decodehtml*/
            var temp = h.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#39;/g, "\'").replace(/&quot;/g, "\"");
            return temp;
        },
        gt: function(p1, p2, ct = false) {
            /*htmlget*/
            var e;
            if (!ct) {
                e = SC('html').innerHTML;
            } else {
                e = ct;
            }
            try {
                var k = e.split(p1)[1];
                var d = k.split(p2)[0];
                return this.dehtml(d);
            } catch (e) {
                return false;
            }
        },
        lazypre: function(c) {
            /*处理Lazyload图片*/
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
            return i.innerHTML;
        },
        lazycheck: function() {
            /*包租婆————怎么没水了呢？*/
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
        },
        templonload: 0,
        /*LoadingTemplates*/
        templateloaded: new Array(),
        tpcheckstatu: false,
        /*模板拼接状态*/
        loadstatu: false,
        /*加载div显示状态*/
        tpcheck: function() {
            /*template check*/
            var ot = this,
                o = this;
            ot.tpcheckstatu = true; /*正在检查模板*/
            ot.loadshow();
            var pagetype = ot.gt('{(PageType)}', '{(PageTypeEnd)}'); /*Get Page Type*/
            if (!window.templjson) {
                $.aj('template.json', '', {
                    success: function(m) {
                        window.templjson = JSON.parse(m);
                        return ot.tpcheck();
                    },
                    failed: function(m) {
                        /*Failed*/
                        console.log('TemplateJson Load Failed.');
                    }
                }, 'get', '', true);
            } else if (!window.mainjson && window.templjson['usemain'].indexOf(pagetype) !== -1) {
                /*Some pages are in need of Main.json*/
                if (!window.mainjsonrequest) {
                    /*Include Mainjson*/
                    window.mainjsonrequest = true; /*make request flag*/
                    $.aj(window.templjson['mainjson'], '', {
                        success: function(m) {
                            window.mainjson = JSON.parse(m.replace(/[\r\n]/g, ""));
                            ot.moreperpage = parseInt(window.mainjson['more_per_page']); /*Update moreperpage*/
                        },
                        failed: function(m) {
                            /*Failed*/
                            console.log('MainJson Load Failed');
                        }
                    }, 'get', '', true);
                }
                setTimeout(function() {
                        return o.tpcheck();
                    },
                    100);
            } else if (typeof showdown !== 'object') {
                /*Markdown is not ready!*/
                setTimeout(function() {
                        return o.tpcheck();
                    },
                    100);
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
                        if (cache['c']) {
                            /*如果有缓存，先装载缓存*/
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
                                } else if (cache['c'] !== m) {
                                    /*缓存需要更新*/
                                    q('w', 'template-' + p, m, timestamp(), '');
                                } else {
                                    /*增加缓存读取次数*/
                                    q('e', 'template-' + p, '', '', 1);
                                }
                            },
                            failed: function(m) {
                                /*Failed*/
                                console.log('Necessary HTML Load Failed...');
                            }
                        }, 'get', '', true);
                    }
                }
                var timer = setInterval(function() {
                        if (o.templonload <= 0) {
                            clearInterval(timer);
                            o.renderer(); /*Call the renderer*/
                        }
                    },
                    50); /*加快页面速度，我也是加把劲骑士！*/
            }
        },
        itempage: 0,
        switchpage: 0,
        nowpage: 0,
        realpage: 1,
        searchw: '',
        hashexist: false,
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
        cd: function(rc) {
            /*covercutter封面<ifcover>去除器*/
            var rst = rc;
            while (rst.indexOf('<ifcover>') !== -1) {
                var coverhtml = B.gt('<ifcover>', '</ifcover>', rst);
                rst = B.r(rst, '<ifcover>' + coverhtml + '</ifcover>', ''); /*没有封面图就删掉整段*/
            }
            return rst;
        },
        renderer: function() {
            var ot = this;
            var j = window.templjson;
            md = new showdown.Converter();
            var cloth = window.htmls[j['templatehtmls']['cloth']];
            var main = window.htmls[j['templatehtmls']['main']];
            var comment = window.htmls[j['templatehtmls']['comment']];
            var pagetype = ot.gt('{(PageType)}', '{(PageTypeEnd)}'); /*Get Page Type*/
            var tj = window.mainjson; /*get json*/
            if (pagetype == j['templatehtmls']['post']) {
                var content = ot.gt('{(PostContent)}', '{(PostContentEnd)}'); /*Get Post Content*/
                var title = ot.gt('{(PostTitle)}', '{(PostTitleEnd)}'); /*Get Post Title*/
                var date = ot.gt('{(PostDate)}', '{(PostDateEnd)}'); /*Get Post Date*/
                var tags = ot.gt('{(PostTag)}', '{(PostTagEnd)}'); /*Get Post Content*/
                var pid = ot.gt('{(PostID)}', '{(PostIDEnd)}'); /*Get Post ID*/
                var cover = ot.gt('{(PostCover)}', '{(PostCoverEnd)}'); /*Get Post Cover*/
                var pagetitle = (ot.gt('{(MainTitle)}', '{(MainTitleEnd)}')).replace(/<\/?.+?>/g, ""); /*Get Page Title(No html characters)*/
                var post = window.htmls[j['templatehtmls']['post']];
                var render11 = ot.r(post, '{[postcontent]}', ot.lazypre(md.makeHtml(ot.hc(ot.unrnspace(content.trim()))))); /*unescape and Analyse md*/
                var render12 = ot.r(render11, '{[posttitle]}', title);
                var alltags = [];
                if (isNaN(date)) {
                    tags = '页面';
                } else {
                    /*Tag Process*/
                    alltags = tags.split(',');
                    tags = '';
                    alltags.forEach(function(i, v) {
                        tags = tags + '<a href="' + j['generatehtmls']['tags'] + '#' + encodeURIComponent(i) + '" class="taglink">' + i + '</a>,';
                    });
                    tags = tags.substr(0, tags.length - 1); /*去掉末尾逗号*/
                }
                var render13 = ot.r(render12, '{[posttags]}', tags);
                var render14 = ot.r(render13, '{[postdate]}', $.dt(date));
                var render2 = ot.r(main, '{[contents]}', render14);
                var render3 = ot.r(cloth, '{[main]}', render2);
                var render4 = ot.r(render3, '{[title]}', pagetitle);
				var ghead=$.rmhead(render4);/*把cloth内的头部去掉，咱分头行动*/
                var render5 = ot.r(ghead[0], '{[comments]}', comment); /*LoadCommentsForPost*/
                var render6 = ot.r(render5, '{[pid]}', pid); /*SetPid*/
                render6 = ot.r(render6, '{[pagetype]}', pagetype); /*SetPageType*/
                render6 = ot.r(render6, '{(PageType)}', '<!--[PageType]'); /*SetPageType*/
                render6 = ot.r(render6, '{(PageTypeEnd)}', '[PageTypeEnd]-->'); /*SetPageType*/
                /*CoverProcess*/
                if (cover && cover !== 'none' && cover !== '') {
                    render6 = ot.r(render6, '{[postcover]}', cover); /*设定封面*/
                } else {
                    /*没有封面，按标签一起删掉*/
                    render6 = ot.cd(render6);
                }
                if (isNaN(date)) {
                    //render6 = render6.split('<!--PostEnd-->')[0] + '<!--PostEnd-->';
                    var r7 = render6.split('{(:PostEnd)}')[0] + '<!--PostEnd-->';
                    var r8 = '<!--Footer-->' + render6.split('{(Footer:)}')[1];
                    render6 = r7 + r8;
                }
                $.ht(ot.deltemptags(render6), 'container');
				$.addhead(ghead[1]);/*接头霸王来了*/
                transitionchecker('loading', function() {
                    ot.lazycheck();
                });
                ot.loadhide();
            } else if (pagetype == j['templatehtmls']['postlist']) {
                var content = ot.gt('{(PostContent)}', '{(PostContentEnd)}'); /*Get Post Content*/
                var pagetitle = (ot.gt('{(MainTitle)}', '{(MainTitleEnd)}')).replace(/<\/?.+?>/g, ""); /*Get Page Title(No html characters)*/
                var realtitle = pagetitle.replace('-', ''); /*Remove - */
                var pt = window.htmls[j['templatehtmls']['postlist']];
                var render11 = ot.r(pt, '{[postitems]}', md.makeHtml(ot.unrnspace((content.trim())))); /*Analyse md*/
                var render2 = ot.r(main, '{[contents]}', render11);
                var render3 = ot.r(cloth, '{[main]}', render2);
                var render4 = ot.r(render3, '{[title]}', realtitle);
				var ghead=$.rmhead(render4);/*把cloth内的头部去掉*/
                var render4 = ot.r(ghead[0], '{[pagetype]}', pagetype); /*SetPageType*/
                render4 = ot.r(render4, '{(PageType)}', '<!--[PageType]'); /*SetPageType*/
                render4 = ot.r(render4, '{(PageTypeEnd)}', '[PageTypeEnd]-->'); /*SetPageType*/
                ot.itempage = parseInt(tj['posts_per_page']);
                ot.itempagefixer(); /*修复因忽略页面而造成的列表重复*/
                $.ht(ot.deltemptags(render4), 'container');
				$.addhead(ghead[1]);/*接头霸王来了*/
                ot.loadhide();
                var timer = setInterval(function() {
                        /*CheckIndexPage*/
                        if (ot.gt('<!--[PageType]', '[PageTypeEnd]-->') !== j['templatehtmls']['postlist']) {
                            /*跳离index页了*/
                            PJAX.sel('container');
                            PJAX.start(); /*修复more按钮的bug - 20190727*/
                            ot.switchpage = 0;
                            clearInterval(timer);
                            return false;
                        }
                        ot.indexpagechecker();
                    },
                    100);
            } else if (pagetype == j['templatehtmls']['archives']) {
                var pagetitle = (ot.gt('{(MainTitle)}', '{(MainTitleEnd)}')).replace(/<\/?.+?>/g, ""),
                    /*Get Page Title(No html characters)*/
                    ar = window.htmls[j['templatehtmls']['archives']],
                    /*get entire html*/
                    archivemain = ot.gt('{(Archives)}', '{(ArchivesEnd)}', ar),
                    /*Get archive main html*/
                    archivetemp = ot.gt('{(ArchiveTemplate)}', '{(ArchiveTemplateEnd)}', ar),
                    /*get section template*/
                    archiveitemtemp = ot.gt('{(ArchiveItemTemplate)}', '{(ArchiveItemTemplateEnd)}', ar),
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
                        if (renderarit !== '') renderar = ot.r(renderar, '{[archiveitems]}', renderarit), renderarit = ''; /*apply items to section*/
                        renderar += ot.r(archivetemp, '{[archiveyear]}', t); /*render year section*/
                    }
                    var pid = td.replace('post', ''),
                        title = Base64.decode(tj['postindex'][pid]['title']),
                        date = tj['postindex'][pid]['date'],
                        itemlink = '';
                    if (!tj['postindex'][pid]['link']) {
                        /*render items*/
                        itemlink = 'post-' + pid + '.html';
                    } else {
                        itemlink = tj['postindex'][pid]['link'];
                    }
                    var itemrender = ot.r(archiveitemtemp, '{[archiveitemlink]}', itemlink),
                        itemrender = ot.r(itemrender, '{[archiveitemtitle]}', title),
                        itemrender = ot.r(itemrender, '{[archiveitemdate]}', $.dt(date));
                    renderarit += itemrender;
                }
                if (renderarit !== '') renderar = ot.r(renderar, '{[archiveitems]}', renderarit); /*apply items to section#2*/
                renderar += '</ul>'; /*Generate Finish*/
                var render11 = ot.r(archivemain, '{[archives]}', renderar); /*渲染模板部分*/
                var render2 = ot.r(main, '{[contents]}', render11);
                var render3 = ot.r(cloth, '{[main]}', render2);
                var render4 = ot.r(render3, '{[title]}', pagetitle);
				var ghead=$.rmhead(render4);/*把cloth内的头部去掉*/
                var render4 = ot.r(ghead[0], '{[pagetype]}', pagetype); /*SetPageType*/
                render4 = ot.r(render4, '{(PageType)}', '<!--[PageType]'); /*SetPageType*/
                render4 = ot.r(render4, '{(PageTypeEnd)}', '[PageTypeEnd]-->'); /*SetPageType*/
                $.ht(ot.deltemptags(render4), 'container');
				$.addhead(ghead[1]);/*接头霸王来了*/
                ot.loadhide();
            } else if (pagetype == j['templatehtmls']['tags']) {
                var pagetitle = (ot.gt('{(MainTitle)}', '{(MainTitleEnd)}')).replace(/<\/?.+?>/g, ""),
                    /*Get Page Title(No html characters)*/
                    tgs = window.htmls[j['templatehtmls']['tags']],
                    tagmain = ot.gt('{(Tags)}', '{(TagsEnd)}', tgs),
                    /*Get tag main html*/
                    tagitemtemp = ot.gt('{(TagItemTemplate)}', '{(TagItemTemplateEnd)}', tgs),
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
                    var g = ot.r(tagitemtemp, '{[tagitemtitle]}', item); /*replace and render*/
                    g = ot.r(g, '{[tagitemlink]}', '#' + encodeURIComponent(item));
                    rendertg += g;
                });
                ot.alltaghtml = rendertg;
                if (href.indexOf('#') !== -1) {
                    var pg = href.split('#')[1];
                    ot.nowtag = pg;
                    if (pg !== 'alltags') {
                        rendertg = '<script>B.taguper(\'' + pg + '\');PJAX.sel(\'container\');PJAX.start();</script>';
                    }
                } /*Generate Finish*/
                var timer = setInterval(function() {
                        /*CheckTagPage*/
                        if (window.location.href.indexOf(j['generatehtmls']['tags']) == -1 && window.location.href.indexOf((j['generatehtmls']['tags']).replace('.html', '')) == -1) {
                            /*跳离tag页了*/
                            PJAX.sel('container');
                            PJAX.start();
                            clearInterval(timer);
                            return false;
                        }
                        ot.tagpagechecker();
                    },
                    100);
                var render11 = ot.r(tagmain, '{[tags]}', rendertg);
                var render2 = ot.r(main, '{[contents]}', render11);
                var render3 = ot.r(cloth, '{[main]}', render2);
                var render4 = ot.r(render3, '{[title]}', pagetitle);
				var ghead=$.rmhead(render4);/*把cloth内的头部去掉*/
                var render4 = ot.r(ghead[0], '{[pagetype]}', pagetype); /*SetPageType*/
                render4 = ot.r(render4, '{(PageType)}', '<!--[PageType]'); /*SetPageType*/
                render4 = ot.r(render4, '{(PageTypeEnd)}', '[PageTypeEnd]-->'); /*SetPageType*/
                $.ht(ot.deltemptags(render4), 'container');
				$.addhead(ghead[1]);/*接头霸王来了*/
                ot.loadhide();
            }
            ot.tpcheckstatu = false; /*模板检查拼接完毕*/
        },
        nowtag: '',
        alltaghtml: '',
        taguper: function(tg) {
            /*渲染特定标签索引的文章列表*/
            tg = decodeURIComponent(tg);
            var eh = SC('html').innerHTML,
                ot = this,
                j = window.templjson,
                tgs = window.htmls[j['templatehtmls']['tags']],
                /*get main tag html*/
                taglisttemp = ot.gt('{(TagListTemplate)}', '{(TagListTemplateEnd)}', tgs),
                /*get item template*/
                taglistitemtemp = ot.gt('{(TagListItemTemplate)}', '{(TagListItemTemplateEnd)}', tgs),
                /*get item template*/
                tj = window.mainjson; /*get json*/
            var dti = tj['dateindex'];
            var pts = tj['postindex'];
            var postlist = new Array();
            var rendertgs = '';
            for (var i in dti) {
                /*Sel Posts in the order of date*/
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
                var g = ot.r(taglistitemtemp, '{[taglistitemlink]}', lk);
                g = ot.r(g, '{[taglistitemtitle]}', Base64.decode(post['title']));
                g = ot.r(g, '{[taglistitemdate]}', $.dt(date));
                rendertgs += g;
            });
            rendertgs = ot.r(taglisttemp, '{[taglist]}', rendertgs);
            rendertgs = ot.r(rendertgs, '{[tagcurrent]}', tg);
            SC('tags').innerHTML = rendertgs;
        },
        tagpagechecker: function() {
            /*标签页hash更新检查器*/
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
                        if (SC('tags')) {
                            SC('tags').innerHTML = ot.alltaghtml;
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
                            ot.searchw = ''; /*不在搜索模式,重置搜索词*/
                            ot.nowpage = pnum;
                            var allps = maxrender * pnum * ot.moreperpage; /*根据页码计算当前页*/
                            ot.itempage = allps;
                            ot.itempagefixer(); /*修复因忽略页面而造成的列表重复*/
                            SC('postitems').innerHTML = '';
                            ot.more(); /*顺序不要颠倒!*/
                            ot.realpage = pnum + 1;
                            ot.switchpage = 0;
                        }
                    }
                } else {
                    /*Search mode*/
                    var rendertp = '';
                    var item = window.htmls[j['templatehtmls']['postitem']],
                        ptitem = ot.gt('{(PostItem)}', '{(PostItemEnd)}', item),
                        /*有项目的模板*/
                        noitem = ot.gt('{(NoItem)}', '{(NoItemEnd)}', item); /*无项目的模板*/
                    var v = href.split('#!')[1];
                    if (v !== ot.searchw) {
                        ot.searchw = v;
                        var pt = tj['postindex'];
                        for (var i in pt) {
                            var tt = (Base64.decode(pt[i]['title'])).toLowerCase();
                            var cc = (Base64.decode(pt[i]['intro'])).toLowerCase();
                            var dd = (pt[i]['date']).toLowerCase();
                            var tg = (pt[i]['tags']).toLowerCase();
                            v = v.toLowerCase(); /*大小写忽略*/
                            if (tt.indexOf(v) !== -1 || cc.indexOf(v) !== -1 || dd.indexOf(v) !== -1 || tg.indexOf(v) !== -1) {
                                var render1 = B.r(ptitem, '{[postitemtitle]}', tt);
                                var render2 = B.r(render1, '{[postitemintro]}', cc + '...');
                                var render3 = B.r(render2, '{[postitemdate]}', $.dt(dd));
                                var render4;
                                if (!pt[i]['link']) {
                                    render4 = B.r(render3, '{[postitemlink]}', 'post-' + i + '.html'); /*把页面也算入*/
                                } else {
                                    render4 = B.r(render3, '{[postitemlink]}', pt[i]['link'] + '.html');
                                }
                                if (pt[i]['cover']) {
                                    /*如果有封面*/
                                    render4 = B.r(render4, '{[postcover]}', pt[i]['cover']); /*把页面也算入*/
                                } else {
                                    render4 = ot.cd(render4); /*没有封面就删掉整段<ifcover>*/
                                }
                                rendertp += render4; /*渲染到列表模板*/
                            }
                        }
                        if (rendertp == '') {
                            rendertp = noitem;
                        }

                        function process() {
                            /*局部函数*/
                            if (SC('postitems') && SC('morebtn')) {
                                window.scrollTo(0, 0);
                                SC('postitems').innerHTML = rendertp;
                                SC('morebtn').style.display = 'none';
                                PJAX.start(); /*refresh pjax links*/
                            } else {
                                setTimeout(function() {
                                    return process();
                                }, 500); /*如果没有需要的元素存在滞留一下*/
                            }
                        }
                        if (!ot.tpcheckstatu && !ot.loadstatu) {
                            /*如果页面加载完,模板拼接完毕就可以打印搜索结果了*/
                            process();
                        }
                    }
                    if (ot.tpcheckstatu || ot.loadstatu) {
                        /*如果模板未拼接完毕，清理搜索词延续循环(外层setInterval)*/
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
            setTimeout(function() {
                SC('loading').style.opacity = 1;
                SC('loading').style.zIndex = 200;
            }, 10);
        },
        loadhide: function() {
            this.loadstatu = false; /*加载就绪*/
            setTimeout(function() {
                SC('loading').style.opacity = 0;
                SC('loading').style.zIndex = -1;
            }, 10);
        },
        morehtmls: {},
        more: function() {
            var ot = this;
            var j = window.templjson;
            var start = ot.itempage + 1; /*当前列表起始文章id*/
            var counter = 0;
            var itemid = 0;
            var listrender = '';
            var tj = window.mainjson; /*get json*/
            var item = window.htmls[j['templatehtmls']['postitem']],
                ptitem = ot.gt('{(PostItem)}', '{(PostItemEnd)}', item),
                /*有项目的模板*/
                noitem = ot.gt('{(NoItem)}', '{(NoItemEnd)}', item); /*无项目的模板*/
            var maxrender = parseInt(tj['posts_per_page']);
            var end = start + maxrender;
            var tj = window.mainjson; /*get json*/
            var postids = tj['dateindex'];
            var overpages = 0;
            for (var i in postids) {
                if (start <= itemid) {
                    if (counter < maxrender) {
                        var pid = i.replace('post', '');
                        var pt = tj['postindex'][pid];
                        if (!pt['link']) {
                            /*排除页面在外*/
                            var render1 = B.r(ptitem, '{[postitemtitle]}', Base64.decode(pt.title));
                            var render2 = B.r(render1, '{[postitemintro]}', Base64.decode(pt.intro) + '...');
                            var render3 = B.r(render2, '{[postitemdate]}', $.dt(pt.date));
                            var render4 = B.r(render3, '{[postitemlink]}', 'post-' + pid + '.html');
                            if (pt['cover']) {
                                /*如果有封面*/
                                render4 = B.r(render4, '{[postcover]}', pt['cover']); /*把页面也算入*/
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
            if (listrender == '') {
                /*没有更多文章了*/
                listrender = noitem;
                SC('morebtn').style.display = 'none';
            } else {
                SC('morebtn').style.display = 'block';
            }
            ot.itempage = ot.itempage + maxrender;
            if (ot.switchpage >= (ot.moreperpage - 1)) {
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
            PJAX.start(); /*refresh pjax links*/
        }
    };
    window.addEventListener('scroll', B.lazycheck, false); /*LazyLoadCheck*/
    window.addEventListener('pjaxstart',

        function() {
            /*加载动画*/
            B.loadshow();
        },
        false);
    window.addEventListener('pjaxfinish',

        function() {
            B.loadhide();
        },
        false);
}

function transitionchecker(e, func) {
    /*css3变换检查器(元素,执行完毕执行的函数)*/
    var ts = '';
    var tss = {
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    }; /*兼容多浏览器*/
    for (var i in tss) {
        if (SC(e).style[i] !== undefined) {
            ts = tss[i];
        }
    }

    function doit() {
        func();
        SC(e).removeEventListener(ts, doit);
    }
    SC(e).addEventListener(ts, doit);
} /*Simple PJAX For Front MAIN - SomeBottle*/
var mainhost = window.location.host;
var dt = new Date().getTime();
if (PJAX == undefined || PJAX == null) {
    /*防止重初始化*/
    var PJAX = {
        index: window.history.state === null ? 1 : window.history.state.page,
        PJAXStart: new CustomEvent('pjaxstart'),
        PJAXFinish: new CustomEvent('pjaxfinish'),
        LoadedPage: {},
        lasthref: window.location.href,
        preventurl: new Array(),
        recenturl: '',
        replace: '',
        sel: function(r) {
            this.replace = r;
        },
        jump: function(href) {
            var ehref = encodeURIComponent(href);
            var ts = this;
            var usecache = false; /*是否使用缓存*/
            var e = ts.replace;
            if (e == '') {
                e = 'container'; /*默认指定container*/
            }
            var listener; /*初始化监听器*/
            if (ts.recenturl.indexOf('#') !== -1 && href.indexOf('#') !== -1) {
                /*防止Tag页面的跳转问题*/
                return false;
            } else if (ts.recenturl.indexOf('#') == -1 && href.indexOf('#') !== -1) {
                B.nowpage = 0; /*防止页码bug*/
            }
            window.dispatchEvent(ts.PJAXStart); /*激活事件来显示加载动画*/
            transitionchecker('loading', function() {
                window.scrollTo(0, 0); /*滚动到头部*/
                if (ts.LoadedPage[ehref]) {
                    /*临时缓存*/
                    $.ht(ts.LoadedPage[ehref], e, false);
                    transitionchecker('loading', function() {
                        window.dispatchEvent(ts.PJAXFinish);
                    }); /*灵活检验loading页面动画是否结束*/
                    /*setTimeout(function() {
                        window.dispatchEvent(ts.PJAXFinish);
                    }, 1000);*/
                } else {
                    var cache = q('r', ehref, '', '', ''); /*获取缓存信息*/
                    if (cache['c']) {
                        /*如果有缓存*/
                        usecache = true;
                        $.ht(cache['c'], e, false); /*预填装缓存*/
                    }
                    $.aj(href, {}, {
                        success: function(m) {
                            ts.recenturl = href;
                            ts.LoadedPage[ehref] = m;
                            if (!usecache) {
                                $.ht(m, e, false);
                                q('w', ehref, m, timestamp(), '');
                            } else {
                                if (cache['c'] !== m) {
                                    /*缓存需要更新了*/
                                    q('w', ehref, m, timestamp(), '');
                                    $.ht(m, e, false);
                                } else {
                                    q('e', ehref, '', '', 1); /*更新缓存读取次数*/
                                }
                            }
                            transitionchecker('loading', function() {
                                window.dispatchEvent(ts.PJAXFinish);
                            }); /*灵活检验loading页面动画是否结束*/
                        },
                        failed: function(m) {
                            window.dispatchEvent(ts.PJAXFinish);
                        }
                    }, 'get', '', true);
                }
            });
        },
        pjaxautojump: function() {
            if (window.location.href.indexOf(mainhost) !== -1) {
                PJAX.jump(window.location.href);
            }
        },
        start: function() {
            var ts = this;
            ts.recenturl = window.location.href;
            var p = document.getElementsByTagName("a");
            for (var i in p) {
                if (typeof(p[i].addEventListener) == 'function') {
                    /*防止不是函数的凑数*/
                    p[i].addEventListener('click', function(e) {
                        if (ts.preventurl.indexOf(this.href) !== -1 || !this.href || this.href == '') {
                            return true;
                        } else {
                            window.history.pushState(null, null, this.href); /*加入历史*/
                            e.preventDefault();
                            ts.jump(this.href);
                        }
                    }, false); /*监听A标签*/
                }
            } /*回退时触发*/
            window.addEventListener('popstate', PJAX.pjaxautojump, false);
            /*window.onpopstate = function(e) { 
                if (window.location.href.indexOf(mainhost) !== -1) {
                    PJAX.jump(window.location.href);
                }
            }*/
        },
        pause: function() {
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
        }
    };
} /*CacheArea - Thank you OBottle*/

function q(md, k, c, t, rt) {
    /*(mode,key,content,timestamp,readtime)*/
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
                if (Number(caches[d].rt) <= 20 || Number(t) - Number(caches[d].t) >= 172800) {
                    /*自动清理缓存空间*/
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