
/////////////////服务器////////////////////
const express = require('express');
const app = express();
app.listen(3000, () => console.log('请开始你的表演'));


app.use(express.static('manager'));
app.use('/uploads', express.static('uploads'));
// app.use('/uploads', express.static(__dirname + 'uploads'));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
const session = require('express-session');
app.use(session({
    secret: 'ad325sdfj123',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
}));
// const db = require('./db.js')
// app.get('/getHeroes', (req, res) => {
//     let page = 1;
//     let pageNum = 5;
//     let sql = 'select * from heroes limit ' + (page - 1) * pageNum + ',' + pageNum;
//     db(sql, null, (err, result) => {
//         if (err) throw err;
//         res.send(result)
//     });
// });

const db = require('./db.js');


////////////////取出所有的英雄////////////////////////////////////
app.get('/getHeroes', (req, res) => {
    let keywords = req.query.keywords || null;
    let page = req.query.page || 1;
    let pageNum = 5;
    let w = '';
    if (keywords) {
        w = ' where name like "%' + keywords + '%" or nickname like "%' + keywords + '%"'
    }
    let sql = 'select * from heroes ' + w + ' limit ' + (page - 1) * pageNum + ',' + pageNum;
    sql += ';select count(*) c from heroes' + w;
    db(sql, null, (err, result) => {
        if (err) throw err;
        // res.send(result);
        res.send({
            data: result[0],
            pageTotal: Math.ceil(result[1][0].c / pageNum)
        });
    });
});

const multer = require('multer');
const upload = multer({
    dest: 'uploads/'
});

//////////////////////完成添加接口////////////////////////////
app.post('/addHero', upload.single('heroIcon'), (req, res) => {
    let sql = 'insert into heroes set ?';
    let values = {
        name: req.body.heroName,
        nickname: req.body.heroNickName,
        file: req.file.path,
        skill: req.body.skillName
    };
    db(sql, values, (err, result) => {
        if (err) {
            res.send({ code: 201, message: '添加失败' })
        } else {
            res.send({ code: 200, message: '添加成功' })
        }
    })
})



////////////////// 根据id，获取一个英雄/////////////////////
app.get('/getHeroById', (req, res) => {
    let id = req.query.id;
    if (!id || isNaN(id)) {
        res.send('参数错误')
        return;
    }
    db('select * from heroes where id=?', id, (err, result) => {
        if (err) throw err;
        res.send(result[0]);
    })
})



///////////////////////// 完成更新的接口////////////////////////
app.post('/updateHero', upload.single('heroIcon'), (req, res) => {
    let sql = 'update heroes set ? where id=?';
    let values = {
        name: req.body.heroName,
        nickname: req.body.heroNickName,
        skill: req.body.skillName
    };
    if (req.file !== undefined) {
        values.file = req.file.path;
    };
    db(sql, [values, req.body.id], (err, result) => {
        if (err) {
            res.send({ code: 201, message: '更新失败' })
        } else {
            res.send({ code: 200, message: '更新成功' })
        }
    })
})



////////////////////////////////////完成删除的接口/////////////////////////
app.get('/deleteHero', (req, res) => {
    // 获取url上的id参数
    let id = req.query.id;
    if (!id || isNaN(id)) {
        res.send('参数错误');
        return;
    }
    db('delete from heroes where id=?', id, (err, result) => {
        if (err) {
            res.send({ code: 201, message: '删除失败' });
        } else {
            res.send({ code: 200, message: '删除成功' });
        }
    })
})


/////////////////////////完成注册//////////////////////
app.post('/reg', (req, res) => {
    // console.log(req.body);
    let sql = 'insert into user set ?';
    db(sql, req.body, (err, data) => {
        if (err) {
            res.send({ code: 201, message: '注册失败' })
        } else {
            res.send({ code: 200, message: '注册成功' })
        }
    })
})

//////////////////////////登陆接口/////////////////////////////////////
app.post('/login', (req, res) => {
    console.log(req.body);
    if (req.body.vcode.toUpperCase() !== req.session.captcha.toUpperCase()) {
        req.send({ code: 202, message: '验证码错误' });
        return;
    }
    let sql = 'select * from user where username = ? and password = ?';
    db(sql, [req.body.username, req.body.password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            req.session.isLogin = true;
            res.send({ code: 200, message: '登录成功' })
        } else {
            res.send({ code: 201, message: '登录失败' })
        }
    })
})






////////////////////////////生成验证码的接口////////////////////
var svgCaptcha = require('svg-captcha');

app.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;

    res.type('svg');
    res.status(200).send(captcha.data);
});