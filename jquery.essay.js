/*
   骁之屋随记展示API
   这是一个jQuery插件
   Ver 1.0.2.0
*/

var Essay_box_id = 0;

+function($){
  
  $.fn.extend({
    
    loadessay:function(option){
      
      var defaultOption = {
        
        sortType: "time/Id",   //默认按时间和编号排序，也可以按评论的条数"comment"、或者是不强制顺序"normal"排序
        sortReverse: true,  //默认从按大到小排序
        
        essayIdList: [], //手动设置需要展示的随记ID，注意，若设置了此项，下面的一组随记筛选条件会全部失效
        
        startTime: "2013-5-27 23:30",
        endTime: "2038-1-19 0:00",
        keyWords: [],
        linkType: "and",  //确认关键词中的连接是按"and" 或者 "or"
        places: [],  //地点筛选匹配，各地点只能用or连接
        noWords: [],   //随记中不能包含的关键词
        minId: 2,
        maxId: 999999,
        
        maxCount: 20, //每次最多加载大随记条数，如果还有未加载的，则显示一个“点此继续加载”，jsonp环境下最多不超过100条。
        allowLoadMore: true,  //如果把这项设为false,那就不会出现“点此继续加载”或“全部加载结束”的字样
        
        miniDisplay: false,  //是否启用极简模式，在该模式下，不展示底部信息区，下面一组选项全部失效且按false处理
        
        showComments: true, //是否在存在评论的前提下自动展示评论
        showCommentTip: true,  //是否在存在评论时显示评论概要
        maxCommentsCount: 5, //最多展示评论的条数。如果还有未展示的就显示个“查看更多”，再引到随记详情页
        showMap: true, //是否在随记中加载可能存在的GPS位置和地图，开启本项功能需要事先引用jQueryUI和百度地图API
        showNear: false, //是否显示“查看前后随记”
        allowCheck: false,  //是否允许通过复选框选择随记
        
        drawBaike: true,  //是否在随记内容中渲染百科条目
        drawEmoji: true,  //是否采用传统方案在随记内容中渲染Emoji表情？需要引用emoji.css。
        drawEmojiImproved: false, //是否采用增强的Emoji渲染方案，需要引用emoji.js和存在相关表情库支持。注意如果这一项为true，上一项自动为false。
        emojiPath: '/plugin/emoji-coocy/emoji/', //drawEmojiImproved需要的emoji表情图片所在的路径

        autoLoad: false,  //是否在滑条接近页面底端时自动触发“点此继续加载”
        
        offset : 0,  //实现分页加载的关键，偏移量
        
        jsonp: "auto", //是否跨域调用 auto自动判断，也可以强制指定true或false。
        
        loadingText: '随记加载中...',
        prepareText: '点此继续加载',
        completeText: '随记加载结束',
        errorText: '随记加载失败，重试加载'
      };
      
      if(option) option = $.extend(defaultOption,option);
      else option = defaultOption;
      
      var $s = $('<div/>').addClass("eu-loading");
      
      this.html('');
      
      if(option.showMap && option.miniDisplay==false){
        //预调用百度地图的API
        if($('#Essay_Map').length<=0){
           if(typeof window.BMap == 'undefined'){
             console.log('百度地图API没有正确加载');
             option.showMap=false;
           }else if (typeof $.ui.dialog == 'undefined') {
             console.log('地图功能依赖的jQueryUI对话框模块没有得到正确加载');
             option.showMap=false;
           }else{
             $('<div id="Essay_Map"><div id="eu-map-container"></div></div>').appendTo("body");
            
             window.eu_map = new BMap.Map("eu-map-container");
             eu_map.centerAndZoom(new BMap.Point(116.4035,39.915), 16);
             eu_map.enableScrollWheelZoom();
             eu_map.addControl(new BMap.MapTypeControl());
             eu_map.addControl(new BMap.NavigationControl());
             eu_map.addControl(new BMap.ScaleControl());
           }
        }
      }

      if(option.drawEmojiImproved){
        if(typeof window.Emoji != 'undefined'){
          option.drawEmoji = false;
          Emoji.emojiPath = option.emojiPath;
          if(option.jsonp) Emoji.emojiPath = "http://www.ybusad.com" + Emoji.emojiPath;
        }else{
          option.drawEmojiImproved = false;
          console.log("渲染emoji需要的emoji插件没有正确加载");
        }
      }
      
      //最终渲染随记条目的函数
      window.Essay_Drawing = function(t,d){
        //t -- 随记需要渲染到的eu-box的id
        //d -- 服务器接口返回的json随记数据
        
        $t = $('#'+t);
        //$t就是当前渲染到的essay=ui-box
        
        if($t.length<=0) {
          alert('未指定随记渲染容器');return;
        }
        
        var option = $t.data('option');
        
        if(typeof option != 'object'){
          alert('未找到随记渲染配置'); return;
        }
        
        //渲染随记条目
        $t.find('.eu-loading').remove();
        
        if(typeof d != 'object'){
          $t.append(option.stateText.error.clone(true)); return;
        }
        
        if(d.success){
          
          var baseDomain = '';
          if(option.jsonp) baseDomain = 'http://www.ybusad.com';
          
          $.each(d.items,function(i,v){
            
            var $eu_item = $('<div/>').addClass('essay-ui eu-item').appendTo($t),
                $eu_information = $('<div/>').addClass('eu-information').appendTo($eu_item),
                $eu_content = $('<div/>').addClass('eu-content').html(v.content).appendTo($eu_item);

            if(option.drawEmojiImproved){
              $eu_content.emoji();
            }
              
            var $eu_id = $('<div/>').addClass('essay-ui eu-id').click(function(){
              window.open(baseDomain+ '/e/' + v.id);
            }).appendTo($eu_information);
            
            if(v['private']) $eu_id.addClass('eu-private');
            
            if(v['private']){
              $eu_id.html('<span>S</span>'+v.id);
            }else{
              $eu_id.html('#'+v.id);
            }
            
            $eu_information.append($('<div/>').addClass('eu-time').html('<i>&#xe621;</i>'+v.time));
            
            var $eu_place = $('<div/>').addClass('eu-place').appendTo($eu_information);
            
            if(v.place) $eu_place.append('<i>&#xe6e4;</i>'+v.place);
            if(option.showMap && v.hasmap && option.miniDisplay==false){
              $('<a/>').attr({href:'javascript:;',target:'_self'}).html('<i>&#xe65f;</i>查看精确位置').appendTo($eu_place).click(function(){
                
                //展示地图
                 var jd = parseFloat(v.longitude), wd = parseFloat(v.latitude);
                 if(jd > 120){jd += 0.013; wd += 0.00815; } else {jd += 0.0122; wd += 0.0031;}
                 
                 eu_map.reset();
                 eu_map.clearOverlays(); 
                 eu_map.setCenter(new BMap.Point(jd, wd));
                 eu_map.panBy(300,250);
                 eu_map.addOverlay(new BMap.Marker(new BMap.Point(jd, wd)));
                 eu_map.addOverlay(new BMap.Circle(new BMap.Point(jd, wd),50,
                                   {strokeColor:"blue", strokeWeight:2, strokeOpacity:0.1}));
                           
                 $("#Essay_Map").dialog({modal:true,width:600,height:500,title:"查看精确位置 - #"+v.id ,show:200,hide:200});
                 
              });
            }
            
            if(option.allowCheck && !option.miniDisplay){
              $('<div/>').addClass('eu-check').html('<input type="checkbox" data-id="'+v.id+'" />').appendTo($eu_information);
            }
            
            if(option.showNear && !option.miniDisplay){
              $('<div/>').addClass('eu-near').html('<a href="/e/near/'+v.id+'" target="_blank"><i>&#xe60e;</i>查看前后随记</a>').append($('<a/>').attr({href:baseDomain + '/essay/near/'+v.id,target:'_blank'})).appendTo($eu_information);
            }
              
            if(option.miniDisplay == false){
                
              var $eu_bottom = $('<div/>').addClass('eu-bottom').appendTo($eu_item),
                  $eu_comment = $('<div/>').addClass('eu-comment').hide().appendTo($eu_item);
                
                if(option.showComments && v.comment.count>0) $eu_comment.show();
              
              //渲染bottom
              var $eu_source = $('<div/>').addClass('eu-source').appendTo($eu_bottom);
              switch(v.source){
                case 'Android客户端':
                  $eu_source.html( '<i>&#xe617;</i>' + v.source);break;
                case 'iPhone客户端':
                  $eu_source.html( '<i>&#xe6d6;</i>' + v.source);break;
                case '网页客户端':
                  $eu_source.html( '<i>&#xe60b;</i>' + v.source);break;
                case 'PC客户端':
                  $eu_source.html( '<i>&#xe624;</i>' + v.source);break;
                case '网页':
                  $eu_source.html( '<i>&#xe7cd;</i>' + v.source);break;
                default:
                  $eu_source.html( '<i>&#xe693;</i>' + v.source);
              }
              
              if(v.hidden){
                $('<div/>').addClass('eu-hidden').html(v.hidden).appendTo($eu_bottom);
              }
              
              $('<div/>').addClass('essay-ui eu-comment-button').html('<i>&#xf0005;</i>' +
                        (option.showComments ? (v.comment.count>0?"收起":"评论") : (v.comment.count>0? v.comment.count :"评论") ))
                        .data('count',v.comment.count).appendTo($eu_bottom)
                        .click(function(){
                       
                          var $c = $(this).parents('.eu-item').find('.eu-comment');
                          if($c.is(":hidden")){
                            $(this).html('<i>&#xf0005;</i>收起');
                            $c.stop().slideDown(200);
                            $c.find(':text').focus();
                          }else{
                            if($(this).data('count')>0) $(this).html('<i>&#xf0005;</i>'+$(this).data('count')); 
                            else $(this).html('<i>&#xf0005;</i>评论'); 

                            $c.stop().slideUp(200);
                          }
                    });
                     
              if(v.comment.tip && option.showCommentTip){
                $('<div/>').addClass('eu-comment-tip').html(v.comment.tip).appendTo($eu_bottom);
              }
              
              //comment的条目渲染
              
              var drawCommentItem = function(i,v){
                  
                var $eu_comment_item = $('<div/>').addClass('eu-comment-item').appendTo($eu_comment_item_box),
                    $eu_comment_portrait = $('<div/>').addClass('eu-comment-portrait').appendTo($eu_comment_item),
                    $portrait = $('<img/>').attr({src:baseDomain + v.portrait,width:30,height:30,
                                onerror:"this.src='"+baseDomain+"/img/person.png'"});

                $('<a/>').attr({href:baseDomain + '/u/'+v.usercode,'target':'_blank'})
                         .append($portrait).appendTo($eu_comment_portrait);
                
                var $eu_comment_main = $('<div/>').addClass('eu-comment-main').appendTo($eu_comment_item),
                    $eu_comment_information = $('<div/>').addClass('eu-comment-information').appendTo($eu_comment_main),
                    $eu_comment_content = $('<div/>').addClass('eu-comment-content').html(v.content).appendTo($eu_comment_main);
                
                $('<a/>').attr({href:baseDomain + '/u/'+v.usercode,target:'_blank'}).html(v.username)
                         .appendTo($eu_comment_information);
                
                if(v.useraut>1){
                  $('<img/>').attr({src:baseDomain + '/user/img/v_'+v.useraut+'.png',width:12,title:v.userdes})
                             .appendTo($eu_comment_information);
                }
                
                $eu_comment_information.append(' <span>'+v.time+'</span>');
                
                if(!option.jsonp || (typeof xzw == 'object' && xzw.uCode()!=''))
                  $('<a/>').attr('href','javascript:;').addClass('eu-comment-reply').html('回复').click(function(){
                    $(this).parents('.eu-comment').find('input').val('回复 '+v.username+':').focus();
                  }).appendTo($eu_comment_information);
                  
              }
              
              var $eu_comment_item_box = $('<div/>').addClass('eu-comment-item-box').appendTo($eu_comment);
              if(v.comment.count>0){
                $.each(v.comment.items,drawCommentItem);
              }
              
              if(v.comment.hasmore || option.jsonp || (typeof xzw == 'object' && xzw.uCode()=='') ){
                var $more = $('<a/>').html('<button>查看更多评论</button>').attr({href:baseDomain + '/e/' + v.id , target: '_blank' });
                if(option.jsonp && v.comment.count==0) $more.html('<button>还没有评论，立刻去抢沙发！</button>'); 
                $('<div/>').addClass('eu-comment-more').append($more).appendTo($eu_comment);
              }
              
              if(!option.jsonp && ((typeof xzw == 'object' && xzw.uCode().length>0) || typeof xzw == 'undefined')){
                var $eu_comment_add = $('<div/>').addClass('eu-comment-add').appendTo($eu_comment),
                    $eu_comment_post = $('<div/>').addClass('eu-comment-post').appendTo($eu_comment_add);
                  
                $('<button/>').html('发表').click(function(){
                  //点击了发表评论的按钮，触发的事件
                  
                  var $input = $(this).parent().parent().find(':text');
                  var content = $input.val();
                  if($.trim(content)==''){
                    alert('评论内容不得为空');
                    $input.val('').focus();
                    return;
                  }
                  
                  var i$b = $(this).parent().parent().find('input,button').attr('disabled','disabled');
                  
                  $.post('/essay/comment/add.php',{id:v.id,content:content},function(o){
                    if(typeof o == 'string') eval('o = '+o);
                    if(o.success){
                      //实时渲染评论上去
                      if(typeof window.xzw != 'object'){
                        alert('评论发表成功，请刷新查看');
                      }else{
                        //如果有加载骁之屋的user.js，优先渲染评论
                        var v = new Object;
                        v.username = xzw.uName();
                        v.usercode = xzw.uCode();
                        v.userdes = xzw.uDes();
                        v.useraut = xzw.uAut();
                        v.portrait = '/user/portrait/' + v.usercode + '_m.jpg';
                        v.content = content.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/ /g,'&nbsp;');
                        
                        var d = new Date();
                        var hour = (100+d.getHours()).toString().substr(1);
                        var minu = (100+d.getMinutes()).toString().substr(1);
                        
                        v.time = '今天 '+hour+':'+minu;
                        drawCommentItem(0,v);
                      }
                      var $pb = $input.val('').parents('.eu-item').find('.eu-comment-button');
                      $pb.data('count',parseInt($pb.data('count'))+1);
                    }else{
                      alert(o.msg);
                      $input.focus();
                    }
                    i$b.removeAttr('disabled');
                  });
                  
                  
                }).appendTo($eu_comment_post);
                
                $input = $('<input/>').attr({type:"text",placeholder:"我也说一句...",maxlength:240,autocomplete:"off"}).keydown(function(){
                  if(event.keyCode == 13){
                     $(this).parent().parent().find('button').click();
                    }
                  });
                
                $('<div/>').addClass('eu-comment-input-box').append($input).appendTo($eu_comment_add);
              }
              } 
            
            
            });
          
          if(option.allowLoadMore){
            if(d.hasmore){
              $t.append(option.stateText.prepare.clone(true));
            }else{
              $t.append(option.stateText.complete.clone(true));
            }
          }
          
          //修改元素绑定的数据，实现向后加载
          if(isNaN(option.offset)) option.offset=0;
          option.offset += d.count;
          $t.data('option',option);
          
        }else{
          $t.append($s.html(o.msg));
        }
        
      }
      
      //准备加载之下的内容
      var loadingNext = function(option,$t){
        
        if(option.jsonp === undefined){ //从a标签传来
            $t = $(this).parents('.eu-box');
            option = $t.data('option');
        }
        
        if(option){  //如果找到
          
          $t.find('.eu-loading').remove();
          
          $t.append(option.stateText.loading.clone(true));
          
          var optdata = $.extend({},option); //制造给服务器传过去的参数
          delete optdata.stateText;
          
          if(option.jsonp){
            //跨域调用
            
            var param = $.param(optdata);
            
            $scr = $('<script/>').attr({async:true,src:"http://www.ybusad.com/essay/api/fetch.php?"+param}).appendTo('head');
            
          }else{
            
            $.ajax({
              url: "/essay/api/fetch.php",
              type: "POST",
              data: optdata,
              timeout: 10*1000,
              dataType:"json",
              complete: function(xhr,s){
                if(s=='timeout' || s=='error'){
                  $t.find('.eu-loading').remove();
                  $t.append(option.stateText.error.clone(true));
                }
              },
              success: function(d){
                Essay_Drawing($t.attr('id'),d);
              }
            });
              
            }
          
          }else{
          $(this).parent().html('加载终止性失败');
        }
      }
      
      option.stateText = {
        "loading":  $s.clone().html(option.loadingText),
        
        "prepare":  $s.clone().append($('<a/>').attr({href:"javascript:;","target":"_self"}).click(loadingNext)
                              .html(option.prepareText)).addClass('eu-loading-prepare'),
                    
        "complete": $s.clone().html(option.completeText).addClass('eu-loading-complete'),
        
        "error":    $s.clone().append($('<a/>').attr({href:"javascript:;","target":"_self"}).click(loadingNext)
                              .html(option.errorText)).addClass('eu-loading-error')
      };
      
      if(option.jsonp == 'auto'){
        option.jsonp = (location.hostname != 'www.ybusad.com') // && (location.hostname != 'localhost') ;
      }
      
      //单独操作每个被选项
      return this.each(function(index,element){
        
        Essay_box_id += 1;
        
        option.ContainerID = 'E_B_' + Essay_box_id;
        
        var $t = $('<div/>').attr('id',option.ContainerID).addClass('eu-box').data('option',option).appendTo(this);
        
        loadingNext(option,$t);
        
        if(option.autoLoad){
          $(window).scroll(function(){
            if($(document).scrollTop() + $(window).height() + 400 >= $(document).height()){
              $('#'+option.ContainerID).find('.eu-loading-prepare').children('a').click();
            }
          });
        }
        
      });
      
    }
    
  });
  
}(jQuery);