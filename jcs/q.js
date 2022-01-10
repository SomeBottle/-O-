/*Scripts For Request - SomeBottle*/
"use strict";
var $ = new Object();
$.ls = new Array();
$.hash = window.location.href;
var SC = function (e) {
	if (e == 'body') {
		return document.body;
	} else {
		return document.getElementById(e);
	}
}
$.chash = function (h) { /*校验hash*/
	if ($.tr(window.location.href) == h) {
		return true;
	} else {
		return false;
	}
}
$.script = function (url) {
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
$.tr = function (url) {
	var a = url;
	a = a.split('?');
	if ((a.length - 1) > 1 || url.indexOf('!') !== -1) {
		if (url.indexOf('?') !== -1) {
			a.pop();
		}
	}
	var u = '';
	for (var i in a) {
		u = u + a[i] + '?';
	}
	u = u.substring(0, u.length - 1);
	return u;
}
$.op = function (v, e) {
	ht = SC(e);
	if (Number(v) == 1) {
		ht.style.transition = '0.5s ease';
		ht.style.opacity = '1';
	} else {
		ht.style.transition = 'none';
		ht.style.opacity = '0';
	}
}
$.rm = function (e) {
	SC(e).parentNode.removeChild(SC(e));
}
$.ht = function (h, e) {
	var ht = SC(e);
	ht.innerHTML = h;
	let os = ht.getElementsByTagName('script');
	var scr = '';
	for (var o = 0; o < os.length; o++) {
		if (os[o].src !== undefined && os[o].src !== null && os[o].src !== '') {
			$.script(os[o].src);
		} else {
			setTimeout(os[o].innerHTML, 0);
		}
	}

}
$.ce = function (v) {/*if empty*/
	if (v == null || String(v) == 'undefined' || v.match(/^\s*$/)) return false
	else return true;
}
$.getquery = function (name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]); return null;
}
$.param = function (pr, bs64 = false) {/*params(object)*/
	var param = '?';
	for (var i in pr) {
		param += i + '=' + pr[i] + '&';
	}
	param = param.slice(0, param.length - 1);
	if (bs64) {
		return Base64.encode(JSON.stringify(pr));
	} else {
		return param;
	}
}
$.fHook = function (resp) {
	if (resp.status >= 200 && resp.status < 400) {
		return resp;
	} else {
		throw 'Error response, code:' + resp.status;
	}
}
$.ft = function (p, d, sf, m, hd) { /*(path,data,success or fail,method,authheader,async,sendasjson)*/
	let options = {
		body: JSON.stringify(d),
		cache: 'default',
		headers: new Headers({
			'Content-Type': 'application/x-www-form-urlencoded'
		}),
		method: m.toUpperCase()
	};
	if (m == 'get') delete options.body;
	if ($.ce(hd)) {
		options.headers.append('Authorization', hd);
	}
	fetch(p, options)
		.then((res) => ($.fHook(res).text()))
		.catch(err => {
			sf.failed(err, p);
			throw err;
		})
		.then(resp => sf.success(resp, p))
}
$.r = function (a, o, p, g = true) { /*(All,Original,ReplaceStr,IfReplaceAll)*/
	if (g) {
		while (a.indexOf(o) !== -1) {
			a = a.replace(o, p);
		}
	} else {
		a = a.replace(o, p);
	}
	return a;
}