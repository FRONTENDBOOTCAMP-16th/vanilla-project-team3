const doubleCheckedGroup = document.querySelectorAll(
  '[data-checked="doubleChecked"]',
)
const container = document.querySelector('.container')
const noti = document.querySelector('.emoji-noti')
const submitButton = container.querySelector('.user-test-check')

// 비회원 확인하기 버튼 눌렀을 때 이벤트
submitButton.addEventListener('click', (e) => {
  const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')
  const { weather, mood } = emojiCheck()

  //날씨와 기분이 하나라도 없다면 페이지 못넘어가게 막음
  if (!weather || !mood) {
    mustSubmitTest()
    e.stopImmediatePropagation()
    return
  }

  // 테스트 버튼을 눌렀을 때 체크 버튼이 비활성화 됨
  buttons.forEach((gruop) => {
    const checkImojis = gruop.querySelectorAll('.checkbox-button-area input')

    checkImojis.forEach((input) => {
      input.disabled = true
    })
  })
})

// 이모지 / 날씨 버튼눌렀을 시 2개이상 체크 안되도록 이벤트
doubleCheckedGroup.forEach((doubleChecked) => {
  doubleChecked.addEventListener('change', (e) => {
    const input = e.target.closest('input')

    // input이 아닐경우 함수 종료
    if (!input) return

    //감정/기분이 변경 안되었을시 버튼 비활성화
    mustChangeOne(e)

    // 체크가 두개이상 안되도록 블록
    checkboxNotdouble(e)
  })
})

// 공용 타이머 함수
let notiTimeout

// 이모지/날씨 버튼 눌렀을 때 2개이상이면 check가 false가 됨
// 안내 noti 출력
function checkboxNotdouble(e) {
  const checked = e.currentTarget.querySelectorAll(
    'input[type="checkbox"]:checked',
  )
  const count = checked.length

  // 실행되고 있는 타이머가 있다면 중복 실행 방지
  if (notiTimeout) {
    clearTimeout(notiTimeout)
  }

  // check두개 이상일때 실행
  if (count > 2) {
    // check가 false가 되어 체크가 안됨
    e.target.closest('input').checked = false
    // 안내 노티
    noti.textContent = '감정 / 기분은 각각 최대 두개씩 선택 가능해요!'
    noti.classList.add('noti-active')
    noti.setAttribute('aria-hidden', 'false')
  }

  // 일정시간이 지난뒤 노티 사라짐
  notiTimeout = setTimeout(() => {
    noti.classList.remove('noti-active')
  }, 1800)
}

// 한개 이상 이모지 변경되었을 시 비회원 확인하기 버튼 활성화
function mustChangeOne() {
  const { weather, mood } = emojiCheck()

  // 안내 노티
  if (!weather || !mood) {
    submitButton.classList.add('test-check-disabled')
  } else {
    submitButton.classList.remove('test-check-disabled')
  }
}

// 이모지를 하나만 선택후 다음 페이지로 넘어가려 할때 막기
function mustSubmitTest() {
  const { weather, mood } = emojiCheck()

  // 실행되고 있는 타이머가 있다면 중복 실행 방지
  if (notiTimeout) {
    clearTimeout(notiTimeout)
  }

  // 감정/날씨 선택하라는 안내 문구 출력
  if (!weather || !mood) {
    noti.textContent = '기분과 감정을 최소 한개이상 골라주세요'
    noti.classList.add('noti-active')
  }

  // 일정시간이 지난뒤 노티 사라짐
  notiTimeout = setTimeout(() => {
    noti.classList.remove('noti-active')
  }, 1800)
}

// 기분/날씨 체크 함수 (각각 const를 불러오기 위해)
function emojiCheck() {
  const weather = container.querySelector('.select-weather input:checked')
  const mood = container.querySelector('.select-mood input:checked')

  return { weather, mood }
}
