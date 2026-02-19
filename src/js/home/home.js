import { removeStorage } from '../utils'
import { saveStorage } from '/src/js/utils/index.js'
import {
  getSelectedValues,
  filterData,
  getRandomData,
} from '../../js/components/_phraseLoader.js'
import { getData } from '../../../api/api.js'
import { IS_CHECKED_KEY, IMOJI } from '/src/js/constants/index.js'

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
function handleSubmitClick(e) {
  const { weather, mood } = getSelected()

  if (!weather || !mood) {
    e.preventDefault()
    e.stopImmediatePropagation()
    showNoti('기분과 감정을 최소 한개이상 골라주세요')
    return
  }

  // 비회원 페이지로 이동할 때 로컬 스토리지에 키 설정
  saveStorage(IS_CHECKED_KEY, 'true')

  // 체크된 버튼이 어느 감정인지 스토리지에 기록 넘겨줌
  emojiStorage()
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

const testCheckButton = document.querySelector('.user-test-check')

if (testCheckButton) {
  testCheckButton.addEventListener('click', async (e) => {
    e.preventDefault()

    try {
      const allData = await getData()
      const moods = getSelectedValues('checkbox-mood')
      const weathers = getSelectedValues('checkbox-weather')

      const filteredData = filterData(allData, moods, weathers)
      const selectedData = getRandomData(filteredData, 4)

      console.log('저장할 데이터 : ', selectedData)
      localStorage.setItem('selectedBookList', JSON.stringify(selectedData))

      location.href = '/src/pages/result/result.html'
    } catch (error) {
      console.error('데이터 저장 중 오류 발생 : ', error)
    }
  })
}
