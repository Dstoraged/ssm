import axios from 'axios'
import { getToken } from '@/utils/auth' 

let service = axios.create({
  baseURL: window.$config.baseUrl, //'http://192.168.100.83:8668/', //window.$config.baseURL,  
  timeout: 20000,//window.$config.timeout,
  method: 'post',
  responseType: 'blob',
  withCredentials: true,
  MixedContentMode: true,
  // "Content-Type":"text/html;charset=UTF-8"
})



service.interceptors.request.use(

  config => {
    if (getToken()) {
      config.headers['Authorization'] ="Bearer " + getToken() 
      config.headers['token']="ABC"
    }
   


    // console.log('url: ' + config.url + ' param' + JSON.stringify(config.data))
    return config
  },
  error => {
    Promise.reject(error)
  }
)

// respone interceptor
service.interceptors.response.use(
  response => {
    return Promise.resolve(response)

  },
  error => {
    console.error(error.config.url, error)
    return Promise.reject(error)
  }
)

export default service
