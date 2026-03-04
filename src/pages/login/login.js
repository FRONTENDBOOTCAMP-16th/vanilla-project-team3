import { getUser, UserAPI } from '../../api/api'
import { ID, LOGIN_AUTH_DATA } from '../../js/constants'

const SESSION_FLAG = 'session_active'
const form = document.querySelector('.autu-box-container')
if (!form) throw new Error('문서에서 form을 찾을 수 없습니다.')
const id = form.querySelector('.id-box')
const password = form.querySelector('.pw-box')
const noti = form.querySelector('.noti-blank-warning')
const login = form.querySelector('.submit-button')

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
    checkeEmailPassword()
  }
}

/**
 * 실시간 입력 감지 함수: 버튼의 활성화/비활성화 상태를 시각적으로 제어합니다.
 * (aria-disabled 속성을 활용하여 웹 접근성을 고려함)
 */
function handleFormChange() {
  if (id.value && password.value) {
    login.setAttribute('aria-disabled', 'false')
  } else {
    login.setAttribute('aria-disabled', 'true')
  }
}

/**
 * 핵심 로직: 입력받은 정보와 저장된 유저 정보를 비교합니다.
 */
async function checkeEmailPassword() {
  // 1. 입력된 아이디를 기반으로 서버에서 유저 정보를 가져옴 (비동기 처리)
  const resultID = await getUser(ID, id.value)

  // 2. 가입 정보가 없는 경우 (아이디가 존재하지 않음)
  if (!resultID) {
    noti.style.visibility = 'visible'
    return
  }

  // 3. 가져온 유저 데이터의 비밀번호와 입력한 비밀번호를 비교
  const isPassword = resultID.password === password.value

  // 4. 비밀번호가 틀린 경우
  if (!isPassword) {
    noti.style.visibility = 'visible'
    return
  }

  if (resultID.isLoggedIn) {
    const force = confirm(
      '다른 기기에서 로그인 중입니다. 강제 로그인하시겠습니까?',
    )
    if (!force) return
  }

  // 5. 아이디와 비밀번호가 모두 일치하면 경고창을 숨기고 로그인 처리 진행
  noti.hidden = true
  isLogin(resultID, isPassword)
}

/**
 * 최종 로그인 처리: 로컬 스토리지에 세션을 저장하고 페이지를 이동시킵니다.
 */
async function isLogin(resultID, resultPassword) {
  if (resultID && resultPassword) {
    await UserAPI.updateUserData(resultID.id, {
      ...resultID,
      isLoggedIn: true,
    })

    const safeUserData = { ...resultID }
    delete safeUserData.password

    localStorage.setItem(LOGIN_AUTH_DATA, JSON.stringify(safeUserData))

    sessionStorage.setItem(SESSION_FLAG, 'true')
    alert('로그인을 성공하였습니다.')

    window.location.href = `/index.html`
  }
}
