/**
 * [결과 공유 함수]
 * 추천된 도서 데이터들을 받아 공유 링크를 생성하고 공유 창을 띄웁니다.
 * @param {Array} resultDatas - 랜덤 추출된 도서 데이터 배열 (보통 4권)
 */
export async function shareResult(resultDatas) {
  // 1. [예외 처리] 데이터가 정상적인 배열인지, 내용이 있는지 확인
  if (!Array.isArray(resultDatas) || resultDatas.length === 0) return

  // 메인으로 보여줄 첫 번째 책 데이터를 추출합니다.
  const mainBook = resultDatas[0]

  // 현재 페이지의 도메인(origin)과 경로(pathname)를 기준으로 새로운 URL 객체를 생성합니다.
  const shareUrl = new URL(window.location.origin + window.location.pathname)

  // 2. https://www.reddit.com/r/VRchat/comments/1cy6j2o/a_little_confused_about_parameters/?tl=ko 공유받은 사람이 링크를 눌렀을 때 정보를 알 수 있게 URL 뒤에 데이터를 붙입니다.
  // 예: .../index.html?title=책제목&author=작가명...
  shareUrl.searchParams.set('title', mainBook.bookTitle) // 책 제목
  shareUrl.searchParams.set('author', mainBook.author) // 저자
  shareUrl.searchParams.set('phrase', mainBook.phrase) // 추천 문구
  shareUrl.searchParams.set('bookCover', mainBook.bookCover) // 책 표지 이미지 주소
  shareUrl.searchParams.set('bookstoreUrl', mainBook.bookstoreUrl) // 서점 링크

  // 3. [데이터 묶기] 추천된 4권 전체의 ID를 콤마(,)로 연결하여 저장합니다. (예: "1,5,12,30")
  // 나중에 공유받은 페이지에서 이 ID들을 이용해 전체 목록을 다시 불러올 수 있습니다.
  const allIds = resultDatas.map((book) => book.id).join(',')
  shareUrl.searchParams.set('ids', allIds)

  // 공유창에 표시될 제목, 텍스트, 최종 완성된 URL 주소를 구성합니다.
  const shareData = {
    title: `📖 추천 도서: ${mainBook.bookTitle}`,
    text: mainBook.phrase,
    url: shareUrl.href, // 데이터가 포함된 최종 주소
  }

  try {
    // 4. [공유 실행] 브라우저 자체 공유 기능(Web Share API)이 있는지 확인
    if (navigator.share) {
      // 모바일 등에서 시스템 공유 창(카톡, 문자, 인스타 등)을 띄웁니다.
      await navigator.share(shareData)
    } else {
      // 공유 기능이 없는 데스크톱 브라우저 등에서는 링크만 클립보드에 복사합니다.
      await navigator.clipboard.writeText(shareUrl.href)
      alert('공유 링크가 클립보드에 복사되었습니다.')
    }
  } catch (error) {
    // 사용자가 공유 창을 그냥 닫았을 때 발생하는 'AbortError'는 무시하고, 그 외의 에러만 기록합니다.
    if (error.name !== 'AbortError') console.error('공유 실패:', error)
  }
}
