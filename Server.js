const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
var app = express();
app.use('/js',express.static('js'));
app.use('/css',express.static('css'));
app.use('/production',express.static('production'));
app.get('/',(req,res)=>{
    fs.readFile('index.html',(err,data)=>{
        if(err){
            console.log(err);
            res.send('Sorry Server is Not Working');
        }
        else{
            res.send(data.toString());
        }
    });
});
app.get('/test',(req,res)=>{
    res.send('This is an test server');
})

var port = 3000;
app.listen(port,()=>{
    console.log('....  server is start '+port+' ....')
})

//Web Socket Coding start here
var Sockets =[];
var wss = new WebSocket.Server({port:4000})
wss.on('open',()=>{
    console.log('Websocket Sever is Start');
});
wss.on('close',(code,reson)=>{
    console.log('WebSocket Server is shutDown code: ',code,' Reson: ',reson);
})
wss.on('connection',(ws)=>{
    ws.on('message',(msg)=>{
        console.log(msg.toString());
        try{
            var Req = JSON.parse(msg.toString());
            switch(Req.type){
                case 'init':
                    if(Req.name&&Req.code&&Req.pass){
                        ws['Sockets']=Sockets;
                        ws['Name']=Req.name;
                        ws['Code']=Req.code;
                        ws['Pass']=Req.pass;
                        Sockets.push(ws);
                        ws.send(JSON.stringify({type:'DONE'}));
                        console.log('Connected Name:',ws['Name'],' Code:',ws['Code'],' Pass:',ws['Pass']);
                        if(ws['Name']&&ws['Code']&&ws['Pass']){
                            Sockets.forEach((e)=>{
                                if(ws['Code']==e['Code']&&ws['Pass']==e['Pass']&&ws!==e){
                                    e.send(JSON.stringify({type:'addName',name:ws['Name']}));
                                }
                            });
                        }
                    }
                    else{
                        ws.send(JSON.stringify({type:'NOTDONE'}));
                        ws.close();
                    }
                    break;
                case 'getAllName':
                    if(ws['Name']&&ws['Pass']&&ws['Code']){
                        console.log('Name: ',ws['Name']);
                        let arr = [];
                        for(let i=0;i<Sockets.length;i++){
                            if(ws!==Sockets[i]&&ws['Code']==Sockets[i]['Code']&&ws['Pass']==Sockets[i]['Pass'])
                            arr.push(Sockets[i]['Name']);
                        }
                        console.log(arr);
                        ws.send(JSON.stringify({type:'AllName',name:arr}));
                    }
                    break;
                case 'MSG':
                    if(ws['Name']&&ws['Pass']&&ws['Code']&&Req.msg){
                        Sockets.forEach((e)=>{
                            if(ws['Code']==e['Code']&&ws['Pass']==e['Pass']&&ws!==e){
                                e.send(JSON.stringify({type:'addMSG',name:ws['Name'],msg:Req.msg.toString()}));
                            }
                        })
                    }
                    break;
            }
        }
        catch(err){
            console.log(err);
            console.log('invailid Json formate');
            ws.close();
        }
    });
    ws.on('close',()=>{
        if(ws['Name']&&ws['Code']&&ws['Pass']){
            Sockets.forEach((e)=>{
                if(ws['Code']==e['Code']&&ws['Pass']==e['Pass']&&ws!==e){
                    e.send(JSON.stringify({type:'removeName',name:ws['Name']}));
                }
            });
            Sockets=Sockets.filter((e)=>{
                if(e!==ws)return e;
            });
            console.log('Disconnected Name:',ws['Name'],' Code:',ws['Code'],' Pass:',ws['Pass']);
        }
    });
    ws.on('error',()=>{
        if(ws['Name']&&ws['Code']&&ws['Pass']){
            Sockets.forEach((e)=>{
                if(ws['Code']==e['Code']&&ws['Pass']==e['Pass']&&ws!==e){
                    e.send(JSON.stringify({type:'removeName',name:ws['Name']}));
                }
            });
            Sockets=Sockets.filter((e)=>{
                if(e!==ws)return e;
            });
        }

        ws.close();
    });
})
