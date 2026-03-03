// 외부 유틸리티 및 상수 데이터를 임포트합니다.
import { loadStorage } from '../utils'
import { LOGIN_AUTH_DATA } from '../constants'

/**
 * 이 파일은 특정 페이지에 종속되지 않으며,
 * 데이터 계산 및 API 통신과 관련된 비즈니스 로직을 담습니다.
 */

// API 기본 주소와 점수 계산에 사용될 기본 단위 점수를 설정합니다.
const VITE_API_BASE_URL = import.meta.env.VITE_DATA_API_URL
const SCORE_POINT = 1

/**
 * [점수 계산 기초 함수]
 * 책의 특정 키(mood, weather 등)가 사용자의 선택값과 일치할 때마다 점수를 누적합니다.
 * @param {Object} book - 도서 객체
 * @param {string} key - 비교할 책의 속성 키 (예: 'mood', 'weather')
 * @param {Object} value - 사용자의 선택 데이터 (예: { happy: 2, sad: 1 })
 */
export function scoreCalculate(book, key, value) {
  if (!value) return 0
  let score = 0
  const tagKey = book[key] || [] // 책에 등록된 태그 목록 (없으면 빈 배열)

  // 사용자가 선택한 각 항목과 책의 태그를 비교하여 점수를 합산합니다.
  Object.entries(value).forEach(([name, count]) => {
    if (tagKey.includes(name)) {
      score += count * SCORE_POINT
    }
  })
  return score
}

// 감정 매칭을 위한 쌍(Pair) 정의 및 가중치 점수 설정
const MOOD_PAIR = {
  happy: 'happy',
  sad: 'sad',
  soso: 'soso',
  bad: 'bad',
}
const MOOD_PAIR_POINT = 1
const MOOD_DIRECT_POINT = 3

/**
 * [도서 개별 점수 산정 함수]
 * 기분, 날씨, 개인 선호 장르, 감정 직접 매칭 등을 종합하여 한 권의 최종 점수를 계산합니다.
 */
export function scoreBook(book, mood, weather) {
  let score = 0

  // 1. 기분(mood)과 날씨(weather) 태그 매칭 점수 합산
  score += scoreCalculate(book, 'mood', mood)
  score += scoreCalculate(book, 'weather', weather)

  // 2. 장르 선호도(genrePreference) 점수 합산
  // 로컬 스토리지에서 사용자의 장르 취향 데이터를 가져와 책의 태그와 대조합니다.
  const preference = JSON.parse(localStorage.getItem('genrePreference') || '{}')
  const tags = book.tags || []
  tags.forEach((tag) => {
    if (preference[tag]) {
      score += preference[tag] * SCORE_POINT
    }
  })

  // 3. 감정 직접 매칭 및 교차 추천 가중치
  if (mood) {
    Object.entries(mood).forEach(([moodName, count]) => {
      if (count) {
        // 책의 대표 감정이 사용자의 현재 감정과 정확히 일치하면 높은 가중치(+3) 부여
        if (book.mood === moodName) {
          score += MOOD_DIRECT_POINT
        }
        // 연관된 감정(Pair)이 매칭될 경우 추가 점수(+1) 부여
        const pairMood = MOOD_PAIR[moodName]
        if (pairMood && book.mood === pairMood && book.mood !== moodName) {
          score += MOOD_PAIR_POINT
        }
      }
    })
  }

  return score
}

/**
 * [최종 추천 리스트 추출 함수]
 * 전체 도서 중 이미 본 책을 제외하고 점수가 높은 상위 4권을 반환합니다.
 * @param {Array} allBooks - 전체 도서 목록
 * @param {Object} mood - 사용자 기분 데이터
 * @param {Object} weather - 사용자 날씨 데이터
 * @param {Array} viewed - 이미 본 도서 ID 목록
 */
export function getRecommendations(allBooks, mood, weather, viewed = []) {
  const result = allBooks
    // 1. 이미 본 책 제외 (ID 비교)
    .filter((book) => !viewed.includes(String(book.id)))
    // 2. 각 책마다 추천 점수 계산하여 할당
    .map((book) => ({
      ...book,
      score: scoreBook(book, mood, weather),
    }))
    // 3. 유효한 점수를 가진 책만 필터링
    .filter((book) => book.score !== -Infinity)
    // 4. 점수가 높은 순(내림차순)으로 정렬
    .sort((a, b) => b.score - a.score)
    // 5. 상위 4권만 추출
    .slice(0, 4)

  return result
}

/**
 * [장르 선호도 업데이트 함수]
 * 특정 장르의 태그가 선택되거나 해제될 때 로컬 스토리지의 선호도 수치를 변경합니다.
 * @param {Array} tags - 업데이트할 태그 목록
 * @param {number} change - 증감 수치 (예: +1 또는 -1)
 */
export function updateGenrePreference(tags, change) {
  const preference = JSON.parse(localStorage.getItem('genrePreference') || '{}')
  tags.forEach((tag) => {
    preference[tag] = (preference[tag] || 0) + change
    // 점수가 0 이하면 해당 장르를 선호 목록에서 삭제하여 최적화합니다.
    if (preference[tag] <= 0) delete preference[tag]
  })
  localStorage.setItem('genrePreference', JSON.stringify(preference))
}

/**
 * [찜하기 서버 동기화 함수]
 * 사용자가 특정 책을 '찜'하거나 '취소'할 때 서버의 유저 데이터(heart 배열)를 업데이트합니다.
 * @param {string|number} bookId - 찜할 도서 ID
 * @param {boolean} isAdding - 추가인지 삭제인지 여부
 */
export async function updateHeartToServer(bookId, isAdding) {
  const loginData = loadStorage(LOGIN_AUTH_DATA)
  if (!loginData || !loginData.id) return // 로그인이 안 되어 있으면 중단

  try {
    // 1. 현재 서버에 저장된 유저 데이터를 먼저 가져옵니다.
    const response = await fetch(
      `${VITE_API_BASE_URL}/todayPhrase/user/${loginData.id}`,
    )
    if (!response.ok) return
    const userData = await response.json()

    // 2. 기존 찜 목록(heart)을 복사하거나 초기화합니다.
    let heart = Array.isArray(userData.heart) ? [...userData.heart] : []
    const strId = String(bookId)

    // 3. 추가/삭제 로직 수행
    if (isAdding) {
      // 목록에 없을 때만 추가 (중복 방지)
      if (!heart.includes(strId)) heart.push(strId)
    } else {
      // 해당 ID를 목록에서 제거
      heart = heart.filter((id) => id !== strId)
    }

    // 4. 서버에 최종 수정된 데이터를 PUT 요청으로 전송합니다.
    await fetch(`${VITE_API_BASE_URL}/todayPhrase/user/${loginData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, heart }),
    })
  } catch (error) {
    console.error('찜 서버 업데이트 실패:', error)
  }
}
