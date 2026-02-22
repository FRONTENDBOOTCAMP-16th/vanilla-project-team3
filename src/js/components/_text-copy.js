// 복사 기능을 담당하는 전용 함수
function copyToClipboard(text, button) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // 성공 시 피드백 로직 실행
      handleCopySuccess(button)
    })
    .catch((err) => {
      console.error('복사 실패', err)
      alert('복사에 실패했습니다. 다시 시도해주세요.')
    })
}

// 성공 피드백(텍스트/색상 변경)을 담당하는 함수
function handleCopySuccess(button) {
  const originalText = button.innerText
  const originalBg = button.style.backgroundColor

  button.innerText = '복사 완료 !'
  button.style.backgroundColor = '#2ecc71'

  setTimeout(() => {
    button.innerText = originalText
    button.style.backgroundColor = originalBg || '#fff'
  }, 2000)
}

// 페이지 로드 시 이벤트를 연결하는 함수 (초기화)
function initCopyButton() {
  const copyButton = document.querySelector('.text-copy-button')
  const phraseElement = document.querySelector('.phrase')

  if (copyButton && phraseElement) {
    copyButton.addEventListener('click', () => {
      copyToClipboard(phraseElement.innerText, copyButton)
    })
  }
}

// 실행
document.addEventListener('DOMContentLoaded', initCopyButton)
