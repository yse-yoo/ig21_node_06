const express = require('express')
const app = express()

const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: true }))

const dotenv = require('dotenv')
dotenv.config()
const host = process.env.HOST
const port = process.env.PORT

const uuidv4 = require('uuid').v4
let users = {}

app.get('/', (req, res) => {
    res.render('index.ejs')
})


io.on('connection', (socket) => {
    socket.on('auth', (user) => {
        //トークンがあれば処理内
        if (user.token) return
        //トークン発行
        user.token = uuidv4()
        //ユーザリスト追加
        users[socket.id] = user
        //data の作成
        let data = {
            user: user,
            users: users,
        }
        console.log(data)
        //本人にデータを返す
        socket.emit('logined', data)
        //本人以外すべてにデータを返す
        socket.broadcast.emit('user_joined', data)
    })

    socket.on('message', (data) => {
        console.log(data)
        data.datetime = Date.now()
        io.emit('message', data)
    })
})

http.listen(port, host, () => {
    console.log('http://' + host + ':' + port)
})