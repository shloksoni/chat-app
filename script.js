jQuery(function($){
       
    var socket = io.connect();
    var $messageForm = $('#send-message');
    var $messageBox = $('#message');
    var $chat = $('#chat');
    var $login =$('#login');
    var $username = $('#username');
    var $loginForm = $('#login');
    var $userList = $('#users');
    $loginForm.submit(function(e){
        e.preventDefault();
        socket.emit('new-user',$username.val(),function(data){
            if(data){
                $('#login').hide();
                $('#contentWrap').show();

            }
            else{
                $('#loginError').html('Username already Registered');
                $username.val('');
            }
        });
    });

    $messageForm.submit(function(e){
        e.preventDefault();
        
    
        socket.emit('send-message', $messageBox.val(), function(data){
            $chat.append('<span class ="error">'+ data+'</span> <br />');
        });
        
        
        $messageBox.val('');
    });
    socket.on('usernames',function(data){
        $userList.html('Online Users <br /><br />');
        data.forEach(function(username){
            $userList.append(username + '<br />');
        })
    })
    socket.on('new-message', function(data){
       
 
        $chat.append('<span class ="normal-message"><b>'+ data.username +':</b> <em>'+data.message +'</em></span><br />');

    });

    socket.on('private-message',function(data){
    
        $chat.append('<span id="private-msg" ><b>'+ data.username +':</b> <em>'+data.message +'</em> </span><br />');
    });

    socket.on('my-message', function(data){
        $chat.append('<span id = "self-msg"> <em>'+data.message +'</em> </span><br />');

    })

});