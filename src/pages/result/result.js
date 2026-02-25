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
import { EMAIL } from '../../js/constants/index.js'

const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')

const doubleCheckedGroups = container.querySelectorAll(
  '[data-checked="doubleChecked"]',
)
const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')
const allBooks = await getData()
const user = await getUser(EMAIL, 'user2@example.com')
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
//  희연님 여기 scoreBook안에 명세서35번 기능 추가해주시면 되요
//  다하신뒤에 혹시 제 기능이랑 희연님 기능 둘다 작동되는지도 확인해주세요 :)
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
