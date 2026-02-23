import { loadStorage } from '/src/js/utils/index.js'
import { displayPhraseResult } from '../../js/components/_phraseLoader.js'
import { shareResult } from '../../js/components/_share.js'
import { IS_CHECKED_KEY, IMOJI } from '/src/js/constants/index.js'
import { getUser } from '../../../api/api.js'

const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')

const doubleCheckedGroups = container.querySelectorAll(
  '[data-checked="doubleChecked"]',
)
const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')

// 페이지 초기화
init()

function init() {
  applyDisableIfChecked()
}

function applyDisableIfChecked() {
  const isChecked = loadStorage(IS_CHECKED_KEY) === 'true'
  if (!isChecked) return

  doubleCheckedGroups.forEach((group) => {
    const inputs = group.querySelectorAll('input')
    inputs.forEach((input) => {
      input.disabled = true
    })
  })
}

// 스토리지에 저장된 감정/날씨 -> 체크로 변환
if (loadStorage(IMOJI)) {
  const savedEmojis = loadStorage(IMOJI)

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

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search)
  const sharedTitle = urlParams.get('title')

  let currentData = null

  if (sharedTitle) {
    currentData = [
      {
        bookTitle: sharedTitle,
        author: urlParams.get('author'),
        phrase: urlParams.get('phrase'),
        bookCover: urlParams.get('bookCover'),
      },
    ]
    displayPhraseResult(currentData)
  } else {
    const savedLocalData = localStorage.getItem('selectedBookList')

    if (savedLocalData) {
      currentData = JSON.parse(savedLocalData)
      displayPhraseResult(currentData)
    } else {
      alert('저장된 데이터가 존재하지않습니다.')
      location.href = '/index.html'
      return
    }
  }
  const shareButton = document.querySelector('.share-button')
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      if (shareButton && currentData) {
        shareResult(currentData[0])
      } else {
        console.error('공유할 데이터를 준비하지 못했습니다.')
      }
    })
  }
})

// 작업중
async function text() {
  // 유저아이디 동적으로 가지고 와야함 <<<<<<< 일단 임시로 불러옴
  const user = await getUser('userId', 'test')
  const test = await user.heart
  console.log(test)
}
text()
