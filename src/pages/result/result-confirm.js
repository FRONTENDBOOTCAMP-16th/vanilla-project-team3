import { loadStorage } from '../../js/utils'
import {
  IS_CHECKED_KEY,
  IMOJI,
  LOGIN_AUTH_DATA,
  EMAIL,
} from '/src/js/constants'
import {
  getRecommendations,
  updateHeartToServer,
} from '../../js/services/booService.js'
import {
  displayPhraseResult,
  filterData,
  getRandomData,
} from '../../js/components/_phraseLoader.js'
import {
  showLoadingDisplay,
  hideLoadingDisplay,
} from '../../js/components/_imageLoading.js'
import { shareResult } from '../../js/components/_share.js'
import { getData, getUser } from '../../../api/api.js'

/**
 * 이 파일은 페이지가 로드될 때 실행되며,
 * DOM에 접근하고 UI를 렌더링하는 역할을 수행합니다.
 */

// 1. DOM 요소 참조
const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')

const doubleCheckedGroups = container.querySelectorAll(
  '[data-checked="doubleChecked"]',
)
const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')

/**
 * 페이지 초기 진입 시 실행
 */
async function initPage() {
  const loadEmail = loadStorage(LOGIN_AUTH_DATA)

  // 기본 데이터 로드
  const allBooks = await getData()

  if (loadEmail?.email) {
    const user = await getUser(EMAIL, loadEmail.email)
    // 추천 로직 실행 (필요 시 결과 활용)
    getRecommendations(allBooks, user.mood_counts, user.weather_counts)
  }

  applyDisableIfChecked()
  syncEmojiCheckboxes()
  handleResultDisplay()
  bindHeartEvents()
}

// UI: 체크박스 비활성화 상태 반영
function applyDisableIfChecked() {
  const isChecked = loadStorage(IS_CHECKED_KEY) === 'true'
  if (!isChecked) return
  doubleCheckedGroups.forEach((group) => {
    group.querySelectorAll('input').forEach((input) => (input.disabled = true))
  })
}

// UI: 저장된 이모지 체크박스 동기화
function syncEmojiCheckboxes() {
  const savedEmojis = loadStorage(IMOJI)
  if (!savedEmojis) return

  buttons.forEach((checkbox) => {
    const checkImojis = checkbox.querySelectorAll('[data-value]')
    checkImojis.forEach((input) => {
      if (savedEmojis.includes(input.dataset.value)) input.checked = true
    })
  })
}

// 메인 로직: 결과 표시 (공유 vs 일반)
async function handleResultDisplay() {
  const urlParams = new URLSearchParams(window.location.search)
  const sharedTitle = urlParams.get('title')
  const sharedIds = urlParams.get('ids')
  let currentData

  try {
    if (sharedTitle) {
      currentData = await getSharedData(sharedTitle, sharedIds, urlParams)
    } else {
      showLoadingDisplay()
      currentData = await getLocalOrCalculatedData()
    }

    if (currentData) {
      displayPhraseResult(currentData)
      bindShareEvent(currentData)
    } else {
      alert('저장된 데이터가 존재하지 않습니다.')
      location.href = '/index.html'
    }
  } catch (error) {
    console.error('데이터 로드 중 오류:', error)
  } finally {
    hideLoadingDisplay()
  }
}

// 공유 데이터 파싱 로직
async function getSharedData(title, ids, params) {
  let allData =
    JSON.parse(localStorage.getItem('cachedBookData')) || (await getData())
  if (ids) {
    const idArray = ids.split(',')
    return idArray
      .map((id) => allData.find((b) => String(b.id) === String(id)))
      .filter(Boolean)
  }
  return [
    {
      bookTitle: title,
      author: params.get('author'),
      phrase: params.get('phrase'),
      bookCover: params.get('bookCover'),
      bookstoreUrl: params.get('bookstoreUrl'),
    },
  ]
}

// 일반 진입 데이터 로직
async function getLocalOrCalculatedData() {
  const savedLocalData = localStorage.getItem('selectedBookList')
  if (savedLocalData) return JSON.parse(savedLocalData)

  const savedEmoji = JSON.parse(localStorage.getItem(IMOJI))
  if (savedEmoji) {
    const cachedData = localStorage.getItem('cachedBookData')
    const allData = cachedData ? JSON.parse(cachedData) : await getData()
    const filtered = filterData(allData, savedEmoji, savedEmoji)
    const result = getRandomData(filtered, 4)
    localStorage.setItem('selectedBookList', JSON.stringify(result))
    return result
  }
  return null
}

function bindShareEvent(data) {
  const shareButton = document.querySelector('.share-button')
  if (shareButton) {
    shareButton.onclick = (e) => {
      e.preventDefault()
      shareResult(data)
    }
  }
}

function bindHeartEvents() {
  // 동적 생성 대응을 위해 이벤트 위임이나 setTimeout 사용 (기존 코드 유지)
  setTimeout(() => {
    document.querySelectorAll('.save-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const imgSrc = btn.querySelector('.book-cover-img')?.src
        const cachedData = JSON.parse(
          localStorage.getItem('cachedBookData') || '[]',
        )
        const book = cachedData.find((b) => b.bookCover === imgSrc)
        if (book) {
          updateHeartToServer(book.id, btn.classList.contains('heart-active'))
        }
      })
    })
  }, 1500)
}

// 실행
window.addEventListener('DOMContentLoaded', initPage)
