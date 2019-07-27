# -O-
![head](https://ws4.sinaimg.cn/large/006Xmmmggy1g5dkc14k9vj30m808cwel.jpg)  
*Just a simple static blog Generator with single static pages.*  
*现在开始就在GithubPages上撰写吧*

-----------------------------------
![example](https://ws4.sinaimg.cn/large/006Xmmmggy1g5dkfebhulj31gr0pu0ud.jpg)  

-----------------------------------

## 想法  
   之前逛v2社区的时候看到有人写了一个利用github api的博客，顿时非常心动，但项目已经久未更新，我便有了自己写一个的想法..  
   * Simple: https://github.com/isnowfy/simple  
   
## 特点
   * 模板可配置  
   * 支持页码，标签页，归档页  
   * 自带简单搜索功能  
   * 原生PJAX  
   * 只需要Github Pages.(关键是省钱啊喂 #)3 ) 
   * 硬核图片Lazyload  
   
## 部署  
   1. 创建一个repo作为博客仓库(记得要创建README), 建议用小号(For Safety).  
   2. 选择一个静态网站服务器上传-O-，作为**后台** (建议用**Release**的版本)  
   3. (可选)手动push该项目template目录下的loading图片到博客仓库.  
   4. 访问后台，根据提示开始初始化部署，直到Finished.  
   5. 进入后台，连续点击左下角蓝色按钮**6次**，生成归档/标签页.  
   6. 在**仓库**的main.json里配置站点名字(name).
   6. 开始Hello World吧，发布之后会自动创建index.html
   7. 给博客仓库绑定域名（甚至还能定义404页，或者favicon）
   8. **Enjoy it!**  
   
## 使用提示  
   * 当日期一栏填的是非数字时会自动切换为创建页面模式，日期中填的内容将作为页面link.   
   * 页面不可转为文章.  
   * 发布文章时js会自动被注释，但是访问对应页面时还是会执行的.  
   
## 关于搜索  
   * 在文章列表页通过hash访问 #!搜索内容 可以进行搜索，需要注意的是，由于索引文件的限制，只支持根据文章部分内容和标题，标签，日期这类的搜索.  
   
## 模板说明  
   * template.json  
     
     | 项目 | 值 |  
     |:-------:|:-------:|  
     | alltp | 所有要部署到仓库的文件，不建议修改 |
     | necessary | 加载页面时一定要加载的几个文件 |  
     | include | 所有的模板文件 |  
     | usemain | 使用main.json的几个页面 |  
     | templatehtmls | 指定各类模板对应的文件，如果修改，上面几项也要进行修改 |  
     | generatehtmls | 主要是tags和archives模板对应的文件 |  
     
     模板在部署到仓库后可以进行相应的修改，搭配对于**仓库**中template.json的修改.  
     *PS：loading.html在template.json是无法配置的，请不要修改文件名.*  
     
   * 模板特殊占位  
   ```html
     1. index.html 媒介页面  
     <!--description-->
     <meta name="description" content="{[description]}" />   Description 
     <!--Keywords-->
     <meta name="keywords" content="{[keywords]}" />   Keywords
     <!--[LoadingArea]-->  用于放置Loading页面，不建议修改  
     <!--[MainTitle]--><title>{[title]}-{[sitename]}</title><!--[MainTitleEnd]-->  注释用于识别标题所在位置，{[title]}为当前标题,{[sitename]}为站点名(在main.json配置)  
     <!--[PostTitle]-->{[title]}<!--[PostTitleEnd]-->  文章标题，一般和上面的{[title]}一致  
     <!--[PostDate]-->{[date]}<!--[PostDateEnd]-->  文章日期  
     <!--[PostContent]-->
     {[content]}   文章内容
     <!--[PostContentEnd]-->
     <!--[PostTag]-->{[tags]}<!--[PostTagEnd]-->  文章tags
     <!--[PostID]-->{[pid]}<!--[PostIDEnd]-->  文章pid  
     <!--[PageType]-->{[type]}<!--[PageTypeEnd]-->  用于指定页面类型  
     <script src="./main.js?233"></script>
     <script>B.tpcheck();</script>  引入mainjs，唤醒模板渲染器  
     
     2. postitem.html 文章列表单项
     {[postitemtitle]}  文章列表每一项的标题  
     {[postitemintro]}  文章列表每一项的简介
     {[postitemdate]}  文章列表每一项的日期  

     3. postlist.html 文章列表   
     {[postitems]}  用于载入文章列表  
     <!--[PageType]{[pagetype]}[PageTypeEnd]-->  用于指定pagetype  
     <script>PJAX.autoprevent();PJAX.sel('container');PJAX.start();</script>  唤醒PJAX  

     4. post.html 文章/页面单页  
     {[posttitle]}  文章标题  
     {[postdate]}  文章日期  
     {[postcontent]}  文章内容  
     {[posttags]}  文章标签(html)  
     <!--PostEnd-->  PostEnd以后的内容在页面中是不会显现的.  
     {[comments]}  用于渲染评论(接comment.html)  

     5. main.html 酥脆外皮,Footer  
     {[contents]}  用于渲染页面内容  

     6. cloth.html 外衣,导航栏  
     {[main]}  用于渲染main.html  
     {[title]}  装载标题  

     7. archives.html 归档页  
     {[archives]}  用于渲染归档  

     8. tags.html 标签页  
     {[tags]}  用于渲染标签  

     9. comment.html 评论框页  
     {[pid]}  文章唯一id  
   ```
     
     
## main.json可配置项  
   * name 站点名，请务必在部署完毕后第一时间配置，后期修改不容易  
   * posts_per_page 每页默认显示多少文章  
   * more_per_page More按钮在同一页面能按多少次  
   
## 引用项目  
   * [Showdown](https://github.com/showdownjs/showdown)  
   * [JS-Base64](https://github.com/dankogai/js-base64)  
   * [Bueue.js](https://github.com/SomeBottle/Bueue.js)  
   
## 感谢  
   * Ghosin 提了非常多很不错的意见！  
   * Ohmyga 帮助改进了LoadingPage...  
   
------------------------------------
#### MIT LICENSE.
