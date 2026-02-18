const container = document.querySelector('.container')
const noti = document.querySelector('.emoji-noti')

// 로컬 스토리지에 값이 true면 감정/날씨를 선택할 수 없음
;(() => {
  const isChecked = localStorage.getItem('isChecked')
  const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')

  if (isChecked === 'true') {
    buttons.forEach((gruop) => {
      const checkImojis = gruop.querySelectorAll('.checkbox-button-area input')

      checkImojis.forEach((input) => {
        input.disabled = true
      })
    })
  }

  // 스토리지에 저장된 감정/날씨 -> 체크로 변환
  if (localStorage.getItem('imoji')) {
    const savedEmojis = JSON.parse(localStorage.getItem('imoji'))

    if (savedEmojis) {
      buttons.forEach((checkbox) => {
        const checkImojis = checkbox.querySelectorAll('[data-value]')

        // 가져온 로컬스토리지의 값이 data-value값과 동일한경우 체크
        checkImojis.forEach((input) => {
          if (savedEmojis.includes(input.dataset.value)) {
            input.checked = true
          }
        })
      })
    }
  }

  // 노티에 잠깐 트렌지션 삭제
  if (noti) {
    // 아주 잠깐 뒤에 트랜지션 못하게 막기
    setTimeout(() => {
      noti.classList.remove('no-transition')
    }, 500)
  }
})()
