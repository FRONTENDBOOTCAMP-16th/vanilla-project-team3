import { LOGIN_AUTH_DATA } from '../src/js/constants'

const VITE_API_BASE_URL = import.meta.env.VITE_DATA_API_URL
// 데이터 읽어오기

export async function getData(key, value) {
  try {
    // 헤더 타입
    const headers = {
      'Content-type': 'application/json',
    }
    // 해당 데이터 URL읽어오기
    const response = await fetch(
      `${VITE_API_BASE_URL}/todayPhrase/todaysPhrase`,
      {
        // GET방식, 캐시기본값(캐시가 오래되면 새로불러옴)
        method: 'GET',
        headers,
        cache: 'default',
      },
    )

    // 에러코드 200이 아니면 에러로 간주
    if (!response.ok) {
      console.log('데이터 전달 실패')
      throw new Error('실패')
    }

    // 받아온 자료를 JSON으로 변경
    const data = await response.json()
    // 데이터리스트
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
    // 키값, 벨류값이 있을때 반환
    if (key && value) {
      const result = massagedData.find((item) => item[key] === value)
      return result
    }

    // 키값만 있을때 반환
    if (key && !value) {
      return massagedData.map((item) => item[key])
    }

    // 데이터 전체 반환
    return massagedData
  } catch (error) {
    // 에러페이지 추후 추가
    console.log(error)
  }
}

export async function getUser(key, value) {
  if (key === 'password') {
    console.error('비밀번호를 URL에 노출할 수 있음')
    return null
  }

  try {
    const response = await fetch(
      `${VITE_API_BASE_URL}/todayPhrase/user?${key}=${value}`,
    )

    if (!response.ok) {
      throw new Error(`${key}, ${value} 데이터 가져오기 실패`)
    }

    const [user] = await response.json()

    const {
      id,
      email,
      password,
      userId,
      heart,
      mood_counts: { happy, sad, soso, bad },
      weather_counts: { sunny, rainy, snowy, dusty, cloudy },
    } = user

    // 로그인 사용자 반환 (데이터 마사지)
    return {
      id,
      email,
      password,
      userId,
      heart,
      mood_counts: { happy, sad, soso, bad },
      weather_counts: { sunny, rainy, snowy, dusty, cloudy },
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function putUser(url, data) {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      console.log('데이터 전달 실패')
      throw new Error('실패')
    }
    return await response.json()
  } catch (error) {
    // 에러 콘솔
    console.error(error)
    throw error
  }
}

// API 통신 (서버(MockAPI)와의 직접적인 HTTP 통신을 전담하는 객체)
const UserAPI = {
  // 함수명 앞의 '_'는 내부에서만 사용하는 함수라는 관례적 표시
  _getEndpoint(userId) {
    return `${VITE_API_BASE_URL}/todayPhrase/user/${userId}`
  },

  // 서버에서 유저 한 명의 전체 데이터를 가져오기
  async fetchUserData(userId) {
    const res = await fetch(this._getEndpoint(userId))
    if (!res.ok)
      throw new Error(`유저(${userId}) 데이터를 불러오는 데 실패했습니다.`)
    return res.json()
  },

  //  유저의 데이터를 서버에 업데이트(덮어쓰기)
  async updateUserData(userId, fullData) {
    const res = await fetch(this._getEndpoint(userId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullData),
    })
    if (!res.ok)
      throw new Error(`유저(${userId}) 데이터 업데이트에 실패했습니다.`)
    return res.json()
  },
}

// 비즈니스 로직 (API 통신 없이 순수하게 데이터 가공 및 계산만 수행)
const UserLogic = {
  // 기존에 본 책 ID 리스트와 새로 본 책 ID 리스트를 합치고 중복을 제거
  mergeViewedIds(currentIds, newIds) {
    const current = Array.isArray(currentIds) ? currentIds : []
    const combined = [...new Set([...current, ...newIds])] // Set을 활용하여 중복된 ID를 자동으로 제거
    return combined.filter((id) => id != null) // 유효하지 않은 값(null, undefined) 필터링
  },

  // 기존 유저 데이터에서 노출 기록(viewed)만 초기화한 객체를 생성
  createResetData(userData) {
    return { ...userData, viewed: [] }
  },
}

// 서비스 조율 및 내보내기(Export)
// 로컬 스토리지에서 현재 로그인한 유저의 고유 ID를 가져오기
const getActiveUserId = () => {
  const userData = localStorage.getItem(LOGIN_AUTH_DATA)
  if (!userData) return null
  try {
    const user = JSON.parse(userData)
    return user.id || null
  } catch {
    // JSON 파싱 에러 발생 시(로그인 데이터 오염 등) 안전하게 null 반환
    return null
  }
}

// 현재 유저가 지금까지 본 책들의 ID 목록을 서버에서 가져오기
export async function getViewedIds() {
  const targetId = getActiveUserId()
  if (!targetId) return [] // 비로그인 시 빈 배열 반환

  try {
    const data = await UserAPI.fetchUserData(targetId)
    return Array.isArray(data.viewed) ? data.viewed : []
  } catch (error) {
    console.warn('노출 기록 로드 실패:', error.message)
    return []
  }
}

// 새로 본 책 ID들을 기존 기록에 누적하여 서버에 저장
export async function updateViewedIds(newIds) {
  const targetId = getActiveUserId()
  // 로그인 상태가 아니거나 업데이트할 ID가 없으면 중단
  if (!targetId || !newIds.length) return

  try {
    // 서버에서 최신 유저 데이터를 먼저 가져옴
    const userData = await UserAPI.fetchUserData(targetId)
    // 로직 레이어를 통해 기록 병합
    const updatedViewed = UserLogic.mergeViewedIds(userData.viewed, newIds)
    // 최종 결과 서버에 전송
    await UserAPI.updateUserData(targetId, {
      ...userData,
      viewed: updatedViewed,
    })
    console.log(`[Success] 유저 ${targetId}번 노출 기록 업데이트 완료`)
  } catch (error) {
    console.error('[Error] 기록 업데이트 중 오류 발생:', error.message)
  }
}

// 유저의 모든 노출 기록을 삭제하여 처음부터 다시 추천받을 수 있게 함
export async function resetViewedHistory() {
  const targetId = getActiveUserId()
  if (!targetId) return

  try {
    const userData = await UserAPI.fetchUserData(targetId)
    // 로직 레이어를 통해 초기화 데이터 생성
    const resetData = UserLogic.createResetData(userData)

    // 서버 데이터 덮어쓰기
    await UserAPI.updateUserData(targetId, resetData)
    console.log(`[Success] 유저 ${targetId}번 추천 기록 초기화 완료`)
  } catch (error) {
    console.error('[Error] 기록 초기화 중 오류 발생:', error.message)
  }
}
