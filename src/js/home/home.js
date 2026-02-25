const VITE_API_BASE_URL = import.meta.env.VITE_DATA_API_URL
import { removeStorage } from '../utils'
import { saveStorage } from '/src/js/utils/index.js'
import { IS_CHECKED_KEY, IMOJI } from '/src/js/constants/index.js'
import { getData, getUser, putUser } from '../../../api/api.js'
import { EMAIL } from '../constants/index.js'

const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')

const submitButton = container.querySelector('.user-test-check')
const noti = document.querySelector('.emoji-noti')
const doubleCheckedGroups = document.querySelectorAll(
  '[data-checked="doubleChecked"]',
)

const NOTI_HIDE_DELAY = 1800
const MAX_CHECKED = 2

// 상태 변수
let notiTimeoutId = null

init()

function init() {
  bindEvents()
}

// 노티에 잠깐 트렌지션 삭제 ( 페이지 오퍼시티와 트렌지션 강제 삽입 삭제 )
if (noti) {
  // 아주 잠깐 뒤에 트랜지션 못하게 막기
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

  // 페이지가 표시될 때 모든 체크박스 초기화
  // 브라우저 뒤로가기 버튼 클릭했을 때도 항상 초기화하고 싶을 때 사용됨
  globalThis.addEventListener('pageshow', handleDetectBrowserLoadOrForward)
}

// 모든 체크박스를 초기화하는 함수
function handleDetectBrowserLoadOrForward() {
  // Navigation Timing API를 통해 현재 페이지에 어떻게 진입했는지 정보 가져오기
  const [navigation] = performance.getEntriesByType('navigation')
  // 페이지 진입 유형을 구조 분해 할당으로 추출
  const { type } = navigation

  // 페이지 진입 유형: 로드(새로고침, 초기 접속)
  if (type === 'navigate') {
    // 로컬 스토리지 isChecked, imoji 삭제
    removeStorage(IS_CHECKED_KEY)
    removeStorage(IMOJI)

    // 제출 버튼(링크) 상태 비활성화
    disableSubmitButtonState()
  }
  // 페이지 진입 유형: 브라우저 뒤로가기 클릭
  else if (type === 'back_forward') {
    // 제출 버튼(링크) 상태 활성화
    enableSubmitButtonState()
  }
}

// 현재 선택된 데이터(날씨, 기분)의 유무를 판단 버튼(링크) 상태 변경
// 접근성: 실시간으로 버튼의 활성 여부를 업데이트합니다.
function updateSubmitButtonState() {
  const { weather, mood } = getSelected()
  const isDisabled = !weather || !mood

  isDisabled ? disableSubmitButtonState() : enableSubmitButtonState()
}

// 버튼(링크)을 활성 상태로 변경
// 접근성: 스크린 리더 등 보조공학기기에 상태 변화를 알림
function enableSubmitButtonState() {
  if (!submitButton) return
  submitButton.setAttribute('aria-disabled', 'false')
}

// 버튼(링크)을 비활성 상태로 변경
// 접근성: 스크린 리더 등 보조공학기기에 상태 변화를 알림
function disableSubmitButtonState() {
  if (!submitButton) return
  submitButton.setAttribute('aria-disabled', 'true')
}

// 결과보기 버튼을 눌렀을 때
async function handleSubmitClick(e) {
  e.preventDefault()
  e.stopImmediatePropagation()
  const { weather, mood } = getSelected()

  if (!weather || !mood) {
    showNoti('기분과 감정을 최소 한개이상 골라주세요')
    return
  }

  try {
    await emojiTotalList()

    // 비회원 페이지로 이동할 때 로컬 스토리지에 키 설정
    saveStorage(IS_CHECKED_KEY, 'true')

    // 체크된 버튼이 어느 감정인지 스토리지에 기록 넘겨줌
    emojiStorage()

    console.log('서버에 데이터 업로드 성공!')

    // 서버 데이터 기다리지 않고 바로 이동
    location.href = '/src/pages/result/result.html'
  } catch (error) {
    console.error('데이터 업로드 실패:', error)
    throw error
  }
}

function handleGroupChange(e) {
  const input = e.target.closest('input[type="checkbox"]')
  if (!input) return

  const ok = limitToTwoChecked(e.currentTarget, input)
  if (!ok) {
    showNoti('감정 / 기분은 각각 최대 두개씩 선택 가능해요!')
  }

  updateSubmitButtonState()
}

function limitToTwoChecked(groupEl, changedInput) {
  const checkedCount = groupEl.querySelectorAll(
    'input[type="checkbox"]:checked',
  ).length
  if (checkedCount <= MAX_CHECKED) return true

  // 초과면 방금 누른 것 되돌림
  changedInput.checked = false
  return false
}

// 이때까지 선택한 감정들 JSON 데이터로 추가
async function emojiTotalList() {
  // 체크박스에 뭘 체크했는지 가져오기
  const checkImojis = container.querySelectorAll(
    '.checkbox-button-area input:checked',
  )
  const imojis = [...checkImojis].map((item) => {
    return item.dataset.value
  })

  // getUser로 날씨/감정 가져오기
  // 현재 유저 로그인 기능이 없어서 일단 임시로 아무 이메일로 호출하여 테스트함
  const user = await getUser(EMAIL, 'user2@example.com')
  const updateUrl = `${VITE_API_BASE_URL}/todayPhrase/user/${user.id}`
  const weather = user.weather_counts
  const mood = user.mood_counts
  const updateData = {
    weather_counts: { ...weather },
    mood_counts: { ...mood },
  }

  // 체크한 감정에 담긴 각각의 data-value를 꺼내 감정 선택한것에 +1 카운트 해줌
  imojis.forEach((item) => {
    if (item in updateData.weather_counts) {
      updateData.weather_counts[item] += 1
    }
    if (item in updateData.mood_counts) {
      updateData.mood_counts[item] += 1
    }
  })

  // 위에서 감정 선택한 데이터들을 JSON으로 업데이트
  await putUser(updateUrl, updateData)
}

// 체크된것들을 로컬스토리지에 기록 남겨주는 함수
function emojiStorage() {
  const checkImojis = container.querySelectorAll(
    '.checkbox-button-area input:checked',
  )
  // 체크 되어있는 유사배열을 진짜 배열로 변환
  const emojiArray = Array.from(checkImojis).map((input) => {
    return input.dataset.value
  })

  // 로컬 스토리지에 해당 체크 리스트를 넘겨줌
  saveStorage(IMOJI, emojiArray)
}

// 노티 활성화 / 비활성화
function showNoti(message) {
  if (!noti) return

  // 알람이 떠있으면 타이머 리셋
  if (notiTimeoutId) clearTimeout(notiTimeoutId)

  noti.textContent = message
  noti.classList.add('noti-active')
  noti.setAttribute('aria-hidden', 'false')

  // 일정시간 지나면 노티 삭제
  notiTimeoutId = setTimeout(() => {
    noti.classList.remove('noti-active')
    noti.setAttribute('aria-hidden', 'true')
  }, NOTI_HIDE_DELAY)
}

// 날씨와 감정 선택
function getSelected() {
  const weather = container.querySelector('.select-weather input:checked')
  const mood = container.querySelector('.select-mood input:checked')
  return { weather, mood }
}

async function prefetchData() {
  try {
    if (localStorage.getItem('cachedBookData')) {
      console.log('✅ 이미 캐시된 데이터가 있습니다.')
      return
    }

    const allData = await getData()

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
  // 새로운 테스트를 위해 이전 결과 리스트 삭제
  localStorage.removeItem('selectedBookList')
  // 선택했던 이모지 초기화
  localStorage.removeItem(IMOJI)
})
