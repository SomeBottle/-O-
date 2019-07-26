# -O-
![head](https://ws4.sinaimg.cn/large/006Xmmmggy1g5dkc14k9vj30m808cwel.jpg)  
Just a simple static blog Generator with single static pages.  

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
   
## 部署  
   1. 创建一个repo作为博客仓库(记得要创建README), 建议用小号(For Safety).  
   2. 选择一个静态网站服务器上传-O-，作为**后台** (建议用**Release**的版本)  
   3. (可选)手动push该项目template目录下的loading图片到博客仓库.  
   4. 访问后台，根据提示开始初始化部署，直到Finished.  
   5. 进入后台，连续点击左下角蓝色按钮**6次**，生成归档/标签页.  
   6. 开始Hello World吧，发布之后会自动创建index.html
   7. 给博客仓库绑定域名（甚至还能定义404页，或者favicon）
   8. **Enjoy it!**  
   
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
     
   
## 引用项目  
   * [Showdown](https://github.com/showdownjs/showdown)  
   * [JS-Base64](https://github.com/dankogai/js-base64)  
   * [Bueue.js](https://github.com/SomeBottle/Bueue.js)  
   
## 感谢  
   * Ghosin 提了非常多很不错的意见！  
   * Ohmyga 帮助改进了LoadingPage...  
