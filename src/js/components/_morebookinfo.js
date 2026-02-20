const recommendLists = document.querySelector('.recommend-lists')

// 링크를 연결하는 함수는 phraseLoader.js에 연결해 둠

// 클릭 로그 확인
if (recommendLists) {
  recommendLists.addEventListener('click', (event) => {
    const target = event.target.closest('.more-book-info')
    if (target) {
      console.log('이동할 주소:', target.href)
    }
  })
}
