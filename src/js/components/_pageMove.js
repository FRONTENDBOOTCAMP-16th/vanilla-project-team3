const container = document.querySelector('.container')
const submitContainer = container.querySelector('.user-submit-area')
const subTitle = container.querySelector('.page-layout-subtitle')
const header = container.querySelector('.navi-layout')

// 네비게이션 이벤트
header.addEventListener('click', (e) => {
  const target = e.target
  const home = header.querySelector('.navi-home-button')
  const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')

  // a태그 이벤트 삭제
  e.preventDefault()

  // 메인페이지로 이동
  pageMain(target, home, buttons)
})

// 메인버튼 이벤트
submitContainer.addEventListener('click', (e) => {
  const target = e.target
  const test = submitContainer.querySelector('.user-test-check')

  // a태그 작동 무시
  e.preventDefault()

  // 테스트 버튼
  pageTest(target, test, subTitle)
})

// 테스트 페이지로 이동하는 기능
function pageTest(target, test, subTitle) {
  if (target === test) {
    // 다음 상세 페이지 이동
    container.classList.remove('main-intro')
    container.classList.add('main-review')
    // 서브 타이틀 문구 변경
    subTitle.textContent = '당신의 기분을 이해해봐요'
  }
}

// 메인페이지로 이동하는 기능
function pageMain(target, home, buttons) {
  if (target === home) {
    // 메인컨텐트로 레이아웃 변경
    container.classList.remove('main-review')
    container.classList.add('main-intro')

    // 서브문구 변경
    subTitle.textContent = '당신에 대해 알려주세요.'

    // 테스트 버튼을 눌렀을 때 체크 버튼이 비활성화 됨
    buttons.forEach((gruop) => {
      const checkImojis = gruop.querySelectorAll('.checkbox-button-area input')

      checkImojis.forEach((input) => {
        input.disabled = false
        input.checked = false
      })
    })
  }
}

// 로그인 버튼 누름
// 안의 컨텐츠 다 삭제
// 로그인 페이지 전부 표출

// 회원가입 버튼 누름
// 안의 컨텐츠 다 삭제
// 회원가입 페이지 전부 표출

// 로그인 / 회원가입 완료화면
// 메인화면으로 이동 (타이틀 있는 화면)

// 마이페이지 버튼 누른 후
// 안의 컨텐츠 다 삭제
// 마이페이지 내용 전부 표출

// 찜눌렀을때 && 로그인이 안됬을 때 : 찜 리스트를 추가할 수 없습니다

// 마이페이지를 눌렀을때 && 로그인이 안됬을 떄 : 로그인이 필요합니다
