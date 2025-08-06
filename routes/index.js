const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/', function (req, res, next) {
    const isAuth = req.isAuthenticated();
    if (isAuth) {
        const userId = req.user.id;
        const filterColor = req.query.color; // クエリパラメータから色を取得

        let query = knex("tasks").select("*").where({user_id: userId});
        
        // クエリパラメータに色情報があり、「all」以外の場合に絞り込み条件を追加
        if (filterColor && filterColor !== 'all') {
            query = query.where({color: filterColor});
        }

        query.then(function (results) {
            res.render('index', {
                title: 'ToDo App',
                todos: results,
                isAuth: isAuth,
            });
        })
        .catch(function (err) {
            console.error(err);
            res.render('index', {
                title: 'ToDo App',
                isAuth: isAuth,
                errorMessage: [err.sqlMessage],
            });
        });
    } else {
        res.render('index', {
            title: 'ToDo App',
            isAuth: isAuth,
        });
    }
});

router.post('/', function(req, res, next) {
  const todoContent = req.body.add;
  const deadline = req.body.deadline;
  const color = req.body.color; // 色情報を受け取る
  const isAuth = req.isAuthenticated();
  const userId = req.user.id;

  knex("tasks")
    .insert({
      user_id: userId,
      content: todoContent,
      deadline: deadline,
      color: color // ここに color を追加
    })
    .then(function () {
      res.redirect('/')
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'ToDo App',
        isAuth: isAuth,
        errorMessage: [err.sqlMessage],
      });
    });
});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;