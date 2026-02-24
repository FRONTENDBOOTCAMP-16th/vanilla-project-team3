const baseURL = import.meta.env.VITE_BASE_URL
import { getUser } from '../../../api/api'
import { ID } from '../../js/constants'

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
    form.addEventListener('input', handleFormChange)
    form.addEventListener('click', handleFormClick)
  }
}

function handleFormClick(e) {
  const target = e.target

  if (target === login) {
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
  const resultID = await getUser(ID, id.value)

  // 가입 정보가 없는 아이디
  if (!resultID) {
    noti.hidden = false
    return
  }

  const isPassword = resultID.password === password.value

  // 비밀번호가 틀린 경우
  if (!isPassword) {
    noti.hidden = false
    return
  }

  // 전부 통과한 경우
  noti.hidden = true
  isLogin(resultID, isPassword)
}

// 로그인 후 메인페이지로 이동
async function isLogin(resultID, resultPassword) {
  if (resultID && resultPassword) {
    // [중요!] 서버에서 받아온 유저의 고유 id(예: "50")를 localStorage에 저장
    // resultID.id가 MockAPI에서 부여한 진짜 번호
    const loginAuthenticationData = {
      loginUserinternalId: resultID.id,
      userId: resultID.userId,
    }
    console.log('로그인 성공')
    localStorage.setItem(
      'loginAuthData',
      JSON.stringify(loginAuthenticationData),
    )

    alert('로그인을 성공하였습니다.')
    window.location.href = `${baseURL}/index.html`
  }
}
