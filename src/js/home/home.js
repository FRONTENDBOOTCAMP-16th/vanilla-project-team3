import { saveStorage, removeStorage } from '/src/js/utils/index.js'

const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')

const submitButton = container.querySelector('.user-test-check')
const noti = document.querySelector('.emoji-noti')
const doubleCheckedGroups = document.querySelectorAll(
  '[data-checked="doubleChecked"]',
)

// 상수파일 분리할때 적용
const NOTI_HIDE_DELAY = 1800
const MAX_CHECKED = 2
const IS_CHECKED_KEY = 'isChecked'
const IMOJI = 'imoji'

// 상태 변수
let notiTimeoutId = null

// 페이지 초기화
init()

function init() {
  bindEvents()
  updateSubmitButtonState()
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
  globalThis.addEventListener('pageshow', handleResetAllInput)
}

// 모든 체크박스를 초기화하는 함수
function handleResetAllInput() {
  // 브라우저 뒤로가기로 왔을 때
  // 페이지 초기화 과정에서 로컬 스토리지의 키 제거
  removeStorage(IS_CHECKED_KEY)
  removeStorage(IMOJI)

  // 감정/날씨 체크된것 다 지우기
  doubleCheckedGroups.forEach((group) => {
    const inputs = group.querySelectorAll('input')
    inputs.forEach((input) => {
      input.checked = false
    })
  })
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

  // 1) 선택 개수 제한(최대 2개)
  const ok = limitToTwoChecked(e.currentTarget, input)
  if (!ok) {
    showNoti('감정 / 기분은 각각 최대 두개씩 선택 가능해요!')
  }

  // 2) 버튼 활성/비활성 갱신
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

function updateSubmitButtonState() {
  if (!submitButton) return

  const { weather, mood } = getSelected()
  const disabled = !weather || !mood

  // 감정과 기분중 하나만 선택했을 때 버튼 비활성화
  submitButton.classList.toggle('test-check-disabled', disabled)
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
