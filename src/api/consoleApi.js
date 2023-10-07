import request from "@/tboot/ajax.js"
import { newdata } from "./core"


const consoleApi = {}

consoleApi.getStorageRentList = function (query) {
    return request({
        url: "/platform/getStorageRentList",
        method: 'post',
        data: query
    })
}


consoleApi.getStorageSpaceList = function (query) {
    return request({
        url: "/platform/getStorageSpaceList",
        method: 'post',
        data: query
    })
}



consoleApi.tablePage = function (query) {


    return request({
        //getStorageRentList
        url: "/platform/getStorageRequestList",
        method: 'post',
        data: query
    })


}
consoleApi.getRentInfo = function (data) {
    return request({
        url: "/platform/getStorageRentInfo",
        method: 'post_form',
        data

    })
}

consoleApi.ConfigList = function (type = 'w') {
    switch (type) {
        case 'w':
            type = 'bandwidth'
            break;

        case 's':
            type = 'storage'
            break;
    }
    return request({
        url: `/platform/getStorageConfigList?type=${type}`,
        method: 'get'
    })


}
consoleApi.getMiner = function (miner_addr) {
    let data = { miner_addr }
    return request({

        url: "/platform/my/getminerdetail",
        method: 'post',
        data

    })
}

consoleApi.getStorageRevenueInfo = function (revenue_addr) {
    let data = { revenue_addr }
    return request({

        url: "/platform/getStorageRevenueInfo",
        method: 'post',
        data

    })
}


consoleApi.updateStorageRentAttach = function (data) {
    return request({
        url: "/platform/updateStorageRentAttach",
        method: 'post_form',
        data

    })
}


consoleApi.updateStorageSpaceAttach = function (data) {
    return request({
        url: "/platform/updateStorageSpaceAttach",
        method: 'post_form',
        data

    })
}


consoleApi.getStoragePoolList = function (query) {
    return request({
        url: "/spPool/getStoragePoolList",
        method: 'post',
        data: query
    })
}


export default consoleApi