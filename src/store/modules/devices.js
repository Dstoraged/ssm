
import utils from "@/utils/utils"
const wallet = {
  state: {
    device: {},
    deviceOk: false,
    incompletes: [],
    inrecovery:[],
    notPledges:[],
    voucherMap:{},
    incompleteMaps:{},
    inPledgeMaps:{},
    inWaitfors:[]
   
  },

  mutations: {

    SET_DEVICE: (state, data) => {
      let deviceOk = !!data;
      state.deviceOk = deviceOk;

      data = data || {}

      //DOTO--
      // data.volume = data.volume=="0" ? "100":data.volume
      let incompletes = [];
      let inrecovery=[];
      let inWaitfors=[];
      let incompleteMaps={};
      let voucherMap={}
      let inPledgeMaps={}
      let utg_rent_items = data.utg_rent_items || []
      utg_rent_items.forEach(item => {
        if(item.utg_need_retrieve_by_manual){
          inrecovery.push(item.utg_rent_voucher)
        }
        if(!item.utg_rent_onpledge&&!item.utg_need_retrieve_by_manual){
          inWaitfors.push(item.utg_rent_voucher)
        }

        if(item.utg_rent_onpledge){
          inPledgeMaps[item.utg_rent_voucher]=item;
        }
        else  {
          incompletes.push(item.utg_rent_voucher);
          incompleteMaps[item.utg_rent_voucher]=item;
        }

        

        voucherMap[item.utg_rent_voucher]=item
      })
      state.incompletes = incompletes;
      state.inrecovery=inrecovery;
      state.voucherMap=voucherMap;
      state.incompleteMaps=incompleteMaps;
      state.inPledgeMaps=inPledgeMaps;
      state.inWaitfors=inWaitfors;
      state.device = data
    }




  },
  actions: {
    setDevice({ commit }, obj) {
      commit('SET_DEVICE', obj)
    },


  }

}
export default wallet
