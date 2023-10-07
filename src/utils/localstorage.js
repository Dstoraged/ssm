import utils from "@/utils/utils"
const saveKey = "traffic_To_addr";
const listKey = "traffic_To_list"

const localKey="locale_language"

const localstorage = {
    setItem(item) {
        localStorage.setItem(saveKey, item);
    },
    getItem() {
        return localStorage.getItem(saveKey);
    },
    removeItem() {
        localStorage.removeItem(saveKey);
    },

    getTicket(_this) {
        let itemStr = this.getItem()
        let item = {}
        try {
            item = JSON.parse(itemStr)
        } catch (error) {

        }
        if (_this && !item.url) {
            this.removeItem();
            _this.$router.push("/login/")
        }

        return item;
    },

    setList(item, saves = false) {
        let url = (item.url || "").trim();
        let nowCd = null;

        try {
            let list = this.getList() || [];
            list.find((item, cd) => {
                if (item.url == url) {
                    nowCd = cd;
                    return item;
                }
            });

            if (nowCd !== null) {
                list.splice(nowCd, 1);
            }

            if (saves) {
                let ticket = item.ticket || "";
                let name = item.name || "";
                let random = utils.random(64);
                let time = utils.formatTime(
                    new Date().getTime() ,
                    "yyyy-MM-dd hh:mm:ss"
                );
                let nowItem = {
                    url,
                    ticket,
                    time,
                    name,
                    random
                };
                list.unshift(nowItem);
            }

            localStorage.setItem(listKey, JSON.stringify(list));
        } catch (error) { }
    },



    getList() {
        let listStr = localStorage.getItem(listKey) || "[]";
        if (Array.isArray(listStr)) {
            return listStr;
        }
        return JSON.parse(listStr);

    },
    removeList(key) {

        if (!key) {
            return;
        }
        let nowCd = null;
        try {
            let list = this.getList() || [];
            list.find((item, cd) => {
                if (item.random == key) {
                    nowCd = cd;
                    return item;
                }
            });

            if (nowCd !== null) {
                list.splice(nowCd, 1);
            }
            localStorage.setItem(listKey, JSON.stringify(list));
        } catch (error) { }
    },
    getLocal(){
        return localStorage.getItem(localKey);
    },

    setLocal(type="en"){
        return localStorage.setItem(localKey,type);
    }

}
export default localstorage;