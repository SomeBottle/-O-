/*Simple PJAX - SomeBottle*/
"use strict";
if (!PJAX) { /*防止重初始化*/
	var PJAX = {
		PJAXStart: new CustomEvent('pjaxstart'),
		PJAXFinish: new CustomEvent('pjaxfinish'),
		replace: '',
		sel: function (r) {
			this.replace = r;
		},
		jump: function (href) {
			let that = this;
			window.dispatchEvent(that.PJAXStart);/*激活事件来显示加载动画*/
			$.ft(href).then(resp => resp.text(), rej => {
				notice('跳转页面失败');
				window.dispatchEvent(that.PJAXFinish);
				throw 'Failed to get the template: ' + rej;
			}).then(resp => {
				$.ht(resp, that.replace);
				window.dispatchEvent(that.PJAXFinish);
			});
		}
	};
}