import { loadStorage, removeStorage } from '../utils'
import { saveStorage } from '/src/js/utils/index.js'
import { IS_CHECKED_KEY, IMOJI } from '/src/js/constants/index.js'
import { getData, getUser, UserAPI } from '../../../api/api.js'
import { EMAIL, LOGIN_AUTH_DATA } from '../constants/index.js'
import { initSession, logout } from '../../pages/login/loginSession.js'

const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')
const loadEmail = loadStorage(LOGIN_AUTH_DATA)
const submitButton = container.querySelector('.user-test-check')
const noti = document.querySelector('.emoji-noti')
const doubleCheckedGroups = document.querySelectorAll(
  '[data-checked="doubleChecked"]',
)

const NOTI_HIDE_DELAY = 1800
const MAX_CHECKED = 2
let notiTimeoutId = null

init()

function init() {
  bindEvents()
}

if (noti) {
  setTimeout(() => {
    noti.classList.remove('no-transition')
  }, 500)
}

function bindEvents() {
  if (submitButton) {
    submitButton.addEventListener('click', handleSubmitClick)
  }

  doubleCheckedGroups.forEach((group) => {
    group.addEventListener('change', handleGroupChange)
  })

  globalThis.addEventListener('pageshow', handleDetectBrowserLoadOrForward)
}

// 페이지 접속 방식(신규 로드 vs 뒤로가기)에 따라 스토리지와 버튼 상태를 제어합니다.
function handleDetectBrowserLoadOrForward() {
  const [navigation] = performance.getEntriesByType('navigation')
  const { type } = navigation

  if (type === 'navigate') {
    removeStorage(IS_CHECKED_KEY)
    removeStorage(IMOJI)
    disableSubmitButtonState()
  }
  else if (type === 'back_forward') {
    enableSubmitButtonState()
  }
}

// 날씨와 기분이 모두 선택되었는지 확인하여 제출 버튼의 활성/비활성 상태를 업데이트합니다.
function updateSubmitButtonState() {
  const { weather, mood } = getSelected()
  const isDisabled = !weather || !mood

  isDisabled ? disableSubmitButtonState() : enableSubmitButtonState()
}

// 버튼 활성화 처리 (접근성 속성 고려)
function enableSubmitButtonState() {
  if (!submitButton) return
  submitButton.setAttribute('aria-disabled', 'false')
}

// 버튼 비활성화 처리 (접근성 속성 고려)
function disableSubmitButtonState() {
  if (!submitButton) return
  submitButton.setAttribute('aria-disabled', 'true')
}

// 결과보기 클릭 시 유효성 검사 후 데이터 업로드 및 페이지 이동을 수행합니다.
async function handleSubmitClick(e) {
  e.preventDefault()
  e.stopImmediatePropagation()
  const { weather, mood } = getSelected()

  if (!weather || !mood) {
    showNoti('기분과 감정을 최소 한개이상 골라주세요')
    return
  }

  try {
    // 로그인한 회원일 경우 사용자의 통계(카운트) 데이터를 서버에 업데이트합니다.
    if (loadStorage(LOGIN_AUTH_DATA)) {
      await emojiTotalList()
    }

    saveStorage(IS_CHECKED_KEY, 'true')
    emojiStorage()

    console.log('서버에 데이터 업로드 성공!')

    location.href = '/src/pages/result/result.html'
  } catch (error) {
    console.error('데이터 업로드 실패:', error)
    throw error
  }
}

// 체크박스 그룹 변경 시 선택 개수 제한 로직을 호출합니다.
function handleGroupChange(e) {
  const input = e.target.closest('input[type="checkbox"]')
  if (!input) return

  const ok = limitToTwoChecked(e.currentTarget, input)
  if (!ok) {
    showNoti('감정 / 기분은 각각 최대 두개씩 선택 가능해요!')
  }

  updateSubmitButtonState()
}

// 체크박스 선택 개수를 최대 2개로 제한합니다.
function limitToTwoChecked(groupEl, changedInput) {
  const checkedCount = groupEl.querySelectorAll(
    'input[type="checkbox"]:checked',
  ).length
  if (checkedCount <= MAX_CHECKED) return true

  // 2개 초과 시 방금 클릭한 체크박스를 해제 처리
  changedInput.checked = false
  return false
}

// 사용자가 선택한 감정/날씨 항목의 카운트를 서버(DB) 유저 정보에 누적 업데이트합니다.
async function emojiTotalList() {
  const checkImojis = container.querySelectorAll(
    '.checkbox-button-area input:checked',
  )
  const imojis = [...checkImojis].map((item) => {
    return item.dataset.value
  })

  const user = await getUser(EMAIL, loadEmail.email)
  const weather = user.weather_counts
  const mood = user.mood_counts
  const updateData = {
    weather_counts: { ...weather },
    mood_counts: { ...mood },
  }

  imojis.forEach((item) => {
    if (item in updateData.weather_counts) {
      updateData.weather_counts[item] =
        (updateData.weather_counts[item] || 0) + 1
    }
    if (item in updateData.mood_counts) {
      updateData.mood_counts[item] = (updateData.mood_counts[item] || 0) + 1
    }
  })
  await UserAPI.updateUserData(user.id, updateData)
}

// 현재 체크된 모든 항목을 배열로 만들어 로컬 스토리지에 저장합니다.
function emojiStorage() {
  const checkImojis = container.querySelectorAll(
    '.checkbox-button-area input:checked',
  )
  const emojiArray = Array.from(checkImojis).map((input) => {
    return input.dataset.value
  })

  saveStorage(IMOJI, emojiArray)
}

// 상단 알림 메시지(노티)를 표시하고 일정 시간 후 숨깁니다.
function showNoti(message) {
  if (!noti) return

  if (notiTimeoutId) clearTimeout(notiTimeoutId)

  noti.textContent = message
  noti.classList.add('noti-active')
  noti.setAttribute('aria-hidden', 'false')

  notiTimeoutId = setTimeout(() => {
    noti.classList.remove('noti-active')
    noti.setAttribute('aria-hidden', 'true')
  }, NOTI_HIDE_DELAY)
}

// 페이지 이탈 시 실행 중인 타이머를 정리합니다.
function cleanupTimers() {
  if (notiTimeoutId) {
    clearTimeout(notiTimeoutId)
    notiTimeoutId = null
  }
}

globalThis.addEventListener('beforeunload', cleanupTimers)

// 현재 날씨와 기분 그룹에서 각각 체크된 요소를 반환합니다.
function getSelected() {
  const weather = container.querySelector('.select-weather input:checked')
  const mood = container.querySelector('.select-mood input:checked')
  return { weather, mood }
}

// 결과 페이지의 로딩 속도를 위해 도서 데이터를 미리 가져와 캐싱합니다.
async function prefetchData() {
  try {
    if (localStorage.getItem('cachedBookData')) {
      console.log('✅ 이미 캐시된 데이터가 있습니다.')
      return
    }

    const allData = await getData()

    if (!allData) return
    localStorage.setItem('cachedBookData', JSON.stringify(allData))
    console.log('✅ Data prefetch 성공')
  } catch (error) {
    console.error('❌ Data prefetch 실패', error)
  }
}

window.addEventListener('load', () => {
  prefetchData()
})

window.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('selectedBookList')
  localStorage.removeItem(IMOJI)
})

const testCheckButton = document.querySelector('.user-test-check')

if (testCheckButton) {
  testCheckButton.addEventListener('click', (e) => {
    e.preventDefault()

    emojiStorage()
    saveStorage(IS_CHECKED_KEY, 'true')

    location.href = '/src/pages/result/result.html'
  })
}

const { isLoggedIn, currentUser } = initSession()

/**
 * [로그인 상태별 UI 렌더링]
 * 로그인 여부에 따라 버튼 텍스트를 변경하고 로그인/회원가입/로그아웃 버튼의 노출을 제어합니다.
 */
export function renderLoggedInDisplay() {
  const checkButton = document.querySelector('.user-test-check')
  const loginButton = document.querySelector('.user-login')
  const joinButton = document.querySelector('.user-join')
  const logoutButton = document.querySelector('.user-logout')

  if (isLoggedIn) {
    checkButton.textContent = '확인하기'
    loginButton?.classList.add('hidden')
    joinButton?.classList.add('hidden')
    logoutButton?.classList.remove('hidden')

    console.log(currentUser?.userId, '님 환영합니다!')
    logoutButton?.addEventListener('click', logout)
  } else {
    checkButton.textContent = '비회원 확인하기'
    loginButton?.classList.remove('hidden')
    joinButton?.classList.remove('hidden')
    logoutButton?.classList.add('hidden')
  }
}

renderLoggedInDisplay()
