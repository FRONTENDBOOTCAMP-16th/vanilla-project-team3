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
        mood,
        weather,
        phrase,
        bookstoreUrl,
        bookTitle,
        bookCover,
        author,
      }) => {
        return {
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

getData('mood').then((res) => console.log(res))
