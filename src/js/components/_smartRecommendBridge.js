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

      // ID 추출
      const idsToStore = result
        .map((book) => String(book.id))
        .filter((id) => id !== 'undefined')

      console.log('서버에 저장할 책 Id들:', idsToStore)

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
