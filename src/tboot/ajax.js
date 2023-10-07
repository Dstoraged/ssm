import axios from 'axios'
import { Message } from 'element-ui';
import Cookies from 'js-cookie'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router/routers'
import qs from "qs"

let service = axios.create({
  baseURL: window.$config.baseUrl, //'http://192.168.100.83:8668/', //window.$config.baseURL,  
  timeout: window.$config.timeout,
  method: 'post',
  withCredentials: true,
  MixedContentMode: true,
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"//"text/html;charset=UTF-8"
})



service.interceptors.request.use(

  config => {
    /* if (getToken()) {
       config.headers['Authorization'] ="Bearer " +getToken()
       
     }*/
    if (config.method == "post") {
      config.headers["Content-Type"] = "application/json;  charset=UTF-8"
    } else if (config.method == "post_form") {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8"//"application/json;  charset=UTF-8"//
      config.data = qs.stringify(config.data);
      config.method = "post"
    }


    //




    return config
  },
  error => {
    Promise.reject(error)
  }
)

// respone interceptor
service.interceptors.response.use(
  response => {
    if (window.$config.ajaxRe) {

      return response && response.data ? response.data : response


    }


    const res = response.data

    let code = res.statusCode || res.result || res.status || 0

    if (code !== 0 && code !== 0 && code !== 200) {
      Message({
        message: res.message || "",
        type: 'error'
      });


      if (code === 402) {
      
        removeToken();
        Cookies.set('point', 402)
        router.push({ path: '/login' })
      }

      return Promise.reject(res)

    } else if (res.errMessage) {
      console.error(res.errMessage)
      this.$message({
        message: res.errMessage || "",
        type: 'warning'
      });


    }

    return response.data

  },
  error => {
    let code = error.response ? error.response.status : 0
    if (code === 402) {

  
      removeToken();
      Cookies.set('point', 402)
      router.push({ path: '/login' })
    }
    return Promise.reject(error)
  }
)

export default service
