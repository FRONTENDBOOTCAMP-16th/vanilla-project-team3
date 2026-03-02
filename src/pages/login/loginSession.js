// 1. 외부 상수 가져오기
// 'LOGIN_AUTH_DATA'는 로컬 스토리지에서 유저 정보를 저장/조회할 때 사용하는 'Key(이름)' 값입니다.
import { LOGIN_AUTH_DATA } from '../../js/constants'
import { removeStorage } from '../../js/utils'

const SESSION_FLAG = 'session_active'

// 2. 전역 상태 변수 선언 (다른 파일에서 이 상태를 참조할 수 있도록 export)
export let isLoggedIn = false // 현재 로그인 여부 (true/false)
export let currentUser = null // 현재 로그인한 유저의 데이터 객체 (비로그인 시 null)

/**
 * 세션 초기화 함수: 브라우저가 열리거나 새로고침될 때 실행됩니다.
 * 로컬 스토리지에 저장된 유저 정보를 확인하여 상태를 복구합니다.
 */
export function initSession() {
  // 로컬 스토리지에서 'LOGIN_AUTH_DATA' 이름으로 저장된 문자열 데이터를 가져옵니다.
  const userData = localStorage.getItem(LOGIN_AUTH_DATA)
  const sessionActive = sessionStorage.getItem(SESSION_FLAG)

  if (userData && sessionActive) {
    isLoggedIn = true
    // 문자열 형태인 데이터를 자바스크립트 객체 형태로 변환하여 저장합니다.
    currentUser = JSON.parse(userData)
  } else {
    // 데이터가 없다면 (로그아웃 상태라면) 초기값으로 설정합니다.
    localStorage.removeItem(LOGIN_AUTH_DATA)
    isLoggedIn = false
    currentUser = null
  }
  // 현재 로그인 상태와 유저 정보를 반환합니다.
  return { isLoggedIn, currentUser }
}

/**
 * 로그아웃 함수: 저장된 세션 정보를 삭제하고 초기화합니다.
 */
export function logout() {
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

// 4. 모듈이 로드될 때 즉시 실행
// 이 파일이 import되는 순간 자동으로 현재 세션 상태를 파악합니다.
initSession()
