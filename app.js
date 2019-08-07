const express = require('express');
const app = express();
app.listen(3000, () => console.log('请开始你的表演'));
app.use(express.static('manager'));
app.use('/uploads', express.static('uploads'));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const db = require('./db.js');
app.get('/getHeroes', (req, res) => {
    db('select * from heroes', null, (err, result) => {
        if (err) throw err;
        res.send(result);
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


