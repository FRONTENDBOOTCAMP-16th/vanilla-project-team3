// 1. 외부 모듈 및 설정값 가져오기
// const baseURL = import.meta.env.VITE_BASE_URL // (현재 주석 처리됨) 환경 변수에서 기본 URL을 가져오는 설정
import { getUser } from '../../../api/api' // 서버(또는 Mock API)에서 사용자 데이터를 가져오는 함수
import { ID, LOGIN_AUTH_DATA } from '../../js/constants' // 프로젝트 내에서 반복 사용되는 고정값(상수)들

const SESSION_FLAG = 'session_active'

// ✅ 추가: 페이지 로드 시 세션 플래그 확인 → 없으면 localStorage 초기화
if (!sessionStorage.getItem(SESSION_FLAG)) {
  localStorage.removeItem(LOGIN_AUTH_DATA)
}

const form = document.querySelector('.autu-box-container')
if (!form) throw new Error('문서에서 form을 찾을 수 없습니다.')
const id = form.querySelector('.id-box')
const password = form.querySelector('.pw-box')
const noti = form.querySelector('.noti-blank-warning')
const login = form.querySelector('.submit-button')

// 3. 실행 초기화
init()

/**
 * 초기 실행 함수: 이벤트를 바인딩합니다.
 */
function init() {
  bindEvent()
}

/**
 * 이벤트 바인딩 함수: 사용자의 입력이나 클릭을 감시합니다.
 */
function bindEvent() {
  if (form) {
    form.addEventListener('submit', (e) => e.preventDefault())
    form.addEventListener('input', handleFormChange)
    // 폼 내부의 클릭 발생 시 처리 (특히 로그인 버튼)
    form.addEventListener('click', handleFormClick)
  }
}

/**
 * 클릭 이벤트 핸들러: 클릭된 요소가 로그인 버튼인지 확인합니다.
 */
function handleFormClick(e) {
  const target = e.target.closest('.submit-button')

  if (target) {
    e.preventDefault()

    // 아이디와 비밀번호가 입력되었는지 확인 후 로그인 로직 실행
    checkeEmailPassword()
  }
}

/**
 * 실시간 입력 감지 함수: 버튼의 활성화/비활성화 상태를 시각적으로 제어합니다.
 * (aria-disabled 속성을 활용하여 웹 접근성을 고려함)
 */
function handleFormChange() {
  // 아이디와 비밀번호 입력창에 모두 값이 존재할 때
  if (id.value && password.value) {
    login.setAttribute('aria-disabled', 'false') // 버튼 활성화 상태 표시
  } else {
    login.setAttribute('aria-disabled', 'true') // 버튼 비활성화 상태 표시
  }
}

/**
 * 핵심 로직: 입력받은 정보와 저장된 유저 정보를 비교합니다.
 */
async function checkeEmailPassword() {
  // 1. 입력된 아이디를 기반으로 서버에서 유저 정보를 가져옴 (비동기 처리)
  console.log('체크 함수 실행됨')
  const resultID = await getUser(ID, id.value)

  // 2. 가입 정보가 없는 경우 (아이디가 존재하지 않음)
  if (!resultID) {
    // 경고 메시지를 화면에 표시함
    noti.style.visibility = 'visible'
    return // 함수 종료
  }

  // 3. 가져온 유저 데이터의 비밀번호와 입력한 비밀번호를 비교
  const isPassword = resultID.password === password.value
  console.log('isPassword:', isPassword)

  // 4. 비밀번호가 틀린 경우
  if (!isPassword) {
    // 경고 메시지를 화면에 표시함
    noti.style.visibility = 'visible'
    return // 함수 종료
  }

  // 5. 아이디와 비밀번호가 모두 일치하면 경고창을 숨기고 로그인 처리 진행
  noti.hidden = true
  isLogin(resultID, isPassword)
}

/**
 * 최종 로그인 처리: 로컬 스토리지에 세션을 저장하고 페이지를 이동시킵니다.
 */
async function isLogin(resultID, resultPassword) {
  console.log('isLogin 실행됨', resultID, resultPassword)
  if (resultID && resultPassword) {
    // 보안을 위해 비밀번호를 제외한 유저 전체 데이터 객체 복사
    const safeUserData = { ...resultID }
    delete safeUserData.password // 복사본에서 비밀번호 필드만 삭제

    // 로컬 스토리지(브라우저 저장소)에 유저 정보 저장 (JSON 문자열로 변환)
    localStorage.setItem(LOGIN_AUTH_DATA, JSON.stringify(safeUserData))

    sessionStorage.setItem(SESSION_FLAG, 'true')
    alert('로그인을 성공하였습니다.')

    // 메인 페이지로 이동 (index.html)
    window.location.href = `/index.html`
  }
}
