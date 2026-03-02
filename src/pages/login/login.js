// const baseURL = import.meta.env.VITE_BASE_URL
import { getUser } from '../../../api/api'
import { ID, LOGIN_AUTH_DATA } from '../../js/constants'

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

init()

function init() {
  bindEvent()
}

function bindEvent() {
  if (form) {
    form.addEventListener('submit', (e) => e.preventDefault())
    form.addEventListener('input', handleFormChange)
    form.addEventListener('click', handleFormClick)
  }
}

function handleFormClick(e) {
  const target = e.target.closest('.submit-button')

  if (target) {
    e.preventDefault()

    // 아이디와 비밀번호 입력 되었을 시 로그인
    checkeEmailPassword()
  }
}

// 버튼 스타일 적용
function handleFormChange() {
  if (id.value && password.value) {
    login.setAttribute('aria-disabled', 'false')
  } else {
    login.setAttribute('aria-disabled', 'true')
  }
}

// 아이디과 비밀번호 확인
async function checkeEmailPassword() {
  console.log('체크 함수 실행됨')
  const resultID = await getUser(ID, id.value)

  // 가입 정보가 없는 아이디
  if (!resultID) {
    // 마크업의 hidden을 css의 style.visibility로 수정
    // noti.hidden = false
    noti.style.visibility = 'visible'
    return
  }

  const isPassword = resultID.password === password.value
  console.log('isPassword:', isPassword)

  // 비밀번호가 틀린 경우
  if (!isPassword) {
    // 마크업의 hidden을 css의 style.visibility로 수정
    // noti.hidden = false
    noti.style.visibility = 'visible'
    return
  }

  // 전부 통과한 경우
  noti.hidden = true
  isLogin(resultID, isPassword)
}

// 로그인 후 메인페이지로 이동
async function isLogin(resultID, resultPassword) {
  console.log('isLogin 실행됨', resultID, resultPassword)
  if (resultID && resultPassword) {
    // 비밀번호를 제외한 user 전체 데이터 객체를 저장
    const safeUserData = { ...resultID }
    delete safeUserData.password

    localStorage.setItem(LOGIN_AUTH_DATA, JSON.stringify(safeUserData))
    sessionStorage.setItem(SESSION_FLAG, 'true')
    alert('로그인을 성공하였습니다.')
    // window.location.href = `${baseURL}/index.html`
    window.location.href = `/index.html`
  }
}
