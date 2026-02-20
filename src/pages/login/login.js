import { getUser } from '../../../api/api'

const form = document.querySelector('.autu-box-container')
if (!form) throw new Error('문서에서 form을 찾을 수 없습니다.')
const id = form.querySelector('.id-box')
const password = form.querySelector('.pw-box')
const noti = form.querySelector('.noti-blank-warning')
const login = form.querySelector('.submit-button')

// 페이지 뒤로가기 / 앞으로가기 했을때 데이터 싹 다 날아가야함
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
    // 아이디와 비밀번호 입력 안되었을 시 로그인안됨
    if (id.value || password.value) {
      checkeEmailPassword()
    }
  }

  if (target !== id) return

  if (target === id) {
    // TODO
    // 영문,숫자,소문자만 입력되도록 수정하기
    console.log('아이디')
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

// 이메일과 비밀번호 확인
async function checkeEmailPassword() {
  const resultID = await getUser('email', id.value)
  const isPassword = resultID.password === password.value

  // 아이디와 비밀번호와 동일하지않으면 안내문구
  resultID && isPassword ? (noti.hidden = true) : (noti.hidden = false)

  // 아이디와 비밀번호가 맞다면 로그인 성공
  isLogin(resultID, isPassword)
}

// 로그인 후 메인페이지로 이동
async function isLogin(resultID, resultPassword) {
  if (resultID && resultPassword) {
    alert('로그인이 성공하였습니다.')
    window.location.href = 'http://localhost:3000/index.html'
  }
}
