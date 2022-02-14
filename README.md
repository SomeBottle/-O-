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
   * 原生JavaScript
   * PJAX
   * 支持模板
   * 支持标签页，归档页  
   * 自带简单搜索功能，支持```介入搜索```    
   * 甚至只需要Github Pages #)3 ) 
   * 硬核图片Lazyload  
   * 平滑回滚至头部 2ax=V²（完全可以用原生的scroll啊喂！）  
   * 封面图支持~  
   
## 可用主题🧻  
   1. -O-程序自带
   2. [Anatole](https://github.com/SomeBottle/-O-Anatole)  
   3. [Simple](https://github.com/SomeBottle/-O-Simple)  
   4. 期待各位的移植和创造~  
   
## 部署📖  
   
   [**具体看wiki**](https://github.com/SomeBottle/-O-/wiki/%E9%83%A8%E7%BD%B2%7CDeployment)  

## 编辑器使用提示📎

   * 在内容编辑栏按下```Alt + V```可以**根据视频URL**快捷添加```<video>```标签

   * 在内容编辑栏按下```Tab```时会插入**四个空格**  

   * 当日期一栏填的是非**日期**时会**自动切换**为**创建页面**模式，日期一栏中填的内容将作为页面链接。
      **例如**：当你填写的是```20200407```，创建的是```post-<文章ID>.html```一类的文章页面；而当你填写的是```aboutme```，创建的页面是```aboutme.html```     
   
   * 页面不可转为文章，反之亦然.  
   
   * 发布文章时js会**自动被注释**，但是访问对应页面时还是会执行的
   
## 一定要注意💡  
   
   * **不要不要不要修改模板的```index.html```**，本身这个模板也只是一个媒介，并不会被直接上传到博客仓库，在前台并不展现外观，另外若修改index.html需要修改后台部分的（所以还是不要瞎折腾啦=A=）  
   
   * **不要向```cloth.otp.html```的```<clothhead>```里面**添加```<script>```标签，不然**并不会**执行/引入，反之你可以在```<clothhead>```以外部分引入```<script>```.  
   
## 关于搜索🔍  
   * 在文章列表页通过hash访问 ```#!搜索内容``` 可以进行搜索，需要注意的是，由于索引文件的限制，只支持根据**文章部分内容和标题，标签，日期**这类的搜索.  
   
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
     | alltp | 所有要部署到仓库的模板文件，**不建议**修改（博客**初始化**时会被部署到```./barn/```目录下） |
     | necessary | 加载页面时一定要加载的几个模板，无论你访问博客的哪个页面这几个模板都会载入浏览器缓存 |   
     | usemain | 使用main.json的几个模板，当你访问使用这几个模板的页面时加载过程会等待main.json载入完毕 |  
     | templatehtmls | 指定各类模板对应的文件，如果部署后修改了这里，上面几个项目中的模板文件名也要进行修改 |  
     | generatehtmls | 主要是tags和archives模板对应的页面文件 |  
     
     模板文件名在部署到仓库后可以进行相应的修改，同时对于**博客所在仓库**中template.json也要有所修改.  
     *PS：```loading.otp.html```在**template.json**是**无法配置**的，请不要修改文件名.*  
     
   * **模板渲染简单gif**.  
   
     ![](https://wx4.sinaimg.cn/large/ed039e1fly1g5uh69qklvg20fa0b47rf)  
     
   * **模板特殊占位**   

     0. **除**```index.html```的**模板**都能使用```{[barndir]}```占位符，这个占位符会被替换为博客**核心文件**所在的相对目录。  
        默认核心文件存在```./barn/```下，```{[barndir]}```也就会被替换为```barn/```。  
     
     1. index.html **媒介页面(不要修改，不影响外观)**  
         ```html
         <!--description-->
         <meta name="description" content="{[description]}" />   Description 
         <!--Keywords-->
         <meta name="keywords" content="{[keywords]}" />   Keywords
         <loadingarea></loadingarea>  用于放置Loading页面，不要删除！   
         {(MainTitle)}<title>{[title]}{[titlemiddle]}{[sitename]}</title>{(MainTitleEnd)}  注释用于识别标题所在位置，{[title]}为当前标题,{[sitename]}为站点名(在main.json配置)，{[titlemiddle]}是一个小短横```-```，访问首页的时候不会显示    
         {(PostTitle)}{[title]}{(PostTitleEnd)}  文章标题，一般和上面的{[title]}一致  
         {(PostDate)}{[date]}{(PostDateEnd)}  文章日期  
         {(PostContent)}
         {[content]}   文章内容
         {(PostContentEnd)}
         {(PostTag)}{[tags]}{(PostTagEnd)}  文章tags
         {(PostID)}{[pid]}{(PostIDEnd)}  文章pid  
         {(PostCover)}{[cover]}{(PostCoverEnd)}  (此处可能为none)文章封面，具体看上方封面设置
         {(PubTime)}{[pubtime]}{(PubTimeEnd)} 初次发布时间戳(毫秒级)
         {(EditTime)}{[edittime]}{(EditTimeEnd)}  最近一次编辑时间戳(毫秒级)
         {(PageType)}{[type]}{(PageTypeEnd)}  用于指定页面类型  
         <script src="./main.js?233"></script>
         ```
     
     2. postitem.otp.html **文章列表单项**
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
     
     3. postlist.otp.html **文章列表**   
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
     
     4. post.otp.html **文章/页面单页**  **-->[具体看wiki](https://github.com/SomeBottle/-O-/wiki/%E6%A8%A1%E6%9D%BF%7CFooter%E5%92%8CPostEnd)**
         ```html
         {(PostTemplate)}  模板开头
         {[posttitle]}  文章标题  
         {[postdate]}  文章日期  
         {[postcontent]}  文章内容  
         {[posttags]}  文章标签(html)  
         {(:PostEnd)}  (需要保留) 指定文章结束的地方.  
         {[comments]}  用于渲染评论(接comment.otp.html)  
         {(PostTemplateEnd)} 模板结尾  
         {(PostTagsTemplate)}  文章底部单个标签的模板
         {[tagurl]} 这个标签的url  
         {[tagname]}  这个标签的名字  
         {(PostTagsTemplateEnd)}   文章底部单个标签模板结束
         {(PostTagsDelimiter)},{(PostTagsDelimiterEnd)}  标签与标签之间的分隔，这里默认是一个逗号  
         {(IfPage)}<span>这里是页面</span>{(IfPageEnd)}  如果是页面，标签这里显示的内容


         <ifcover><img src='{[postcover]}'></img></ifcover>  封面标签，以及封面占位符  
         ```

     5. main.otp.html **酥脆外皮**  **-->[具体看wiki](https://github.com/SomeBottle/-O-/wiki/%E6%A8%A1%E6%9D%BF%7CFooter%E5%92%8CPostEnd)**  
         ```html
         {[contents]}  用于渲染页面内容  
         {(Footer:)}  (需要保留) 指定页脚开始的地方  
         ```

     6. cloth.otp.html **外衣**  
         ```html
         <clothhead>
         模板头部内容，用于替代页面中的<head>  
         </clothhead>
         {[main]}  用于渲染main.otp.html
         ```

     7. archives.otp.html **归档页**  
     
        [**具体介绍看wiki**](https://github.com/SomeBottle/-O-/wiki/%E6%A8%A1%E6%9D%BF%7Carchives.otp.html)  

     8. tags.otp.html **标签页**  
     
        [**具体介绍看wiki**](https://github.com/SomeBottle/-O-/wiki/%E6%A8%A1%E6%9D%BF%7Ctags.otp.html)  

     9. comment.otp.html **评论框页**  
        ```html
        {[pid]}  文章唯一id  
        ``` 
     
     10. loading.otp.html   

         [**加载浮页具体配置看wiki**](https://github.com/SomeBottle/-O-/wiki/%E6%A8%A1%E6%9D%BF%7Cloading.otp.html)  

     11. search.js  
         
         借助```search.js```我们可以引用外部搜索，默认模板中的search.js引用了github的搜索api，可以编辑以进行配置。  

     
## 函数/自带变量供应💬  

   * 当前文章信息  

      每次**文章或页面**载入完毕后，程序会把文章信息储存在一个对象中：  

      ```javascript
      B.currentPostInfo
      ```

      1. 当访问的是**文章**时，其内容为：  

         ```javascript
         {  
            cover: "none", // 封面图片URL
            date: "20220206", // 文章日期
            editTime: 1644416432224, // 文章上一次被编辑的时间戳(毫秒级)
            pid: "6", // 文章/页面唯一id
            pubTime: 1644415998546, // 文章发布时间戳(毫秒级,一旦发布就不会变)
            tags: "日常", // 文章的标签们
            title: "Hello7" // 文章标题
         }
         ```

      2. 当访问的是**用户创建的页面**时，其内容为：

         ```javascript
         {
            cover: "https://ae01.alicdn.com/kf/He6234e196550496abff612ee2f209cd9n.jpg", // 封面图片URL
            editTime: 1644417418735, // 页面上一次被编辑的时间戳(毫秒级)
            link: "testpage", // 页面链接
            pid: "7", // 文章/页面唯一id
            pubTime: 1644415284074, // 页面发布时间戳(毫秒级,一旦发布就不会变)
            tags: "", // 页面的标签们，暂时一直为空
            title: "New Page" // 页面标题
         }
         ```

      3. 访问其他页面时：返回 ```false```。

   * 页面渲染后回调  

      ```javascript
      B.callAfterRender(callBackFunction);
      ```

      通过这个方法，你可以注册一个回调函数```callBackFunction```。每当页面渲染完毕（以及所有JavaScript脚本执行完毕），程序会调用这个回调函数。  

      传入回调函数的第一个参数为**当前页面的模板名**。  

      例如：  

      ```javascript
      B.callAfterRender((pageType)=>{
         console.log(pageType);
      })
      ```

      当我访问**文章列表页**（博客首页）时，等页面渲染完，控制台会输出：```postlist.otp.html```。  

      > 你可以把这个方法写到**模板文件**中！

   * 导航栏相关  
      ```javascript
      B.nav*
      ```
      [**具体看wiki**](https://github.com/SomeBottle/-O-/wiki/%E5%87%BD%E6%95%B0%7C%E5%AF%BC%E8%88%AA%E6%A0%8F%E6%9C%89%E5%85%B3)  
   
   * 平滑滚动至顶部，直接滚到底部  
      ```javascript
      B.scrolltop(maxspeed,minspeed); //(最大速度,最小速度)单位：px/10ms
      B.scrollbottom();  //直接滚到底部，用于快速看到底部的内容
      ```

   * 暂停当前会话中的lazyload（懒加载）  
      ```javascript
      B.lazy(bool);  //true则开启懒加载，false则关闭。当懒加载关闭后往下滚动页面图片不会再载入，流量用户狂喜。
      /*注意：在未刷新页面的情况下这一选项是持续有效的，刷新页面重建会话后会恢复到默认值，也就是false*/
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
      B.turnback(); //在文章列表返回上一面  
      B.back(); //返回历史上一页  
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
      PJAX.jump(url); //动态载入页面，但不会改变地址栏  
      ```
   
   * 利用PJAX做搜索跳转的小技巧  
      ```javascript
      //比如你要搜索的内容是searchtxt  
      var searchtxt='233';
      window.history.pushState(null,null,'/#!'+searchtxt); //在文章列表访问 /#!搜索内容 可调用自带的搜索功能  
      PJAX.jump('/#!'+searchtxt); //因为PJAX.jump不会改变地址栏，所以要用pushState先加工一道  
      ```
   
   * 获得当前时间戳  
      ```javascript
      timestamp(); // 毫秒级
      ```

## main.json可配置项🔧  
   * ```name``` 站点名，请务必在**部署完毕**后第一时间配置，后期修改不容易  
   * ```posts_per_page``` 每页默认显示多少文章  
   * ```more_per_page``` More按钮在同一页面能按多少次  
   
## 引用项目⚙️  
   * [Showdown](https://github.com/showdownjs/showdown)  
   * [JS-Base64](https://github.com/dankogai/js-base64)  
   * [Crypto-JS](https://github.com/brix/crypto-js)  
   * [Bueue.js](https://github.com/SomeBottle/Bueue.js)  
   * [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)  
   
## 感谢❤  
   * Ghosin 提了非常多很不错的意见！  
   * Ohmyga 帮助改进了LoadingPage...  
   * 匿名小伙伴们的资助~  
   
------------------------------------
#### MIT LICENSE.
