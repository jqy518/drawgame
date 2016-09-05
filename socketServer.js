var socket=require('socket.io');
var fs = require("fs");
var path = require('path');
var socketServer = {
  io:null,
  onlineUsers:{},
  onlineCount:0,
  drawItems:null,
  l_drawItems:null,
  drawmanID:null,
  currentItem:null,
  setInter:null,
  drawedNum:0,
  time:60,
  pathstr:path.join(__dirname,"./public/data/data.json"),
  init:function(server){
    this.io =socket.listen(server);
    this.readWords();
    this.bindEvent();
  },
  readWords:function(){
    var self = this;
    fs.readFile(this.pathstr,function(err,data){
      if(!err){
        self.drawItems=JSON.parse(data.toString()).words;
        self.l_drawItems = JSON.parse(data.toString()).words;
        console.log(self.drawItems.length);
      }else{
        throw err;
      }
    });
  },
  writeFile:function(){
    var jsonData = {"words":this.drawItems};
    fs.writeFile(this.pathstr,JSON.stringify(jsonData));
  },
  bindEvent:function(){
    var self = this;
    this.io.on('connection' , function(socket){
      socket.join('gameroom');
      socket.on('drawing' , function(data){
          self.io.to("gameroom").emit('drawing_back' , data);
      });
      socket.on('login',function(obj){
        socket.id = obj.userid;
        if(!self.onlineUsers.hasOwnProperty(obj.userid)){
          self.onlineUsers[obj.userid] = obj.username;
          self.onlineCount=self.io.eio.clientsCount;
          console.log(self.io.eio.clientsCount);
        }
         if(self.onlineCount==1){
            self.drawmanID = obj.userid;
            obj.drawable=true;
            self.startTime();
          }
          if(self.drawmanID==obj.userid){
             obj.drawable=true;
          }
        self.io.to("gameroom").emit('login',{'onlineUsers':self.onlineUsers, 'onlineCount':self.onlineCount, 'user':obj});
        self.io.to("gameroom").emit('changedata',self.getCurrData(false));
      });
      socket.on('message',function(data){  
          var c = data.content;
          
          if(c==self.currentItem.drawtext){
            var sysobj = {};
            sysobj.username="系统";
            sysobj.content =data.username+"答对了";
            self.io.to("gameroom").emit("message",sysobj);
          }else{
            self.io.to("gameroom").emit("message",data);
          }
      });
      socket.on("disconnect",function(){
           self.userDisconnect(socket.id);
      });
      socket.on('addword',function(data){
        var wordObj = data;
        self.drawItems.push(wordObj);
        self.l_drawItems.push(wordObj);
        var sysobj = {};
        sysobj.username="系统";
        sysobj.content =data.username+"加了新词"+data.word;
        self.io.to("gameroom").emit("message",sysobj);
      });
  });

  },
  userDisconnect:function(id){
    var self = this;
    var name = this.onlineUsers[id];
    delete this.onlineUsers[id];
    setTimeout(function(){
      if(!self.onlineUsers.hasOwnProperty(id)){
            var sysobj = {};
            sysobj.username="系统";
            sysobj.content =name+"退出游戏";
            self.io.to("gameroom").emit("message",sysobj);
            if(id ==self.drawmanID){
              console.log("画者退出");
              self.changeDrawer();
            }
      }
    },3000);


  },
  changeDrawer:function(){
        var nArr = [];
       for(var n in this.onlineUsers){
          nArr.push(n);
       }
       var obj = {};
       obj.userid = nArr[Math.floor(Math.random()*nArr.length)];
       obj.name = this.onlineUsers[obj.userid];
       obj.drawable=true;
       this.drawmanID=obj.userid;
       this.drawedNum=0;
       this.io.to("gameroom").emit('changedrawer',{'onlineUsers':this.onlineUsers, 'onlineCount':this.onlineCount, 'user':obj});
       
       this.startTime();
  },
  startTime:function(){
    var self = this;
    clearInterval(self.setInter);
    self.time=0;
    self.setInter=null;
    self.setInter = setInterval(function(){
      if(self.time>0){
        self.time--;
        self.io.to("gameroom").emit("countDown",{"time":self.time});
      }else{
        self.time=60;
        self.io.to("gameroom").emit('changedata',self.getCurrData(true));
        self.writeFile();
      }
    },1000);
  },
  getCurrData:function(changeflag){
      var obj = {};
      if(this.currentItem==null||changeflag){
        console.log(this.drawedNum+"----------");
        if(this.drawedNum==1){
            this.changeDrawer();
        }else{
          this.drawedNum++;
        }
        var index = Math.floor(Math.random()*this.l_drawItems.length);
        obj.drawtext = this.l_drawItems[index].word;
        obj.desc = this.l_drawItems[index].desc;
        this.l_drawItems.splice(index,1);
        this.currentItem = obj;
      }else{
        obj=this.currentItem;
      }
      obj.userid = this.drawmanID;
      obj.tlen = obj.drawtext.length;
      return obj;
  }

}
module.exports = socketServer;