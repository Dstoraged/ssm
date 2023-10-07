import { ethers } from 'ethers';
 
export default class Providers {
 
    static isMetaMaskProvider () {
        //DOTO dapps
        return Boolean( window.web3 && window.web3.currentProvider );
    }
 
    static createProvider () {
        if (Providers.isMetaMaskProvider()) {
          
            return new ethers.providers.Web3Provider( window.web3.currentProvider );
            
        } else {
            alert("Please install wallet plug-in")
        }
    }
}
