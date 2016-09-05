(function(){
    var nav = document.getElementById("nav");
    function addEvent(el,eventName,callback){
        if(window.attachEvent){
          el.attachEvent("on"+eventName,function(event){
              var event = event || window.event;
              event.target = event.target || event.srcElement;
              callback.call(this,event);
          });
        }else{
          el.addEventListener(eventName,callback,false);
        }
    }
    function callBackfun(event){
        alert(this.tagName);
        if(event.preventDefault){
          event.preventDefault();
        }else{
          event.returnValue = false;
        }
        var target = event.target;
          if(target.tagName=="A"){
            target = target.parentNode;
          }
          var index = 0;
        for(var i=0,len=lis.length;i<len;i++){
            if(lis[i]===target){
              index = i;
            }
        } 
        alert(index);
    }
    addEvent(nav,"click",callBackfun);
}());

function arrayTest(){
    var arr = [];
    for(var i=0;i<100; i++){
      arr.push(Math.floor(Math.random()*100)+'');
    }
    console.log(arr);
    for(var i=0;i<arr.length;i++){
        var src = arr[i];
        for(var j=i+1;j<arr.length;j++){
          var tar = arr[j];
          if(src==tar){
            arr.splice(j,1);
            j--;
          }
        }
    }
    console.log(arr);
}
arrayTest();