import { loadStorage } from '/src/js/utils/index.js'
import { displayPhraseResult } from '../../js/components/_phraseLoader.js'
import { shareResult } from '../../js/components/_share.js'
import { IS_CHECKED_KEY, IMOJI } from '/src/js/constants/index.js'
import { filterData, getRandomData } from '../../js/components/_phraseLoader.js'
import {
  showLoadingDisplay,
  hideLoadingDisplay,
} from '../../js/components/_imageLoading.js'
import { getData } from '../../../api/api.js'

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

window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const sharedTitle = urlParams.get('title')
  const sharedIds = urlParams.get('ids')

  let currentData = null

  try {
    // 1. 공유받은 링크로 접속했을 때
    if (sharedTitle) {
      // 로컬스토리지에 데이터가 없으면(공유링크를 타고 들어온 브라우저) 서버에서 새로 가져옴
      let allData = JSON.parse(localStorage.getItem('cachedBookData'))
      if (!allData) {
        allData = await getData()
        if (allData)
          localStorage.setItem('cachedBookData', JSON.stringify(allData))
      }

      if (sharedIds && allData) {
        const idArray = sharedIds.split(',')
        // ID를 비교할 때 타입 에러 방지를 위해 둘 다 String으로 변환
        currentData = idArray
          .map((id) => allData.find((book) => String(book.id) === String(id)))
          .filter(Boolean)
      }

      // 만약 데이터를 못 찾았다면(비상시) URL 정보로 1권이라도 생성
      if (!currentData || currentData.length === 0) {
        currentData = [
          {
            bookTitle: sharedTitle,
            author: urlParams.get('author'),
            phrase: urlParams.get('phrase'),
            bookCover: urlParams.get('bookCover'),
            bookstoreUrl: urlParams.get('bookstoreUrl'),
          },
        ]
      }

      displayPhraseResult(currentData)
      resultShareEvent(currentData)
      return
    }

    // 2. 공유가 아닐 때 (직접 확인 또는 새로고침)
    showLoadingDisplay()
    const savedLocalData = localStorage.getItem('selectedBookList')
    if (savedLocalData) {
      // 새로고침 한 경우 (로컬 데이터 존재)
      currentData = JSON.parse(savedLocalData)
      displayPhraseResult(currentData)
      resultShareEvent(currentData)
      hideLoadingDisplay()
      return
    } else {
      // 처음 결과를 보는 경우
      const savedEmoji = JSON.parse(localStorage.getItem(IMOJI))
      if (savedEmoji) {
        let allData = null
        const cachedData = localStorage.getItem('cachedBookData')
        allData = cachedData ? JSON.parse(cachedData) : await getData()

        const filtered = filterData(allData, savedEmoji, savedEmoji)
        currentData = getRandomData(filtered, 4)

        localStorage.setItem('selectedBookList', JSON.stringify(currentData))
        displayPhraseResult(currentData)
        resultShareEvent(currentData)
      }
    }

    if (!currentData) {
      alert('저장된 데이터가 존재하지 않습니다.')
      location.href = '/index.html'
      return
    }

    hideLoadingDisplay()
  } catch (error) {
    console.error('데이터 로드 중 오류 발생:', error)
    hideLoadingDisplay()
  }
})

function resultShareEvent(currentData) {
  const shareButton = document.querySelector('.share-button')

  if (shareButton && currentData) {
    shareButton.onclick = (e) => {
      e.preventDefault()
      shareResult(currentData)
    }
  }
}
