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
  updateGenrePreference,
} from '../../js/service/bookService.js'
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
const loadEmail = loadStorage(LOGIN_AUTH_DATA)
const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')
const allBooks = await getData()

let mood = {}
let weather = {}
let viewed = []

// 이번에 선택한 감정/날씨를 localStorage에서 가져오기
const savedEmoji = JSON.parse(localStorage.getItem(IMOJI)) || []
savedEmoji.forEach((item) => {
  if (['happy', 'sad', 'soso', 'bad'].includes(item)) {
    mood[item] = 1
  }
  if (['sunny', 'rainy', 'snowy', 'dusty', 'cloudy'].includes(item)) {
    weather[item] = 1
  }
})

// 로그인 유저의 viewed 가져오기
if (loadEmail) {
  const userData = await getUser(EMAIL, loadEmail.email)
  viewed = userData.viewed || []
}
// 페이지 초기화
init()

function init() {
  applyDisableIfChecked()
}

// UI: 체크박스 비활성화 상태 반영
function applyDisableIfChecked() {
  const isChecked = loadStorage(IS_CHECKED_KEY) === 'true'
  if (!isChecked) return
  doubleCheckedGroups.forEach((group) => {
    group.querySelectorAll('input').forEach((input) => (input.disabled = true))
  })
}

// 스토리지에 저장된 감정/날씨 -> 체크로 변환
if (loadStorage(IMOJI)) {
  const savedEmojis = loadStorage(IMOJI)
  if (savedEmojis) {
    buttons.forEach((checkbox) => {
      const checkImojis = checkbox.querySelectorAll('[data-value]')
      checkImojis.forEach((input) => {
        if (savedEmojis.includes(input.dataset.value)) input.checked = true
      })
    })
  }
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
      const recommended = getRecommendations(allBooks, mood, weather, viewed)
      console.log('recommended 결과:', recommended.length, '권')
      console.log('mood:', mood)
      console.log('weather:', weather)

      if (recommended && recommended.length > 0) {
        currentData = recommended
      } else {
        currentData = await getLocalOrCalculatedData()
      }
    }

    if (currentData) {
      console.log(
        '최종 추천:',
        currentData.map((b) => `${b.bookTitle} (${b.mood})`),
      )
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
  setTimeout(() => {
    document.querySelectorAll('.save-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!loadEmail) return // ← 이거 추가

        const imgSrc = btn.querySelector('.book-cover-img')?.src
        const cachedData = JSON.parse(
          localStorage.getItem('cachedBookData') || '[]',
        )
        const book = cachedData.find((b) => b.bookCover === imgSrc)
        if (book) {
          const isActive = btn.classList.contains('heart-active')
          updateHeartToServer(book.id, isActive)
          if (book.tags) {
            updateGenrePreference(book.tags, isActive ? 1 : -1)
          }
        }
      })
    })
  }, 1500)
}

async function initPage() {
  await handleResultDisplay()
  bindHeartEvents()
}
// 실행
initPage()
