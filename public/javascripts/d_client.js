(function($){
    var canvas = document.getElementById("d");
    var socket= io.connect('ws://192.168.169.35:3000');
    socket.on('drawing_back' , function(data){
        console.log(data);
        var json = JSON.parse(data);
        var ctx = canvas.getContext("2d");
        var image = new Image();
        image.src = json.lower;
        ctx.clearRect(0,0,500,500);
       ctx.drawImage(image,0,0,500,500,0,0,500,500);
        image.src = json.upper;
        ctx.drawImage(image,0,0,500,500,0,0,500,500);
    })

    function genUid(){
      return new Date().getTime()+""+Math.floor(Math.random()*899+100);
    }
})(jQuery);