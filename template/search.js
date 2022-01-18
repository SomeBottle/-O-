/*Config*/
B.githubRepo = "";/*博客所在github仓库，比如我的在github.com/SomeBottle/test/ ，这里填SomeBottle/test*/
/*ConfigEnd*/
/*postIndexes是文章索引，不知道有没有用，localArr是本地搜索结果，会被自动传入*/
B.searchInj = (postIndexes, searchWord, localArr) => {
    return new Promise(res => {
        if (B.githubRepo) {
            let queryString = encodeURIComponent(searchWord) + "+in:file+language:html+repo:" + B.githubRepo;
            $.ft("https://api.github.com/search/code?q=" + queryString)
                .then(j => {
                    let rs = JSON.parse(j), items = rs['items'], resultArr = localArr;
                    for (var o in items) {
                        processed = items[o]["name"].replace("post-", "").replace(".html", "");
                        if (!isNaN(Number(processed))) {
                            resultArr.push(processed);
                        } else {
                            for (let i in postIndexes) {
                                if (postIndexes[i]['link'] && postIndexes[i]['link'] == processed) resultArr.push(i);
                            }
                        }
                    }
                    res(resultArr);/*回调的是搜索出的文章ID组成的数组和本地数组结合的结果*/
                }, rej => {
                    res(localArr);/*失败了也要返回*/
                    console.log('API Search failed. -> ' + rej);
                })
        } else {
            res(localArr);
        }
    });
}
/*searchInj会返回一个promise对象，传值中是包含所有结果的数组*/