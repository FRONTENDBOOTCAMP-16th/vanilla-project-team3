const doubleCheckedGroup = document.querySelectorAll(
  '[data-checked="doubleChecked"]',
)

// 이모지 / 날씨 버튼눌렀을 시 2개이상 체크 안되도록 이벤트
// 체인지 이벤트 반복문으로 한 함수로 중복 이벤트 걸어줌
doubleCheckedGroup.forEach((doubleChecked) => {
  doubleChecked.addEventListener('change', (event) => {
    const input = event.target.closest('input')

    // input이 아닐경우 함수 종료
    if (!input) return

    checkboxNotdouble(event)
  })
})

// 공용 타이머 함수
let notiTimeout

// 함수
// 이모지/날씨 버튼 눌렀을 때 2개이상이면 check가 false가 됨
// 안내 noti 출력
function checkboxNotdouble(event) {
  const checked = event.currentTarget.querySelectorAll(
    'input[type="checkbox"]:checked',
  )
  const count = checked.length
  const noti = document.querySelector('.emoji-noti')

  // 실행되고 있는 타이머가 있다면 중복 실행 방지
  if (notiTimeout) {
    clearTimeout(notiTimeout)
  }

  // check두개 이상일때 실행
  if (count > 2) {
    // check가 false가 되어 체크가 안됨
    event.target.closest('input').checked = false
    // 안내 노티
    noti.classList.add('noti-active')
    noti.setAttribute('aria-hidden', 'false')
  }

  // 일정시간이 지난뒤 노티 사라짐
  notiTimeout = setTimeout(() => {
    noti.classList.remove('noti-active')
  }, 1800)
}
