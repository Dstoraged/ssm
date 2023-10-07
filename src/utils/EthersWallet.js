import { Wallet } from 'ethers';
import Providers from './Providers.js';
 
export default class EthersWallet {
    constructor () {
        this.initProvider();
    }
 
    initProvider () {
        if (Providers.isMetaMaskProvider()) {
            throw Error( 'Please install wallet plug-in' );
        }
        
        this.provider = this.provider = Providers.createProvider();
      
        console.log( 'Please install wallet plug-in' );
    }
 
    generate_private_key_wallet ( private_key ) {
        return new Wallet( private_key, this.provider );
    }
    generate_mnemonric_wallet ( mnemonric, path = `m/44'/60'/0'/0/0` ) {
       
        return Wallet.fromMnemonic( mnemonric, path ).connect( this.provider );
    }
    async generate_keystore_wallet ( keystore_json_string, password, progressCallback = null ) {
       
        let off_wallet = await Wallet.fromEncryptedJson( keystore_json_string, password, progressCallback );
        return off_wallet.connect( this.provider );
    }
 
    create_new_wallet () {
        return Wallet.createRandom().connect( this.provider );
    }
}
