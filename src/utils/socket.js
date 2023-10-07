
import { io } from "socket.io-client"
const ERROR_TYPES = window.$config.ERROR_TYPES
const paths = window.$config.SOCKET_PATH_TWO;
import CryptoJS from "@/utils/CryptoJS.js"
import localstorage from "@/utils/localstorage.js"
import { Notification as Message } from 'element-ui';
import i18n from '@/lang'
import router from '@/router/routers'

export const createWebsocket = (key, option, url) => {

    url = url || localstorage.getTicket().url;
    return new websocket(url, option, key)
}
const getPath = (key) => {
    let path = paths[key]
    if (!path) {

        return ""
    }
    return path
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
        this.path = getPath(key);

        let Socket = null;

        if (!this.path) return;

        try {

            Socket = io(url);

        } catch (error) {
            if (this.option.onerror) {
                this.option.onerror(error)
            }

        }
        if (!Socket) {
            return;
        }

        // Object.assign(Socket, option)







        Socket.on('connect', (o) => {
          
            // ...
            this.linkOk = true;
            if (option.onopen) {
                option.onopen(o)
            }
        });
        Socket.on('reconnect_error', (e) => {
            console.info("reconnect_error", e)
            if (!this.linkOk) {
                Message.error(i18n.t("messages.connectionFailed"));

            } else {
                Message.error(e);
            }
            if (option.onerror) {
                option.onerror(e)
            }
        });
        Socket.on('connect_error', (e) => {
            console.info("connect_error", e)
            // ...
            if (!this.linkOk) {
                Message.error(i18n.t("messages.connectionFailed"));

            } else {
                Message.error(e);
            }
            if (option.onerror) {
                option.onerror(e)
            }
        });



        Socket.on('disconnect', (c) => {
            console.info("disconnect", c)
            // ...
            this.linkOk = false;
            option.onclose && option.onclose(c)
        });



        Socket.on(this.path, (re) => {

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
                    router.push("/login/")
                    localstorage.removeItem();

                    break;

                default:
                    Message.error(errorJSON.reason);
                    option.onerror && option.onerror(errorJSON)
                    break;
            }

        })
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

        if (!this.Socket.connected) {
            this.init()
            return;
        }

        if (setTicket && Object.prototype.toString.call(message) === '[object Object]') {
            cmd && (message.cmd = cmd);
            this.setSgin(message);
        }
        //  let messageJson = JSON.stringify(message)
        console.log("request", message)
        this.Socket.emit(this.path, message);

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