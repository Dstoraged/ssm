import EthersWallet from './EthersWallet';
import MetamaskWallet from './MetamaskWallet';
import Providers from './Providers';
import { ethers } from 'ethers';
 
export default class BassContract {
    constructor ( options) {
        this.initWallet( options );
        this.active_WalletOrSigner = this.signer || this.active_wallet||this.active_wallet_key;
    }
 
    initWallet (options={mnemonric:'',key:''} ) {
        if (Providers.isMetaMaskProvider()) {
            let metamaskWallet=new MetamaskWallet();
            this.signer = metamaskWallet.signer;
            
            this.currentProvider=metamaskWallet.currentProvider
        } else if(options.mnemonric) {
       
            this.active_wallet = new EthersWallet().generate_mnemonric_wallet( options.mnemonric );
        }else 
        if(options.key){
            this.active_wallet_key =new EthersWallet().generate_private_key_wallet(options.key)
        }else
        {
            alert("Please install wallet plug-in")
        }
    }
 
    createContract ( abi_data, bytecode ) {
        return new ethers.ContractFactory( abi_data, bytecode, this.active_WalletOrSigner );
    }
 
    createContractInstance ( contract_address, abi_data ) {
        return new ethers.Contract( contract_address, abi_data, this.active_WalletOrSigner );
    }
}
