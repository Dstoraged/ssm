import Vue from 'vue'
import App from './App.vue'
import Vant from 'vant';
import api from './api/index.js'
import 'vant/lib/index.css';
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router/routers'
import VueClipboard from 'vue-clipboard2'
import './router/index'
import i18n from './lang'
import utils from './utils/utils'
//import locale from 'element-ui/lib/locale/lang/en'
Vue.prototype.$api=api;
Vue.config.productionTip = false
Vue.use(ElementUI);//, { locale }
Vue.use(Vant);
Vue.use(VueClipboard)

Vue.prototype.$IEDATA={
  capacity:"GB",
  currency:"SRT",
  suffix:"UTG",
  max_space:utils.storage(1,'e-b')
}

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})