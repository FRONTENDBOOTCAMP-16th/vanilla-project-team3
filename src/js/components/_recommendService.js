/**
 * [추천 책 제외 랜덤 추출 함수]
 * @param {Array} filteredData - 필터링된 전체 도서 데이터
 * @param {number} count - 화면에 보여줄 책 개수 (보통 4개)
 * @param {Array} viewedIds - 사용자가 이미 본 책의 ID 목록 (서버/로컬에서 가져옴)
 * @returns {Object} { result: 뽑힌 데이터 배열, shouldReset: 기록 초기화 여부 }
 */
export function getUniqueRandomData(filteredData, count, viewedIds = []) {
  // 1. [필터링] 이미 본 책은 후보군에서 제외하기
  let freshData = filteredData.filter((item) => {
    // viewedIds가 ["1", "2"] 같은 문자열 배열일 수 있으므로
    // item.id와 viewedIds의 요소를 모두 문자열(String)로 통일해서 비교합니다.
    return !viewedIds.map(String).includes(String(item.id))
  })

  // 리셋 여부를 알려주는 깃발(플래그) 변수
  let shouldReset = false

  // 2. [예외 처리] 안 본 책이 요청한 개수(count)보다 적을 경우
  // 예: 안 본 책은 2권 남았는데 4권을 보여줘야 한다면?
  if (freshData.length < count) {
    // 모든 책을 다시 후보군으로 넣습니다. (무한 루프 방지 및 순환 추천)
    freshData = [...filteredData]
    // "이제 책을 다 봤으니 시청 기록을 비워줘!"라는 신호를 보냅니다.
    shouldReset = true
  }

  const result = []
  // 원본 후보군 데이터를 안전하게 복사합니다.
  const freshCopy = [...freshData]

  // 3. [랜덤 추출] 중복 없이 count만큼 뽑기
  for (let i = 0; i < count; i++) {
    // 후보군이 바닥나면 중단
    if (freshCopy.length === 0) break

    // 현재 남은 후보군 개수 내에서 랜덤한 인덱스 번호 생성
    const randomIndex = Math.floor(Math.random() * freshCopy.length)

    // splice를 사용하여 뽑힌 데이터를 배열에서 아예 제거(잘라내기)합니다.
    // 이렇게 하면 다음 반복문에서 똑같은 데이터가 절대 뽑히지 않습니다. (중복 방지)
    const selectedItem = freshCopy.splice(randomIndex, 1)[0]
    result.push(selectedItem)
  }

  // 최종 결과물과 리셋 신호를 객체 형태로 반환합니다.
  return { result, shouldReset }
}
