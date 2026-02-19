const recommendLists = document.querySelector('.recommend-lists')

// 1. 링크를 연결하는 함수
export const linkPurchaseButtons = (selectedJsonData) => {
  // 1. 하단 이미지 3개와 버튼 3개를 각각 모두 가져옴
  const buyButtons = document.querySelectorAll('.more-book-info')
  
  // 2. [중요] 원본 코드의 이미지 배치 로직을 그대로 복사
  const subBooks = selectedJsonData.slice(1) // 데이터의 1번, 2번 데이터

  // 3. 하단 이미지 리스트를 돌면서 버튼 링크를 매칭
  subBooks.forEach((data, index) => {
    if (buyButtons[index]) {
      // 현재 하단 이미지 index번에 들어간 데이터(data)의 링크를 
      // 똑같은 순서의 버튼(buyButtons[index])에 넣는다.
      buyButtons[index].href = data.bookstoreUrl
      
      // 확인용 로그: 어떤 데이터가 몇 번 버튼에 들어가는지
      console.log(`하단 ${index + 1}번째 버튼에 '${data.bookTitle}' 연결 완료`)
    }
  })

  // 4. 
  // 만약 하단 버튼은 3개인데 데이터(subBooks)는 2개뿐이라면, 
  // 원본 코드에서 3번째 이미지는 '메인 데이터'를 쓰고 있을 가능성이 높음
  if (buyButtons[2] && !subBooks[2]) {
    // 3번째 버튼에 메인 데이터(index 0)의 링크를 넣는다.
    buyButtons[2].href = selectedJsonData[0].bookstoreUrl
    console.log(`하단 3번째 버튼에 메인 책 '${selectedJsonData[0].bookTitle}' 연결 완료`)
  }
}

// 2. 원본 코드에서 보낸 'renderDone' 신호를 감시
window.addEventListener('renderDone', (event) => {
  // 신호와 함께 넘어온 데이터(selectedJsonData)를 받아서 연결 함수 실행
  const finalData = event.detail
  linkPurchaseButtons(finalData)
})

// 3. 클릭 로그 확인
if (recommendLists) {
  recommendLists.addEventListener('click', (event) => {
    const target = event.target.closest('.more-book-info')
    if (target) {
      console.log('이동할 주소:', target.href)
    }
  })
}