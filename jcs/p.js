/*Simple PJAX - SomeBottle*/
var mainhost = window.location.host;
var dt = new Date().getTime();
if (PJAX == undefined || PJAX == null) { /*防止重初始化*/
	var PJAX = {
		index: window.history.state === null ? 1 : window.history.state.page,
		PJAXStart: new CustomEvent('pjaxstart'),
		PJAXFinish: new CustomEvent('pjaxfinish'),
		lasthref: window.location.href,
		preventurl: new Array(),
		replace: '',
		sel: function(r) {
			this.replace = r;
		},
		jump: function(href) {
			var ts = this;
			window.dispatchEvent(ts.PJAXStart); /*激活事件来显示加载动画*/
			$.aj(href, {}, {
				success: function(m) {
					var e = ts.replace;
					$.ht(m, e);
					window.dispatchEvent(ts.PJAXFinish);
				},
				failed: function(m) {
					window.dispatchEvent(ts.PJAXFinish);
				}
			}, 'get', '', true);
		},
		start: function() {
			var ts = this;
			var p = document.getElementsByTagName("a");
			for (var i in p) {
				p[i].onclick = function(e) {
					if (ts.preventurl.indexOf(this.href) !== -1 || this.href.indexOf('#') !== -1) {
						return true;
					} else {
						window.history.pushState(null, null, this.href); /*加入历史*/
						e.preventDefault();
						ts.jump(this.href);
					}
				};
			}
			window.onpopstate = function(e) { /*回退或者前进时触发*/
				if (window.location.href.indexOf(mainhost) !== -1) {
					PJAX.jump(window.location.href);
				}
			}
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
}