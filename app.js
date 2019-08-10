const express = require('express');
const app = express();
app.listen(3000, () => console.log('请开始你的表演'));
app.use(express.static('manager'));
app.use('/uploads', express.static('uploads'));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));


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
app.get('/getHeroes', (req, res) => {
    let page = req.query.page || 1;
    let pageNum = 5;
    let sql = 'select * from heroes limit ' + (page - 1) * pageNum + ',' + pageNum;
    sql += ';select count(*) c from heroes';
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


app.get('/deleteHero', (req, res) => {
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
