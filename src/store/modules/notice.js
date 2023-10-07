
const wallet = {
    state: {

        makeUpWindow: true
    },

    mutations: {

        SET_MAKEUP: (state, makeUpWindow = false) => {
            state.makeUpWindow = makeUpWindow;
        }




    },
    actions: {
        setMakeUp({ commit }, makeUpWindow) {
            commit('SET_MAKEUP', makeUpWindow)
        },


    }

}
export default wallet
