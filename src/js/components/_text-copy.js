/**
 * [1] 클립보드 복사 기능을 담당하는 전용 함수
 * @param {string} text - 복사할 실제 텍스트 내용
 * @param {HTMLElement} button - 클릭된 버튼 요소 (피드백을 주기 위해 필요)
 */
function copyToClipboard(text, button) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      handleCopySuccess(button)
    })
    .catch((err) => {
      console.error('복사 실패', err)
      alert('복사에 실패했습니다. 다시 시도해주세요.')
    })
}

/**
 * [2] 성공 피드백(텍스트/색상 변경)을 담당하는 함수
 * 사용자에게 복사가 되었음을 시각적으로 알리기 위해 2초간 버튼 상태를 유지합니다.
 * @param {HTMLElement} button - 피드백을 표시할 버튼 요소
 */
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

/**
 * [3] 페이지 로드 시 이벤트를 연결하는 함수 (초기화)
 * 버튼과 복사할 대상(문구)이 화면에 있는지 확인하고 클릭 이벤트를 붙입니다.
 */
function initCopyButton() {
  const copyButton = document.querySelector('.text-copy-button')
  const phraseElement = document.querySelector('.phrase')

  if (copyButton && phraseElement) {
    copyButton.addEventListener('click', () => {
      copyToClipboard(phraseElement.innerText, copyButton)
    })
  }
}

/**
 * [4] 실행
 * HTML 문서가 완전히 로드되어 DOM 트리가 완성된 시점에 초기화 함수를 실행합니다.
 */
document.addEventListener('DOMContentLoaded', initCopyButton)
