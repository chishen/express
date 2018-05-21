var express = require('express');
var mysql = require('mysql');
var router = express.Router();
// var ts = require('tushare');
function sql(sql,success) {
    var connect = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'chishen',
        database: 'dog',
        port: 3306
    });
    connect.connect();
    connect.query(sql,function (err,rows, result) {
        success(err,rows);
    });
    connect.end();
}

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index');
});
/*获取品种*/
router.get('/getType', function(req, res){
    var questions={
        success: false,
        message: null,
        data: {
            type: []
            }
        };
    sql('SELECT DISTINCT type FROM dog_detail',function (err,rows) {
        if(err){
            questions.message = "获取品种错误";
            res.json(questions);
        }else{
            questions.success = true;
            rows.forEach(function(value) {
                questions.data.type.push(value.type);
            });
            res.json(questions);
        }
    });
});
/*获取品级*/
router.get('/getLevel', function(req, res){
    var questions={
        success: false,
        message: null,
        data: {
            level: []
        }
    };
    sql('SELECT DISTINCT level FROM dog_detail',function (err,rows) {
        if(err){
            questions.message = "获取品级错误";
            res.json(questions);
        }else{
            questions.success = true;
            rows.forEach(function(value) {
                questions.data.level.push(value.level);
            });
            res.json(questions);
        }
    });
});
/*获取城市*/
router.get('/getCity', function(req, res){
    var questions={
        success: false,
        message: null,
        data: {
            city: []
        }
    };
    sql('SELECT DISTINCT city FROM dog_detail',function (err,rows) {
        if(err){
            questions.message = "获取城市错误";
            res.json(questions);
        }else{
            questions.success = true;
            rows.forEach(function(value) {
                questions.data.city.push(value.city);
            });
            res.json(questions);
        }
    });
});
/*搜索*/
router.get('/search', function(req, res) {
    var config = {
        'type': '',
        'level': '',
        'city': ''
    };
    //查询品种，品级和城市的方法
    function sql_condition(type) {
        if(req.query[type]){
            var list = req.query[type].split(',');
            var t = '';
            for(var i = 0; i < list.length; i++){
                t += "'" + list[i] + "'" + ",";
            }
            config[type] = "`" + type + "` in (" + t.substr(0,t.length-1) + ")";
        }
        return config[type];
    }
    var sql_sentence = ("SELECT * FROM dog_detail WHERE 1=1" +
        (sql_condition('type')?(" and " + sql_condition('type')):"") +
        (sql_condition('level')?(" and " + sql_condition('level')):"") +
        (sql_condition('city')?(" and " + sql_condition('city')):"")) +
        (req.query.saleIn === 'true'?" and `isSoldOut`=0":"") +
        (req.query.isNew === 'true'?" and `isNew`=1":"") +
        (req.query.champion === 'true'?" and `champion`=1":"") +
        (req.query.isVideo === 'true'?" and `isVideo`=1":"") +
        (req.query.sale === 'lowToHigh'?" ORDER BY sale":(req.query.sale === 'highToLow'?" ORDER BY sale DESC":"")) +
        (req.query.evaluation === 'lowToHigh'?" ORDER BY evaluation":(req.query.evaluation === 'highToLow'?" ORDER BY evaluation DESC":"")) +
        (req.query.price === 'lowToHigh'?" ORDER BY price_low,price_high":(req.query.price === 'highToLow'?" ORDER BY price_high DESC,price_low DESC":""));
    var questions={
        success: false,
        message: null,
        total: null,
        data: []
    };
    console.log(sql_sentence);
    sql(sql_sentence,function (err,rows) {
        if(err){
            questions.message = "错误";
            res.json(questions);
        }else{
            questions.success = true;
            questions.total = rows.length;
            var rows_new = rows.slice((parseInt(req.query.page) - 1)*parseInt(req.query.size),parseInt(req.query.page)*parseInt(req.query.size));
            rows_new.forEach(function(value) {
                questions.data.push(value);
            });
            res.json(questions);
        }
    });
});
    // res.render('index',function () {
    //     sql('select * from user',function (err,rows) {
    //         if(err){
    //             questions.message = "错误";
    //             res.json(questions);
    //         }else{
    //             questions.success = true;
    //             questions.data = {
    //                 data:[]
    //             };
    //             rows.forEach(function(value) {
    //                 questions.data.data.push(value);
    //             });
    //             res.json(questions);
    //         }
    //     });
    // });
    // res.render('index', { title: 'hello world' }, function(err, html) {
    //     res.send(html);
    // });

// router.param('id', function(req, res, next, id) {
//     // sample user, would actually fetch from DB, etc...
//     req.user = {
//         id:id,
//         name:"TJ"
//     };
//     next();
// });
// router.route('/index/:id')
    // .all(function(req, res, next) {
    //     // runs for all HTTP verbs first
    //     // think of it as route specific middleware!
    //     res.json(req.user);
    //     next();
    // })
// router.get('/users/:id', function(req, res, next) {
//     var questions={
//         success: false,
//         message: null,
//         data: null
//     };
//     if(req.query.name && req.query.password){
//         sql('select * from user where name="'+req.query.name+'"' ,function (err,rows) {
//             if(err){
//                 questions.message = "错误";
//                 res.json(questions);
//             }else{
//                 if(rows.length){
//                     questions.message = "已存在该用户";
//                     res.json(questions);
//                 }else{
//                     sql('insert into user values (null,'+req.query.name+','+req.query.password+')',function () {
//                         console.log('success');
//                     });
//                 }
//             }
//
//         });
//         var questions={
//             success: true,
//             message: null,
//             data: {
//                 name:req.query.name,
//                 password:req.query.password
//             }
//         };
//         res.json(questions);
//     }else if(!req.query.name){
//         questions.message = "请输入姓名";
//         res.json(questions);
//     }else if(!req.query.password){
//         questions.message = "请输入密码";
//         res.json(questions);
//     }
//
// });

module.exports = router;
