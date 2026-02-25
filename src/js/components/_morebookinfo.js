// 현재는 phraseLoader.js에서 displayPhraseResult 함수가 실행되면서 
// <a> 태그에 href="주소"로 바로 이동
// 해당 함수들은 이후 추가 기능으로 아래의 기능들을 추가할때 사용 가능 
// - 외부 링크 안내: "교보문고 사이트로 이동하시겠습니까?"라는 안내창 띄우기
// - 클릭 분석: 사용자가 어떤 책 상세정보를 많이 눌렀는지 서버에 데이터 보내기
// - 비로그인 차단: "로그인 후 상세 정보를 확인하실 수 있습니다"라고 막기


// // 링크를 연결하는 함수는 phraseLoader.js에 연결해 둠

// // 클릭했을 때 실행될 핸들러 함수
// function handleLinkClick(event) {
//   const target = event.target.closest('.more-book-info')
//   if (target) {
//     console.log('이동할 주소:', target.href)
//   }
// }

// // 이벤트 연결하는 함수
// export function initRecommendEvents(element) {
//   if (element) {
//     element.addEventListener('click', handleLinkClick)
//   }
// }

// // 실행 시
// const recommendLists = document.querySelector('.recommend-lists')
// initRecommendEvents(recommendLists)
