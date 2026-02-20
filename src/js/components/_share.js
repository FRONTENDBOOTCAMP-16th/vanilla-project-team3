export async function shareResult(resultData) {
  const shareUrl = new URL(window.location.origin + window.location.pathname)
  shareUrl.searchParams.set('title', resultData.bookTitle)
  shareUrl.searchParams.set('author', resultData.author)
  shareUrl.searchParams.set('phrase', resultData.phrase)
  shareUrl.searchParams.set('bookCover', resultData.bookCover)

  const shareData = {
    title: `추천하는 책 : ${resultData.bookTitle}`,
    text: `${resultData.phrase}`,
    url: shareUrl.href,
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareUrl.href)
      alert('공유 기능을 지원하지 않는 브라우저입니다. url이 복사되었습니다.')
    }
  } catch (error) {
    console.log(error)
  }
}
