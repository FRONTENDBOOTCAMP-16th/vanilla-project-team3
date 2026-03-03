/**
 * [추천 책 제외 랜덤 추출 함수]
 * @param {Array} filteredData - 필터링된 전체 도서 데이터
 * @param {number} count - 화면에 보여줄 책 개수 (보통 4개)
 * @param {Array} viewedIds - 사용자가 이미 본 책의 ID 목록 (서버/로컬에서 가져옴)
 * @returns {Object} { result: 뽑힌 데이터 배열, shouldReset: 기록 초기화 여부 }
 */
export function getUniqueRandomData(filteredData, count, viewedIds = []) {
  let freshData = filteredData.filter((item) => {
    return !viewedIds.map(String).includes(String(item.id))
  })

  let shouldReset = false

  if (freshData.length < count) {
    freshData = [...filteredData]
    shouldReset = true
  }

  const result = []
  const freshCopy = [...freshData]

  for (let i = 0; i < count; i++) {
    if (freshCopy.length === 0) break
    const randomIndex = Math.floor(Math.random() * freshCopy.length)
    const selectedItem = freshCopy.splice(randomIndex, 1)[0]
    result.push(selectedItem)
  }
  return { result, shouldReset }
}
