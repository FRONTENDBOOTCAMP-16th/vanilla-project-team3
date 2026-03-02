/**
 * [1] 클립보드 복사 기능을 담당하는 전용 함수
 * @param {string} text - 복사할 실제 텍스트 내용
 * @param {HTMLElement} button - 클릭된 버튼 요소 (피드백을 주기 위해 필요)
 */
function copyToClipboard(text, button) {
  // 브라우저의 최신 클립보드 API를 사용하여 텍스트를 복사합니다.
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // 복사 성공 시: 사용자에게 시각적 피드백을 주는 함수를 실행합니다.
      handleCopySuccess(button)
    })
    .catch((err) => {
      // 복사 실패 시: 콘솔에 에러를 찍고 사용자에게 알림창을 띄웁니다.
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
  // 나중에 원래대로 되돌리기 위해 현재 버튼의 텍스트와 배경색을 변수에 기록해둡니다.
  const originalText = button.innerText
  const originalBg = button.style.backgroundColor

  // 버튼의 상태를 '성공' 느낌으로 바꿉니다 (초록색 배경 + 문구 변경).
  button.innerText = '복사 완료 !'
  button.style.backgroundColor = '#2ecc71' // 산뜻한 초록색

  // 2초(2000ms)가 지나면 다시 원래의 텍스트와 배경색으로 되돌립니다.
  setTimeout(() => {
    button.innerText = originalText
    // 원래 배경색이 없었다면 기본값인 흰색(#fff)으로 설정합니다.
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

  // 두 요소가 모두 존재할 때만 클릭 리스너를 등록하여 에러를 방지합니다.
  if (copyButton && phraseElement) {
    copyButton.addEventListener('click', () => {
      // 문구 요소(.phrase) 안의 텍스트를 가져와서 복사 함수에 전달합니다.
      copyToClipboard(phraseElement.innerText, copyButton)
    })
  }
}

/**
 * [4] 실행
 * HTML 문서가 완전히 로드되어 DOM 트리가 완성된 시점에 초기화 함수를 실행합니다.
 */
document.addEventListener('DOMContentLoaded', initCopyButton)
