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
import { filterData, getRandomData } from '../../js/components/_phraseLoader.js'
import {
  showLoadingDisplay,
  hideLoadingDisplay,
  handleShowResult,
} from '../../js/components/_imageLoading.js'
import { shareResult } from '../../js/components/_share.js'
import { getData, getUser } from '../../../api/api.js'
import { updateUserDiSplay } from '../../js/components/_popup.js'

/**
 * 이 파일은 페이지가 로드될 때 실행되며,
 * DOM에 접근하고 UI를 렌더링하는 역할을 수행합니다.
 */
const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')

const doubleCheckedGroups = container.querySelectorAll(
  '[data-checked="doubleChecked"]',
)
const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')

/**
 * 페이지 초기 진입 시 실행되는 메인 함수
 */
async function initPage() {
  window.__skipSmartRecommendation = true
  const loadEmail = loadStorage(LOGIN_AUTH_DATA)

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

  const savedData = JSON.parse(localStorage.getItem(LOGIN_AUTH_DATA) || '{}')
  const heartIds = (savedData.heart || []).map(Number)

  if (loadEmail?.email) {
    const userData = await getUser(EMAIL, loadEmail.email)
    viewed = userData.viewed || []
  }

  const allBooks = await getData()
  const excludeIds = [...new Set([...viewed, ...heartIds])]

  applyDisableIfChecked()
  syncEmojiCheckboxes()
  await handleResultDisplay(allBooks, mood, weather, excludeIds)
  bindHeartEvents(allBooks)
}

// UI: 이미 검사가 끝났다면(isChecked) 체크박스를 클릭하지 못하게 비활성화합니다.
function applyDisableIfChecked() {
  const isChecked = loadStorage(IS_CHECKED_KEY) === 'true'
  if (!isChecked) return
  doubleCheckedGroups.forEach((group) => {
    group.querySelectorAll('input').forEach((input) => (input.disabled = true))
  })
}

// UI: 로컬 스토리지에 저장된 내가 고른 이모지 값을 찾아 체크박스에 체크 표시를 합니다.
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

/**
 * 메인 로직: 결과 표시 (직접 접속 vs 공유 링크 접속 구분)
 */
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
        currentData = await getLocalOrCalculatedData()
      }
    }

    if (currentData) {
      window.selectedJsonData = Array.isArray(currentData)
        ? currentData
        : currentData

      handleShowResult(currentData)
      bindShareEvent(currentData)
    } else {
      alert('저장된 데이터가 존재하지 않습니다.')
      location.href = '/index.html'
    }
  } catch (error) {
    console.error('데이터 로드 중 오류:', error)
    hideLoadingDisplay()
  }
}

/**
 * 공유 데이터 파싱: 친구가 공유한 링크의 URL 정보를 분석하여 책 정보를 복원합니다.
 */
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

/**
 * 일반 진입 데이터 로직: 로컬 스토리지에 저장된 내 선택 결과를 가져오거나 계산합니다.
 */
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

// 공유하기 버튼 클릭 시 카카오톡이나 링크 복사 등의 기능을 실행하도록 연결합니다.
export function bindShareEvent(data) {
  const shareButton = document.querySelector('.share-button')
  if (shareButton) {
    shareButton.onclick = (e) => {
      e.preventDefault()
      shareResult(data)
    }
  }
}

/**
 * 하트(좋아요) 이벤트 연결: 사용자가 추천된 책의 하트 버튼을 누르면 서버에 저장합니다.
 */
function bindHeartEvents(allBooks) {
  document.querySelectorAll('.save-button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const loadEmail = loadStorage(LOGIN_AUTH_DATA)
      if (!loadEmail) {
        const loginDialog = document.querySelector('.login-dialog')
        loginDialog?.showModal()
        return
      }

      const isActive = btn.classList.toggle('heart-active')
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false')

      const imgSrc = btn.querySelector('.book-cover-img')?.src
      const book = allBooks.find((b) => b.bookCover === imgSrc)

      if (book) {
        const savedData = JSON.parse(
          localStorage.getItem(LOGIN_AUTH_DATA) || '{}',
        )

        if (isActive) {
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
        await updateHeartToServer(book.id, isActive)

        if (!isActive) {
          const myPageDialog = document.querySelector('.my-page-dialog')
          if (myPageDialog?.open) {
            updateUserDiSplay()
          }
        }

        if (book.tags) {
          updateGenrePreference(book.tags, isActive ? 1 : -1)
        }
      }
    })
  })
}

window.addEventListener('DOMContentLoaded', initPage)
