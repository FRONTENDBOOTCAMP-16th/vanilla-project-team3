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
 * 이 파일은 결과 페이지의 렌더링을 담당하며, 사용자의 선택과 서버 데이터를 결합합니다.
 */
const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')

const doubleCheckedGroups = container.querySelectorAll(
  '[data-checked="doubleChecked"]',
)
const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')

/**
 * [메인 함수] 페이지 진입 시 가장 먼저 실행되는 초기화 로직
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
  syncHeartStatus(allBooks)
}

/**
 * [UI] 이미 검사를 완료한 유저라면 체크박스를 비활성화(수정 불가) 처리
 */
function applyDisableIfChecked() {
  const isChecked = loadStorage(IS_CHECKED_KEY) === 'true'
  if (!isChecked) return
  doubleCheckedGroups.forEach((group) => {
    group.querySelectorAll('input').forEach((input) => (input.disabled = true))
  })
}

/**
 * [UI] 저장되어 있는 이모지 데이터를 바탕으로 체크박스의 체크 상태를 동기화
 */
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
 * [로직] 결과 화면 표시 처리 (공유 모드 vs 일반 추천 모드)
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
 * [공유] 친구에게 전달받은 URL 파라미터를 분석해 특정 도서 정보 복구
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
 * [보조 로직] 저장된 결과 리스트가 있으면 가져오고, 없으면 필터링 후 랜덤 추출
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

/**
 * [공유 버튼] 현재 추천 결과(data)를 외부로 공유할 수 있도록 설정
 */
function bindShareEvent(data) {
  const shareButton = document.querySelector('.share-button')
  if (shareButton) {
    shareButton.onclick = (e) => {
      e.preventDefault()
      shareResult(data)
    }
  }
}

/**
 * [화면 전환] 화면 전환해도 찜한 목록 그대로 표시
 */
function syncHeartStatus(allBooks) {
  const savedData = loadStorage(LOGIN_AUTH_DATA) || {}
  const hearts = savedData.heart || []
  const buttons = document.querySelectorAll('.save-button')

  buttons.forEach((button) => {
    const imgSrc = button.querySelector('.book-cover-img')?.src
    const book = allBooks.find((item) => item.bookCover === imgSrc)

    if (book && hearts.includes(String(book.id))) {
      button.classList.add('heart-active')
      button.setAttribute('aria-pressed', 'true')
    } else {
      button.classList.remove('heart-active')
      button.setAttribute('aria-pressed', 'false')
    }
  })
}

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

initPage()
