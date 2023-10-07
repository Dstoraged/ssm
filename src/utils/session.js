import Config from '@/settings'

const TokenKey = Config.TokenKey

export function getToken () {
 
  const token = sessionStorage.getItem(TokenKey)
  // console.log('gettoken ' + token)
  return token
}

export function setToken (token, rememberMe) {
  console.log(rememberMe)
  // console.log('settoken ' + token)
  return sessionStorage.setItem(TokenKey, token)
}

export function removeToken () {
  return sessionStorage.removeItem(TokenKey)
}

export function set (key, value) {
  sessionStorage.setItem(key, value)
}

export function get (key) {
  const token = sessionStorage.getItem(key)
  return token
}

export function remove (key) {
  sessionStorage.removeItem(key)
}

export default { set, get, remove }