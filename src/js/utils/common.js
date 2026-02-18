import { removeStorage } from './index.js'

const IS_CHECKED_KEY = 'isChecked'
const IMOJI = 'imoji'

// 화면이 그려지고 난 다음에 이벤트 실행
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container')
  const header = container.querySelector('.navi-layout')

  // 네비게이션 이벤트
  header.addEventListener('click', (e) => {
    const target = e.target
    const home = header.querySelector('.navi-home-button')

    // home이 없으면 끝
    if (!home) return

    // 홈버튼 누르면 로컬스토리지 전부 삭제
    // 감정/날씨 체크박스 리셋
    if (target === home) {
      removeStorage(IMOJI)
      removeStorage(IS_CHECKED_KEY)
    }
  })
})
