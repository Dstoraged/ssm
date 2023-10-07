import request from "@/tboot/ajax.js"
import { newdata } from "./core"

const home = {}

home.getStorageSpaceInfo = function (device_addr) {

    let data= {device_addr} //newdata({device_addr})
    return request({
     
        url: "/platform/getStorageSpaceInfo",
        method: 'post_form',
        data

    })


}

home.getStorageRewardList = function (data) {

    //let data= {address,revenueAddress} //newdata({device_addr})
    return request({
     
        url: "/platform/getStorageRewardList",
        method: 'post',
        data

    })


}

export default home