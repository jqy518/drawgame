var express = require('express');
var router = express.Router();
var multiparty = require("multiparty");
var util = require("util");
var fs = require("fs");

/* GET home page. */
router.post('/',function(req,res) {
    var form = new multiparty.Form({"uploadDir":"./public/upload"});
      form.parse(req, function(err, fields, files) {
        console.log(files);
        var filesTmp = JSON.stringify(files,null,2);
        if(err){
          console.log('parse error: ' + err);
        } else {
          console.log('parse files: ' + filesTmp);
          var inputFile = files.ufile[0];
          var uploadedPath = inputFile.path;
          var dstPath = './public/upload/' + inputFile.originalFilename;
          //重命名为真实文件名
          fs.rename(uploadedPath, dstPath, function(err) {
            if(err){
              console.log('rename error: ' + err);
            } else {
              console.log('rename ok');
            }
          });
        }

        res.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: filesTmp}));
 });
});

module.exports = router;
