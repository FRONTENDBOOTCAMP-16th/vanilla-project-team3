// 필요한 API 통신 함수들을 가져옵니다.
import {
  getData,
  getViewedIds,
  updateViewedIds,
  resetViewedHistory,
} from '../../../api/api.js'

// 중복 제외 랜덤 추출 로직을 가져옵니다.
import { getUniqueRandomData } from './_recommendService.js'

// 화면 렌더링 및 사용자 필터 도구들을 가져옵니다.
import { getSelectedValues, filterData } from './_phraseLoader.js'
import { handleShowResult } from './_imageLoading.js'
/**
 * [스마트 추천 실행 함수]
 * 사용자의 기분/날씨 선택값과 과거 시청 기록을 분석하여
 * 중복되지 않은 새로운 명언(책) 4개를 화면에 출력하고 서버에 기록합니다.
 */
export async function runSmartRecommendation() {
  try {
    // 1. [데이터 확보] 전체 책 리스트와 유저가 이미 본 ID 목록을 병렬(Promise.all)로 가져와 시간을 단축합니다.
    const [allBooks, viewedIds] = await Promise.all([getData(), getViewedIds()])

    // 2. [사용자 입력 필터링] 체크박스에서 선택된 기분/날씨 값을 읽어와 1차 필터링을 진행합니다.
    const moods = getSelectedValues('checkbox-mood')
    const weathers = getSelectedValues('checkbox-weather')
    const filtered = filterData(allBooks, moods, weathers)

    // 3. [알고리즘 적용] 필터링된 결과 중 '안 본 책' 위주로 랜덤 4권 추출합니다. (부족하면 리셋 신호 발생)
    const { result, shouldReset } = getUniqueRandomData(filtered, 4, viewedIds)

    // 결과 데이터가 존재할 때만 후속 작업을 진행합니다.
    if (result.length > 0) {
      // 4. [UI 출력] 추출된 4개의 데이터를 화면(DOM)에 표시합니다.
      handleShowResult(result)

      // 5. [서버 동기화 - 리셋] 모든 도서를 다 본 상태라면 서버의 시청 기록을 초기화합니다.
      if (shouldReset) await resetViewedHistory()

      // 5. [서버 동기화 - 업데이트] 방금 추천된 4권의 ID를 추출하여 유저 기록에 추가합니다.
      // id가 숫자인 경우를 대비해 String으로 변환하고, 혹시 모를 에러 데이터는 필터링합니다.
      const idsToStore = result
        .map((book) => String(book.id))
        .filter((id) => id !== 'undefined')

      if (idsToStore.length > 0) {
        await updateViewedIds(idsToStore)
      }

      // 6. [전역 상태 연동] 기존 전역 변수 시스템을 사용하는 코드들과의 호환성을 위해 첫 번째 데이터를 저장합니다.
      window.selectedJsonData = result[0]

      // 7. [이벤트 발행] 데이터 준비가 완료되었음을 다른 모듈에 알립니다. (예: 로딩 애니메이션 중단 등)
      window.dispatchEvent(new CustomEvent('recommendationReady'))
    }
  } catch (error) {
    // 비동기 통신이나 로직 처리 중 발생하는 에러를 콘솔에 기록합니다.
    console.error('추천 실행 중 에러:', error)
  }
}
