import { loadStorage } from '../utils'
import { LOGIN_AUTH_DATA } from '../constants'

/**
 * 이 파일은 특정 페이지에 종속되지 않으며,
 * 데이터 계산 및 API 통신과 관련된 비즈니스 로직을 담습니다.
 */

const VITE_API_BASE_URL = import.meta.env.VITE_DATA_API_URL
const SCORE_POINT = 1

// 점수 계산 및 추천 로직
export function scoreCalculate(book, key, value) {
  if (!value) return 0
  let score = 0
  const tagKey = book[key] || []

  Object.entries(value).forEach(([name, count]) => {
    if (tagKey.includes(name)) {
      score += count * SCORE_POINT
    }
  })
  return score
}

const MOOD_PAIR = {
  happy: 'happy',
  sad: 'happy',
  soso: 'happy',
  bad: 'happy',
}
const MOOD_PAIR_POINT = 1
const MOOD_DIRECT_POINT = 3

export function scoreBook(book, mood, weather) {
  let score = 0
  score += scoreCalculate(book, 'mood', mood)
  score += scoreCalculate(book, 'weather', weather)

  const preference = JSON.parse(localStorage.getItem('genrePreference') || '{}')
  const tags = book.tags || []
  tags.forEach((tag) => {
    if (preference[tag]) {
      score += preference[tag] * SCORE_POINT
    }
  })

  // 감정 교차 추천 점수
  if (mood) {
    Object.entries(mood).forEach(([moodName, count]) => {
      if (count) {
        // 직접 매칭: 선택한 감정과 같은 책
        if (book.mood === moodName) {
          score += MOOD_DIRECT_POINT
        }
        // 교차 추천: 매핑된 감정 책 (직접 매칭이 아닌 경우만)
        const pairMood = MOOD_PAIR[moodName]
        if (pairMood && book.mood === pairMood && book.mood !== moodName) {
          score += MOOD_PAIR_POINT
        }
      }
    })
  }
  console.log(
    `${book.bookTitle}: mood=${book.mood}, weather=${book.weather}, 총점=${score}`,
  )
  return score
}

export function getRecommendations(allBooks, mood, weather, viewed = []) {
  return allBooks
    .filter((book) => !viewed.includes(String(book.id)))
    .map((book) => ({
      ...book,
      score: scoreBook(book, mood, weather),
    }))
    .filter((book) => book.score !== -Infinity)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
}

// 선호도 및 찜하기 관련 서버 통신
export function updateGenrePreference(tags, change) {
  const preference = JSON.parse(localStorage.getItem('genrePreference') || '{}')
  tags.forEach((tag) => {
    preference[tag] = (preference[tag] || 0) + change
    if (preference[tag] <= 0) delete preference[tag]
  })
  localStorage.setItem('genrePreference', JSON.stringify(preference))
}

export async function updateHeartToServer(bookId, isAdding) {
  const loginData = loadStorage(LOGIN_AUTH_DATA)
  if (!loginData || !loginData.id) return

  try {
    const response = await fetch(
      `${VITE_API_BASE_URL}/todayPhrase/user/${loginData.id}`,
    )
    if (!response.ok) return
    const userData = await response.json()

    let heart = Array.isArray(userData.heart) ? [...userData.heart] : []
    const strId = String(bookId)

    if (isAdding) {
      if (!heart.includes(strId)) heart.push(strId)
    } else {
      heart = heart.filter((id) => id !== strId)
    }

    await fetch(`${VITE_API_BASE_URL}/todayPhrase/user/${loginData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, heart }),
    })
  } catch (error) {
    console.error('찜 서버 업데이트 실패:', error)
  }
}
