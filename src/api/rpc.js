import request from "@/tboot/ajax.js"
import { newdata } from "./core"

const rpcBaseUrl = window.$config.rpcBaseUrl;
const rpcUrl = '/oldbl/oldNfcTransit'
const rpc = {}

rpc.balance = function (addr) {
    let datat = { "jsonrpc": "2.0", "method": "eth_getBalance", "params": [addr, "latest"], "id": 1 }

    const data = newdata({ transit: JSON.stringify(datat) })
    return request({
        baseURL: rpcBaseUrl,
        url: rpcUrl,
        method: 'post',
        data: data

    })


}
rpc.nonce = function (addr) {
   
    return ethereum.request({
        method: 'eth_getTransactionCount',
        params: [addr, "latest"]
    })
    /*let datat= {"jsonrpc":"2.0","method":"eth_getTransactionCount","params":[addr,"latest"],"id":1}

    const data = newdata({transit:JSON.stringify(datat)})
    return request({
        baseURL:rpcBaseUrl,
        url: rpcUrl,
        method: 'post',
        data:data
        
    })*/
}

rpc.blockNumber = function () {
      return  ethereum.request({
            method: 'eth_blockNumber',
            params: []
        })

}

rpc.blockHash= function (block) {
    //DOTO Dapps
    if(ethereum.isIeMetas){
        block=`${parseInt(block)}`
    }
    return new Promise((resolve, reject) => {
        
        ethereum.request({
            method: 'eth_getBlockByNumber',
            params: [block,false]
        }).then(response => {
          
            try {
                if((typeof response )=="string"){
                    response=JSON.parse(response)
                }
              } catch (error) {
                
              }
           
            resolve(response)
        }).catch(err => {
            reject(err)
        })

    });

}



rpc.estimateGas = function (dataL) {
    let datat = { "jsonrpc": "2.0", "method": "eth_estimateGas", "params": [dataL], "id": 73 };

    const data = newdata({ transit: JSON.stringify(datat) })
    return request({
        baseURL: rpcBaseUrl,
        url: rpcUrl,
        method: 'post',
        data: data
    })
}


rpc.getGasPrice = function () {
    let datat = { "jsonrpc": "2.0", "method": "eth_gasPrice", "params": [], "id": 73 }

    const data = newdata({ transit: JSON.stringify(datat) })
    return request({
        baseURL: rpcBaseUrl,
        url: rpcUrl,
        method: 'post',
        data: data

    })
}


rpc.transaction = function (hash) {
    let datat = { "jsonrpc": "2.0", "method": "eth_sendRawTransaction", "params": [hash], "id": 1 }

    const data = newdata({ transit: JSON.stringify(datat) })
    return request({
        baseURL: rpcBaseUrl,
        url: rpcUrl,
        method: 'post',
        data: data
    })
}

rpc.waitForTransactionHttp = function (hash) {
    let datat = { "jsonrpc": "2.0", "method": "eth_getTransactionReceipt", "params": [hash], "id": 1 }

    const data = newdata({ transit: JSON.stringify(datat) })
    return request({
        baseURL: rpcBaseUrl,
        url: rpcUrl,
        method: 'post',
        data: data
    })
}




export default rpc;
