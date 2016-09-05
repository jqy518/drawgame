JQYFILE = {
    fileid:null,
    filedname:"",
    fileInput:null,
    uploadBtn:"",
    smallImageData:null,
    bigImageData:null,
    url:"",
    file:null,
    defaultSize:200,
    init:function(params){
      $.extend(this,params);
      this.fileInput = document.getElementById(this.fileid);
      this.eventBind();
    },
    eventBind:function(){
      var self = this;
      this.fileInput.onchange=function(){
        self.fileChangeHandler(this);
      };
      if(self.uploadBtn!=""){
        $("#"+self.uploadBtn).on("click",function(){
          self.uploadFile();
        });
      }
    },
    uploadFile:function(){
      if(this.file){
        var oMyForm = new FormData();
        oMyForm.append(this.filedname,this.file);
        $.ajax({
            url: this.url,
            type: 'POST',
            cache: false,
            data: oMyForm,
            processData: false,
            contentType: false
        }).done(function(res) {
        }).fail(function(res) {});
      }
    },
    fileChangeHandler:function(_this){
      var self = this;
      var file = _this.files[0];
      this.file = file;
      reader = new FileReader();
      reader.onload=function(){
        var img = new Image();
        img.src = this.result;
        var data = self.compress(img);
        img.src = data;
        $(self.fileInput).closest("div").find("img").remove();
        $(self.fileInput).closest("div").append($(img));
      }
      reader.readAsDataURL(file);
    },
    compress:function(img){
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var cw=0,ch=0;
        if(img.width>this.defaultSize||img.height>this.defaultSize){
          if(img.width>=img.height){
            cw=this.defaultSize;
            ch=img.height*cw/img.width;
          }else{
            ch=this.defaultSize;
            cw=img.width*ch/img.height;
          }
        }else{
          cw = img.width;
          ch = img.height;
        }
        canvas.width = cw;
        canvas.height = ch;
        
        ctx.drawImage(img,0,0,img.width,img.height,0,0,cw,ch);
        var data = canvas.toDataURL('image/jpeg',1);
        return data;
    }

};
