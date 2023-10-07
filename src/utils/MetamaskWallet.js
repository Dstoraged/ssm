import Providers from './Providers';
 
export default class MetamaskWallet {
    constructor () {
        this.initProvider();
        this.signer = this.provider.getSigner();
    
        this.currentProvider=this.provider.provider
    }
 
    initProvider () {
        if (!Providers.isMetaMaskProvider()) {
            throw Error( 'Please install wallet plug-in' );
        }
        this.provider = Providers.createProvider();
        
    }
}