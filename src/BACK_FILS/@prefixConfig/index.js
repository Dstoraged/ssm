
var { ethers } = require("ethers")
const defaultFixs = "0x"
const MAINFIX = "ux"
const MAINNETID = 1337
const prefixs = ['nx', 'NX', 'ux', 'UX', '0x']

const getAddress = function (address, format = false) {
    if (typeof (address) !== "string") {
        return address
    }
    if (address.length < 2) {
        return address
    }
    if (prefixs.includes(address.substring(0, 2))) {
        address = address.slice(2);
    }
    if (prefixs.includes(address.substring(0, 2))) {
        address = address.slice(2);
    }
    if(address){
        address = defaultFixs + address
    }
    
    if (format) {
        return ethers.utils.getAddress(address)
    } else {
        return address;
    }

}

const toAddress = function (address) {
    if (typeof (address) !== "string") {
        return address
    }

    if (prefixs.includes(address.substring(0, 2))) {
        address = address.slice(2);
    }
    if (prefixs.includes(address.substring(0, 2))) {
        address = address.slice(2);
    }
    address = MAINFIX + address
    return address;
}
const splitAddress = function (address) {
    let result = { value: address, fix: defaultFixs }
    if (typeof (address) !== "string" || address.length < 2) {

        return result
    }
    let fix = address.substring(0, 2);
    if (prefixs.includes(fix)) {
        result.value = address.slice(2)
        result.fix = fix
    }

    return result;
}

const combineAddress = function (address, fix) {
    if (typeof (address) !== "string" || address.length < 2) {

        return address
    }
    let fixL = address.substring(0, 2);
    if (prefixs.includes(fixL)) {
        address = fix + address.slice(2)
    } else {
        fix + address
    }
    return address
}
const addressIncludes = function (arr, addr) {
    return arr.find(item => {
        if (splitAddress(item.toLowerCase()).value == splitAddress(addr.toLowerCase())) {
            return item
        }
    })
}

module.exports = { getAddress, toAddress, splitAddress, combineAddress, addressIncludes, prefixs, MAINFIX }

