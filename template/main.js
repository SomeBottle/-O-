/*FrontMainJS ver5.0.0 - SomeBottle*/
"use strict";
const barnDir = 'barn/', // 博客核心文件相对目录，请不要修改
    mainHost = window.location.host;
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
    $.ft = function (p, proxy = '', m = 'get', d = {}) { /*Fetcher(path,proxyurl,method,data)*/
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
            return fetch(p, options)
                .then(res => {
                    if (res.status >= 200 && res.status < 400) {
                        return res.text();
                    } else {
                        return Promise.reject('failed:invalid status code.');
                    }
                })
                .catch(e => {
                    return Promise.reject(e);
                })
        } else {
            return Promise.reject('failed:wrong URL.')
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
    $.aniChecker = function (element, func) { /*css3动画检查器(元素,执行完毕执行的函数)*/
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
    $.scriptCircle = function (content) {/*20210522执行脚本的延迟函数，在$.script导入的js没有完全载入之前页面中的js会在此处滞留。所有js载入成功后会执行页面中的js*/
        let retry = 0;
        return new Promise((res) => {
            let timer = setInterval(() => {
                if ($.loadingJS > 0) {
                    retry += 1;
                } else {
                    clearInterval(timer);
                    content.forEach((script) => {
                        setTimeout("try{" + script + "}catch(e){console.log('Page script Error: ' + e.message);}", 0);
                    });
                    setTimeout(() => res('done'), 10); // 页面js载入完毕，仍然用setTimeout
                }
            }, 100);
        });
    }
    $.attrs = function (element) {/*20210722获得元素所有属性并返回数组，用于修复script掉属性的问题*/
        let attrArr = {};
        if (element.hasAttributes()) {
            let allAttrs = element.attributes;
            for (let attr of allAttrs) {
                if (attr.name && attr.value) attrArr[attr.name] = attr.value;
            }
        }
        return attrArr;
    }
    $.scriptRestore = function (html) {/*使用正则去除script注释*/
        return html.replace(new RegExp('^(?:\\/\\*)([\\s\\S]*?)(?:\\*\\/)$', 'gi'), (match, p1) => p1);
    }
    $.ht = function (html, element, scriptInclude = true) { /*元素内容设置器(html,element,run script or not when ht)*/
        let theElement = SC(element),
            pageScripts = [],
            rejMsg = 'Unable to find the Element:' + element;
        if (!theElement) {
            console.log(rejMsg);
            return Promise.reject(rejMsg);
        } else {
            theElement.innerHTML = html;
            let allTags = theElement.getElementsByTagName('script');
            for (var o = 0, len = allTags.length; o < len; o++) {
                if (allTags[o].src !== undefined && allTags[o].src !== null && allTags[o].src !== '') {
                    $.script(allTags[o].src, allTags[o]);
                } else {
                    var h = allTags[o].innerHTML;
                    if (scriptInclude) { /*是否去除注释执行*/
                        h = $.scriptRestore(h.trim());
                    }
                    pageScripts.push(h);/*综合一下页面中的js*/
                }
            }
            return $.scriptCircle(pageScripts); // 传回Promise
        }
    }
    $.useLinkPattern = function (link, pid) { // 套上文章永久链接pattern
        return link.replaceAll(new RegExp('\\{\\s*?pid\\s*?\\}', 'gi'), pid);
    }
    $.trimMark = function (url) { /*PreventURLProblem(F*ck QQ Querying URI*/
        var a = url;
        let b = a.split('?');
        if (b[1]) {
            return b[0];
        } else {
            return a;
        }
    }
    $.dt = function (v) { /*date transformer -> ISO 8601*/
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
            head.appendChild(titleElement);
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
            for (let elem of es) {
                if (rm) {
                    elem.classList.remove(operateClass);
                } else {
                    elem.classList.add(operateClass);
                }
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
        SC('html').innerHTML = prevHtml.replace('<loadingarea></loadingarea>', () => localStorage['obottle-ldpage']);
    } else {
        var ldLocalUsed = false;
    }
    $.ft(`${barnDir}loading.otp.html`)
        .then(resp => {
            resp = B.r(resp, 'barndir', barnDir, true); // 处理模板中的{[barndir]}标签
            if (!ldLocalUsed) { /*如果本地已经有了就不热更新了20200808*/
                B.hr('<loadingarea></loadingarea>', resp);
                $.ldParse(resp); /*解析加载页*/
            }
            localStorage['obottle-ldpage'] = resp;
        }, rej => {
            console.log('LoadingPage Load Failed -> ' + rej);
        });
    $.script(`${barnDir}library.js`); /*Include Library Once*/
    $.script(`${barnDir}search.js`); /*Include Search.js Once*/
    window.tpHtmls = new Object();/*Prepare for the HTMLS variable.*/
    var B = { /*B Part*/
        morePerPage: 0,
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
        navList: {
            status: false,
            conf: {}
        },
        navCurrent: function (v = '') { /*getcurrentnav*/
            let port = window.location.port; // 算入端口
            return (
                (!v.includes('http') ? v : (
                    v.replace(window.location.protocol + '//' + window.location.hostname + (port ? ':' + port : ''), '')
                )) || window.location.pathname
            ).replace('.html', ''); /*割掉尾巴*/
        },
        navcheck: function () { /*modify html*/
            let that = this,
                classesForNav = that.navList.conf;
            if (that.navList.status) {
                let elements = document.body.getElementsByClassName(classesForNav.navclass),
                    path = that.navCurrent();
                for (let elem of elements) { /*20201229更改算法*/
                    let comparePath = that.navCurrent(elem.href),
                        pathPos = path.lastIndexOf(comparePath),
                        pathLen = path.length,
                        hrefLen = comparePath.length;
                    if ((path == comparePath || (pathPos + hrefLen == pathLen && pathPos !== -1)) && elem instanceof Element) {
                        elem.classList.add(classesForNav.activeclass); /*设置为焦点*/
                    } else if (elem instanceof Element) {
                        (elem.classList.contains(classesForNav.activeclass)) ? (elem.classList.remove(classesForNav.activeclass)) : comparePath = comparePath; /*取消其他的焦点*/
                    }
                }
                elements = null;
            }
        },
        nav: function (v) {
            let o = this;
            o.navList.status = true;
            o.navList.conf = v;
        },
        scrollbottom: function () {
            let wholeHeight = document.documentElement.scrollHeight;
            window.scrollTo(0, wholeHeight);
        },
        scrolltop: function (maxSpeed, minSpeed) {
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
            for (let e of scriptTags) {
                if (e.src && !$.loadedScripts.includes(e.src)) {
                    $.loadedScripts.push(e.src);
                }
            }
            scriptTags = null;
        },
        deHtml: function (h) { /*decodeHtml*/
            return h.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#039;/g, "\'").replace(/&#39;/g, "\'").replace(/&quot;/g, "\"");
        },
        gt: function (between, and, useContent = false, notTemplate = false) { /*htmlget(between,and,content,NotTemplate=false)*/
            let content = useContent ? useContent : SC('html').innerHTML;
            try { /*notTemplate=false，也就是模板中匹配的时候，默认匹配{(xxx)}和{(xxx)}之间的内容*/
                let contentAfter = notTemplate ? content.split(between)[1] : content.split(new RegExp('\\{\\(' + between + '\\)\\}', 'i'))[1], /*正则支持大小写忽略*/
                    contentBetween = notTemplate ? contentAfter.split(and)[0] : contentAfter.split(new RegExp('\\{\\(' + and + '\\)\\}', 'i'))[0];
                return contentBetween;
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
            for (let e of imgTags) {
                if (e.src) {
                    let theTag = e, originData = theTag.src;
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
            for (let e of imgTags) {
                let imgPos = e.offsetTop;
                if (H + S > imgPos && ((H + S) - imgPos < H)) {/*修正算法，只展示在文档显示区的图片20210909*/
                    B.lazyShow(e);
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
        templateOnload: 0,
        /*LoadedTemplates*/
        templateLoaded: new Array(),
        tpcheckStatus: false,
        /*模板拼接状态*/
        loadStatus: false,
        /*加载div显示状态*/
        tpcheck: function (contents = false) { /*template check(ct=是否指定内容)*/
            let that = this;
            if (!that.tpcheckStatus) { /*防止短时间内重复检查模板20200805*/
                that.tpcheckStatus = true; /*正在检查模板*/
                that.loadshow();
                let pageType = that.gt('PageType', 'PageTypeEnd', contents); /*Get Page Type*/
                /*用Promise改写20220115*/
                Promise.resolve(window.tpJson ? false : $.ft(`${barnDir}template.json`)) // 抓取barn/template.json
                    .then(tpJson => {
                        if (tpJson) window.tpJson = JSON.parse(tpJson);
                        let condition = (!window.mainJson && window.tpJson['usemain'].includes(pageType)); //有页面需要mainJson时才获取
                        return Promise.resolve(condition ? $.ft(barnDir + window.tpJson['mainjson'], '') : false); // false代表不用获取
                    }, rej => {
                        throw 'TemplateJson Load Failed -> ' + rej; // 获得template.json失败
                    })
                    .then(mainJson => {
                        if (mainJson) {
                            window.mainJson = JSON.parse(mainJson.replace(/[\r\n]/g, ""));
                            that.morePerPage = parseInt(window.mainJson['more_per_page']); /*Update morePerPage*/
                        }
                        return new Promise(res => {
                            let poller = setInterval(() => {
                                if ($.loadingJS <= 0 && localStorage['obottle-ldpage']) { // 保证库中的外部js和loading页面加载完全
                                    clearInterval(poller);
                                    res(true);
                                }
                            }, 25);
                        });
                    }, rej => {// 获得main.json失败
                        throw 'MainJson Load Failed -> ' + rej;
                    })
                    .then(res => {
                        that.preventScript(); /*剔除已加载scripts*/
                        let j = window.tpJson,
                            tpNames = j['templatehtmls'];
                        j['necessary'].push(pageType); /*Pagetype Pushed*/
                        if (pageType == tpNames['postlist']) {/*如果是文章列表页，就还需要载入单个文章列表项的模板20211020*/
                            j['necessary'].push(tpNames['postitem']); /*Extra Load*/
                        }
                        for (let tpName of j['necessary']) {
                            if (!that.templateLoaded.includes(tpName)) {
                                that.templateOnload += 1;
                                let useCache = false,
                                    theCache = q('r', 'template-' + tpName, '', '', ''),
                                    tpHtmls = window.tpHtmls; /*Test Cache*/
                                if (theCache['c']) { /*如果有缓存，先装载缓存*/
                                    useCache = true;
                                    console.log('Preload the template locally: ' + tpName);
                                    tpHtmls[tpName] = theCache['c'];
                                    that.templateLoaded.push(tpName);
                                    that.templateOnload -= 1;
                                }
                                ((tpName) => {
                                    $.ft(barnDir + tpName)
                                        .then(rawHtml => {
                                            rawHtml = B.r(rawHtml, 'barndir', barnDir, true); // 处理模板中的{[barndir]}标签
                                            tpHtmls[tpName] = rawHtml;
                                            if (!useCache) {
                                                that.templateLoaded.push(tpName);
                                                that.templateOnload -= 1;
                                                q('w', 'template-' + tpName, rawHtml, timestamp(), '');
                                            } else if (theCache['c'] !== rawHtml) { /*缓存需要更新*/
                                                q('w', 'template-' + tpName, rawHtml, timestamp(), '');
                                            } else { /*增加缓存读取次数*/
                                                q('e', 'template-' + tpName, '', '', 1);
                                            }
                                        }, rej => {
                                            console.log('Necessary HTML Load Failed... -> ' + rej);
                                        })
                                })(tpName);// 闭包传递模板路径
                            }
                        }
                        let poller = setInterval(function () {
                            if (that.templateOnload <= 0) {
                                clearInterval(poller);
                                that.renderer(contents); /*Call the renderer*/
                            }
                        }, 50); /*加快页面速度，我也是加把劲骑士！*/
                        j = null; /*释放*/
                    });
            }
        },
        itemPage: 0,
        switchPage: 0,
        currentPageBefore: 0,
        realPage: 1,
        searchWd: '',
        hashExist: false,
        /*渲染状态，同时队列中只能有一次渲染20200805*/
        itemPageFixer: function () {/*文章列表不显示页面，修复去除页面后对于文章列表的计算错误20211020*/
            let that = this,
                mj = window.mainJson, /*get json*/
                nowItemPage = that.itemPage;
            for (let i = 0; i < nowItemPage; i++) {
                let item = mj['dateindex'][i];
                if (item) {
                    let pid = item[0], // 取出文章ID
                        currentPostObj = mj['postindex'][pid];
                    if (currentPostObj['link']) that.itemPage += 1; // 如果是页面，已载入到的项目下标+1
                }
            }
            /*
                itemPage代表**已经**载入到的文章列表项目的下标
                itemPage是从0开始的项目下标，但无论是posts_per_page还是indexPageChecker里的计算都是从1开始计算的项目数，
                因此在itemPage被itemPageFixer修正后，再减去1，以获得正确的项目下标，以便于后续操作（主要用于more函数）。
                比如itemPage是0,减去1后是-1，但是more函数是从itemPage的**下一位**开始的，所以正好是-1+1=0位下标。
                记于2022.2.5 - SomeBottle
            */
            that.itemPage -= 1;
            mj = null;
        },
        cd: function (rendered) { /*covercutter封面<ifcover>去除器*/
            let pattern = new RegExp('<ifcover.*?>(.*?)</ifcover.*?>', 'gis');
            return rendered.replaceAll(pattern, '');
        },
        clothFirstRendered: false,
        /*渲染过的cloth,main放在这里*/
        checkFirstRender: function () { /*检查是不是第一次渲染，如果是就渲染cloth,main并喷到网页上*/
            let that = this,
                j = window.tpJson,
                tps = window.tpHtmls,
                tpNames = j['templatehtmls'],
                cloth = tps[tpNames['cloth']],
                main = tps[tpNames['main']];
            if (!that.clothFirstRendered) { /*还没有渲染cloth,main模板*/
                console.log('Document rendered with clothes.(๑•̀ㅂ•́)و✧');
                let render1 = that.r(main, 'contents', '<div id=\'contentcontainer\'></div>', true), /*预设好id以便后面调用*/
                    render2 = that.r(cloth, 'main', render1, true),
                    ghead = $.rmHead(render2); /*把cloth内的头部去掉，咱分头行动*/
                $.ht(that.delTempTags(ghead[0]), 'container'); /*先把外皮给渲染出来*/
                $.addHead(ghead[1]); /*把头接到head里面去*/
                that.clothFirstRendered = true;
                render1 = render2 = ghead = null;
            }
        },
        back: function () { /*返回上一页*/
            window.history.go(-1);
        },
        turnback: function () {/*根据hash返回文章列表上一页*/
            let current = this.realPage;
            window.location.href = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + (current > 1 ? (current - 1) : 1);
        },
        notNumber: function (num) {
            let pattern = /^\d+$/g;
            return !pattern.test(num.toString());
        },
        isDate: function (num) {
            return new RegExp('^\\d{4}?(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])$', 'gi').test(num);
        },
        currentPageType: '',/*20210919记录renderer获取到的pagetype*/
        isPost: false,//是不是页面，不是页面就是文章20220115
        renderer: function (fcontent = false) { /*(fcontent=是否指定内容)*/
            let that = this,
                j = window.tpJson,
                tps = window.tpHtmls,
                tpNames = j['templatehtmls'],
                comment = tps[tpNames['comment']],
                mj = window.mainJson, /*get json*/
                pageTitle = (that.gt('MainTitle', 'MainTitleEnd', fcontent)).replace(/<\/?.+?>/g, ""), /*Get Page Title(No html characters)*/
                pageType = that.gt('PageType', 'PageTypeEnd', fcontent), /*Get Page Type*/
                htmlPromise; // 针对$.ht预留一个存放Promise的变量
            that.currentPageType = pageType;
            that.currentPostInfo = false; // 重置当前文章信息
            that.isPost = false;
            if (pageType == tpNames['post']) {
                let content = that.deHtml(that.gt('PostContent', 'PostContentEnd', fcontent)), /*Get Post Content*/
                    title = that.gt('PostTitle', 'PostTitleEnd', fcontent), /*Get Post Title*/
                    date = that.gt('PostDate', 'PostDateEnd', fcontent), /*Get Post Date*/
                    tags = that.gt('PostTag', 'PostTagEnd', fcontent), /*Get Post Content*/
                    pid = that.gt('PostID', 'PostIDEnd', fcontent), /*Get Post ID*/
                    cover = that.gt('PostCover', 'PostCoverEnd', fcontent),
                    /*Get Post Cover*/
                    pubTime = that.gt('PubTime', 'PubTimeEnd', fcontent),
                    editTime = that.gt('EditTime', 'EditTimeEnd', fcontent),/* 获得发布和上次编辑的时间*/
                    post = tps[tpNames['post']],
                    tagsTp = that.gt('PostTagsTemplate', 'PostTagsTemplateEnd', post),/*20210919获得tags模板*/
                    tagsDelimiter = that.gt('PostTagsDelimiter', 'PostTagsDelimiterEnd', post),/*20210919获得tags分隔部分*/
                    ifPageTp = that.gt('IfPage', 'IfPageEnd', post),/*如果是页面，标签的部分就显示这里面的内容*/
                    renders = that.r(post, 'postcontent', that.lazyPre($.mark(content.trim())), true), /*unescape and Analyse md*/
                    allTags = [],
                    postInfo = { // 更新currentPostInfo
                        title: title,
                        date: date,
                        tags: tags,
                        pid: pid,
                        cover: cover || '',
                        pubTime: pubTime ? Number(pubTime) : 0,
                        editTime: editTime ? Number(editTime) : 0
                    }
                renders = that.r(renders, 'posttitle', title, true);
                if (!that.isDate(date)) { // 是页面
                    tags = ifPageTp;
                    delete postInfo['date'];
                    postInfo['link'] = date; // 如果是页面，就把日期属性改成link
                } else { /*Tag Process*/
                    allTags = tags.split(',');
                    tags = '';
                    allTags.forEach(function (v, i) {
                        let filled = that.r(tagsTp, 'tagurl', j['generatehtmls']['tags'] + '#' + encodeURIComponent(v), true);
                        filled = that.r(filled, 'tagname', v, true);
                        tags += filled;
                        if (i !== (allTags.length - 1)) tags += tagsDelimiter;/*如果不是最后一个标签就加分隔部分*/
                    });
                    that.isPost = true; // 更新属性：是文章
                }
                that.currentPostInfo = postInfo; // 更新currentPostInfo
                renders = that.r(renders, 'posttags', tags, true);
                renders = that.r(renders, 'postdate', $.dt(date), true);
                renders = that.r(renders, 'comments', comment, true); /*LoadCommentsForPost*/
                renders = that.r(renders, 'pid', pid, true); /*SetPid*/
                let theanchor = $.trimMark(window.location.hash).replace('#', '');/*获得要跳转的锚点*/
                renders = that.r(renders, 'pagetype', pageType, true); /*SetPageType*/
                renders = that.r(renders, 'PageType', '<!--[PageType]', '(', false); /*SetPageType*/
                renders = that.r(renders, 'PageTypeEnd', '[PageTypeEnd]-->', '(', false); /*SetPageType*/
                /*CoverProcess*/
                if (cover && cover !== 'none') {
                    renders = that.r(renders, 'postcover', cover, true); /*设定封面*/
                } else { /*没有封面，按标签一起删掉*/
                    renders = that.cd(renders);
                }
                if (!that.isDate(date)) { /*是页面，就不显示评论了*/
                    let beforeEnd = renders.split(new RegExp('\\{\\(:PostEnd\\)\\}', 'gi'))[0] + '<!--PostEnd-->',
                        afterComment = '<!--Footer-->' + renders.split(new RegExp('\\{\\(Footer:\\)\\}', 'gi'))[1];
                    renders = beforeEnd + afterComment;
                }
                renders = that.gt('PostTemplate', 'PostTemplateEnd', renders);
                that.checkFirstRender(); /*检查是否已经在页面中渲染cloth和main 20210125*/
                $.title(pageTitle); /*设置title*/
                htmlPromise = $.ht(that.delTempTags(renders), 'contentcontainer');
                $.aniChecker($.alterClass($.loadSettings['listening'], '', false, true), function () {
                    that.lazyCheck(); /*lazyLoad初次检测*/
                });
                that.applyAfterLoad(() => { if (SC(theanchor)) SC(theanchor).scrollIntoView(); });
                window.addEventListener('scroll', B.lazyCheck, false); /*只有文章页面监听懒加载20210909*/
                renders = j = null; /*释放*/
            } else if (pageType == tpNames['postlist']) {
                let content = that.deHtml(that.gt('PostContent', 'PostContentEnd', fcontent)), /*Get Post Content*/
                    listTemplate = tps[tpNames['postlist']],
                    postListTp = that.gt('PostListTemplate', 'PostListTemplateEnd', listTemplate),
                    moreBtn = that.gt('MoreBtn', 'MoreBtnEnd', listTemplate),
                    backBtn = that.gt('BackBtn', 'BackBtnEnd', listTemplate);
                postListTp = that.r(postListTp, 'morebtn', '<span id=\'morebtn\'>' + moreBtn + '</span>', true);
                postListTp = that.r(postListTp, 'backbtn', '<span id=\'backbtn\'>' + backBtn + '</span>', true);
                let renders = that.r(postListTp, 'postitems', '<div id=\'postitems\'>' + $.mark((content.trim())) + '</div>', true); /*Analyse md*/
                renders = that.r(renders, 'pagetype', pageType, true); /*SetPageType*/
                renders = that.r(renders, 'PageType', '<!--[PageType]', '(', false); /*SetPageType*/
                renders = that.r(renders, 'PageTypeEnd', '[PageTypeEnd]-->', '(', false); /*SetPageType*/
                that.itemPage = parseInt(mj['posts_per_page']);
                that.itemPageFixer(); /*修复因忽略页面而造成的列表重复*/
                that.checkFirstRender(); /*检查是否已经在页面中渲染cloth和main 20210125*/
                $.title(pageTitle); /*设置标题*/
                htmlPromise = $.ht(that.delTempTags(renders), 'contentcontainer');
                renders = null; /*释放*/
                that.backChecker();/*检查是否显示后退按钮*/
                that.indexPageChecker();
                var timer = setInterval(function () { /*CheckIndexPage*/
                    if (that.gt('<!--[PageType]', '[PageTypeEnd]-->', false, true) !== tpNames['postlist']) { /*跳离index页了*/
                        console.log('Jumped out of the index page w(ﾟДﾟ)w');
                        that.switchPage = 0;/*(和morebtn有关)将单页文章展示归零*/
                        clearInterval(timer);
                        j = null;/*释放掉临时的tpJson*/
                        return false;
                    }
                    that.indexPageChecker();
                }, 100);
            } else if (pageType == tpNames['archives']) {
                let ar = tps[tpNames['archives']],
                    /*get entire html*/
                    archiveMain = that.gt('Archives', 'ArchivesEnd', ar),
                    /*Get archive main html*/
                    archiveTemp = that.gt('ArchiveTemplate', 'ArchiveTemplateEnd', ar),
                    /*get section template*/
                    archiveItemTemp = that.gt('ArchiveItemTemplate', 'ArchiveItemTemplateEnd', ar),
                    /*get item template*/
                    /*Generate Archives*/
                    dateIndexes = mj['dateindex'],
                    rdSections = '',
                    /*archive section render*/
                    rdArcItems = '',
                    /*archive item render*/
                    year = 0;
                for (let i = 0, len = dateIndexes.length; i < len; i++) {
                    let item = dateIndexes[i],
                        currentYear = item[1].toString().substring(0, 4);// 获得当前年份
                    if (currentYear !== year) {
                        year = currentYear;
                        if (rdArcItems !== '') rdSections = that.r(rdSections, 'archiveitems', rdArcItems, true), rdArcItems = ''; /*apply items to section*/
                        rdSections += that.r(archiveTemp, 'archiveyear', currentYear, true); /*render year section*/
                    }
                    let pid = item[0], // 取出文章ID
                        currentPostObj = mj['postindex'][pid],
                        postLinkPattern = currentPostObj['permalink'] || 'post-{pid}', // 获得文章永久链接模板，这里兼容旧版本
                        permalink = $.useLinkPattern(postLinkPattern, pid), // 文章永久链接
                        title = Base64.decode(currentPostObj['title']),
                        date = currentPostObj['date'],
                        itemLink = currentPostObj['link'] ? currentPostObj['link'] + '.html' : permalink + '.html',/*render items*/
                        itemrender = that.r(archiveItemTemp, 'archiveitemlink', itemLink, true);
                    itemrender = that.r(itemrender, 'archiveitemtitle', title, true);
                    itemrender = that.r(itemrender, 'archiveitemdate', $.dt(date), true);
                    rdArcItems += itemrender;
                }
                rdSections = (rdArcItems !== '') ? that.r(rdSections, 'archiveitems', rdArcItems, true) : rdSections; /*apply items to section#2*/
                rdSections += '</ul>'; /*Generate Finish*/
                let renders = that.r(archiveMain, 'archives', rdSections, true); /*渲染模板部分*/
                renders = that.r(renders, 'pagetype', pageType, true); /*SetPageType*/
                renders = that.r(renders, 'PageType', '<!--[PageType]', '(', false); /*SetPageType*/
                renders = that.r(renders, 'PageTypeEnd', '[PageTypeEnd]-->', '(', false); /*SetPageType*/
                that.checkFirstRender(); /*检查是否已经在页面中渲染cloth和main 20210125*/
                $.title(pageTitle); /*设置标题*/
                htmlPromise = $.ht(that.delTempTags(renders), 'contentcontainer');
                renders = rdArcItems = rdSections = j = null; /*释放*/
            } else if (pageType == tpNames['tags']) {
                let tagsTp = tps[tpNames['tags']],
                    tagsMain = that.gt('Tags', 'TagsEnd', tagsTp),
                    /*Get tag main html*/
                    tagItemTp = that.gt('TagItemTemplate', 'TagItemTemplateEnd', tagsTp),
                    /*get item template*/
                    href = $.trimMark(window.location.href),
                    /*Generate Tags*/
                    renderTgs = '',
                    pIndexes = mj['postindex'],
                    tagsArr = new Array();
                if (that.allTagsHtml == '') {
                    for (var i in pIndexes) {
                        let currentTags = pIndexes[i]['tags'].split(',');
                        currentTags.forEach(function (item) {
                            if (item !== '' && tagsArr.indexOf(item) == -1) {
                                tagsArr.push(item);
                            }
                        });
                    }
                    tagsArr.forEach(function (item) {
                        let g = that.r(tagItemTp, 'tagitemtitle', item, true); /*replace and render*/
                        g = that.r(g, 'tagitemlink', '#' + encodeURIComponent(item), true);
                        renderTgs += g;
                    });
                    that.allTagsHtml = renderTgs;
                } else {/*如果渲染过了就不必重复了，节省算力*/
                    renderTgs = that.allTagsHtml;
                }
                if (href.indexOf('#') !== -1) {
                    let specific = href.split('#')[1];
                    that.nowTag = specific;
                    if (specific !== 'alltags') {/*如果指定了标签，在页面载入后调用一下tagUper20211026*/
                        renderTgs = '<script>B.tagUper(\'' + specific + '\');PJAX.sel(\'contentcontainer\');PJAX.start();</script>';
                    }
                } /*Generate Finish*/
                let timer = setInterval(function () { /*CheckTagPage*/
                    if (window.location.href.indexOf(j['generatehtmls']['tags']) == -1 && window.location.href.indexOf((j['generatehtmls']['tags']).replace('.html', '')) == -1) { /*跳离tag页了*/
                        clearInterval(timer);
                        j = null;
                        return false;
                    }
                    that.tagPageChecker();
                }, 100);
                let renders = that.r(tagsMain, 'tags', '<div id=\'contenttags\'>' + renderTgs + '</div>', true);
                renders = that.r(renders, 'pagetype', pageType, true); /*SetPageType*/
                renders = that.r(renders, 'PageType', '<!--[PageType]', '(', false); /*SetPageType*/
                renders = that.r(renders, 'PageTypeEnd', '[PageTypeEnd]-->', '(', false); /*SetPageType*/
                that.checkFirstRender(); /*检查是否已经在页面中渲染cloth和main 20210125*/
                $.title(pageTitle); /*设置标题*/
                htmlPromise = $.ht(that.delTempTags(renders), 'contentcontainer');
                renders = null; /*释放*/
            }
            that.tpcheckStatus = false; /*模板检查拼接完毕*/
            /*PJAX监听刷新*/
            PJAX.autoprevent();
            PJAX.sel('contentcontainer');
            PJAX.start();
            that.navcheck(); /*进行导航栏检查*/
            window.dispatchEvent(PJAX.PJAXFinish); /*调用事件隐藏loading浮层20201229*/
            htmlPromise.then(res => {
                let func = that.rendererCallBack;
                if (typeof func == 'function') {
                    /*执行callAfterRender设置的回调函数，传入当前的pageType*/
                    func(pageType);
                }
            }, rej => {
                console.log(rej);
            });
            mj = tps = null;
        },
        rendererCallBack: false, // renderer回调函数
        callAfterRender: function (callBackFunc) { // 设置renderer回调函数
            if (typeof callBackFunc == 'function') {
                this.rendererCallBack = callBackFunc;
            }
        },
        currentPostInfo: false, // 当前文章信息对象
        backChecker: function () {/*检查后退按钮是否显示*/
            SC('backbtn').style.display = this.realPage == 1 ? 'none' : 'initial';
        },
        nowTag: '',
        allTagsHtml: '',
        tagUper: function (tag) { /*渲染特定标签索引的文章列表*/
            tag = decodeURIComponent(tag);
            let that = this,
                j = window.tpJson,
                tagsTp = window.tpHtmls[j['templatehtmls']['tags']],
                /*get main tag html*/
                tagListTp = that.gt('TagListTemplate', 'TagListTemplateEnd', tagsTp),
                /*get item template*/
                tagListItemTp = that.gt('TagListItemTemplate', 'TagListItemTemplateEnd', tagsTp),
                /*get item template*/
                mj = window.mainJson, /*get json*/
                dIndexes = mj['dateindex'],
                pIndexes = mj['postindex'],
                postList = new Array(),
                renderTgs = '';
            for (let i = 0, len = dIndexes.length; i < len; i++) { // 按日期顺序取出文章
                let pid = dIndexes[i][0]; // 获得文章ID
                if (pIndexes[pid]['tags'].indexOf(tag) !== -1) {
                    postList.push(pid);
                }
            }
            renderTgs += '<ul>';
            postList.forEach(function (pid) {
                let post = pIndexes[pid],
                    postLinkPattern = post['permalink'] || 'post-{pid}', // 获得文章永久链接模板，这里兼容旧版本
                    permalink = $.useLinkPattern(postLinkPattern, pid), // 文章永久链接
                    link = permalink + '.html',
                    date = $.dt(post['date']);
                if (post['link']) {
                    link = post['link'] + '.html';
                }
                let g = that.r(tagListItemTp, 'taglistitemlink', link, true);
                g = that.r(g, 'taglistitemtitle', Base64.decode(post['title']), true);
                g = that.r(g, 'taglistitemdate', $.dt(date), true);
                renderTgs += g;
            });
            renderTgs = that.r(tagListTp, 'taglist', renderTgs, true);
            renderTgs = that.r(renderTgs, 'tagcurrent', tag, true);
            SC('contenttags').innerHTML = renderTgs;
            renderTgs = mj = j = null; /*释放*/
        },
        tagPageChecker: function () { /*标签页hash更新检查器*/
            let that = this,
                href = $.trimMark(window.location.href);
            if (href.indexOf('#') == -1) {
                PJAX.pause();
                window.location.replace(href + '#alltags'); /*利用replace防止浏览器记录history导致无法回退的bug*/
                PJAX.start();
            } else {
                let specific = href.split('#')[1];
                if (that.nowTag !== specific) {
                    that.nowTag = specific;
                    if (specific == 'alltags') {
                        if (SC('contenttags')) SC('contenttags').innerHTML = that.allTagsHtml;
                    } else {
                        that.tagUper(specific);
                        PJAX.start();/*防止标签更新后a标签没有监听PJAX的问题*/
                    }
                }
            }
        },
        indexPageChecker: function () {
            let j = window.tpJson,
                href = $.trimMark(decodeURIComponent(window.location.href)),
                mj = window.mainJson, /*get json*/
                maxRender = parseInt(mj['posts_per_page']),
                that = this;
            if (href.indexOf('#') !== -1) {
                that.hashExist = true;/*存在hash*/
                let whichPage = href.split('#')[1] || 1;
                if (href.indexOf('#!') == -1) {
                    if (!that.notNumber(whichPage)) {
                        let currentPage = parseInt(whichPage), pageBefore = currentPage - 1;
                        if (that.currentPageBefore !== pageBefore && that.realPage !== currentPage) {/*翻页了，这里判断realPage是为了防止more已经被用户触发了indexpagechecker再触发一遍，造成无用的资源浪费*/
                            console.log('Page change triggered by indexPageChecker <(￣︶￣)>');
                            that.searchWd = ''; /*不在搜索模式,重置搜索词*/
                            that.currentPageBefore = pageBefore;
                            that.itemPage = maxRender * pageBefore * that.morePerPage; /*根据页码计算当前页(每按一次“more"按钮最多展示多少页) × (当前页码-1，也就是算当前页之前的项目) × (每页能按多少次"more"按钮) 20211020补充*/
                            that.itemPageFixer(); /*修复因忽略页面而造成的列表重复*/
                            /*itemPage变量在renderer里被初始化为了posts_per_page值，经过itemPageFixer校正为不算进页面的itemPage值 20211020补充*/
                            SC('postitems').innerHTML = '';/*因为翻页了，清空之前页的文章列表*/
                            that.more(true); /*顺序不要颠倒!，这里利用more将项目分片展示出来，这里的true让more不进行翻页操作*/
                            that.realPage = pageBefore + 1;/*真正的页码是这个，值其实是等同于上面的whichPage的*/
                            that.switchPage = 0;/*将点击more按钮的次数归零*/
                            that.backChecker();/*检查是否显示后退按钮*/
                        }
                    }
                } else { /*Search mode*/
                    let item = window.tpHtmls[j['templatehtmls']['postitem']],
                        postItemTp = that.gt('PostItem', 'PostItemEnd', item),
                        /*有项目的模板*/
                        noItemTp = that.gt('NoItem', 'NoItemEnd', item), /*无项目的模板*/
                        queryWd = href.split('#!')[1];/*获得搜索的内容*/
                    if (queryWd !== that.searchWd && !that.tpcheckStatus && !that.loadStatus) {/*如果模板未拼接完毕，就先不处理搜索*/
                        that.searchWd = queryWd;
                        let pIndexes = Object.assign({}, mj['postindex']);/*进行两层复制（比较深），防止对原对象造成了影响*/
                        for (i in pIndexes) {/*因为搜索要遍历到整个对象，而且要做base64处理，为了防止后面多次重复操作造成资源消耗，这里就先全部处理*/
                            pIndexes[i] = (typeof pIndexes[i] == 'object') ? Object.assign({}, pIndexes[i]) : pIndexes[i];/*第二层复制，如果是对象就用Object.assign方法*/
                            pIndexes[i]['title'] = Base64.decode(pIndexes[i]['title']);
                            pIndexes[i]['intro'] = Base64.decode(pIndexes[i]['intro']);
                        }
                        queryWd = queryWd.toLowerCase(); /*大小写忽略*/
                        function renderList(postIndexes, pid) {
                            let currentPostObj = postIndexes[pid],
                                postLinkPattern = currentPostObj['permalink'] || 'post-{pid}', // 获得文章永久链接模板，这里兼容旧版本
                                permalink = $.useLinkPattern(postLinkPattern, pid),// 文章永久链接
                                tt = currentPostObj['title'], cc = currentPostObj['intro'], dd = currentPostObj['date'], tags = currentPostObj['tags'],
                                renders = B.r(postItemTp, 'postitemtitle', tt, true);
                            renders = B.r(renders, 'postitemintro', cc + '...', true);
                            renders = B.r(renders, 'postitemdate', $.dt(dd), true);
                            renders = B.r(renders, 'postitemtags', tags.replace(/,/g, '·'), true); /*20201229加入对于文章列表单项模板中tags的支持*/
                            renders = currentPostObj['link'] ? B.r(renders, 'postitemlink', currentPostObj['link'] + '.html', true) : B.r(renders, 'postitemlink', permalink + '.html', true);/*针对和文章不同的页面特殊处理*/
                            renders = currentPostObj['cover'] ? B.r(renders, 'postcover', currentPostObj['cover'], true) : that.cd(renders);/*如果有封面就上封面，没封面就整段删掉*/
                            return renders;
                        }
                        let localSearch = [], renderTp = '';
                        for (var i in pIndexes) {
                            let tt = pIndexes[i]['title'].toLowerCase(),
                                cc = pIndexes[i]['intro'].toLowerCase(),
                                dd = (pIndexes[i]['date']).toLowerCase(),
                                tags = pIndexes[i]['tags'].toLowerCase();
                            if ((tt + cc + dd + tags).indexOf(queryWd) !== -1) {
                                localSearch.push(i);
                            }
                        }
                        function process() { /*局部函数*/
                            if (SC('postitems') && SC('morebtn') && SC('backbtn')) {
                                window.scrollTo(0, 0);
                                SC('postitems').innerHTML = "Searching...∠( ᐛ 」∠)＿";
                                SC('morebtn').style.display = 'none';
                                SC('backbtn').style.display = 'none';
                                Promise.resolve(localSearch)
                                    .then((localSearch) => {
                                        return typeof that.searchInj == "function" ? that.searchInj(pIndexes, queryWd, localSearch) : Promise.resolve(localSearch);/*如果没有外置搜索，就直接返回renderTp，如果有，就返回searchInj函数（返回一个Promise对象）*/
                                    })
                                    .then((respArr) => {
                                        respArr = Array.from(new Set(respArr));/*利用集合去重*/
                                        respArr.forEach((item) => {
                                            renderTp += renderList(pIndexes, item);/*遍历渲染项目*/
                                        });
                                        renderTp = renderTp || noItemTp;/*如果没有找到结果就返回noItem模板*/
                                        SC('postitems').innerHTML = renderTp;
                                        PJAX.start(); /*refresh pjax links*/
                                        renderList = pIndexes = renderTp = null;/*释放内存*/
                                    })
                            } else {
                                setTimeout(function () {
                                    return process();
                                }, 10); /*如果没有需要的元素存在滞留一下*/
                            }
                            process = localSearch = null;
                        }
                        if (!that.tpcheckStatus && !that.loadStatus) { /*如果页面加载完,模板拼接完毕就可以打印搜索结果了*/
                            process();
                        }
                    }
                }
            } else {
                if (that.hashExist) {
                    that.realPage = 1;
                    that.switchPage = 0;
                    that.hashExist = false;
                }
            }
            j = mj = null;
        },
        loadshow: function () {
            B.loadStatus = true; /*加载未就绪*/
            if ($.loadSettings['animations']) {
                /*解构赋值*/
                let { in: eIn, out: eOut } = $.loadSettings['animations'];
                for (var i in eIn) $.alterClass(i, eIn[i]);
                for (var i in eOut) $.alterClass(i, eOut[i], true); /*移除元素*/
            }
        },
        loadhide: function () {
            B.loadStatus = false; /*加载就绪*/
            let { out: eOut, in: eIn } = $.loadSettings['animations'];
            for (var i in eOut) $.alterClass(i, eOut[i]);
            for (var i in eIn) $.alterClass(i, eIn[i], true); /*移除元素*/
        },
        applyAfterLoad: function () {/*等加载完毕后再应用html改动(操作函数(参数数组),参数1,参数2,...)*/
            let that = this, oriArgs = arguments, args = Array.from(oriArgs), func = args.shift();/*得到传入的参数列表*/
            if (that.loadStatus) {
                setTimeout(() => that.applyAfterLoad.apply(that, oriArgs), 50);
            } else {
                func(args);
                func = that = null;
            }
        },
        more: function (checkerTrigger = false) { /*(是否由pageChecker触发(用于适配indexpagechecker20200812)*/
            let that = this,
                j = window.tpJson,
                start = that.itemPage + 1, /*紧接**已加载**到的项目下标itemPage的下一项开始*/
                counter = 0,
                listRender = '',
                mj = window.mainJson, /*get json*/
                postItemTp = window.tpHtmls[j['templatehtmls']['postitem']],
                ptTp = that.gt('PostItem', 'PostItemEnd', postItemTp),/*有项目的模板*/
                noItemTp = that.gt('NoItem', 'NoItemEnd', postItemTp), /*无项目的模板*/
                maxRender = parseInt(mj['posts_per_page']),
                dIndexes = mj['dateindex'];
            for (let i = start, len = dIndexes.length; i < len; i++) { /*从start为下标的项目开始处理，也就是找到当前加载的分片的文章起始id*/
                let item = dIndexes[i];
                if (counter < maxRender && item) {/*从文章项目起始id开始载入maxRender(posts_per_page)个项目，制成当前的分片*/
                    let pid = item[0],// 取出文章ID
                        currentPostObj = mj['postindex'][pid];
                    if (!currentPostObj['link']) { /*排除页面在外，文章列表不显示页面*/
                        let renders = B.r(ptTp, 'postitemtitle', Base64.decode(currentPostObj.title), true),
                            postLinkPattern = currentPostObj['permalink'] || 'post-{pid}', // 获得文章永久链接模板，这里兼容旧版本
                            permalink = $.useLinkPattern(postLinkPattern, pid); // 文章永久链接
                        renders = B.r(renders, 'postitemintro', Base64.decode(currentPostObj.intro) + '...', true);
                        renders = B.r(renders, 'postitemdate', $.dt(currentPostObj.date), true);
                        renders = B.r(renders, 'postitemtags', currentPostObj.tags.replace(/,/g, '·'), true); /*20201229加入对于文章列表单项模板中tags的支持*/
                        renders = B.r(renders, 'postitemlink', permalink + '.html', true);
                        if (currentPostObj['cover']) { /*如果有封面*/
                            renders = B.r(renders, 'postcover', currentPostObj['cover'], true); /*把页面也算入*/
                        } else {
                            renders = that.cd(renders); /*没有封面就删掉所有<ifcover>*/
                        }
                        listRender += renders; /*渲染到列表模板*/
                        renders = null;
                    } else {/*不显示页面，要去除页面占用的载入数量counter，但同时下一个列表的起始id itemPage要增加*/
                        that.itemPage += 1;
                        counter -= 1;
                    }
                    counter += 1;
                } else { /*处理maxRender个项目后跳出循环*/
                    break;
                }
            }
            if (listRender == '') { /*渲染出来什么都没有就是没有更多文章了*/
                listRender = noItemTp;/*用上没有更多文章的模板*/
                SC('morebtn').style.display = 'none';
            } else {
                SC('morebtn').style.display = 'initial';
            }
            that.itemPage += maxRender;/*itemPage加上一个分片中的项目数，就是下一个分片的起始位置*/
            if (that.switchPage >= (that.morePerPage - 1) && !checkerTrigger) { /*如果switchPage（一个页面的分片数量,从0开始）大于morePerPage(一个页面最多分片数量,从1开始)，就换到下一页面。值得注意的是，more函数分用户触发和indexPageChecker触发，只有用户触发的时候会执行这个选择块中的语句，indexPageChecker触发的话只是为了打印列表分片，所以执行的是else块中的语句*/
                that.currentPageBefore = that.realPage;/*用户触发的时候也要修改和indexPageChecker有关的currentPageBefore*/
                that.scrolltop(20, 2);
                that.switchPage = 0;/*将页面已经载入的分片数量归零*/
                that.realPage += 1;/*真实页数+1*/
                PJAX.pause();/*暂停PJAX监听，防止翻页时加载浮页跳出*/
                window.location.href = '#' + that.realPage;/*这里是用户触发的情况下，修改hash*/
                SC('postitems').innerHTML = listRender;
                PJAX.start(); /*在更新postitems后给a标签附上PJAX监听器20211026*/
            } else {
                that.applyAfterLoad((x) => {
                    SC('postitems').innerHTML = x[1] ? x[0] : SC('postitems').innerHTML + x[0];
                    PJAX.start(); /*在更新postitems后给a标签附上PJAX监听器20211026*/
                }, listRender, checkerTrigger);/*渲染分片到页面，如果是indexPageChecker触发的就更新所有的postitems，如果是more自己触发的就追加在现有的postitems后面20211026*/
                that.switchPage += 1;
            }
            that.backChecker();
            j = dIndexes = listRender = null;
        }
    };
    window.addEventListener('pjaxstart', B.loadshow, false);
    window.addEventListener('pjaxfinish', B.loadhide, false);
}

/*Simple PJAX For Front MAIN - SomeBottle*/
if (PJAX == undefined || PJAX == null) { /*防止重初始化*/
    var PJAX = {
        index: window.history.state === null ? 1 : window.history.state.page,
        PJAXStart: new CustomEvent('pjaxstart'),
        PJAXFinish: new CustomEvent('pjaxfinish'),
        loadedPage: {},
        lastHref: window.location.href,
        preventUrl: new Array(),
        recentUrl: '',
        replace: '',
        status: true,
        sel: function (r) {
            this.replace = r;
        },
        jump: function (href) {
            let eHref = encodeURIComponent(href),
                that = this;
            that.replace = that.replace || 'contentcontainer';/*默认指定contentcontainer*/
            if (that.recentUrl.indexOf('#') !== -1 && href.indexOf('#') !== -1 && that.recentUrl.split('#')[0] == href.split('#')[0]) { /*防止Tag页面的跳转问题*/
                return false;
            } else {
                if (that.recentUrl.indexOf('#') == -1 && href.indexOf('#') !== -1) {/*由有hash变成无hash*/
                    B.currentPageBefore = 0; /*防止页码bug*/
                }
            }
            window.dispatchEvent(that.PJAXStart); /*激活事件来显示加载动画*/
            window.removeEventListener('scroll', B.lazyCheck, false); /*移除懒加载监听*/
            $.aniChecker($.alterClass($.loadSettings['listening'], '', false, true), function () {
                window.scrollTo(0, 0); /*滚动到头部*/
                if (that.loadedPage[eHref]) { /*有临时缓存*/
                    that.clearEvent(); /*清除之前的监听器*/
                    B.tpcheck(that.loadedPage[eHref]); /*因为tpcheck末尾已经有loadhide，此处没必要$.aniChecker20201229*/
                } else {
                    let cache = q('r', eHref, '', '', ''), cacheContent = cache['c']; /*获取缓存信息*/
                    if (cacheContent) { /*如果有缓存*/
                        that.clearEvent(); /*清除之前的监听器*/
                        B.tpcheck(cacheContent); /*预填装缓存*/
                    }
                    $.ft(href)
                        .then(raw => {
                            that.recentUrl = href;
                            that.loadedPage[eHref] = raw;/*给临时缓存装载*/
                            if (cacheContent !== raw) { /*缓存需要更新了，把新数据写入本地*/
                                q('w', eHref, raw, timestamp(), '');
                                that.clearEvent();/*清除之前的监听器*/
                                B.tpcheck(raw);
                            } else {
                                q('e', eHref, '', '', 1); /*更新缓存读取次数*/
                            }/*因为tpcheck末尾已经有loadhide，此处没必要$.aniChecker20201229*/
                        }, rej => {
                            window.dispatchEvent(that.PJAXFinish);
                            console.log(rej);
                        });
                }
            });
        },
        pjaxAutoJump: function () {
            let currentHref = window.location.href, tpHtmls = window.tpJson['templatehtmls'];
            if (PJAX.recentUrl.split('#')[0] == currentHref && B.currentPageType == tpHtmls['postlist']) { /*用于处理**首页**没有hash和有hash页码时回退跳转的问题20200808*/
                window.history.replaceState(null, null, currentHref + '#1');/*从https://xxx/#2回退到https://xxx/时自动变成https://xxx/#1跳转到页码1(不改变历史)20200808*/
                return true;
            } else if (PJAX.recentUrl == currentHref.split('#')[0] && B.currentPageType == tpHtmls['post']) { // 在文章页面点击锚点时不要重载页面！20220113
                return true;
            }
            if (currentHref.indexOf(mainHost) !== -1) { /*回退时跳转20200808*/
                PJAX.jump(currentHref);
            }
        },
        clickEvent: function (e) {
            if (PJAX.preventUrl.indexOf(this.href) !== -1 || !this.href || this.href.includes(location.pathname) && this.href.includes('#')) {/*如果a标签的href是hash且指向当前页面，也直接放行，这样在文章内就可以使用锚点了*/
                return true;
            } else {
                window.history.pushState(null, null, this.href); /*加入历史*/
                e.preventDefault();
                PJAX.jump(this.href);
            }
        },
        clearEvent: function () { /*移除所有a标签事件*/
            let that = this,
                tags = document.getElementsByTagName("a");
            for (let e of tags) {
                e.removeEventListener('click', that.clickEvent); /*取消监听A标签*/
            }
            tags = null;
        },
        start: function () {
            let that = this;
            that.status = true; /*启动*/
            that.recentUrl = window.location.href;
            that.clearEvent(); /*先清除之前的监听器*/
            window.removeEventListener('popstate', PJAX.pjaxAutoJump);/*先移除原来的事件监听器*/
            let tags = document.getElementsByTagName("a");
            for (let e of tags) {
                let onc = e.getAttribute('onclick'); /*检查a标签是否有onclick属性20210126*/
                if (!onc) { /*防止不是元素的凑数，a标签带onclick属性就不监听了20210126*/
                    e.setAttribute('pjax', ''); /*设置标识*/
                    e.addEventListener('click', that.clickEvent, false); /*监听A标签*/
                }
            } /*回退时触发*/
            window.addEventListener('popstate', PJAX.pjaxAutoJump, false);
            tags = null;
        },
        pause: function () {
            this.status = false; /*暂停*/
            window.removeEventListener('popstate', PJAX.pjaxAutoJump); /*移除监听器，暂停pjax*/
        },
        autoprevent: function () {
            let that = this,
                tags = document.getElementsByTagName("a"),
                h = window.location.host;
            for (let e of tags) {
                if (e.href !== undefined) {
                    if (e.href.indexOf(h) == -1) {
                        that.preventUrl.push(e.href);
                    }
                }
            }
            tags = null;
        }
    };
}
/*CacheArea - Thank you OBottle*/
function q(md, k, c, t, rt) { /*(mode,key,content,timestamp,readtime)*/
    /*初始化本地cache*/
    if (typeof localStorage.obottle == 'undefined') {
        localStorage.obottle = '{}';
    }
    let timestamp = 0,
        cache = '',
        caches = JSON.parse(localStorage.obottle),
        rs = {};
    if (typeof caches[k] !== 'undefined') {
        timestamp = caches[k].t;
        cache = caches[k].h;
    }
    switch (md) {
        case 'w':/*Write*/
            let cc = new Object();
            cc.h = c;
            cc.t = t;
            cc.rt = 0; /*使用缓存次数*/
            caches[k] = cc;
            try {
                localStorage.obottle = JSON.stringify(caches);
            } catch (e) {
                for (var d in caches) {
                    if (Number(caches[d].rt) <= 20 || Number(t) - Number(caches[d].t) >= 172800) { /*自动清理本地储存空间*/
                        delete caches[d];
                    }
                }
                localStorage.obottle = JSON.stringify(caches);
            }
            break;
        case 'r':/*Read*/
            rs = {
                t: timestamp,
                c: cache
            };
            return rs;
        case 'e':/*Edit*/
            caches[k].rt = Number(caches[k].rt) + rt;
            localStorage.obottle = JSON.stringify(caches);
            break;
    }
}
function timestamp() {/*GetTimestamp*/
    var a = new Date().getTime();
    return a;
}
B.tpcheck(); /*Activate Template Checker*/
