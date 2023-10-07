import ajax from '@/utils/ajax'

const witUrl = window.$url.BASE_URL
const userUrl = window.$url.USER_URL
const miningUrl=window.$url.MINING_URL

const exchangeUrl=window.$url.EXCHGE_URL
export function post(uri, params, type = 0) {
  return ajax.post(witUrl + uri, params)
}

export function postJson(uri, params, type = 0) {
  return ajax.postJson(witUrl + uri, params)
}

export function get(uri, params, type = 0) {
  return ajax.get(witUrl + uri, params)
}

export function userPost(uri, params, type = 0) {
  return ajax.post(userUrl + uri, params)
}

export function userPostJson(uri, params, type = 0) {
  return ajax.postJson(userUrl + uri, params)
}

export function userGet(uri, params, type = 0) {
  return ajax.get(userUrl + uri, params)
}


export function miningPost(uri, params, type = 0) {
  return ajax.post(miningUrl + uri, params)
}

export function miningPostJson(uri, params, type = 0) {
  return ajax.postJson(miningUrl + uri, params)
}

export function miningGet(uri, params, type = 0) {
  return ajax.get(miningUrl + uri, params)
}

export function exchangePostJson(uri, params, type = 0) {
  return ajax.postJson(exchangeUrl + uri, params)
}