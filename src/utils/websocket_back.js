import CryptoJS from "@/utils/CryptoJS.js"
import localstorage from "@/utils/localstorage.js"
let Socket = ''
let setIntervalWesocketPush = null
let notSocket = false;

export const createSocket = (url, option={}) => {
    notSocket = false
    if(Socket){
        Socket.close()
        Socket=null; 
    }  
    
        try {
            Socket = new WebSocket(url)
        } catch (error) {
            if(option.onerror){
                option.onerror(error)
            }
            Socket=null;
        }
       if(!Socket){
           return;
       }
        Socket.onopen =option.onopen|| onopenWS
        Socket.onmessage =option.onmessage|| onmessage
        Socket.onerror =option.onerror|| onerrorWS
     //   Socket.onclose =option.onclose|| oncloseWS
        return Socket
    }


const onopenWS = () => {
    sendPing()
}


const onerrorWS = () => {

    Socket.close()
    clearInterval(setIntervalWesocketPush)
   
    if (Socket.readyState !== 3) {
        Socket = null
        createSocket()
    }
}



const connecting = message => {
    setTimeout(() => {
        if (Socket.readyState === 0) {
            connecting(message)
        } else {
            Socket.send(JSON.stringify(message))
        }
    }, 1000)
}

const setSgin=function(json){
   let itemStr= localstorage.getItem()
   let item={}
   try {
    item= JSON.parse(itemStr)
    let red=CryptoJS.sha256(CryptoJS.md5(item.ticket))
    Object.assign(json.red);
   } catch (error) {
       
   }
}


export const sendWSPush = (message,setTicket=true) => {
    if (Socket !== null && Socket.readyState === 3) {
        Socket.close()
        createSocket()
    } else if (Socket.readyState === 1) {
        if(setTicket&&Object.prototype.toString.call(message) === '[object Object]'){
            setSgin(message)
        }
        Socket.send(JSON.stringify(message))
    } else if (Socket.readyState === 0) {
        connecting(message)
    }
}


const oncloseWS = () => {
    clearInterval(setIntervalWesocketPush)
    if (notSocket) {
        return;
    }
    if (Socket.readyState !== 2) {
        Socket = null
        createSocket()
    }
}
export const closeSocket=()=>{
    notSocket=true;
    Socket && Socket.close()
    Socket=null;
}

export const sendPing = (time = 5000, ping = 'ping') => {
    clearInterval(setIntervalWesocketPush)
    Socket.send(ping)
    setIntervalWesocketPush = setInterval(() => {
        Socket.send(ping)
    }, time)
}


const paths={
    login:"ws://*/nfclogin",
    nfc:"ws://*/nfcdevicectl",
    utg:"ws://*/utglogin",
}

export const getUrl=(ip,key)=>{
   let path= paths[key]
   if(!path){
       return ""
   }
   return path.replace("*",ip.trim())
}