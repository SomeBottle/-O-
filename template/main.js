/*FrontMainJS ver4.5.0 - SomeBottle*/
"use strict";
console.log('changed at 21:25');
if (typeof ($) !== 'object') {
    var $ = new Object();
    var SC = function (e) { /*元素选择器*/
        if (e == 'body') {
            return document.body;
        } else if (e == 'html') {
            return document.getElementsByTagName('html')[0];
        } else {
            return document.getElementById(e);
        }
    }
    $.loadedScripts = new Array();
    $.loadSettings = new Object(); /*加载页配置*/
    $.loadingJS = 0;/*正在用$.script载入的外部js数量，这个数量不归零，文章页面中script标签内的js不会执行*/
    $.ft = function (p, d, sf, m, proxy) { /*Fetcher(path,data,success or fail,method,proxyurl,async)*/
        if (p !== 'false' && p) { /*奇妙的false问题*/
            let options = {
                body: JSON.stringify(d),
                cache: 'default',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
                method: m
            };
            if (m == 'get') delete options.body;
            p = (proxy !== '') ? proxy + p : p;
            fetch(p, options)
                .then(res => res.text())
                .then(resp => sf.success(resp, p))
                .catch(err => sf.failed(err, p))
        }
    }
    $.script = function (url, element = false) { /*外部js加载器，页面已经加载的不会重复加载*/
        let script = document.createElement("script"),
            exist = $.loadedScripts.includes(url),
            originalAttrs = element ? $.attrs(element) : {};/*20210722原本标签所带的属性要补上*/
        if (!exist) {
            $.loadingJS += 1;/*有外部js正在载入*/
            $.loadedScripts.push(url);
            script.type = "text/javascript";
            script.src = url;
            for (var i in originalAttrs) {
                script.setAttribute(i, originalAttrs[i]);/*把原script的属性给补上*/
            }
            document.body.appendChild(script);
            let scriptLoaded = function () {
                $.loadingJS -= 1;/*这个外部js载入完毕*/
                this.removeEventListener("load", scriptLoaded, false);
            }.bind(script);
            script.addEventListener("load", scriptLoaded, false);
        }
        script = null;
    }
    $.aniChecker = function (element, func) { /*css3变换检查器(元素,执行完毕执行的函数)*/
        let chosenTester = '', testers = {
            'animation': 'animationend',
            'OAnimation': 'oAnimationEnd',
            'MozAnimation': 'animationend',
            'WebkitAnimation': 'webkitAnimationEnd'
        }; /*兼容多浏览器*/
        for (var i in testers) {
            if (element.style[i] !== undefined) {
                chosenTester = testers[i];
            }
        }
        function callBack() {
            element.removeEventListener(chosenTester, callBack);
            func();
        }
        element.addEventListener(chosenTester, callBack);
    }
    $.scriptCircle = function (content, retry = 0) {/*20210522执行脚本的延迟函数，在$.script导入的js没有完全载入之前页面中的js会在此处滞留。所有js载入成功后会执行页面中的js*/
        if ($.loadingJS > 0) {
            setTimeout(function () { $.scriptCircle(content, retry + 1) }, 100);/*循环延迟*/
        } else {
            for (var i in content) setTimeout("try{" + content[i] + "}catch(e){console.log('Page script Error: ' + e.message);}", 0);
        }
    }
    $.attrs = function (element) {/*20210722获得元素所有属性并返回数组，用于修复script掉属性的问题*/
        let attrArr = {};
        if (element.hasAttributes()) {
            let allAttrs = element.attributes;
            for (var i in allAttrs) {
                if (allAttrs[i].name && allAttrs[i].value) attrArr[allAttrs[i].name] = allAttrs[i].value;
            }
        }
        return attrArr;
    }
    $.ht = function (html, element, scriptInclude = true) { /*元素内容设置器(html,element,run script or not when ht)*/
        let theElement = SC(element), pageScripts = [];
        if (!theElement) {
            console.log('Unable to find the Element:' + e);
            return false;
        }
        theElement.innerHTML = html;
        let allTags = theElement.getElementsByTagName('script');
        for (var o = 0; o < allTags.length; o++) {
            if (allTags[o].src !== undefined && allTags[o].src !== null && allTags[o].src !== '') {
                $.script(allTags[o].src, allTags[o]);
            } else {
                var h = allTags[o].innerHTML;
                if (scriptInclude) { /*是否去除注释执行*/
                    h = B.r(h, '/*', '');
                    h = B.r(h, '*/', '');
                }
                pageScripts.push(h);/*综合一下页面中的js*/
            }
        }
        $.scriptCircle(pageScripts);
        theElement = allTags = null; /*释放*/
    }
    $.trimMark = function (url) { /*PreventURLProblem(Fuck QQ Querying URI*/
        var a = url;
        let b = a.split('?');
        if (b[1]) {
            return b[0];
        } else {
            return a;
        }
    }
    $.dt = function (v) { /*date transformer*/
        if (Number(v) >= 10000000) {
            let dt = String(v),
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
    $.rmHead = function (html) { /*去头并返回处理后的内容*/
        let temp = document.createElement('html');
        temp.innerHTML = html;
        let head = temp.getElementsByTagName('clothhead')[0]; /*获得cloth.html内的头*/
        head.parentNode.removeChild(head);
        let returnV = [temp.innerHTML, head.innerHTML];
        temp.remove(); /*移除临时元素*/
        head = null;
        return returnV;
    }
    $.addHead = function (headHtml) { /*接头霸王*/
        let head = SC('html').getElementsByTagName('head')[0],
            clothHead = head.getElementsByTagName('clothhead');
        if (head.parentNode.tagName.toLowerCase() !== 'html') return false; /*父级元素不是html就算了*/
        if (clothHead.length <= 0) { /*还没有渲染cloth的头部*/
            let cloth = document.createElement('clothhead');
            cloth.innerHTML = headHtml;
            head.appendChild(cloth);
            cloth = null;
        } else { /*渲染过了，直接改*/
            clothHead[0].innerHTML = headHtml;
        }
        head = clothHead = null;
    }
    $.title = function (theTitle) { /*修改页面<title>*/
        let head = SC('html').getElementsByTagName('head')[0],
            title = head.getElementsByTagName('title');
        if (title.length <= 0) { /*还没有加过<title>*/
            let titleElement = document.createElement('title');
            titleElement.innerHTML = theTitle;
            head.appendChild(te);
        } else {
            title[0].innerHTML = theTitle;
        }
    }
    $.ldParse = function (ldHtml) { /*解析loading页面*/
        let element = document.createElement('html');
        element.innerHTML = ldHtml;
        let obj = element.getElementsByTagName('loadset'),
            set = obj ? JSON.parse(obj[0].innerHTML) : false; /*获得设置JSON*/
        if (set) {
            $.loadSettings = set;
        } else { /*获取配置失败*/
            console.log('Failed to initialize loading page.');
        }
        element.remove(); /*移除临时元素*/
        obj = null;
    }
    $.alterClass = function (selection, operateClass, rm = false, returnE = false) {
        /*元素class应用(选择器,值,是否移除,是否返回元素)，
        选择器由两部分组成：[选择方法(id,class,id):目标标识名*/
        var ps = selection.split(':'),
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
        if (returnE) return es; /*返回元素*/
        if (!(es instanceof Element)) {
            for (var i in es) {
                es[i] instanceof Element ? (rm ? es[i].classList.remove(operateClass) : es[i].classList.add(operateClass)) : es = es;
            }
        } else {
            rm ? es.classList.remove(operateClass) : es.classList.add(operateClass);
        }
        es = content = null;
    }
}
if (!B) { /*PreventInitializingTwice*/
    /*Include LoadingPage*/
    if (localStorage['obottle-ldpage']) {
        var prevHtml = SC('html').innerHTML,
            ldLocalUsed = true;
        $.ldParse(localStorage['obottle-ldpage']); /*解析加载页*/
        SC('html').innerHTML = prevHtml.replace('<loadingarea></loadingarea>', localStorage['obottle-ldpage']);
    } else {
        var ldLocalUsed = false;
    }
    $.ft('./loading.otp.html', '', {
        success: function (pageHtml) {
            if (!ldLocalUsed) { /*如果本地已经有了就不热更新了20200808*/
                B.hr('<loadingarea></loadingarea>', pageHtml);
                $.ldParse(pageHtml); /*解析加载页*/
            }
            localStorage['obottle-ldpage'] = pageHtml;
        },
        failed: function (m) { /*Failed*/
            console.log('LoadingPage Load Failed');
        }
    }, 'get', '');
    $.script('./library.js'); /*Include Library Once*/
    $.script('./search.js'); /*Include Search.js Once*/
    window.htmls = new Object();/*Prepare for the HTMLS variable.*/
    var B = { /*B Part*/
        moreperpage: 0,
        r: function (origin, from, to, forTemplate = false, replaceAll = true) { /*别改这里！，没有写错！(All,Original,ReplaceStr,IfTemplate[false,'['(true),'('],IfReplaceAll)*/
            if (forTemplate) return forTemplate == '(' ? origin.replace(new RegExp('\\{\\(' + from + '\\)\\}', (replaceAll ? 'g' : '') + 'i'), to) : origin.replace(new RegExp('\\{\\[' + from + '\\]\\}', (replaceAll ? 'g' : '') + 'i'), to); /*20201229替换{[xxx]}和{(xxx)}一类模板，这样写目的主要是利用正则忽略大小写进行匹配*/
            if (replaceAll) {
                while (origin.indexOf(from) !== -1) {
                    origin = origin.replace(from, to);
                }
            } else {
                origin = origin.replace(from, to);
            }
            return origin;
        },
        navList: {
            statu: false,
            conf: {}
        },
        navCurrent: function (v = '') { /*getcurrentnav*/
            return ((-1 == v.indexOf('http') ? v = v : (v.replace(window.location.protocol + '//' + window.location.hostname, ''))) || window.location.pathname).replace('.html', ''); /*割掉尾巴*/
        },
        navCheck: function () { /*modify html*/
            let that = this,
                classesForNav = that.navList.conf;
            if (that.navList.statu) {
                let elements = document.body.getElementsByClassName(classesForNav.navclass),
                    path = that.navCurrent();
                for (var i in elements) { /*20201229更改算法*/
                    let comparePath = that.navCurrent(elements[i].href),
                        pathPos = path.lastIndexOf(comparePath),
                        pathLen = path.length,
                        hrefLen = comparePath.length;
                    if ((path == comparePath || (pathPos + hrefLen == pathLen && pathPos !== -1)) && elements[i] instanceof Element) {
                        elements[i].classList.add(classesForNav.activeclass); /*设置为焦点*/
                    } else if (elements[i] instanceof Element) {
                        (elements[i].classList.contains(classesForNav.activeclass)) ? (elements[i].classList.remove(classesForNav.activeclass)) : comparePath = comparePath; /*取消其他的焦点*/
                    }
                }
                elements = null;
            }
        },
        nav: function (v) {
            let o = this;
            o.navList.statu = true;
            o.navList.conf = v;
        },
        scrollBottom: function () {
            let wholeHeight = document.documentElement.scrollHeight;
            window.scrollTo(0, wholeHeight);
        },
        scrollTop: function (maxSpeed, minSpeed) {
            var totalHeight = document.body.scrollTop,
                stages = Math.floor(parseInt(totalHeight) / 3), /*分成加速、匀速、减速三段*/
                v1 = maxSpeed, /*加速到maxspeed px/s*/
                vmin = minSpeed, /*最小减速到minspeed px/s*/
                a1 = (Math.pow(v1, 2)) / (stages * 2), /*2ax=V²*/
                vn = 0, /*当前速度*/
                timer = setInterval(function () {
                    let nowHeight = document.body.scrollTop;
                    if (parseInt(nowHeight) > (stages * 2)) {
                        vn += a1;
                        document.body.scrollTop = parseInt(nowHeight) - vn;
                    } else if (parseInt(nowHeight) > (stages)) { /*第二阶段*/
                        document.body.scrollTop = parseInt(nowHeight) - vn;
                    } else if (parseInt(nowHeight) <= (stages)) { /*第三阶段*/
                        vn -= a1;
                        if (vn <= vmin) {
                            vn = vmin;
                        }
                        if (parseInt(nowHeight) <= 0) {
                            document.body.scrollTop = 0;
                            clearInterval(timer);
                        } else {
                            document.body.scrollTop = parseInt(nowHeight) - vn;
                        }
                    }
                }, 10);
        },
        hr: function (o, p) { /*htmlreplace*/
            var e = SC('html').innerHTML;
            SC('html').innerHTML = this.r(e, o, p);
        },
        delTempTags: function (h) { /*删除模板多余的标识符，像{(xxx)}一类*/
            return h.replace(/\{\((.*?)\)\}/g, '');
        },
        preventScript: function () {
            let scriptTags = SC('html').getElementsByTagName('script');
            for (var i in scriptTags) {
                if (scriptTags[i].src && !$.loadedScripts.includes(scriptTags[i].src)) {
                    $.loadedScripts.push(scriptTags[i].src);
                }
            }
            scriptTags = null;
        },
        deHtml: function (h) { /*decodeHtml*/
            return h.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#039;/g, "\'").replace(/&#39;/g, "\'").replace(/&quot;/g, "\"");
        },
        gt: function (between, and, useContent = false, notTemplate = false) { /*htmlget(between,and,content,NotTemplate=false)*/
            let element = useContent ? useContent : SC('html').innerHTML;
            try { /*notTemplate=false，也就是模板中匹配的时候，默认匹配{(xxx)}和{(xxx)}之间的内容*/
                let contentAfter = notTemplate ? element.split(between)[1] : element.split(new RegExp('\\{\\(' + between + '\\)\\}', 'i'))[1], /*正则支持大小写忽略*/
                    contentBetween = notTemplate ? contentAfter.split(and)[0] : contentAfter.split(new RegExp('\\{\\(' + and + '\\)\\}', 'i'))[0];
                return this.deHtml(contentBetween);
            } catch (e) {
                return false;
            }
        },
        lazyLoad: true, /*是否开启lazyLoad*/
        lazy: (bool) => { /*lazyLoad触发器*/
            B.lazyLoad = bool;
        },
        lazyPre: function (c) { /*预先处理lazyLoad图片*/
            let temp = document.createElement('div');
            temp.innerHTML = c;
            let imgTags = temp.getElementsByTagName('img');
            for (var p in imgTags) {
                if (imgTags[p].src) {
                    let theTag = imgTags[p], originData = theTag.src;
                    theTag.src = "data:image/svg+xml,%3Csvg width='302' height='27' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E %3Ctitle%3Ebackground%3C/title%3E %3Crect x='-1' y='-1' width='304' height='29' id='canvas_background' fill='none'/%3E %3Cg id='canvasGrid' display='none'%3E %3Crect id='svg_2' width='100%25' height='100%25' x='0' y='0' stroke-width='0' fill='url(%23gridpattern)'/%3E %3C/g%3E %3C/g%3E %3Cg%3E %3Ctitle%3ELayer 1%3C/title%3E %3Ctext fill='%23000000' stroke='%23000' stroke-width='0' x='129.703125' y='16.303124' id='svg_1' font-size='8' font-family='Helvetica, Arial, sans-serif' text-anchor='start' xml:space='preserve'%3Epic sleeping%3C/text%3E %3C/g%3E %3C/svg%3E";
                    if (theTag.style.width !== '') {
                        originData += '[width]' + theTag.style.width; /*记录元素原本的样式*/
                    }
                    theTag.setAttribute('data-src', '[lazy]' + originData);
                    theTag.style.width = '100%';
                }
            }
            let returnV = temp.innerHTML;
            temp.remove(); /*移除临时元素*/
            imgTags = null;
            return returnV;
        },
        lazyCheck: function () { /*包租婆————怎么没水了呢？*/
            if (!B.lazyLoad) return false;/*关闭了lazyLoad*/
            let H = window.innerHeight, S = document.documentElement.scrollTop || document.body.scrollTop, imgTags = document.getElementsByTagName('img');
            for (var i in imgTags) {
                let imgPos = imgTags[i].offsetTop;
                if (H + S > imgPos && ((H + S) - imgPos < H)) {/*修正算法，只展示在文档显示区的图片20210909*/
                    B.lazyShow(imgTags[i]);
                }
            }
            imgTags = null;
        },
        lazyShow: function (element) {/*展示懒加载的图片*/
            let origin = element.getAttribute('data-src');
            if (origin !== 'undefined' && origin) {
                element.setAttribute('data-src', '');
                let mainSrc = origin.split('[lazy]')[1];
                if (mainSrc.indexOf('[width]') !== -1) {
                    let sp = mainSrc.split('[width]');
                    element.src = sp[0];
                    element.style.width = sp[1]; /*恢复原来的width样式*/
                } else {
                    element.src = origin.split('[lazy]')[1];
                    element.style.width = 'auto';
                }
            }
        },
        templonload: 0,
        /*LoadedTemplates*/
        templateloaded: new Array(),
        tpcheckstatu: false,
        /*模板拼接状态*/
        loadstatu: false,
        /*加载div显示状态*/
        tpcheck: function (re = false, ct = false) { /*template check(re=是否轮询,ct=是否指定内容)*/
            var ot = this,
                o = this;
            if (!ot.tpcheckstatu || re) { /*防止短时间内重复检查模板20200805*/
                ot.tpcheckstatu = true; /*正在检查模板*/
                ot.loadshow();
                var pagetype = ot.gt('PageType', 'PageTypeEnd', ct); /*Get Page Type*/
                if (!window.templjson) {
                    $.ft('template.json', '', {
                        success: function (m) {
                            window.templjson = JSON.parse(m);
                            return ot.tpcheck(true, ct);
                        },
                        failed: function (m) { /*Failed*/
                            console.log('TemplateJson Load Failed.');
                        }
                    }, 'get', '');
                } else if (!window.mainjson && window.templjson['usemain'].indexOf(pagetype) !== -1) { /*Some pages are in need of Main.json*/
                    if (!window.mainjsonrequest) { /*Include Mainjson*/
                        window.mainjsonrequest = true; /*make request flag*/
                        $.ft(window.templjson['mainjson'], '', {
                            success: function (m) {
                                window.mainjson = JSON.parse(m.replace(/[\r\n]/g, ""));
                                ot.moreperpage = parseInt(window.mainjson['more_per_page']); /*Update moreperpage*/
                            },
                            failed: function (m) { /*Failed*/
                                console.log('MainJson Load Failed');
                            }
                        }, 'get', '');
                    }
                    setTimeout(function () {
                        return o.tpcheck(true, ct);
                    },
                        25);
                } else if ($.loadingJS > 0 || !localStorage['obottle-ldpage']) { /*Make sure that JS libraries and the loadingpage are ready!*/
                    setTimeout(function () {
                        return o.tpcheck(true, ct);
                    }, 25);
                } else {
                    ot.preventScript(); /*剔除已加载scripts*/
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
                                console.log('Template loaded from local: ' + p);
                                window.htmls[p] = cache['c'];
                                o.templateloaded.push(p);
                                o.templonload -= 1;
                            }
                            $.ft(j['necessary'][i], '', {
                                success: function (m, p) {
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
                                failed: function (m) { /*Failed*/
                                    console.log('Necessary HTML Load Failed...');
                                }
                            }, 'get', '');
                        }
                    }
                    var timer = setInterval(function () {
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
        itempagefixer: function () {
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
        cd: function (rc) { /*covercutter封面<ifcover>去除器*/
            var rst = rc;
            while (rst.indexOf('<ifcover>') !== -1) {
                var coverhtml = B.gt('<ifcover>', '</ifcover>', rst, true);
                rst = B.r(rst, '<ifcover>' + coverhtml + '</ifcover>', ''); /*没有封面图就删掉整段*/
            }
            return rst;
        },
        clothmainrendered: false,
        /*渲染过的cloth,main放在这里*/
        checkfirstrender: function () { /*检查是不是第一次渲染，如果是就渲染cloth,main并喷到网页上*/
            var ot = this,
                j = window.templjson,
                cloth = window.htmls[j['templatehtmls']['cloth']],
                main = window.htmls[j['templatehtmls']['main']];
            if (!ot.clothmainrendered) { /*还没有渲染cloth,main模板*/
                console.log('Document rendered with clothes.(๑•̀ㅂ•́)و✧');
                var render1 = ot.r(main, 'contents', '<div id=\'contentcontainer\'></div>', true); /*预设好id以便后面调用*/
                var render2 = ot.r(cloth, 'main', render1, true);
                var ghead = $.rmHead(render2); /*把cloth内的头部去掉，咱分头行动*/
                $.ht(ot.delTempTags(ghead[0]), 'container'); /*先把外皮给渲染出来*/
                $.addHead(ghead[1]); /*把头接到head里面去*/
                ot.clothmainrendered = true;
            }
        },
        back: function () { /*返回上一页*/
            window.history.go(-1);
        },
        turnback: function () {/*根据hash返回文章列表上一页*/
            let current = this.realpage;
            window.location.href = window.location.protocol + '//' +
                window.location.host + window.location.pathname + '#' + (current > 1 ? (current - 1) : 1);
        },
        currentpagetype: '',/*20210919记录renderer获取到的pagetype*/
        renderer: function (fcontent = false) { /*(fcontent=是否指定内容)*/
            var ot = this;
            if (!ot.rendering) {
                ot.rendering = true; /*示意正在渲染20200805*/
                var j = window.templjson;
                var comment = window.htmls[j['templatehtmls']['comment']];
                var pagetype = ot.gt('PageType', 'PageTypeEnd', fcontent); /*Get Page Type*/
                ot.currentpagetype = pagetype;
                var tj = window.mainjson; /*get json*/
                if (pagetype == j['templatehtmls']['post']) {
                    var content = ot.gt('PostContent', 'PostContentEnd', fcontent); /*Get Post Content*/
                    var title = ot.gt('PostTitle', 'PostTitleEnd', fcontent); /*Get Post Title*/
                    var date = ot.gt('PostDate', 'PostDateEnd', fcontent); /*Get Post Date*/
                    var tags = ot.gt('PostTag', 'PostTagEnd', fcontent); /*Get Post Content*/
                    var pid = ot.gt('PostID', 'PostIDEnd', fcontent); /*Get Post ID*/
                    var cover = ot.gt('PostCover', 'PostCoverEnd', fcontent); /*Get Post Cover*/
                    var pagetitle = (ot.gt('MainTitle', 'MainTitleEnd', fcontent)).replace(/<\/?.+?>/g, ""); /*Get Page Title(No html characters)*/
                    var post = window.htmls[j['templatehtmls']['post']],
                        tag_tp = ot.gt('PostTagsTemplate', 'PostTagsTemplateEnd', post),/*20210919获得tags模板*/
                        tag_deli = ot.gt('PostTagsDelimiter', 'PostTagsDelimiterEnd', post),/*20210919获得tags分隔部分*/
                        ifpage_tp = ot.gt('IfPage', 'IfPageEnd', post);/*如果是页面，标签的部分就显示这里面的内容*/
                    var render11 = ot.r(post, 'postcontent', ot.lazyPre($.mark(content.trim())), true); /*unescape and Analyse md*/
                    var render12 = ot.r(render11, 'posttitle', title, true);
                    var alltags = [];
                    if (isNaN(date)) {
                        tags = ifpage_tp;
                    } else { /*Tag Process*/
                        alltags = tags.split(',');
                        tags = '';
                        alltags.forEach(function (v, i) {
                            let filled = ot.r(tag_tp, 'tagurl', j['generatehtmls']['tags'] + '#' + encodeURIComponent(v), true);
                            filled = ot.r(filled, 'tagname', v, true);
                            tags += filled;
                            if (i !== (alltags.length - 1)) tags += tag_deli;/*如果不是最后一个标签就加分隔部分*/
                        });
                    }
                    var render13 = ot.r(render12, 'posttags', tags, true);
                    var render14 = ot.r(render13, 'postdate', $.dt(date), true);
                    var render15 = ot.r(render14, 'comments', comment, true); /*LoadCommentsForPost*/
                    var render16 = ot.r(render15, 'pid', pid, true); /*SetPid*/
                    var theanchor = window.location.hash.replace('#', '');/*获得要跳转的锚点*/
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
                    render16 = ot.gt('PostTemplate', 'PostTemplateEnd', render16);
                    ot.checkfirstrender(); /*检查是否已经在页面中渲染cloth和main 20210125*/
                    $.title(pagetitle); /*设置title*/
                    $.ht(ot.delTempTags(render16), 'contentcontainer');
                    $.aniChecker($.alterClass($.loadSettings['listening'], '', false, true), function () {
                        ot.lazyCheck(); /*lazyLoad初次检测*/
                    });
                    if (SC(theanchor)) setTimeout(() => { SC(theanchor).scrollIntoView(); }, 300);/*20210919如果锚点存在就跳转到锚点*/
                    window.addEventListener('scroll', B.lazyCheck, false); /*只有文章页面监听懒加载20210909*/
                    render16 = tj = null; /*释放*/
                } else if (pagetype == j['templatehtmls']['postlist']) {
                    var content = ot.gt('PostContent', 'PostContentEnd', fcontent); /*Get Post Content*/
                    var pagetitle = (ot.gt('MainTitle', 'MainTitleEnd', fcontent)).replace(/<\/?.+?>/g, ""); /*Get Page Title(No html characters)*/
                    var pt = window.htmls[j['templatehtmls']['postlist']];
                    var ptt = ot.gt('PostListTemplate', 'PostListTemplateEnd', pt),
                        morebtn = ot.gt('MoreBtn', 'MoreBtnEnd', pt),
                        backbtn = ot.gt('BackBtn', 'BackBtnEnd', pt);
                    ptt = ot.r(ptt, 'morebtn', '<span id=\'morebtn\'>' + morebtn + '</span>', true);
                    ptt = ot.r(ptt, 'backbtn', '<span id=\'backbtn\'>' + backbtn + '</span>', true);
                    var render11 = ot.r(ptt, 'postitems', '<div id=\'postitems\'>' + $.mark((content.trim())) + '</div>', true); /*Analyse md*/
                    var render12 = ot.r(render11, 'pagetype', pagetype, true); /*SetPageType*/
                    render12 = ot.r(render12, 'PageType', '<!--[PageType]', '(', false); /*SetPageType*/
                    render12 = ot.r(render12, 'PageTypeEnd', '[PageTypeEnd]-->', '(', false); /*SetPageType*/
                    ot.itempage = parseInt(tj['posts_per_page']);
                    ot.itempagefixer(); /*修复因忽略页面而造成的列表重复*/
                    ot.checkfirstrender(); /*检查是否已经在页面中渲染cloth和main 20210125*/
                    $.title(pagetitle); /*设置标题*/
                    $.ht(ot.delTempTags(render12), 'contentcontainer');
                    render12 = null; /*释放*/
                    ot.backchecker();/*检查是否显示后退按钮*/
                    ot.indexpagechecker();
                    var timer = setInterval(function () { /*CheckIndexPage*/
                        if (ot.gt('<!--[PageType]', '[PageTypeEnd]-->', false, true) !== j['templatehtmls']['postlist']) { /*跳离index页了*/
                            console.log('jumped out of index');
                            PJAX.sel('contentcontainer');
                            PJAX.start(); /*修复more按钮的bug - 20190727*/
                            ot.switchpage = 0;
                            clearInterval(timer);
                            return false;
                        }
                        ot.indexpagechecker();
                    }, 100);
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
                    $.ht(ot.delTempTags(render12), 'contentcontainer');
                    render12 = null; /*释放*/
                } else if (pagetype == j['templatehtmls']['tags']) {
                    var pagetitle = (ot.gt('MainTitle', 'MainTitleEnd', fcontent)).replace(/<\/?.+?>/g, ""),
                        /*Get Page Title(No html characters)*/
                        tgs = window.htmls[j['templatehtmls']['tags']],
                        tagmain = ot.gt('Tags', 'TagsEnd', tgs),
                        /*Get tag main html*/
                        tagitemtemp = ot.gt('TagItemTemplate', 'TagItemTemplateEnd', tgs),
                        /*get item template*/
                        href = $.trimMark(window.location.href),
                        /*Generate Tags*/
                        rendertg = '',
                        pts = tj['postindex'],
                        tagarr = new Array();
                    for (var i in pts) {
                        var t = pts[i]['tags'].split(',');
                        t.forEach(function (item, index) {
                            if (item !== '' && tagarr.indexOf(item) == -1) {
                                tagarr.push(item);
                            }
                        });
                    }
                    tagarr.forEach(function (item, index) {
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
                    var timer = setInterval(function () { /*CheckTagPage*/
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
                    $.ht(ot.delTempTags(render12), 'contentcontainer');
                    render12 = null; /*释放*/
                }
                ot.tpcheckstatu = false; /*模板检查拼接完毕*/
                ot.rendering = false; /*渲染完毕，空出队列20200805*/
                /*PJAX监听刷新*/
                PJAX.autoprevent();
                PJAX.sel('contentcontainer');
                PJAX.start();
                ot.navCheck(); /*进行导航栏检查*/
                window.dispatchEvent(PJAX.PJAXFinish); /*调用事件隐藏loading浮层20201229*/
            }
        },
        backchecker: function () {/*检查后退按钮是否显示*/
            if (this.realpage == 1) {
                SC('backbtn').style.display = 'none';
            } else {
                SC('backbtn').style.display = 'initial';
            }
        },
        nowtag: '',
        alltaghtml: '',
        taguper: function (tg) { /*渲染特定标签索引的文章列表*/
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
            postlist.forEach(function (it, id) {
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
        tagpagechecker: function () { /*标签页hash更新检查器*/
            var ot = this;
            var eh = SC('html').innerHTML; /*Get All html*/
            var href = $.trimMark(window.location.href);
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
        indexpagechecker: function () {
            var eh = SC('html').innerHTML; /*Get All html*/
            var j = window.templjson;
            var href = $.trimMark(decodeURIComponent(window.location.href));
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
                            ot.backchecker();/*检查是否显示后退按钮*/
                        }
                    }
                } else { /*Search mode*/
                    var item = window.htmls[j['templatehtmls']['postitem']],
                        ptitem = ot.gt('PostItem', 'PostItemEnd', item),
                        /*有项目的模板*/
                        noitem = ot.gt('NoItem', 'NoItemEnd', item); /*无项目的模板*/
                    var v = href.split('#!')[1];
                    if (v !== ot.searchw) {
                        ot.searchw = v;
                        var pt = tj['postindex'];
                        function renderlist(postindexes, id, title = false, intro = false, date = false, tgs = false) {
                            var rendertp = '';
                            let pt = postindexes, i = id, tt = title || (Base64.decode(pt[i]['title'])), cc = intro || (Base64.decode(pt[i]['intro'])), dd = date || (pt[i]['date']), tags = tgs || pt[i]['tags'];
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
                            return rendertp;
                        }
                        var rendertp = '', pushedids = {};/*用pushed ids排除原生搜索打印的内容*/
                        for (var i in pt) {
                            var tt = (Base64.decode(pt[i]['title'])).toLowerCase();
                            var cc = (Base64.decode(pt[i]['intro'])).toLowerCase();
                            var dd = (pt[i]['date']).toLowerCase();
                            var tags = pt[i]['tags'],
                                tg = tags.toLowerCase();
                            v = v.toLowerCase(); /*大小写忽略*/
                            if (tt.indexOf(v) !== -1 || cc.indexOf(v) !== -1 || dd.indexOf(v) !== -1 || tg.indexOf(v) !== -1) {
                                rendertp += renderlist(pt, i, tt, cc, dd, tags);
                                pushedids[i] = true;
                            }
                        }
                        if (rendertp == '') {
                            rendertp = noitem;
                        }
                        function process() { /*局部函数*/
                            if (SC('postitems') && SC('morebtn') && SC('backbtn')) {
                                window.scrollTo(0, 0);
                                SC('postitems').innerHTML = rendertp;
                                if (typeof ot.searchinj == "function") ot.searchinj(pt, v, (ids) => {
                                    let injrendertp = '';
                                    for (var i in ids) injrendertp += isNaN(ids[i]) ? '' : ((pushedids[ids[i]]) ? '' : renderlist(pt, ids[i]));
                                    if (injrendertp == '') return false;
                                    SC('postitems').innerHTML = rendertp + injrendertp;/*使用外部搜索的时候保留原生搜索部分，在后面附加*/
                                    PJAX.start();
                                });/*外部搜索search.js介入*/
                                SC('morebtn').style.display = 'none';
                                SC('backbtn').style.display = 'none';
                                PJAX.start(); /*refresh pjax links*/
                            } else {
                                setTimeout(function () {
                                    return process();
                                }, 10); /*如果没有需要的元素存在滞留一下*/
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
        loadshow: function () {
            this.loadstatu = true; /*加载未就绪*/
            if ($.loadSettings['animations']) {
                /*解构赋值*/
                let { in: eIn, out: eOut } = $.loadSettings['animations'];
                for (var i in eIn) $.alterClass(i, eIn[i]);
                for (var i in eOut) $.alterClass(i, eOut[i], true); /*移除元素*/
            }
        },
        loadhide: function () {
            this.loadstatu = false; /*加载就绪*/
            let { out: eOut, in: eIn } = $.loadSettings['animations'];
            for (var i in eOut) $.alterClass(i, eOut[i]);
            for (var i in eIn) $.alterClass(i, eIn[i], true); /*移除元素*/
        },
        morehtmls: {},
        more: function (nochangehash = false) { /*(是否阻止改变hash(用于适配indexpagechecker20200812)*/
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
                SC('morebtn').style.display = 'initial';
            }
            ot.itempage = ot.itempage + maxrender;
            if (ot.switchpage >= (ot.moreperpage - 1) && !nochangehash) { /*nochangehash搭配indexpagefixer20200812*/
                SC('postitems').innerHTML = listrender;
                ot.scrollTop(20, 2);
                ot.switchpage = 0;
                ot.realpage += 1;
                PJAX.pause();
                window.location.href = '#' + ot.realpage;
            } else {
                SC('postitems').innerHTML = SC('postitems').innerHTML + listrender;
                ot.switchpage += 1;
            }
            ot.backchecker();
            PJAX.start(); /*refresh pjax links*/
        }
    };
    window.addEventListener('pjaxstart',

        function () { /*加载动画*/
            B.loadshow();
        },
        false);
    window.addEventListener('pjaxfinish',

        function () {
            B.loadhide();
        },
        false);
}

/*Simple PJAX For Front MAIN - SomeBottle*/
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
        sel: function (r) {
            this.replace = r;
        },
        jump: function (href) {
            var ehref = encodeURIComponent(href);
            var ts = this;
            var usecache = false; /*是否使用缓存*/
            var e = ts.replace;
            if (e == '') {
                e = 'contentcontainer'; /*默认指定container*/
            }
            if (ts.recenturl.indexOf('#') !== -1 && href.indexOf('#') !== -1 && ts.recenturl.split('#')[0] == href.split('#')[0]) { /*防止Tag页面的跳转问题*/
                return false;
            } else if (ts.recenturl.indexOf('#') == -1 && href.indexOf('#') !== -1) {
                B.nowpage = 0; /*防止页码bug*/
            }
            window.dispatchEvent(ts.PJAXStart); /*激活事件来显示加载动画*/
            window.removeEventListener('scroll', B.lazyCheck, false); /*移除懒加载监听*/
            $.aniChecker($.alterClass($.loadSettings['listening'], '', false, true), function () {
                window.scrollTo(0, 0); /*滚动到头部*/
                if (ts.LoadedPage[ehref]) { /*临时缓存*/
                    ts.clearevent(); /*清除之前的监听器*/
                    B.tpcheck(false, ts.LoadedPage[ehref]); /*因为tpcheck末尾已经有loadhide，此处没必要$.aniChecker20201229*/
                } else {
                    var cache = q('r', ehref, '', '', ''); /*获取缓存信息*/
                    if (cache['c']) { /*如果有缓存*/
                        usecache = true; /*本地缓存使用模式*/
                        ts.clearevent(); /*清除之前的监听器*/
                        B.tpcheck(false, cache['c']); /*预填装缓存*/
                    }
                    $.ft(href, {}, {
                        success: function (m) {
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
                            } /*因为tpcheck末尾已经有loadhide，此处没必要$.aniChecker20201229*/
                        },
                        failed: function (m) {
                            window.dispatchEvent(ts.PJAXFinish);
                        }
                    }, 'get', '');
                }
            });
        },
        pjaxautojump: function () {
            if (PJAX.recenturl.split('#')[0] == window.location.href && B.currentpagetype == window.templjson['templatehtmls']['postlist']) { /*用于处理**首页**没有hash和有hash页码时回退跳转的问题20200808*/
                window.history.replaceState(null, null, window.location.href + '#1'); /*从https://xxx/#2回退到https://xxx/时自动变成https://xxx/#1跳转到页码1(不改变历史)20200808*/
                PJAX.jump(window.location.href + '#1');
            }
            if (window.location.href.indexOf(mainhost) !== -1) { /*回退时跳转20200808*/
                PJAX.jump(window.location.href);
            }
        },
        clickevent: function (e) {
            if (PJAX.preventurl.indexOf(this.href) !== -1 || !this.href || this.href == '') {
                return true;
            } else {
                window.history.pushState(null, null, this.href); /*加入历史*/
                e.preventDefault();
                PJAX.jump(this.href);
            }
        },
        clearevent: function () { /*移除所有a标签事件*/
            var ts = this,
                p = document.getElementsByTagName("a");
            for (var i in p) {
                if (typeof (p[i].removeEventListener) == 'function') { /*防止不是函数的凑数*/
                    p[i].removeEventListener('click', ts.clickevent); /*取消监听A标签*/
                }
            }
            p = null;
        },
        start: function () {
            var ts = this;
            ts.statu = true; /*启动*/
            ts.recenturl = window.location.href;
            ts.clearevent(); /*先清除之前的监听器*/
            var p = document.getElementsByTagName("a");
            for (var i in p) {
                var onc = p[i] instanceof Element ? p[i].getAttribute('onclick') : null; /*检查a标签是否有onclick属性20210126*/
                if (typeof (p[i].addEventListener) == 'function' && !onc) { /*防止不是元素的凑数，a标签带onclick属性就不监听了20210126*/
                    p[i].setAttribute('pjax', ''); /*设置标识*/
                    p[i].addEventListener('click', ts.clickevent, false); /*监听A标签*/
                }
            } /*回退时触发*/
            window.addEventListener('popstate', PJAX.pjaxautojump, false);
            p = null;
        },
        pause: function () {
            this.statu = false; /*暂停*/
            window.removeEventListener('popstate', PJAX.pjaxautojump); /*移除实践，暂停pjax*/
        },
        autoprevent: function () {
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
