const {useState,useContext,createContext} = React;
const ChatServer ={
    RemoveName:null,
    AddAllName:null,
    AddName:null,
    AddChat:null,
    ws:null,
    init:function(code,pass,name){
        console.log(code,name,pass);
        ChatServer.ws = new WebSocket('ws://'+window.location.hostname+':4000');
        this.ws.onclose=function(evt){
            console.log('connection is close');
        }
        this.ws.onerror=function(evt){
            console.log('Error occured at Socket');
        }
        this.ws.onmessage=function(evt){
            let msg = JSON.parse(evt.data);
            console.log(msg)
            switch(msg.type){
                case 'DONE':break;
                case 'AllName':
                    ChatServer.AddAllName(msg.name);
                    break;
                case 'addName':
                    ChatServer.AddName(msg.name);
                    break;
                case 'removeName':
                    ChatServer.RemoveName(msg.name);
                    break;
                case 'addMSG':
                    ChatServer.AddChat(msg.name,msg.msg);
                    break;
            }
        }
        this.ws.onopen=function(evt){
            console.log('Socket is Connected');
        }
        var i = setInterval(()=>{
            console.log('try to connect');
            if(this.ws.readyState==1){
                this.ws.send(JSON.stringify({type:'init',name:name,pass:pass,code:code}));
                this.ws.send(JSON.stringify({type:'getAllName'}));
                clearInterval(i);
            }
        },100)
    },
}
function Name({name}){
    return (
        <div className='Name'>
            {name}
        </div>
    );
}
function MSG({msg}){
    return (
        <div className='MSG'>
            {msg}
        </div>
    );
}
function Chat({name,msg}){
    return (
        <div className='Chat'>
            <Name name={name}/>
            <MSG msg={msg}/>
        </div>
    );
}
function ChatWrap({list}){
    var chats = list.map((ele)=>{
        return <Chat name={ele.name} msg={ele.msg}/>;
    })
    
    return (
        <div className='ChatWrap'>
            {[chats]}
        </div>
    );
}
function ChatWriter({add}){
    function onkeyup(evt){
        if(evt.keyCode==13 && evt.target.value!=''){
            if(ChatServer.ws!=null){
                ChatServer.ws.send(JSON.stringify({type:'MSG',msg:evt.target.value}));
                add('YOU',evt.target.value);
                evt.target.value='';    
            }
        }
    }
    return (
        <div className='ChatWriter'>
            <input className='writer' onKeyUp={onkeyup} type='text' placeholder='Enter Message'/>
        </div>
    );
}
function Main(){
    var [list , setlist]=useState([]);
    ChatServer.AddChat = function(name,msg){
        setlist([...list,{name:name,msg:msg}]);
    }
    function Add(name,msg){
        setlist([...list,{name:name,msg:msg}]);
    }
    return (
        <div className='Main'>
            <ChatWrap list={list}/>
            <ChatWriter add={Add}/>
        </div>
    );
}
function SideBar(){
    var [nameList,setNameList] = useState([]);
    ChatServer.AddName = function(name){
        setNameList([...nameList,name]);
    }
    ChatServer.AddAllName=function(name){
        setNameList([...nameList,...name]);
    }
    ChatServer.RemoveName = function(name){
        let a = nameList.filter((e)=>{
            if(e!=name)return e;
        });
        setNameList(a);
    }
    var c;
    if(nameList.length==0){
        c=<span>No one is Online</span>;
    }
    else{
        c = nameList.map((e)=>{
            return <Name name={e}/>;
        });
    }
    return (
        <div className='SideBar'>
            {[c]}
        </div>
    );
}
function Body(){
    return (
        <div className='Body'>
            <SideBar />
            <Main />
        </div>
    );
}
function StaticHead({Code,Name}){
    return (
        <div>
            <span>Code: {Code}</span>
            <span>Name: {Name}</span>
        </div>
    );
}
function DynamicHead({setData}){
    var code='',name='',pass='';
    function Join(evt){
        if(code!='' && name!='' && pass!=''){
                ChatServer.init(code,pass,name);
                setData(code,name);
        }
    }
    return (
        <div>
            <span>Code: <input onKeyUp={(evt=>code=evt.target.value)} type='text'/></span>
            <span>Pass: <input onKeyUp={(evt=>pass=evt.target.value)} type='password'/></span>
            <span>Name: <input onKeyUp={(evt=>name=evt.target.value)} type='text'/></span>
            <span><input onClick={Join} type='button' value='Join'/></span>
        </div>
    );
}
function Head(){
    var [state,setState] = useState(null);
    var c;
    function setData(code,name){
        if(code==null){
            setState(null);
            return ;
        }
        setState({code,name});
    }
    if(state==null){
        c = <DynamicHead setData={setData}/>;
    }
    else{
        c=<StaticHead Code={state.code} Name={state.name}/>;
    }
    return (
        <div className='Head'>
            {c}
        </div>
    )
}
function App(){
    return(
        <div id='AppRoot'>
            <Head/>
            <Body/>
        </div>
    )
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);