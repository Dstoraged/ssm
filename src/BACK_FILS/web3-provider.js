"use strict";
import { deepCopy, defineReadOnly } from "@ethersproject/properties";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
import { JsonRpcProvider } from "./json-rpc-provider";
let _nextId = 1;
function buildWeb3LegacyFetcher(provider, sendFunc) {
    const fetcher = "Web3LegacyFetcher";
    return function (method, params) {
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && (provider.isMetaMask || provider.isStatus)) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        const request = {
            method: method,
            params: params,
            id: (_nextId++),
            jsonrpc: "2.0"
        };
        return new Promise((resolve, reject) => {
            this.emit("debug", {
                action: "request",
                fetcher,
                request: deepCopy(request),
                provider: this
            });
            sendFunc(request, (error, response) => {
                if (error) {
                    this.emit("debug", {
                        action: "response",
                        fetcher,
                        error,
                        request,
                        provider: this
                    });
                    return reject(error);
                }
                this.emit("debug", {
                    action: "response",
                    fetcher,
                    request,
                    response,
                    provider: this
                });
                if (response.error) {
                    const error = new Error(response.error.message);
                    error.code = response.error.code;
                    error.data = response.error.data;
                    return reject(error);
                }
                resolve(response.result);
            });
        });
    };
}
function buildEip1193Fetcher(provider) {
    return function (method, params) {
        if (params == null) {
            params = [];
        }
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && (provider.isMetaMask || provider.isStatus)) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        const request = { method, params };
        this.emit("debug", {
            action: "request",
            fetcher: "Eip1193Fetcher",
            request: deepCopy(request),
            provider: this
        });
        //DOTO Dapps
        if (window.ethereum.isIeMetas||window.ethereum.isIeTest) {
            

            provider._request = function (e) {

                var t = this, s = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                return this.idMapping.tryIntifyId(e),
                    this.isDebug && console.info("==> _request payload ".concat(JSON.stringify(e))),
                    new Promise(function (n, r) {
                        let mL = (e.id || (e.id = _utils.
                            default.genId()), t.callbacks.set(e.id,
                                function (e, t) {
                                    e ? r(e) : n(t)
                                }), t.wrapResults.set(e.id, s), e.method);
                    
                      
                        switch (mL) {
                            case "eth_accounts":
                                return t.sendResponse(e.id, t.eth_accounts());
                            case "eth_coinbase":
                                return t.sendResponse(e.id, t.eth_coinbase());
                            case "net_version":
                                return t.sendResponse(e.id, t.net_version());
                            case "eth_chainId":
                                return t.sendResponse(e.id, t.eth_chainId());
                            case "eth_sign":
                                return t.eth_sign(e);
                            case "personal_sign":
                                return t.personal_sign(e);
                            case "personal_ecRecover":
                                return t.personal_ecRecover(e);
                            case "eth_signTypedData_v3":
                                return t.eth_signTypedData(e, !1);
                            case "eth_signTypedData":
                            case "eth_signTypedData_v4":
                                return t.eth_signTypedData(e, !0);
                            case "eth_sendTransaction":
                                return t.eth_sendTransaction(e);
                            case "eth_requestAccounts":
                                return t.eth_requestAccounts(e);
                            case "wallet_watchAsset":
                                return t.wallet_watchAsset(e);
                            case "wallet_addEthereumChain":
                                return t.wallet_addEthereumChain(e);
                         /*   case "eth_getTransactionReceipt":
                           // return t.postMessage("ethRequest", e.id, e.params[0]);
                            case "eth_newFilter":
                            case "eth_newBlockFilter":
                            case "eth_newPendingTransactionFilter":
                            case "eth_uninstallFilter":
                            case "eth_subscribe":
                                throw new _error.
                                    default(4200, "Trust does not support calling ".concat(e.method, ". Please use your own solution"));
                            default:
                                return t.callbacks.delete(e.id),
                                    t.wrapResults.delete(e.id),
                                    t.rpc.call(e).then(function (e) {
                                        t.isDebug && console.log("<== rpc response ".concat(JSON.stringify(e))),
                                            n(s ? e : e.result)
                                    }).
                                        catch(r)*/
                            default:
                                return t.postMessage("ethRequest", e.id, e);


                        }
                    })
            }


        }
        return provider.request(request).then((response) => {
            this.emit("debug", {
                action: "response",
                fetcher: "Eip1193Fetcher",
                request,
                response,
                provider: this
            });
            return response;
        }, (error) => {
            this.emit("debug", {
                action: "response",
                fetcher: "Eip1193Fetcher",
                request,
                error,
                provider: this
            });
            throw error;
        });
    };
}
export class Web3Provider extends JsonRpcProvider {
    constructor(provider, network) {
        logger.checkNew(new.target, Web3Provider);
        if (provider == null) {
            logger.throwArgumentError("missing provider", "provider", provider);
        }
        let path = null;
        let jsonRpcFetchFunc = null;
        let subprovider = null;
        if (typeof (provider) === "function") {
            path = "unknown:";
            jsonRpcFetchFunc = provider;
        }
        else {
            path = provider.host || provider.path || "";
            if (!path && provider.isMetaMask) {
                path = "metamask";
            }
            subprovider = provider;
            if (provider.request) {
                if (path === "") {
                    path = "eip-1193:";
                }
                jsonRpcFetchFunc = buildEip1193Fetcher(provider);
            }
            else if (provider.sendAsync) {
                jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.sendAsync.bind(provider));
            }
            else if (provider.send) {
                jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.send.bind(provider));
            }
            else {
                logger.throwArgumentError("unsupported provider", "provider", provider);
            }
            if (!path) {
                path = "unknown:";
            }
        }
        super(path, network);
        defineReadOnly(this, "jsonRpcFetchFunc", jsonRpcFetchFunc);
        defineReadOnly(this, "provider", subprovider);
    }
    send(method, params) {
        return this.jsonRpcFetchFunc(method, params);
    }
}
//# sourceMappingURL=web3-provider.js.map