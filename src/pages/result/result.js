import { loadStorage } from '/src/js/utils/index.js'

const container = document.querySelector('.container')

// 로컬 스토리지에 값이 true면 감정/날씨를 선택할 수 없음
;(() => {
  const isChecked = loadStorage('isChecked')
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
  if (loadStorage('imoji')) {
    const savedEmojis = loadStorage('imoji')

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
})()
