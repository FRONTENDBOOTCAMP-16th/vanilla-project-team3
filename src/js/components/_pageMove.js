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
