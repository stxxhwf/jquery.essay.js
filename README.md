# jquery.essay.js
## 强大的天骁随记展示jQuery插件

以前我调用随记，不仅要处理一大堆逻辑，而且功能少，有够麻烦。
所以全新的随记展示模块开发出来了！支持变宽，支持跨域，各种定制功能，调用极其方便！更是支持了emoji表情渲染等高级功能！

引用相关文件之后，您只需要调用类似：

    $('#box2').loadessay({
    	sortType: "time/Id", 
    	sortReverse: false,  
    	essayIdList: [], 
    	startTime: "2014-1-12 0:00",
    	endTime: "2014-1-24 12:00",
    	keyWords: ['张径阁','方皓'],
    	linkType: "or",
    	places: ['班级'],  
    	noWords: ['PRIN','一班'],  
    	minId: 1,
    	maxId: 999999,
    	maxCount: 20, 
    	allowLoadMore: false, 
    	miniDisplay: false, 
    	showComments: true, 
    	showCommentTip: true,
    	maxCommentsCount: 5,
    	showMap: true, 
    	showNear: true, 
    	allowCheck: true, 
    	autoLoad: false,  
    	offset : 0, 
    	drawBaike: true,
    	drawEmoji: true,
    	jsonp: true, 
    	loadingText: '努力加载又加载中...',
    	prepareText: '点此继续加载',
    	completeText: '随记加载结束',
    	errorText: '随记加载失败，重试加载',
    });
    
轻松按您的想法筛选随记及决定如何显示！

查看Demo:
[http://www.ybusad.com/essay/demo.html](http://www.ybusad.com/essay/demo.html)

欢迎访问我的个人网站:
[http://www.ybusad.com/](http://www.ybusad.com/)

**（本插件已经在2018年8月份弃用）**
