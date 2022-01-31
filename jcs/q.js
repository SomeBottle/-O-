/*Scripts For Request - SomeBottle*/
"use strict";
var $ = {
	loadedScripts: new Array(),
	hash: window.location.href,
	script: function (url) {
		let script = document.createElement("script");
		if (!$.loadedScripts.includes(url)) {
			$.loadedScripts.push(url);
			script.type = "text/javascript";
			script.src = url;
			document.body.appendChild(script);
		}
	},
	ht: function (h, e) {
		let ht = SC(e),
			os = ht.getElementsByTagName('script');
		ht.innerHTML = h;
		for (var o = 0; o < os.length; o++) {
			if (os[o].src !== undefined && os[o].src !== null && os[o].src !== '') {
				$.script(os[o].src);
			} else {
				setTimeout(os[o].innerHTML, 0);
			}
		}
	},
	notEmpty: function (v) {/*if not empty*/
		if (v == null || String(v) == 'undefined' || v.match(/^\s*$/)) return false
		else return true;
	},
	isDate: function (dt) { // 判断是不是日期
		return new RegExp('^\\d{4}?(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])$', 'gi').test(dt);
	},
	ft: function (p, m = 'get', hd = '', d = {}) { /*Fetcher(path,method,authheader,data)*/
		if (p !== 'false' && p) { /*奇妙的false问题*/
			let options = {
				body: JSON.stringify(d),
				cache: 'default',
				headers: new Headers({
					'Content-Type': 'application/x-www-form-urlencoded'
				}),
				method: m.toUpperCase()
			};
			if (m == 'get') delete options.body;
			if ($.notEmpty(hd)) {
				options.headers.append('Authorization', hd);
			}
			return fetch(p, options)
				.then(res => {
					if (res.status >= 200 && res.status < 400) {
						return res;
					} else {
						return Promise.reject('invalid status code.');
					}
				})
				.catch(e => {
					return Promise.reject(e);
				})
		} else {
			return Promise.reject('wrong URL.')
		}
	},
	crypt: function (token, key, decrypt = false) {
		try {
			if (!$.notEmpty(token) || !$.notEmpty(key)) {
				return false;
			} else if (!decrypt) {
				return CryptoJS.RC4.encrypt(token, key);
			} else {
				let decrypt = CryptoJS.RC4.decrypt(token, key);
				return CryptoJS.enc.Utf8.stringify(decrypt);
			}
		} catch (e) {
			console.log('Encrypt/Decrypt failed' + e);
		}
	}
}, SC = function (e) {
	if (e == 'body' || e == 'html') {
		return document.body;
	} else {
		return document.getElementById(e);
	}
}