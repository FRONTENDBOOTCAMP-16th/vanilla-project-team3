const container = document.querySelector('.container')
const header = container.querySelector('.navi-layout')

// 네비게이션 이벤트
header.addEventListener('click', (e) => {
  const target = e.target
  const home = header.querySelector('.navi-home-button')

  // 메인페이지로 이동
  pageMain(target, home)
})

// 메인페이지로 이동하는 기능
function pageMain(target, home) {
  if (target === home) {
    localStorage.clear()
  }
}

// 마이페이지 버튼 누른 후
// 안의 컨텐츠 다 삭제
// 마이페이지 내용 전부 표출

// 찜눌렀을때 && 로그인이 안됬을 때 : 찜 리스트를 추가할 수 없습니다

// 마이페이지를 눌렀을때 && 로그인이 안됬을 떄 : 로그인이 필요합니다
