/*Libraries to import*/
/*这里是博客必须用到的库，请不要改动base64这一个库*/
/*dankogai/js-base64*/
$.script("https://cdn.jsdelivr.net/npm/js-base64@latest/base64.min.js");
/*markdown-it/markdown-it*/
$.script("https://cdn.jsdelivr.net/npm/markdown-it@latest/dist/markdown-it.min.js");
/*markdown-it-anchor */
$.script("https://cdn.jsdelivr.net/npm/markdown-it-anchor@latest/dist/markdownItAnchor.umd.js");

/*Markdown Function used by main.js，这里是main.js需要用到的函数$.mark(content)，content是传入的markdown原文，函数返回值是按要求渲染后的文档*/
/*默认使用了markdown-it以及其组件markdown-it-anchor*/
$.mark = function (content) {
    return window.markdownit({ html: true, linkify: true })
        .use(window.markdownItAnchor, {
            permalink: window.markdownItAnchor.permalink.linkInsideHeader({
                symbol: '#',
                placement: 'before'
            })
        })
        .render(content);
}

/*MathJax 数学公式渲染 引入示例*/
/*
window.MathJax = {
    tex: {
        inlineMath: [['$', '$']],
        displayMath: [['$$', '$$']],
    },
    svg: {
        fontCache: 'global'
    },
};
$.script('https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/tex-mml-svg.min.js')
B.callAfterRender((pageType) => {
    if (pageType === 'post.otp.html') {
        // 仅在文章页面渲染数学公式
        setTimeout(function () {
            MathJax.typesetPromise();
        }, 500);
    }
});
*/