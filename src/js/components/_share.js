// const shareData = {
//   title: ${title},
//   phrase: `${phrase}`,
//   author : `${author}`,
// }

const shareData = {
  title: '책 제목',
  phrase: '추천 문구',
  author: '작가',
  url: window.location.href,
}

const resultSection = document.querySelector('.result-display')
const resultArticle = resultSection.querySelector('.result-content-display')
const shareButton = resultArticle.querySelector('.share-button')
// navigator.share 를 사용해서 내가 본 화면을 그대로 전달할 수 있는가?
// 주소창에 꼬리표(데이터)를 달아서 공유하면 가능하다.
shareButton.addEventListener('click', async () => {
  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      alert('현재 브라우저에서는 공유 기능을 지원하지 않습니다.')
    }
    console.log('공유 성공!')
  } catch (error) {
    console.error('공유 실패 : ', error)
  }
})
