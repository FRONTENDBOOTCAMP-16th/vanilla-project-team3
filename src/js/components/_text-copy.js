// 페이지가 로드된 후 실행되도록 설정
document.addEventListener('DOMContentLoaded', () => {
  const copyButton = document.querySelector('.text-copy-button')
  const phraseElement = document.querySelector('.phrase')

  // 요소들이 존재할 때만 실행(에러 방지)
  if (copyButton && phraseElement) {
    copyButton.addEventListener('click', () => {
      const textToCopy = phraseElement.innerText

      navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // 사용자 피드백: 버튼 텍스트 변경
        const originalText = copyButton.innerText
        copyButton.innerText = '복사 완료 !'
        copyButton.style.backgroundColor = '#2ecc71'

        setTimeout(() => {
          copyButton.innerText = originalText
          copyButton.style.backgroundColor = '#fff'
        }, 2000)
      })
      .catch(Error => {
      console.error('복사 실패', Error)
      alert('복사에 실패했습니다. 다시 시도해주세요.')
      })
    })
  }
})