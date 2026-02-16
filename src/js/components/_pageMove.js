const container = document.querySelector('.container')
const submitContainer = container.querySelector('.user-submit-area')

// 메인버튼 이벤트
submitContainer.addEventListener('click', (e) => {
  const subTitle = container.querySelector('.page-layout-subtitle')
  // a태그 작동 무시
  e.preventDefault()

  // 다음 상세 페이지 이동
  container.classList.remove('main-intro')
  container.classList.add('main-review')
  // 서브 타이틀 문구 변경
  subTitle.textContent = '당신의 기분을 이해해봐요'
})


// 로그인 버튼 누름
// 안의 컨텐츠 다 삭제
// 로그인 페이지 전부 표출

// 회원가입 버튼 누름
// 안의 컨텐츠 다 삭제
// 회원가입 페이지 전부 표출

// 뒤로가기 버튼
// 메인화면으로 이동 (타이틀 있는 화면)

// 로그인 / 회원가입 완료화면
// 메인화면으로 이동 (타이틀 있는 화면)

// 마이페이지 버튼 누른 후
// 안의 컨텐츠 다 삭제
// 마이페이지 내용 전부 표출

// 찜눌렀을때 && 로그인이 안됬을 때 : 찜 리스트를 추가할 수 없습니다

// 마이페이지를 눌렀을때 && 로그인이 안됬을 떄 : 로그인이 필요합니다
