import Vue from 'vue'
import VueI18n from 'vue-i18n'
// import Cookies from 'js-cookie'
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'// element-ui lang
import localstorage from "@/utils/localstorage.js"
import enLocale from './language_en'
import zhLocale from './language_zh'
import { getCookie } from '@/utils/auth'
// Vue.use(VueI18n)
//localStorage.setItem('locale_language', 'en')
Vue.use(VueI18n, {
  i18n: function (path, options) {
    const value = i18n.t(path, options)
    if (value !== null && value !== undefined) {
      return value
    }
    return ''
  }
})

const messages = {
  en: {
    ...enLocale,
    ...elementEnLocale
  },
  zh: {
    ...zhLocale,
    ...elementZhLocale
  }
}

const i18n = new VueI18n({
  locale:  localstorage.getLocal() || 'en',
  messages
})

export default i18n
