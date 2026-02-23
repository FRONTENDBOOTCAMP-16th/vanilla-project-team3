// smartRecommendBridge.js
import {
  getData,
  getViewedIds,
  updateViewedIds,
  resetViewedHistory,
} from '../../../api/api.js'
import { getUniqueRandomData } from './_recommendService.js'
import {
  getSelectedValues,
  filterData,
  displayPhraseResult,
} from './_phraseLoader.js' // 필터 도구들

// URL의 마지막 경로(숫자)를 잘라내는 함수
const getBookIdFromUrl = (url) => {
  if (!url) return null
  const parts = url.split('/')
  return parts[parts.length - 1] // 마지막 요소 반환
}

export async function runSmartRecommendation() {
  try {
    // 1. 필요한 모든 재료를 가져옴
    const [allBooks, viewedIds] = await Promise.all([getData(), getViewedIds()])

    // 2. 필터 도구로 1차 거르기
    const moods = getSelectedValues('checkbox-mood')
    const weathers = getSelectedValues('checkbox-weather')
    const filtered = filterData(allBooks, moods, weathers)

    // 3. 만든 계산기로 '안 본 책 4권' 확정
    const { result, shouldReset } = getUniqueRandomData(filtered, 4, viewedIds)

    if (result.length > 0) {
      // 4. 화면에 그리기
      displayPhraseResult(result)

      // 5. 서버에 본 것 기록 (94권 다 봤으면 리셋)
      if (shouldReset) await resetViewedHistory()

      // [확인용] 콘솔에서 데이터 생김새를 정확히 확인합니다.
      console.log('추천된 데이터 전체:', result)
      console.log('첫 번째 책 데이터:', result[0])

      // ID 추출 (필드명이 id가 맞는지 콘솔 로그를 통해 확인해야 합니다)
      const idsToStore = result
        .map((book) => getBookIdFromUrl(book.bookstoreUrl)) // URL에서 숫자 추출
        .filter((id) => id !== null)

      console.log('서버에 저장할 고유 상품 번호들:', idsToStore)

      if (idsToStore.length > 0) {
        await updateViewedIds(idsToStore)
      }

      // 6. 기존 코드와 호환
      window.selectedJsonData = result[0]
    }
  } catch (error) {
    console.error('추천 실행 중 에러:', error)
  }
}
