// 定义我们的 chat 类
function SimpleChat() {
    this.socket = null;
}

// 像原型添加业务方法
SimpleChat.prototype = {
    // 初始化程序
    init: function() {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function() {
            document.getElementById('info').textContent = 'get yourself a nicename.';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
            // 昵称设置的确认按钮
            document.getElementById('loginBtn').addEventListener('click', function() {
                var nickName = document.getElementById('nicknameInput').value;
                // 检查昵称输入框是否为空
                if(nickName.trim().length != 0) {
                    // 不为空, 则发起一个 login 事件并将输入的昵称发送到服务器
                    that.socket.emit('login', nickName);
                } else {
                    // 否则输入框获取焦点
                    document.getElementById('nicknameInput').focus();
                };
            }, false);
        });
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '!niclname is taken';
        });
        this.socket.on('loginSuccess', function() {
            document.title = 'simpleChat |' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none'; // 隐藏遮罩层显示聊天界面
            document.getElementById('messageInput').focus();    // 让消息输入框获得焦点
        });
        this.socket.on('system', function(nickname, userCount, type) {
            // 判断用户是链接还是离开以显示不同的信息
            var msg = nickname + (type == 'login' ? ' joined' : ' left');
            // 指定系统消息显示为红色
            that._displayNewMsg('system', msg, 'red');
            // var p = document.createElement('p');
            // p.textContent = msg;
            // document.getElementById('historyMsg').appendChild(p);
            // 将在线人数显示到页面顶部
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users ' : 'user') + 'online';
        });
        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value;
            messageInput.value = '';
            messageInput.focus();
            if(msg.trim().length != 0) {
                that.socket.emit('postMsg', msg);  // 把消息发送到服务端
                that._displayNewMsg('me', msg);  // 把自己的消息显示到自己的窗口中
            }
        }, false);
        this.socket.on('newMsg', function(user, msg) {
            that._displayNewMsg(user, msg);
        })
    },
    _displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
}



window.onload = function() {
    var simpleChat = new SimpleChat();
    simpleChat.init();
}
