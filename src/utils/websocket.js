import CryptoJS from "@/utils/CryptoJS.js"
import localstorage from "@/utils/localstorage.js"
import { Notification as Message } from 'element-ui';
import i18n from '@/lang'
import router from '@/router/routers'
const ERROR_TYPES = window.$config.ERROR_TYPES
const paths =  window.$config.SOCKET_PATH;

export const createWebsocket = (key, option, url) => {
   
    url = url || localstorage.getTicket().url;
    return new websocket(url, option, key)
}

const getUrl = (ip, key) => {
    let path = paths[key]
    if (!path) {
        this.closeSocket()
        return ""
    }
    return path.replace("*", ip.trim())
}

export class websocket {
    constructor(url, option = {}, key) {
        this.init(url, option, key);
    }

    init(url = this.url, option = this.option, key = this.key) {
        this.closeSocket()

        this.linkOk = false;
        this.url = url;
        this.option = option;
        this.key = key;

        url = key ? getUrl(url, key) : url;
        let Socket = null;

        if (!url) return;

        try {
           
            Socket = new WebSocket(url)
           
        } catch (error) {
            if (this.option.onerror) {
                this.option.onerror(error)
            }

        }
        if (!Socket) {
            return;
        }
        Object.assign(Socket, option)
        Socket.onopen = (o) => {
            this.linkOk = true;
            if (option.onopen) {
                option.onopen(o)
            }
        }

        Socket.onerror = (e) => {
           
            
            if (!this.linkOk) {
                Message.error(i18n.t("messages.connectionFailed"));
            } else {
                Message.error(e);
            }
            if (option.onerror) {
                option.onerror(e)
            }
        }


        Socket.onclose = (c) => {
            this.linkOk = false;
            option.onclose && option.onclose(c)

        }

        Socket.onmessage = (re) => {

            let redata = JSON.parse(re.data || "{}")
            console.log("response=>", redata)
            let result = redata.result + "";
            let errorJSON = { result: result, reason: i18n.t(ERROR_TYPES[result]) || "Error" };
           
            switch (result) {
                case "0":
                    option.onmessage && option.onmessage(redata)
                    break;
                case "23":
                    option.onRepeat && option.onRepeat(redata)
                    break;
                case "46":
                    Message.error(errorJSON.reason);
                    
                    localstorage.removeItem();
                    router.push("/login")
                    break;

                default:
                    if(option.errorStart){
                        if(option.errorStart(redata)){
                            return ;
                        }
                    }
                    Message.error(errorJSON.reason);
                    option.onerror && option.onerror(errorJSON)
                    break;
            }

        }
        /* Socket.onopen =option.onopen|| onopenWS
         Socket.onmessage =option.onmessage|| onmessage
         Socket.onerror =option.onerror|| onerrorWS
         Socket.onclose =option.onclose|| oncloseWS*/
        this.Socket = Socket;
    }

    closeSocket() {
        if (this.Socket) {
            this.Socket.close()
            this.Socket = null;
         
        }
        this.setIntervalWesocketPush && clearInterval(this.setIntervalWesocketPush)
        this.setIntervalWesocketPush = null;
    }
    sendWSPush(message, cmd, setTicket = true, cd = 1) {

        if (!this.Socket) {
            this.init()
            return;
        }
        if (this.Socket.readyState === 3) {
            this.init()
            if (cd > 0) {
                this.sendWSPush(message, setTicket, cd--)
            }
        } else if (this.Socket.readyState === 1) {
            if (setTicket && Object.prototype.toString.call(message) === '[object Object]') {
                cmd && (message.cmd = cmd);
                this.setSgin(message);
            }
            let messageJson = JSON.stringify(message)
            console.log("request", messageJson)
            this.Socket.send(messageJson)
        } else if (this.Socket.readyState === 0) {
            this.connecting(message, setTicket, cd)
        }
    }

    connecting(message, setTicket, cd) {
        setTimeout(() => {
            this.sendWSPush(message, setTicket, cd)
        }, 1000)
    }
   
    sendPing({ time = 30000, message = 'ping', cmd, setTicket, cd }, fun) {
        clearInterval(this.setIntervalWesocketPush)
        this.sendWSPush(message, cmd, setTicket, cd)
        this.setIntervalWesocketPush = setInterval(() => {
            fun && fun(cmd);
            this.sendWSPush(message, cmd, setTicket, cd)
        }, time)
    }
    setSgin(json) {
        let itemStr = localstorage.getItem()
        let item = {}
        try {
            item = JSON.parse(itemStr)
            let red = CryptoJS.HmacSHA256(item.ticket)
            Object.assign(json, red);
        } catch (error) {

        }
    }
}






