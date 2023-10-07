
import { Message } from "element-ui";
import i18n from '@/lang'

import Web3 from "web3"
import utils from "@/utils/utils";
import { ethers } from "ethers"
var Tx = require('ethereumjs-tx');
import rpcApi from "@/api/rpc.js"
import { getAddress as getprefixAddress, toAddress, splitAddress } from "@prefixConfig"

const netUrl = window.$config.netUrl
const netId = window.$config.netId
const webSdk = {
    typeHandle: {
        "device_address": { type: "address" },
        "revenue_address": { type: "address" },
        "contractAddr": { type: "address" },
        "signaddr": { type: "address" },
        // "rent_hash": { type: "address" },
        "dayPrice": { type: "number", decimals: 18 },
        "blockNumber": { type: "block" },
        "capacity": { type: "number", aFun(val) { return utils.storage(val, 'g-b'); } },
        "surplus_capacity": { type: "number", aFun(val) { return utils.storage(val, 'g-b'); } },
        "pledgeAmount": { type: "number", decimals: 18 },
        "storagePool": { type: "address" },
        manage_addr: { type: "address" },
    },

    typeJson: {
        streq: { first: "UTG:1:stReq", assembly: ["first", "device_address", "dayPrice", "capacity", "block", "nonce", "block_hash", "verification", "bandwidth", "pledgeRatio", "ratio"] },
        streplace:{ first: "UTG:1:streplace",assembly: ["first", "device_address", "capacity",  "block", "nonce", "block_hash","verification"] },
        // streq: { first: "UTG:1:stReq", assembly: ["first", "device_address", "dayPrice", "capacity", "height", "blockNumber", "root_hash", "verification", "bandwidth"] },
        strentpg: { first: "UTG:1:stRentPg", assembly: ["first", "device_address", "rent_hash", "capacity", "verification", "surplus_capacity", "surplus_verification"] },
        strentnewpg: { first: "UTG:1:stReNewPg", assembly: ["first", "device_address", "rent_hash", "capacity", "verification"] },

        stexit: { first: "UTG:1:stExit", assembly: ["first", "device_address"] },
        bind: { first: "UTG:1:Bind", assembly: ["first", "device_address", "type", "contractAddr", "signaddr", "revenue_address"] },
        rebind: { first: "UTG:1:Rebind", assembly: ["first", "device_address", "type", "contractAddr", "signaddr", "revenue_address"] },
        unbind: { first: "UTG:1:Unbind", assembly: ["first", "device_address", "type"] },
        chPrice: { first: "UTG:1:chPrice", assembly: ["first", "device_address", "dayPrice"] },

        chbw: { first: "UTG:1:chbw", assembly: ["first", "device_address", "bandwidth"] },

        stcatchup: { first: "UTG:1:stCatchUp", assembly: ["first", "device_address"] },
       
        stwtreward: { first: "UTG:1:stwtreward", assembly: ["first", "device_address", "ratio"] },
        stchpg: { first: "UTG:1:stchpg", assembly: ["first", "device_address", "pledgeAmount"] },
        setsp: { first: "UTG:1:setsp", assembly: ["first", "device_address", "storagePool"] },
        editmgaddr: { first: "UTG:1:editmgaddr", assembly: ["first", "device_address", "manage_addr"] },
        exitsp: { first: "UTG:1:exitsp", assembly: ["first", "device_address"] },
     

    },
    async dataUtil(assemblyJson = {}, datas = {}, additional) {

        let assembly = assemblyJson.assembly
        let from = webSdk.sdkUtils.getSelectAddress()
        let first = assemblyJson.first
        let dataL = {
            first
        }
        Object.assign(dataL, datas);




        let data = ""
        for (let cd = 0; cd < assembly.length; cd++) {
            let key = assembly[cd]
            let valL = dataL[key]

            let handleImte = webSdk.typeHandle[key];

            if (handleImte) {

                switch (handleImte.type) {
                    case "block":
                        valL = parseInt(await rpcApi.blockNumber(), 16);
                        break;
                    case "number":
                        valL = handleImte.aFun ? handleImte.aFun(valL) : valL
                        valL = utils.toNumber(valL * (handleImte.times || 1), handleImte.decimals || 0);
                        break;
                    case "address":
                        valL = splitAddress(valL).value.toLocaleLowerCase()
                        break;
                }
            }

            data += data.length > 0 ? (':' + valL) : valL;
        }

        let u = ethers.utils;
        let dataHash = u.hexlify(u.toUtf8Bytes(data))
        console.log(data)
        return {
            from,
            to: from,//u.getAddress(bossAddr),
            value: "0",//val._hex,
            data: dataHash
        }
    },
    sdkUtils: {
        networkChanged: function (fun) {
            if (window.ethereum) {
                window.ethereum.on("chainChanged", (networkIDstring) => {
                    fun(networkIDstring)
                });
            }

        },
        netWorkOk() {
            if (!window.ethereum) {
                return false;
            }

            let netIdInt = parseInt(netId, 16);
            let netIdIntL = parseInt(window.ethereum.chainId || "0");
            return netIdInt == netIdIntL
        },



        accountsChanged: function (fun) {
            if (window.ethereum && window.ethereum.on) {
                window.ethereum.on("accountsChanged", (accounts) => {

                    fun(accounts[0])
                });

            }
        },



        async getEnable(funL) {
            if (!window.ethereum) {
                Message.error(`Please install wallet first`)
                return new Promise((resolve, reject) => {
                    reject()

                });

            }




            return new Promise((resolve, reject) => {
                let rpcUrls = []
                if (netUrl.indexOf("https") < 0) {
                    rpcUrls.push(netUrl.replace("http", "https"))
                }
                rpcUrls.push(netUrl);
                let AddEthereumChainParameter = [{
                    chainId: netId,// A 0x-prefixed hexadecimal string
                    chainName: "UTG",
                    nativeCurrency: {
                        name: "UTG",
                        symbol: "UTG", // 2-6 characters long
                        decimals: 18,
                    },
                    rpcUrls: rpcUrls,

                }]
                let netIdInt = parseInt(netId, 16);
                window.ethereum.request({
                    method: 'eth_requestAccounts'
                }).then((addr) => {
                    if (webSdk.sdkUtils.netWorkOk()) {
                        resolve(addr);
                    } else {
                        window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: netId }],
                        }).then(() => {
                            resolve(addr);
                        }).catch((err) => {
                            window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: AddEthereumChainParameter,
                            }).then(response => {
                                resolve(response);
                            }).catch(err => {
                                console.error("changeNOt", err)
                                Message.error(`Add Network RPC Url：${netUrl} \n chainId：${netIdInt}`);
                                reject(err)
                            })
                        });

                    }


                }).catch(err => {
                    reject(err);
                })
                resolve();
            })

        },

        async erc20Sign(json, value) {
            return new Promise((resolve, reject) => {
                let jsonL = {
                    data: json.data,
                    to: json.to,
                    value
                }
                this.aOri("erc20Sign", "erc20SginResult", JSON.stringify(jsonL), (hash) => {
                    resolve(hash || {})
                })

            });
        },


        getSelectAddress() {
            if (window.ethereum) {

                let address = ""
                if (window.ethereum.selectedAddress) {
                    address = window.ethereum.selectedAddress;
                } else
                    if (window.ethereum.address) {
                        address = window.ethereum.address;
                    }
                    else
                        if (window.web3.currentProvider.address) {
                            address = window.web3.currentProvider.address;
                        }

                return address;
            } else {
                return ""
            }


        },

        hashToNX(valHex, dFix = false, toLow = false) {

            let address = toAddress(valHex)
            if (dFix) {
                address = splitAddress(address).value;
            }
            if (dFix || toLow) {
                address = address ? address.toLocaleLowerCase() : address;
            }

            return address
        },





    },


    sdk: class {
        constructor(bassContract) {
            this.bassContract = bassContract;
        }

        personalSign(message, address) {
            return new Promise((resolve, reject) => {
                address = getprefixAddress(address);
                this.bassContract.currentProvider.request({
                    method: "personal_sign",
                    params: [message, address],
                })
                    .then((sign) => {
                        resolve({ sign, address });
                    })
                    .catch((err) => {
                        reject(err);
                    });


            })
        }

        getBalance() {
            let address = webSdk.sdkUtils.getSelectAddress();
            // let provider = this.bassContract.active_WalletOrSigner.provider.provider//

            //   let request = { "method": "eth_getBalance", "params": [address, "latest"] }


            return new Promise((resolve, reject) => {

                this.bassContract.active_WalletOrSigner.provider.getBalance(address).then(response => {
                    resolve(ethers.utils.formatUnits(response));

                }).catch(err => {
                    reject(err)
                })
            })
        }



        getRpcData(obj) {
            if (!utils.isEmpty(obj.result)) {
                return obj.result
            }
            if (obj.data && !utils.isEmpty(obj.data.result)) {
                return obj.data.result
            }
            return "0x0"

        }
        buf2hex(buffer) {
            return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
        }
        async transactionSing(json, _that_) {


            try {
                let bassContract = this.bassContract;
                //  let currentProvider = new Web3.providers.HttpProvider('http://localhost:8545');
                let provider = bassContract.currentProvider || window.web3.currentProvider// this.bassContract.active_WalletOrSigner.provider//

                let web3 = new Web3(provider, null, { transactionConfirmationBlocks: 1 })
                const web3Private = web3// privateChainWeb3;

                let gasPrice = await (_that_ ? _that_.$api.rpc.getGasPrice() : web3.eth.getGasPrice());

                gasPrice = this.getRpcData(gasPrice)// gasPrice.data && !utils.isEmpty(gasPrice.data.result) ? gasPrice.data.result : "0x0"

                let nonce = await (_that_ ? _that_.$api.rpc.nonce(json.from) : web3Private.eth.getTransactionCount(json.from));
                nonce = this.getRpcData(nonce)// nonce.data && !utils.isEmpty(nonce.data.result) ? nonce.data.result : "0x0"
                // let netIdInt = parseInt(netId, 16);

                const rawTx = {
                    nonce: nonce,//web3.utils.toHex(
                    gasPrice: gasPrice,//web3.utils.toHex(
                    // gasLimit: gasLimit,
                    to: json.to,
                    value: json.value,
                    data: json.data,
                    from: json.from,
                    chainId: json.chainId,
                };


                let gasLimit = await (_that_ ? _that_.$api.rpc.estimateGas(rawTx) : web3.eth.estimateGas({
                    to: json.to,
                    data: json.data,
                })
                )
                gasLimit = this.getRpcData(gasLimit)// gasLimit.data && !utils.isEmpty(gasLimit.data.result) ? gasLimit.data.result : "0x0"



                rawTx.gasLimit = rawTx.nonce
                rawTx.nonce = rawTx.gasPrice;
                rawTx.gasPrice = gasLimit
                var tx = new Tx(rawTx);
                var hash = '0x' + this.buf2hex(tx.hash(false));
                return new Promise((resolve, reject) => {
                    let sign = web3.eth.sign


                    sign(hash, json.from, async (err, sign) => {
                        if (err) {
                            reject(err)
                            return
                        }

                        var r = sign.substring(2, 66);
                        var s = sign.substring(66, 66 + 64);
                        var v = sign.substring(66 + 64);
                        var sig = {
                            r: '0x' + r,
                            s: '0x' + s,
                            v: parseInt(v, 16),
                        }

                        if (tx._chainId > 0) {
                            sig.v += tx._chainId * 2 + 8;
                        }
                        Object.assign(tx, sig);


                        var serializedTx = tx.serialize();
                        let hashL = '0x' + serializedTx.toString('hex')

                        resolve(hashL)
                    })

                })
            } catch (error) {
                return new Promise((resolve, reject) => {
                    reject(error)
                });
            }
        }

        sendTransactionTo(assembly, datas, windata) {
            if (windata) {
                windata.subContext = `<span style='color:orange'>${i18n.t("messages.pleaseconfirm")} </span>`
            }

            return new Promise((resolve, reject) => {

                webSdk.dataUtil(assembly, datas).then(json => {
                    let dataL = {
                        method: 'eth_sendTransaction',
                        params: [json],
                    }

                    ethereum.request(dataL).then(response => {
                        if (windata) {
                            windata.subContext = `<span style='color:blue'>${i18n.t("messages.confirmed")}</span>`
                            windata.closebtnshow = windata.closebtnshow !== false
                        }

                        this.waitForTransaction(response).then(re => {

                            if (windata) {
                                windata.subContext = ""
                            }
                            resolve(re)
                        }).catch(err => {
                            if (windata) {
                                windata.subContext = ""
                            }
                            reject(err)
                        })

                    }).catch(err => {
                        if (windata) {
                            windata.subContext = ""
                        }
                        reject(err)
                    })
                }).catch(err => {
                    reject(err)
                })


            });


        }






        waitForTransactionHttp(_that_, hash) {
            return new Promise((resolve, reject) => {
                _that_.$api.rpc.waitForTransactionHttp(hash).then(res => {
                    resolve(res.data ? res.data.result : res.result)
                }).catch(err => {
                    reject(err)
                })
            });
        }




        waitForTransaction(hash) {
            return new Promise((resolve, reject) => {

                let provider = this.bassContract.active_WalletOrSigner.provider
                hash = getprefixAddress(hash);
                provider.waitForTransaction(hash, null, 120000)
                    .then((receipt) => {
                        if (receipt.status == 1) {
                            resolve(receipt)
                        } else {
                            reject(receipt);
                        }
                    })
                    .catch((err) => {
                        console.error("error", err)
                        reject(err);
                    });
            })
        }


    }

}




export default webSdk;