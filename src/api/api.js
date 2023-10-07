
import ajax from "@/tboot/ajax.js"
//import {newdata} from "./core"

const baseUrl = window.$config.baseUrl
export function post(uri, params, type = 0) {
  return ajax({
    url: uri,
    method: 'post',
    data: params

  })
}

export function postJson(uri, params, type = 0) {

  return ajax({
    url: uri,
    method: 'post',
    data: params

  })
}

export function get(uri, params, type = 0) {
  return ajax({
    url: uri,
    method: 'get',
    data: params

  })
}

