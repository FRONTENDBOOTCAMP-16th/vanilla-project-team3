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
      mood_counts: [happy, sad, soso, bad],
      weather_counts: [sunny, rainy, snowy, dusty, cloudy],
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

// 로그인한 유저의 고유 번호(MockAPI ID)를 가져오는 헬퍼 함수

const getActiveUserId = () => {
  // sessionStorage에서 login.js가 저장한 ID를 가져오면, 탭을 닫을 때 로그인 정보(Id) 자동 삭제
  // 로그인하지 않으면 null을 반환하여 이후 API 요청 원천 차단
  return sessionStorage.getItem('loginUserInternalId') || null
}

// 1. 유저의 노출 기록(viewed) 목록 가져오기
//    서버(MockAPI)에서 해당 유저의 데이터를 조회하여 이미 본 책 ID 배열을 반환
export async function getViewedIds() {
  const targetId = getActiveUserId() // 현재 로그인 유저 ID 확인, null이 올 수 있음

  // [방어 코드] ID(targetId)가 없으면 서버에 물어볼 필요도 없이 빈 목록 반환 (404 에러 방지)
  if (!targetId) {
    console.log('로그인 데이터가 없어 빈 기록을 반환합니다.')
    return []
  }

  try {
    const res = await fetch(`${VITE_API_BASE_URL}/todayPhrase/user/${targetId}`)
    if (!res.ok) return []
    const data = await res.json()
    // 서버 데이터에 viewed 필드가 배열 형태인지 확인 후 반환
    return Array.isArray(data.viewed) ? data.viewed : []
  } catch (error) {
    console.error('노출 기록 로드 실패:', error)
    return []
  }
}

// 2. 새로운 추천 ID들(4개)을 서버에 누적 저장 (PUT 방식)
//    기존에 본 ID 리스트와 방금 본 ID 리스트를 합쳐서 서버에 업데이트
export async function updateViewedIds(newIds) {
  const targetId = getActiveUserId()

  // [방어 코드] 로그인 상태가 아니면 (targetId가 null이면) 기록을 남기지 않음
  if (!targetId) {
    console.log('로그인 전이므로 노출 기록을 업데이트하지 않습니다.')
    return
  }

  try {
    // A. 먼저 현재 서버에 저장된 유저 정보를 가져옴 (기존 viewed 목록을 알기 위해)
    const resGet = await fetch(
      `${VITE_API_BASE_URL}/todayPhrase/user/${targetId}`,
    )
    if (!resGet.ok) throw new Error('유저를 찾을 수 없습니다.')
    const userData = await resGet.json()

    // B. 데이터 병합: [기존 목록 + 새 목록] 합친 뒤 중복 제거(Set 사용) 및 유효성 검사
    const currentViewed = Array.isArray(userData.viewed) ? userData.viewed : []
    const updatedViewed = [...new Set([...currentViewed, ...newIds])].filter(
      (val) => val !== null && val !== undefined,
    )

    // C. 서버 업데이트: 누적된 전체 목록을 다시 서버에 저장(PUT)
    const resPut = await fetch(
      `${VITE_API_BASE_URL}/todayPhrase/user/${targetId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData, // 기존 유저 정보(이름, 이메일 등) 유지
          viewed: updatedViewed, // 업데이트된 목록만 교체
        }),
      },
    )

    if (resPut.ok) console.log(`유저 ${targetId}번 노출 기록 업데이트 완료`)
  } catch (error) {
    console.error('노출 기록 업데이트 실패:', error)
  }
}

// 3. 노출 기록 완전 초기화 (PUT 방식)
//    모든 책을 다 보았거나 리셋이 필요할 때 viewed 배열을 빈 배열([])로 만듦
export async function resetViewedHistory() {
  const targetId = getActiveUserId()
  
  // 로그인 안 했으면 (targetId가 없으면) 무시
  if (!targetId) return

  try {
    // A. 현재 유저 정보를 가져옴
    const resGet = await fetch(
      `${VITE_API_BASE_URL}/todayPhrase/user/${targetId}`,
    )
    if (!resGet.ok) return
    const userData = await resGet.json()

    // B. viewed 필드만 빈 배열로 덮어씌워 서버에 저장
    await fetch(`${VITE_API_BASE_URL}/todayPhrase/user/${targetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userData,
        viewed: [], // 기록 삭제
      }),
    })
    console.log(`유저 ${targetId}번 추천 기록이 초기화되었습니다.`)
  } catch (error) {
    console.error('기록 초기화 실패:', error)
  }
}
