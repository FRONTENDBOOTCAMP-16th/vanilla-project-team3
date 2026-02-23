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

  let currentData = null

  try {
    // 공유받은 링크로 들어온 경우 
    if (sharedTitle) {
      currentData = [
        {
          bookTitle: sharedTitle,
          author: urlParams.get('author'),
          phrase: urlParams.get('phrase'),
          bookCover: urlParams.get('bookCover'),
          bookstoreUrl: urlParams.get('url'),
        },
      ]
      displayPhraseResult(currentData)
    } else {
      showLoadingDisplay() 

      // 홈에서 넘어온 직후인지 확인 (이모지 데이터 존재 여부)
      const savedEmoji = JSON.parse(localStorage.getItem(IMOJI))

      if (savedEmoji) {
        // 홈페이지에서 직접 결과를 확인하는 경우 
        let allData = null
        const cachedData = localStorage.getItem('cachedBookData')

        if (cachedData) {
          allData = JSON.parse(cachedData)
        } else {
          // 프리패치된 데이터가 로컬스토리지에 없을 경우에는 데이터를 getData() 함수를 사용해 불러옴
          allData = getData()
        }

        const filtered = filterData(allData, savedEmoji, savedEmoji)
        currentData = getRandomData(filtered, 4)

        // 결과 저장 및 사용한 이모지 삭제 (중복 생성 방지)
        localStorage.setItem('selectedBookList', JSON.stringify(currentData))
        localStorage.removeItem(IMOJI)
      } else {
        // 새로고침한 경우: 이미 뽑아둔 데이터 꺼내기
        const savedLocalData = localStorage.getItem('selectedBookList')
        if (savedLocalData) {
          currentData = JSON.parse(savedLocalData)
        }
      }

      // 데이터가 준비되었다면 화면에 뿌리기
      if (currentData) {
        displayPhraseResult(currentData)
      } else {
        // 아무 데이터도 없다면 홈으로 이동
        alert('저장된 데이터가 존재하지 않습니다.')
        location.href = '/index.html'
        return
      }

      hideLoadingDisplay() 
    }

    // 공유 버튼
    const shareButton = document.querySelector('.share-button')
    if (shareButton && currentData) {
      shareButton.addEventListener('click', () => {
        shareResult(currentData[0])
      })
    }
  } catch (error) {
    console.error('데이터 로드 중 오류 발생:', error)
    hideLoadingDisplay()
  }
})
