/**
 * [결과 공유 함수]
 * 추천된 도서 데이터들을 받아 공유 링크를 생성하고 공유 창을 띄웁니다.
 * @param {Array} resultDatas - 랜덤 추출된 도서 데이터 배열 (보통 4권)
 */
export async function shareResult(resultDatas) {
  // [예외 처리] 데이터가 정상적인 배열인지, 내용이 있는지 확인
  if (!Array.isArray(resultDatas) || resultDatas.length === 0) return

  const mainBook = resultDatas[0]
  const shareUrl = new URL(window.location.origin + window.location.pathname)

  // 공유받은 사람이 링크를 눌렀을 때 정보를 알 수 있게 URL 뒤에 데이터를 붙입니다.
  shareUrl.searchParams.set('title', mainBook.bookTitle)
  shareUrl.searchParams.set('author', mainBook.author)
  shareUrl.searchParams.set('phrase', mainBook.phrase)
  shareUrl.searchParams.set('bookCover', mainBook.bookCover)
  shareUrl.searchParams.set('bookstoreUrl', mainBook.bookstoreUrl)

  // [데이터 묶기] 추천된 4권 전체의 ID를 콤마(,)로 연결하여 저장합니다. (예: "1,5,12,30")
  const allIds = resultDatas.map((book) => book.id).join(',')
  shareUrl.searchParams.set('ids', allIds)

  const shareData = {
    title: `📖 추천 도서: ${mainBook.bookTitle}`,
    text: mainBook.phrase,
    url: shareUrl.href,
  }

  try {
    // [공유 실행] 브라우저 자체 공유 기능(Web Share API)이 있는지 확인
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareUrl.href)
      alert('공유 링크가 클립보드에 복사되었습니다.')
    }
  } catch (error) {
    // 사용자가 공유 창을 그냥 닫았을 때 발생하는 'AbortError'는 무시하고, 그 외의 에러만 기록합니다.
    if (error.name !== 'AbortError') console.error('공유 실패:', error)
  }
}
