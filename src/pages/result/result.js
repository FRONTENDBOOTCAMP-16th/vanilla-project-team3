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
const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')

/**
 * 페이지 초기 진입 시 실행
 */
async function initPage() {
  window.__skipSmartRecommendation = true
  const loadEmail = loadStorage(LOGIN_AUTH_DATA)

  // 이번에 선택한 감정/날씨를 localStorage에서 가져오기
  let mood = {}
  let weather = {}
  let viewed = []

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
  if (loadEmail?.email) {
    const userData = await getUser(EMAIL, loadEmail.email)
    viewed = userData.viewed || []
  }

  // 기본 데이터 로드
  const allBooks = await getData()

  applyDisableIfChecked()
  syncEmojiCheckboxes()
  await handleResultDisplay(allBooks, mood, weather, viewed)
  bindHeartEvents(loadEmail, allBooks)
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
async function handleResultDisplay(allBooks, mood, weather, viewed) {
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

      if (recommended && recommended.length > 0) {
        currentData = recommended
      } else {
        console.log('getLocalOrCalculatedData 사용')
        currentData = await getLocalOrCalculatedData()
      }
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

function bindHeartEvents(loadEmail, allBooks) {
  // [수정] setTimeout(1500) 제거 - initPage에서 await로 순서가 보장되므로 불필요
  // setTimeout(() => {
  document.querySelectorAll('.save-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!loadEmail) return

      // [수정] 클릭 전 상태를 읽던 방식 → 토글 먼저 하고 토글 후 상태를 읽는 방식으로 변경
      // 기존 코드: const isActive = btn.classList.contains('heart-active')
      const isActive = btn.classList.toggle('heart-active')
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false')

      const imgSrc = btn.querySelector('.book-cover-img')?.src
      // [수정] cachedBookData 대신 allBooks 직접 사용
      // cachedBookData가 없거나 "undefined" 문자열일 경우 에러 방지
      // const cachedData = JSON.parse(
      //   localStorage.getItem('cachedBookData') || '[]',
      // )
      // const book = cachedData.find((b) => b.bookCover === imgSrc)
      const book = allBooks.find((b) => b.bookCover === imgSrc)
      if (book) {
        const savedData = JSON.parse(
          localStorage.getItem(LOGIN_AUTH_DATA) || '{}',
        )

        if (isActive) {
          // [수정] 중복 체크 없이 push하던 방식 → includes로 중복 체크 후 추가
          // 기존 코드: savedData.heart = [...(savedData.heart || []), String(book.id)]
          const currentHeart = savedData.heart || []
          if (!currentHeart.includes(String(book.id))) {
            savedData.heart = [...currentHeart, String(book.id)]
          }
        } else {
          savedData.heart = (savedData.heart || []).filter(
            (id) => id !== String(book.id),
          )
        }

        localStorage.setItem(LOGIN_AUTH_DATA, JSON.stringify(savedData))
        updateHeartToServer(book.id, isActive)

        if (book.tags) {
          updateGenrePreference(book.tags, isActive ? 1 : -1)
          // [수정] 디버깅용 console.log 제거
          // const preference = JSON.parse(
          //   localStorage.getItem('genrePreference') || '{}',
          // )
          // const allTags = [...new Set(allBooks.flatMap((b) => b.tags || []))]
          // console.log(
          //   '전체 태그별 점수:',
          //   allTags.map((tag) => `${tag}: ${preference[tag] || 0}점`),
          // )
        }
      }
    })
  })
  // }, 1500)
}

// 실행
initPage()
