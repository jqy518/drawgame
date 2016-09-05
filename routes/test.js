var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var links = [{
    "name":"品牌团",
    "link":"http://ju.taobao.com/brand.html"
  },{
    "name":"整点聚",
    "link":"http://ju.taobao.com/point_list.html"
  },{
    "name":"聚宜兰",
    "link":"http://ju.taobao.com/jiazhuang.html"
  },{
    "name":"量贩团",
    "link":"http://ju.taobao.com/tp.html"
  }];
  res.render('test', {"links":links});
});

module.exports = router;
