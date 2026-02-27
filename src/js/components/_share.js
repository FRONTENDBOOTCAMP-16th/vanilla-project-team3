// share.js
export async function shareResult(resultDatas) {
  // 1. 데이터가 배열인지 확인하고 메인 책(0번) 추출
  if (!Array.isArray(resultDatas) || resultDatas.length === 0) return
  const mainBook = resultDatas[0]

  const shareUrl = new URL(window.location.origin + window.location.pathname)

  // 2. URL 파라미터 세팅 (메인 정보)
  shareUrl.searchParams.set('title', mainBook.bookTitle)
  shareUrl.searchParams.set('author', mainBook.author)
  shareUrl.searchParams.set('phrase', mainBook.phrase)
  shareUrl.searchParams.set('bookCover', mainBook.bookCover)
  shareUrl.searchParams.set('bookstoreUrl', mainBook.bookstoreUrl)

  // 3. 4권 전체 ID를 콤마로 연결해서 추가 (예: "1,5,12,30")
  const allIds = resultDatas.map((book) => book.id).join(',')
  shareUrl.searchParams.set('ids', allIds)

  const shareData = {
    title: `📖 추천 도서: ${mainBook.bookTitle}`,
    text: mainBook.phrase,
    url: shareUrl.href,
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareUrl.href)
      alert('공유 링크가 클립보드에 복사되었습니다.')
    }
  } catch (error) {
    if (error.name !== 'AbortError') console.error('공유 실패:', error)
  }
}
