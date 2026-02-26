import { loadStorage } from '/src/js/utils/index.js'
import { displayPhraseResult } from '../../js/components/_phraseLoader.js'
import { shareResult } from '../../js/components/_share.js'
import { IS_CHECKED_KEY, IMOJI } from '/src/js/constants/index.js'
import { filterData, getRandomData } from '../../js/components/_phraseLoader.js'
import {
  showLoadingDisplay,
  hideLoadingDisplay,
} from '../../js/components/_imageLoading.js'
import { getData, getUser } from '../../../api/api.js'
import { EMAIL, LOGIN_AUTH_DATA } from '../../js/constants/index.js'

const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')

const doubleCheckedGroups = container.querySelectorAll(
  '[data-checked="doubleChecked"]',
)
const loadEmail = loadStorage(LOGIN_AUTH_DATA)
const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')
const allBooks = await getData()
const user = await getUser(EMAIL, loadEmail.email)
const mood = user.mood_counts
const weather = user.weather_counts

const SCORE_POINT = 1

// 페이지 초기화
init()

function init() {
  applyDisableIfChecked()
  getRecommendations(allBooks, mood, weather)
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

// 날씨,기분 점수 계산
// TODO =====================================================
function scoreBook(book, mood, weather) {
  let score = 0
  // 현재 기분 점수
  score += scoreCalculate(book, 'mood', mood)
  // 현재 날씨 점수
  score += scoreCalculate(book, 'weather', weather)

  return score
}

function scoreCalculate(book, key, value) {
  // 방어코드 - 값이 없으면 0점
  if (!value) return 0

  let score = 0

  const tagKey = book[key]

  // 키에 value가 포함되어 있으면 점수
  Object.entries(value).forEach(([name, count]) => {
    if (tagKey.includes(name)) {
      score += count * SCORE_POINT
    }
  })

  return score
}

// 최종 추천 리스트 생성
function getRecommendations(allBooks, mood, weather) {
  return allBooks
    .map((book) => ({
      ...book,
      score: scoreBook(book, mood, weather),
    }))
    .filter((book) => book.score !== -Infinity)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
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

      const savedLocalData = localStorage.getItem('selectedBookList')

      if (savedLocalData) {
        currentData = JSON.parse(savedLocalData)
      } else {
        const savedEmoji = JSON.parse(localStorage.getItem(IMOJI))

        if (savedEmoji) {
          let allData = null
          const cachedData = localStorage.getItem('cachedBookData')
          allData = cachedData ? JSON.parse(cachedData) : await getData()

          const filtered = filterData(allData, savedEmoji, savedEmoji)
          currentData = getRandomData(filtered, 4)

          localStorage.setItem('selectedBookList', JSON.stringify(currentData))
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

// ---------------------- 찜 목록 userAPI 서버에 보내기 ----------------------

const VITE_API_BASE_URL = import.meta.env.VITE_DATA_API_URL

async function updateHeartToServer(bookId, isAdding) {
  // 1. 로그인 유저 확인
  const loginData = loadStorage(LOGIN_AUTH_DATA)
  if (!loginData) return

  const userId = loginData.id
  if (!userId) return

  try {
    // 2. 서버에서 현재 유저 데이터 가져오기
    const response = await fetch(
      `${VITE_API_BASE_URL}/todayPhrase/user/${userId}`,
    )
    if (!response.ok) return
    const userData = await response.json()

    // 3. heart 배열 업데이트
    let heart = Array.isArray(userData.heart) ? [...userData.heart] : []

    if (isAdding) {
      if (!heart.includes(String(bookId))) {
        heart.push(String(bookId))
      }
    } else {
      heart = heart.filter((id) => id !== String(bookId))
    }

    // 4. 서버에 PUT 요청
    await fetch(`${VITE_API_BASE_URL}/todayPhrase/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userData,
        heart: heart,
      }),
    })

    console.log('찜 목록 업데이트:', heart)
  } catch (error) {
    console.error('찜 서버 업데이트 실패:', error)
  }
}

// 하트 버튼 클릭 이벤트
setTimeout(() => {
  const saveBtns = document.querySelectorAll('.save-button')

  saveBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const loginData = loadStorage(LOGIN_AUTH_DATA)
      if (!loginData) return

      const imgSrc = btn.querySelector('.book-cover-img').src
      const cachedData = JSON.parse(
        localStorage.getItem('cachedBookData') || '[]',
      )
      const book = cachedData.find((b) => b.bookCover === imgSrc)

      if (book) {
        const isActive = btn.classList.contains('heart-active')
        updateHeartToServer(book.id, isActive)
      }
    })
  })
}, 1500)
