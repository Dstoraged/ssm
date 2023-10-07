
import utils from "@/utils/utils"
import Vue from "vue"
const wallet = {
  state: {
    accounts: [],
    account: null,
    accounty: null,
    sdk: null,
    win: false,
    item: null,
    typesColor: {
      1: "blue",
      2: "green",
      0: "red",
      3: "blue"
    },
    typesText: {
      1: "loadingSubPan.loading",
      2: "loadingSubPan.finishText",
      0: "loadingSubPan.failure",
      3: "loadingSubPan.pleaseConfirm"
    }

  },

  mutations: {
    SET_ACCOUNT: (state, obj = {}) => {
      state.accounty = obj.account
      state.account = obj.account;

    },
    SET_SDK: (state, sdk) => {
      state.sdk = sdk
      if (!sdk) {
        state.account = ""
      }
    },
    SET_WIN_STATTUS: (state, show) => {
      state.win = !!show;
    },
    SET_NOTIFICATION: (state, data) => {

      try {
        if (utils.isEmpty(data.status)) {
          Vue.set(data, "status", 1);
        }
        Vue.set(data, "time", utils.formatTime(Date.now()));
        if (data.request.then) {
          data.request.then(response => {
            data.status = 2;
            try {
              data.success ? data.success(response) : null;
            } catch (error) {

              // data.err ? data.err(error) : null;
            }
          }).catch(err => {
            data.status = 0;
            data.err ? data.err(err) : null;
            let msg = "err"
            if (err) {

              if (err && err.code == 4001) {
                msg = `cancel`
              } else
                if (err.data && err.data.message) {
                  msg = err.data.message
                } else {
                  msg = err.message ? err.message : err;
                }

            }

            data.errMsg = msg

          })
        }

        state.item = data;
        state.win = true;
      } catch (error) {
        console.error(error)
      }
    },

  },
  actions: {
    setAccount({ commit }, obj) {
      commit('SET_ACCOUNT', obj)
    },
    setSdk({ commit }, sdk) {
      commit('SET_SDK', sdk)
    },
    setNotification({ commit }, data) {
      commit('SET_NOTIFICATION', data)
    },
    setWinStatus({ commit }, show) {
      commit('SET_WIN_STATTUS', show)
    }

  }

}
export default wallet
