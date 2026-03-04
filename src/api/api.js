import { LOGIN_AUTH_DATA } from '../js/constants/index'

const VITE_API_BASE_URL = import.meta.env.VITE_DATA_API_URL

/**
 * [공통] API 호출 전담 함수
 */
export async function fetchAPI(endpoint, options = {}) {
  try {
    const url = `${VITE_API_BASE_URL}${endpoint}`
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${url}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API 호출 오류:', error)
    throw error
  }
}

/**
 * [API 계층] 데이터 접근 레이어
 */
export const UserAPI = {
  // 특정 ID 기반 단일 유저 조회 (reset/update용)
  async fetchUserData(userId) {
    return await fetchAPI(`/todayPhrase/user/${userId}`)
  },

  // 유저 정보 덮어쓰기 (PUT)
  async updateUserData(userId, data) {
    return await fetchAPI(`/todayPhrase/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
}

/**
 * [로직 계층] 순수 비즈니스 로직
 */
const UserLogic = {
  // 본 기록 초기화
  clearViewedHistory: (userData) => ({
    ...userData,
    viewed: [],
  }),

  // 본 기록 중복 없이 합치기
  mergeViewedIds(currentIds, newIds) {
    const current = Array.isArray(currentIds) ? currentIds : []
    const combined = [...new Set([...current, ...newIds])]
    return combined.filter((id) => id != null)
  },
}

/**
 * [유틸리티] 현재 로그인 유저 ID 확인
 */
const getActiveUserId = () => {
  const userData = localStorage.getItem(LOGIN_AUTH_DATA)
  if (!userData) return null
  try {
    const user = JSON.parse(userData)
    return user.id || null
  } catch {
    return null
  }
}

/* ============================================================ */
/* [EXPORT FUNCTIONS] - 실제 프로젝트에서 사용하는 함수들            */
/* ============================================================ */

/**
 * 1. 기존 getData 로직
 */
export async function getData(key, value) {
  try {
    const data = await fetchAPI('/todayPhrase/todaysPhrase')
    const massagedData = data.map(
      ({
        id,
        mood,
        weather,
        phrase,
        bookstoreUrl,
        bookTitle,
        bookCover,
        author,
        tags,
      }) => {
        return {
          id,
          mood,
          weather,
          phrase,
          bookstoreUrl,
          bookTitle,
          bookCover,
          author,
          tags,
        }
      },
    )

    if (key && value) {
      return massagedData.find((item) => item[key] === value)
    }
    if (key && !value) {
      return massagedData.map((item) => item[key])
    }
    return massagedData
  } catch (error) {
    console.error('getData 실패:', error)
  }
}

/**
 * 2. 기존 getUser 로직
 */
export async function getUser(key, value) {
  if (key === 'password') {
    console.error('비밀번호 노출 위험으로 조회를 차단합니다.')
    return null
  }

  try {
    const data = await fetchAPI(`/todayPhrase/user?${key}=${value}`)
    const user = Array.isArray(data) ? data[0] : data
    if (!user) return null

    const {
      id,
      email,
      password,
      userId,
      heart,
      isLoggedIn,
      mood_counts: { happy, sad, soso, bad },
      weather_counts: { sunny, rainy, snowy, dusty, cloudy },
    } = user

    return {
      id,
      email,
      password,
      userId,
      heart,
      isLoggedIn,
      mood_counts: { happy, sad, soso, bad },
      weather_counts: { sunny, rainy, snowy, dusty, cloudy },
    }
  } catch (error) {
    console.error('getUser 실패:', error)
    return null
  }
}

/**
 * 3. 추천 기록 조회
 */
export async function getViewedIds() {
  const targetId = getActiveUserId()
  if (!targetId) return []

  try {
    const data = await UserAPI.fetchUserData(targetId)
    return Array.isArray(data.viewed) ? data.viewed : []
  } catch (error) {
    console.error('노출 기록 로드 실패:', error)
    return []
  }
}

/**
 * 4. 추천 기록 업데이트
 */
export async function updateViewedIds(newIds) {
  const targetId = getActiveUserId()
  if (!targetId || !newIds.length) return

  try {
    const userData = await UserAPI.fetchUserData(targetId)
    const updatedViewed = UserLogic.mergeViewedIds(userData.viewed, newIds)

    await UserAPI.updateUserData(targetId, {
      ...userData,
      viewed: updatedViewed,
    })
  } catch (error) {
    console.error('기록 업데이트 중 오류:', error)
  }
}

/**
 * 5. 추천 기록 초기화
 */
export async function resetViewedHistory() {
  const targetId = getActiveUserId()
  if (!targetId) return

  try {
    const userData = await UserAPI.fetchUserData(targetId)
    const resetData = UserLogic.clearViewedHistory(userData)
    await UserAPI.updateUserData(targetId, resetData)
  } catch (error) {
    console.error('기록 초기화 실패:', error)
  }
}
