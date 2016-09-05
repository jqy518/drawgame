
  var canvas = this.__canvas = new fabric.Canvas('c', {
    isDrawingMode: true
  });
  var show_canvas = document.getElementById("d");
  fabric.Object.prototype.transparentCorners = false;

  var drawingModeEl = $('#drawing-mode'),
      drawingOptionsEl = $('#drawing-mode-options'),
      drawingColorEl = $('#drawing-color'),
      drawingLineWidthEl = $('#drawing-line-width'),
      clearEl = $('#clear-canvas');
      sendDate=false,
      socket =null,
      d = document,
      w = window,
      CHAT=null,

  clearEl.click(function() { canvas.clear() });


  if (fabric.PatternBrush) {
    var vLinePatternBrush = new fabric.PatternBrush(canvas);
    vLinePatternBrush.getPatternSrc = function() {

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    var hLinePatternBrush = new fabric.PatternBrush(canvas);
    hLinePatternBrush.getPatternSrc = function() {

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    var squarePatternBrush = new fabric.PatternBrush(canvas);
    squarePatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 2;

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
      var ctx = patternCanvas.getContext('2d');

      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, squareWidth, squareWidth);

      return patternCanvas;
    };

    var diamondPatternBrush = new fabric.PatternBrush(canvas);
    diamondPatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 5;
      var patternCanvas = fabric.document.createElement('canvas');
      var rect = new fabric.Rect({
        width: squareWidth,
        height: squareWidth,
        angle: 45,
        fill: this.color
      });

      var canvasWidth = rect.getBoundingRectWidth();

      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

      var ctx = patternCanvas.getContext('2d');
      rect.render(ctx);

      return patternCanvas;
    };

    var img = new Image();
    img.src = '../assets/honey_im_subtle.png';

    var texturePatternBrush = new fabric.PatternBrush(canvas);
    texturePatternBrush.source = img;
  }

  $('#drawing-mode-selector').on("change",function() {

    if ($(this).val() === 'hline') {
      canvas.freeDrawingBrush = vLinePatternBrush;
    }
    else if ($(this).val() === 'vline') {
      canvas.freeDrawingBrush = hLinePatternBrush;
    }
    else if ($(this).val() === 'square') {
      canvas.freeDrawingBrush = squarePatternBrush;
    }
    else if ($(this).val() === 'diamond') {
      canvas.freeDrawingBrush = diamondPatternBrush;
    }
    else if ($(this).val() === 'texture') {
      canvas.freeDrawingBrush = texturePatternBrush;
    }
    else {
      canvas.freeDrawingBrush = new fabric[$(this).val() + 'Brush'](canvas);
    }

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = drawingColorEl.val();
      canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.val(), 10) || 1;
    }
  });

  drawingColorEl.on("change",function() {
    canvas.freeDrawingBrush.color = $(this).val();
  });
  drawingLineWidthEl.on("change",function() {
    canvas.freeDrawingBrush.width = parseInt($(this).val(), 10) || 1;
    $(this).prev().text($(this).val());
  });
  canvas.on('mouse:down', function(){
      sendDate=true;
  });
  canvas.on('mouse:up', function(){
      sendDate=false;
  });
  canvas.on("mouse:move",function(){
       // console.log(canvas.lowerCanvasEl.toDataURL()); 
       var imageData = {lower:canvas.lowerCanvasEl.toDataURL(),upper:canvas.upperCanvasEl.toDataURL()}
       if(sendDate&&CHAT.socket)
        CHAT.socket.emit('drawing' , JSON.stringify(imageData));
  });
  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = drawingColorEl.val();
    canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.val(), 10) || 1;
  }

//连接聊天
CHAT = {
    msgObj:$("#messageBox"),
    screenheight:w.innerHeight ? w.innerHeight : dx.clientHeight,
    username:null,
    userid:null,
    socket:null,
    //让浏览器滚动条保持在最低部
    scrollToBottom:function(){
      var tt = this.msgObj.get(0).scrollHeight;
      this.msgObj.scrollTop(tt);
    },
    //退出，本例只是一个简单的刷新
    logout:function(){
      //this.socket.disconnect();
      location.reload();
    },
    //提交聊天消息内容
    submit:function(){
      var content = $("#content").val();
      if(content != ''){
        var obj = {
          userid: this.userid,
          username: this.username,
          content: content
        };
        this.socket.emit('message', obj);
        $("#content").val("");
      }
      return false;
    },
    genUid:function(){
      return new Date().getTime()+""+Math.floor(Math.random()*899+100);
    },
    //更新系统消息，本例中在用户加入、退出的时候调用
    updateSysMsg:function(o, action){
      //当前在线用户列表
      var onlineUsers = o.onlineUsers;
      //当前在线人数
      var onlineCount = o.onlineCount;
      //新加入用户的信息
      var user = o.user;
        
      //更新在线人数
      var userhtml = '';
      var separator = '';
      for(key in onlineUsers) {
            if(onlineUsers.hasOwnProperty(key)){
          userhtml += separator+onlineUsers[key];
          separator = '、';
        }
        }
      var h3t = $("<h3>"+this.username+"</h3>");
      var pinfo = $('<p>当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml+"</p>");
      $(".loginInner").empty().append(h3t).append(pinfo);
      //显示界面
      if(action == 'changedrawer'){
        if(this.userid==user.userid){
          $(".canvas-container").css("display","block");
          $("#d").css("display","none");
        }else{
          $(".canvas-container").css("display","none");
          $("#d").css("display","block");
        }
      }
      if(action == 'login'){
        if(this.userid==user.userid){
        $("#operationBox").css("display","block");
          if(user.drawable){
              $(".canvas-container").css("display","block");
              $("#d").css("display","none");
            }else{
              $(".canvas-container").css("display","none");
              $("#d").css("display","block");
            }

        }
        //添加系统消息
        var html = '';
        html += '<li class="server"><span>系统</span>';
        html += user.username;
        html += (action == 'login') ? ' 加入了游戏' : ' 退出了游戏';
        html += '</li>';

        this.msgObj.find("ul").append(html); 
        this.scrollToBottom();
      }
    },
    addwordFun:function(){
      var word = $("#keyword").val();
      var desc = $("#description").val();
      if($.trim(word)!=""){
        this.socket.emit('addword',{"word":word,"desc":desc,username: this.username});
      }else{
        w.alert("添加词不能为空");
      }
    },
    //第一个界面用户提交用户名
    usernameSubmit:function(){
      var username = $("#username").val();
      var userid = this.genUid();
      if(username != ""){
        $("#username").val("");
        $("#loginbox").css("display","none");
        this.init(username,userid);
        var storage = w.localStorage;
        storage.setItem("user",JSON.stringify({'username':username,'userid':userid}));
      }
      return false;
    },
    autoLogin:function(){
      var storage = w.localStorage;
      var userStr = storage.getItem("user");
      if(userStr){
        var obj = JSON.parse(userStr);
        this.init(obj.username,obj.userid);
      }
    },
    init:function(username,userid){
      /*
      客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
      实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
      */
      this.userid = userid;
      this.username = username;
      var host = window.location.hostname;
      var port = window.location.port;
      //连接websocket后端服务器
      this.socket = io.connect("ws://"+host+":"+port);
      
      //告诉服务器端有用户登录
      this.socket.emit('login', {userid:this.userid, username:this.username});
      
      //监听新用户登录
      this.socket.on('login', function(o){
        //console.log(o);
        CHAT.updateSysMsg(o, 'login');  
      });
      this.socket.on('changedata',function(data){
        console.log(data);
        if(data.userid==CHAT.userid){
            $(".word").text(data.drawtext);
            $(".wordremark").text("---");
        }else{
             $(".word").text("---");
            $(".wordremark").empty().append(data.tlen+"个字<br/>"+data.desc);
        }
      });
      this.socket.on("countDown",function(data){
          $(".timeshow").text("倒计时："+data.time+"秒");
      });
      this.socket.on('changedrawer', function(o){
        console.log(o);
        CHAT.updateSysMsg(o, 'changedrawer');
      });
      
      //监听消息发送
      this.socket.on('message', function(obj){
        var isme = (obj.userid == CHAT.userid) ? true : false;
        var contentDiv = $('<li>'+obj.content+'</li>');
        contentDiv.append('<span>'+obj.username+'</span>');
        
        if(isme){
          contentDiv.addClass("user");
        } else {
          contentDiv.addClass("server");
        }
        console.log(contentDiv.text());
        CHAT.msgObj.find("ul").append(contentDiv);
        CHAT.scrollToBottom();  
      });
      this.socket.on('drawing_back' , function(data){
          if(show_canvas){
            var json = JSON.parse(data);
            var ctx = show_canvas.getContext("2d");
            var image = new Image();
            image.src = json.lower;
            ctx.clearRect(0,0,500,500);
            ctx.drawImage(image,0,0,500,500,0,0,500,500);
            image.src = json.upper;
            ctx.drawImage(image,0,0,500,500,0,0,500,500);
          }           
        });

    }
  };
  //通过“回车”提交用户名
  $("#addgame").on("click",function(e) {
      CHAT.usernameSubmit();
  });
  //通过“回车”提交信息
  $("#sendMeg").on("click",function(e) {
      CHAT.submit();
  });
  $("#content").on("keydown",function(e) {
      var e = e||event;
      if(e.keyCode==13){
        CHAT.submit();
      }
  });
  $("#addword").on("click",function(e){
      CHAT.addwordFun();
  })

CHAT.autoLogin();