import { LOGIN_AUTH_DATA } from '../../js/constants'

export let isLoggedIn = false
export let currentUser = null

export function initSession() {
  const userData = localStorage.getItem(LOGIN_AUTH_DATA)

  if (userData) {
    isLoggedIn = true
    currentUser = JSON.parse(userData)
  } else {
    isLoggedIn = false
    currentUser = null
  }
  return { isLoggedIn, currentUser }
}

export function logout() {
  localStorage.removeItem(LOGIN_AUTH_DATA)
  isLoggedIn = false
  currentUser = null

  alert('로그아웃 되었습니다.')
  // 페이지를 새로고침(이동)하면 home.js가 실행되면서
  // 자연스럽게 renderLoggedInDisplay가 비회원 모드로 그려집니다.
  window.location.href = '/index.html'
}

initSession()
