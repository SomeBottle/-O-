# -O-
![head](https://s2.ax1x.com/2020/02/12/1b1l5R.jpg)  
*Just a simple static blog Generator with single static pages.*  
*现在开始就在GithubPages上撰写吧*

-----------------------------------
![example](https://s2.ax1x.com/2020/02/12/1b13P1.jpg)  

-----------------------------------

## 想法🤔  
   之前逛v2社区的时候看到有人写了一个利用github api的博客，顿时非常心动，但项目已经久未更新，我便有了自己写一个的想法..  
   * Simple: https://github.com/isnowfy/simple  
   
## 特点💊  
   * 模板可配置  
   * 支持页码，标签页，归档页  
   * 自带简单搜索功能  
   * 原生PJAX  
   * 只需要Github Pages #)3 ) 
   * 硬核图片Lazyload  
   * 平滑回滚至头部 2ax=V²  
   * 封面图支持~  
   
## 可用主题🧻  
   1. -O-程序自带
   2. [Anatole](https://github.com/SomeBottle/-O-Anatole)  
   3. 期待各位的移植和创造~  
   
## 部署📖  
   
   **具体看wiki**
   * 以下是**1.5.x版本及以下**的部署简述，但是这些版本在今年年底会后台登录失效...  
   
   ----------------------------------
   1. 创建一个repo作为博客仓库(记得要创建README), 建议用小号(For Safety).  
   2. 选择一个静态网站服务器上传-O-，作为**后台** (建议用**Release**的版本)  
   3. (可选)手动push该项目template目录下的loading图片到博客仓库.  
   4. 访问后台，根据提示开始初始化部署，直到Finished.  
   5. 进入后台，连续点击左下角蓝色按钮**6次**，生成归档/标签页.  
   6. 在**仓库**的main.json里配置站点名字(name).
   6. 开始Hello World吧，发布之后会自动创建index.html
   7. 给博客仓库绑定域名（甚至还能定义404页，或者favicon）
   8. **Enjoy it!**  
   
## 使用提示💡  
   * 当日期一栏填的是非数字时会**自动切换**为**创建页面**模式，日期一栏中填的内容将作为页面链接。例如当你填写的是20200407，创建的页面是post-xxx.html一类的文章；而当你填写的是aboutme，创建的页面是aboutme.html     
   
   * 页面不可转为文章，反之亦然.  
   
   * 发布文章时js会**自动被注释**，但是访问对应页面时还是会执行的
   
   * **不要不要不要修改模板的index.html**，本身这个模板也只是一个媒介，并不会被直接上传到博客仓库，在前台并不展现外观，另外若修改index.html需要修改后台部分的（所以还是不要瞎折腾啦=A=）  
   
   * **不要向cloth.html的\<clothhead>里面**引入js文件，不然**并不会**执行/引入，反之你可以在\<clothhead>以外部分引入\<script>.  
   
## 关于搜索🔍  
   * 在文章列表页通过hash访问 #!搜索内容 可以进行搜索，需要注意的是，由于索引文件的限制，只支持根据文章部分内容和标题，标签，日期这类的搜索.  
   
## 文章封面📋  
   2019.8.10，老瓶<del>闲着蛋疼</del>加了个文章封面的支持.  
   
   ![](https://wx4.sinaimg.cn/large/ed039e1fly1g5uy7t1446j20qo0k0t9o)  
   
   编辑文章时在无论哪个位置以注释的形式插入**一条**：
   ```html  
   <!--[cover:<link>]-->  
   ```  
   发布文章时会自动识别，一同上载.接下来，最重要的是模板部分了.  
   在**postitem**和**post**模板中会有这样一个标签：  
   ```html
   <ifcover><img src='{[postcover]}'></img></ifcover>  
   ```
   * ifcover标签在这两个模板中可以出现在很多个地方，**有头有尾**.如果指定的文章或页面没有封面，渲染完成后**所有的**ifcover标签都会被自动剔除.  
   * 如果有封面，ifcover标签会保留，而{[postcover]}会被替换为封面图片url.由此，你可以尽可能地去自定义您的封面以使其样式融入主题😃  
   
   * **我怎么删除封面呢？**  
     只需要编辑文章的时候，把之前的那一条改成：  
     ```html  
     <!--[cover:none]-->  
     ```  
     然后编辑发布文章，即可删除封面.(由于pages缓存问题，可能要稍等一下才能看到效果)  
     Have fun~  
     
## 模板说明🔨  
   * **template.json**  
     
     | 项目 | 值 |  
     |:-------:|:-------:|  
     | alltp | 所有要部署到仓库的模板文件，不建议修改，不能有图片一类的媒体文件 |
     | necessary | 加载页面时一定要加载的几个模板，无论你访问博客的哪个页面这几个模板都会载入浏览器缓存 |  
     | include | 所有的模板文件 |  
     | usemain | 使用main.json的几个模板，当你访问使用这几个模板的页面时加载过程会等待main.json载入完毕 |  
     | templatehtmls | 指定各类模板对应的文件，如果部署后修改了这里，上面几个项目中的模板文件名也要进行修改 |  
     | generatehtmls | 主要是tags和archives模板对应的文件 |  
     
     模板文件名在部署到仓库后可以进行相应的修改，同时对于**博客所在仓库**中template.json也要有所修改.  
     *PS：loading.html在template.json是无法配置的，请不要修改文件名.*  
     
   * **模板渲染简单gif**.  
   
     ![](https://wx4.sinaimg.cn/large/ed039e1fly1g5uh69qklvg20fa0b47rf)  
     
   * **模板特殊占位**   
     
     1. index.html **媒介页面(不要修改，不影响外观)**  
     ```html
     <!--description-->
     <meta name="description" content="{[description]}" />   Description 
     <!--Keywords-->
     <meta name="keywords" content="{[keywords]}" />   Keywords
     <!--[LoadingArea]-->  用于放置Loading页面，不要删除！   
     {(MainTitle)}<title>{[title]}-{[sitename]}</title>{(MainTitleEnd)}  注释用于识别标题所在位置，{[title]}为当前标题,{[sitename]}为站点名(在main.json配置)  
     {(PostTitle)}{[title]}{(PostTitleEnd)}  文章标题，一般和上面的{[title]}一致  
     {(PostDate)}{[date]}{(PostDateEnd)}  文章日期  
     {(PostContent)}
     {[content]}   文章内容
     {(PostContentEnd)}
     {(PostTag)}{[tags]}{(PostTagEnd)}  文章tags
     {(PostID)}{[pid]}{(PostIDEnd)}  文章pid  
     {(PostCover)}{[cover]}{(PostCoverEnd)}  (此处可能为none)文章封面，具体看上方封面设置
     {(PageType)}{[type]}{(PageTypeEnd)}  用于指定页面类型  
     <script src="./main.js?233"></script>
     ```
     
     2. postitem.html **文章列表单项**
     ```html
     {(PostItem)}  主要postitem模板
     {[postitemlink]}  文章列表每一项的链接
     {[postitemtitle]}  文章列表每一项的标题  
     {[postitemintro]}  文章列表每一项的简介
     {[postitemdate]}  文章列表每一项的日期  
     {[postitemtags]}  文章列表每一项的标签  
     <ifcover><img src='{[postcover]}'></img></ifcover>  封面标签，以及封面占位符  
     {(PostItemEnd)}
     {(NoItem)}   加载more时没有更多文章的模板
     <h3 style='color:#AAA;'>没有更多了呢</h3>   
     {(NoItemEnd)}
     ```
     
     3. postlist.html **文章列表**   
     ```html
     {(PostListTemplate)}  用于划定PostList模板的范围
     {[postitems]}  用于载入文章列表  
     {[morebtn]}  加载更多按钮的替换符
     {[backbtn]}  返回上一页按钮的替换符（可以不写）
     {(PageType)}{[pagetype]}{(PageTypeEnd)}  用于指定pagetype   
     {(PostListTemplateEnd)}
     
     {(MoreBtn)}
     加载更多按钮的模板
     {(MoreBtnEnd)}
     {(BackBtn)}
     返回上一页按钮的模板
     {(BackBtnEnd)}
     ```
     
     4. post.html **文章/页面单页**  **-->具体看wiki**
     ```html
	 {(Post)}
     {[posttitle]}  文章标题  
     {[postdate]}  文章日期  
     {[postcontent]}  文章内容  
     {[posttags]}  文章标签(html)  
     {(:PostEnd)}  (需要保留) 指定文章结束的地方.  
     {[comments]}  用于渲染评论(接comment.html)  
     <ifcover><img src='{[postcover]}'></img></ifcover>  封面标签，以及封面占位符  
     ```

     5. main.html **酥脆外皮**  **-->具体看wiki**  
     ```html
     {[contents]}  用于渲染页面内容  
     {(Footer:)}  (需要保留) 指定页脚开始的地方  
     ```

     6. cloth.html **外衣**  
     ```html
     <clothhead>
     模板头部内容，用于替代页面中的<head>  
     </clothhead>
     {[main]}  用于渲染main.html
     ```

     7. archives.html **归档页**  
     
        **具体介绍看wiki**

     8. tags.html **标签页**  
     
        **具体介绍看wiki**

     9. comment.html **评论框页**  
        ```html
        {[pid]}  文章唯一id  
        ``` 
     
     10. loading.html **加载浮页具体配置看wiki**  

     
## 函数供应💬  
   * 导航栏相关  
   ```javascript
   B.nav*
   ```
   **具体看wiki**
   
   * 平滑滚动至顶部  
   ```javascript
   B.scrolltop(maxspeed,minspeed); //(最大速度,最小速度)单位：px/10ms
   ```
   
   * 向页面引入js  
   ```javascript
   $.script(url);
   ```
   
   * 改变head中的\<title\>标签  
   ```javascript
   $.title(yourtitle);
   ```
   
   * 抓取元素(id)  
   ```javascript
   SC(id); //return element
   ```
   
   * 控制Loading的显示和隐藏  
   ```javascript
   B.loadshow(); //show
   B.loadhide(); //hide
   ```
   
   * 加载更多按钮和返回上一页按钮
   ```javascript
   B.more(); //在文章列表加载更多
   B.back(); //返回上一页  
   ```
   
   * CSS3Animation动画检查器  
   ```javascript
   anichecker(e, func); //e为元素id , func为animation结束后回调的函数.  
   ```
   
   * PJAX自动操作  
   ```javascript
   PJAX.sel(id); //选择PJAX操作的容器  
   PJAX.autoprevent(); //自动排查当前页是否有外站地址并放入忽略名单  
   PJAX.start(); //开始监听所有a标签和popstate，开启PJAX  
   PJAX.pause(); //暂停PJAX对于popstate的监听,可以用start来重激活  
   ```
   
   * 获得当前时间戳  
   ```javascript
   timestamp();
   ```

## main.json可配置项🔧  
   * name 站点名，请务必在**部署完毕**后第一时间配置，后期修改不容易  
   * posts_per_page 每页默认显示多少文章  
   * more_per_page More按钮在同一页面能按多少次  
   
## 引用项目⚙️  
   * [Showdown](https://github.com/showdownjs/showdown)  
   * [JS-Base64](https://github.com/dankogai/js-base64)  
   * [Bueue.js](https://github.com/SomeBottle/Bueue.js)  
   
## 感谢❤  
   * Ghosin 提了非常多很不错的意见！  
   * Ohmyga 帮助改进了LoadingPage...  
   * 匿名小伙伴们的资助~  
   
------------------------------------
#### MIT LICENSE.
