// 링크를 연결하는 함수는 phraseLoader.js에 연결해 둠

// 클릭했을 때 실행될 핸들러 함수
function handleLinkClick(event) {
  const target = event.target.closest('.more-book-info')
  if (target) {
    console.log('이동할 주소:', target.href)
  }
}

// 이벤트 연결하는 함수
export function initRecommendEvents(element) {
  if (element) {
    element.addEventListener('click', handleLinkClick)
  }
}

// 실행 시
const recommendLists = document.querySelector('.recommend-lists')
initRecommendEvents(recommendLists)
