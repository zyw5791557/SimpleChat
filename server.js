const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);     // 引入 socket.io 模块并绑定到服务器

app.use('/', express.static(__dirname + '/www'));   // 指向静态HTML文件的位置

// node_modules
app.use('/modules', express.static('./node_modules'));

server.listen(80);

// 保存所有在线用户的昵称
let users = [];

// socket 部分
io.on('connection', socket => {
    // 昵称设置
    socket.on('login', nickname => {
        if(users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');     // 向所有连接到服务器的客户端发送当前登录用户的昵称
        };
    });
    // 接收新消息
    socket.on('postMsg', msg => {
        // 将消息发送到除了自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
    // 断开连接的事件
    socket.on('disconnect', () => {
        // 将断开连接的用于从 users 中删除
        users.splice(socket.userIndex, 1);
        // 通知除自己以外的所有人
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
});
