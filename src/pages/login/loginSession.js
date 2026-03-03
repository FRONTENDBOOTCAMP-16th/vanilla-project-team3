import { LOGIN_AUTH_DATA } from '../../js/constants'
import { removeStorage } from '../../js/utils'
import { UserAPI } from '../../../api/api'

const SESSION_FLAG = 'session_active'

export let isLoggedIn = false
export let currentUser = null

/**
 * 세션 초기화 함수: 브라우저가 열리거나 새로고침될 때 실행됩니다.
 * 로컬 스토리지에 저장된 유저 정보를 확인하여 상태를 복구합니다.
 */
export function initSession() {
  const userData = localStorage.getItem(LOGIN_AUTH_DATA)
  const sessionActive = sessionStorage.getItem(SESSION_FLAG)

  if (userData && sessionActive) {
    isLoggedIn = true
    currentUser = JSON.parse(userData)
  } else {
    isLoggedIn = false
    currentUser = null
  }
  return { isLoggedIn, currentUser }
}

/**
 * 로그아웃 함수: 저장된 세션 정보를 삭제하고 초기화합니다.
 */
export async function logout() {
  const userData = JSON.parse(localStorage.getItem(LOGIN_AUTH_DATA) || '{}')
  if (userData.id) {
    await UserAPI.updateUserData(userData.id, {
      ...userData,
      isLoggedIn: false,
    })
  }

  // 1. 로컬 스토리지에서 유저 정보를 삭제합니다.
  localStorage.removeItem(LOGIN_AUTH_DATA)

  // 2. 메모리 상의 전역 변수들을 초기화합니다.
  sessionStorage.removeItem(SESSION_FLAG)
  isLoggedIn = false
  currentUser = null
  removeStorage('genrePreference')

  alert('로그아웃 되었습니다.')

  // 3. 페이지를 메인 화면으로 이동시킵니다.
  // 새로고침이 일어나면서 아래의 initSession()이 다시 실행되고,
  // 데이터가 없으므로 비회원 상태로 화면이 그려지게 됩니다.
  window.location.href = '/index.html'
}

initSession()
