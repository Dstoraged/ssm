

import request from "@/tboot/ajax.js"


const pledge = {}

pledge.getSet = function () {

    let data = {} //newdata({device_addr})
    return request({

        url: "/platform/getStorageBasicSet",
        method: 'post_form',
        data

    })


}

pledge.getVolume = function (data) {


    return request({

        url: "/platform/predictStoragePledgeAmount",
        method: 'post',
        data

    })
}
export default pledge