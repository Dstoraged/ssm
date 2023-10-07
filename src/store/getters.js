const getters = {

  account: state => state.wallet.account,
  accounty: state => state.wallet.accounty,
  getsdk: state => state.wallet.sdk,
  publicWin:state => state.wallet.win,
  publicItem:state => state.wallet.item,
  typesColor:state => state.wallet.typesColor,
  typesText:state => state.wallet.typesText,
  getDevice:state => state.devices.device,
  deviceAddr:state => state.devices.device.utg_addr,
  deviceOk:state=> state.devices.deviceOk,
  incompletes:state=> state.devices.incompletes,
  inrecovery:state=> state.devices.inrecovery,
  incompleteMaps:state=>state.devices.incompleteMaps,
  inPledgeMaps:state=>state.devices.inPledgeMaps,
  voucherMap:state=> state.devices.voucherMap,
  inWaitfors:state=>state.devices.inWaitfors,
  makeUpWindow:state=>state.notice.makeUpWindow,
 
}
export default getters
