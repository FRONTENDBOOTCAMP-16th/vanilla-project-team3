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

// 사용자의 기분/날씨 선택값과 과거 시청 기록을 분석하여
// 중복되지 않은 새로운 명언(책) 4개를 화면에 출력하고 서버에 기록
export async function runSmartRecommendation() {
  try {
    // 1. 기초 데이터 확보: 전체 책 리스트와 유저가 이미 본 ID 목록을 병렬로 가져옴
    const [allBooks, viewedIds] = await Promise.all([getData(), getViewedIds()])

    // 2. 사용자 입력 필터링: 체크박스에서 선택된 기분/날씨 값을 읽어와 1차 필터링
    const moods = getSelectedValues('checkbox-mood')
    const weathers = getSelectedValues('checkbox-weather')
    const filtered = filterData(allBooks, moods, weathers)

    // 3. 추천 제외 랜덤 함수 실행: 필터링된 결과 중 '안 본 책' 위주로 랜덤 4권 추출 (부족하면 리셋 신호 발생)
    const { result, shouldReset } = getUniqueRandomData(filtered, 4, viewedIds)

    if (result.length > 0) {
      // 4. UI 렌더링: 추출된 4개의 데이터를 화면에 표시
      displayPhraseResult(result)

      // 5. 서버 동기화: 모든 도서를 다 본 상태라면 기록을 초기화(Reset)
      if (shouldReset) await resetViewedHistory()

      // 방금 추천된 4권의 ID를 문자열로 변환하여 유저 기록에 추가(Update)
      const idsToStore = result
        .map((book) => String(book.id))
        .filter((id) => id !== 'undefined')

      if (idsToStore.length > 0) {
        await updateViewedIds(idsToStore)
      }

      // 6. 하위 호환성: 기존 전역 변수 시스템을 사용하는 코드들을 위해 첫 번째 데이터 저장
      window.selectedJsonData = result[0]

      // 데이터 준비가 완료된 시점에 이벤트를 쏴주기
      window.dispatchEvent(new CustomEvent('recommendationReady')) // ← 추가
    }
  } catch (error) {
    console.error('추천 실행 중 에러:', error)
  }
}
