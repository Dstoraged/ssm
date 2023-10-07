import router from './routers'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import localstorage from "@/utils/localstorage.js";

//import { getToken } from '@/utils/auth' 


NProgress.configure({ showSpinner: false })// NProgress Configuration


router.beforeEach((to, from, next) => {
 
  let itemStr = localstorage.getItem();
  
  if (to.name == "login") {
    if (itemStr) {
      next("/");
    } else {
      next();
    }
  } else {
    if (itemStr) {
      next();
    } else {
      next({path:"/login"});
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

export const getRouter = function () {
  return router
}