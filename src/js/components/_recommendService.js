
// 이미 본 책을 제외하고 4개를 랜덤 추출 (데이터 소진 시 자동 리셋 신호 발생)

export function getUniqueRandomData(filteredData, count, viewedIds = []) {
  // 1. 안 본 책(Fresh)만 골라내기
  let freshData = filteredData.filter(item => !viewedIds.includes(item.id))
  let shouldReset = false

  // 2. [자동 순환 로직] 안 본 책이 뽑을 개수(4개)보다 적으면 전체 데이터에서 다시 뽑기
  if (freshData.length < count) {
    console.log("모든 도서를 확인하여 추천 기록을 초기화하고 다시 시작합니다.")
    freshData = [...filteredData] // 후보군을 전체로 초기화
    shouldReset = true            // 서버 기록을 비우라는 신호
  }

  const result = []
  const freshCopy = [...freshData]

  // 3. 랜덤하게 4개 추출
  for (let i = 0; i < count; i++) {
    if (freshCopy.length === 0) break
    const randomIndex = Math.floor(Math.random() * freshCopy.length)
    result.push(freshCopy.splice(randomIndex, 1)[0])
  }

  return { result, shouldReset }
}