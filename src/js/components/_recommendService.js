// 추천한 책을 제외하고 4개를 랜덤 추출하는 함수

export function getUniqueRandomData(filteredData, count, viewedIds = []) {
  // 1. item.id를 기반으로 안 본 책 골라내기
  let freshData = filteredData.filter((item) => {
    // viewedIds가 ["1"] 형태이므로 타입 변환시켜 문자열로 통일한 후 비교
    return !viewedIds.map(String).includes(String(item.id))
  })

  let shouldReset = false

  // 2. 안 본 책이 부족하면 리셋
  if (freshData.length < count) {
    console.log('추천 기록을 초기화합니다.')
    freshData = [...filteredData] // 후보군을 전체로 초기화
    shouldReset = true // 서버 기록을 비우라는 신호
  }

  const result = []
  const freshCopy = [...freshData]

  // 3. 랜덤하게 4개 추출
  for (let i = 0; i < count; i++) {
    if (freshCopy.length === 0) break
    const randomIndex = Math.floor(Math.random() * freshCopy.length)

    // 랜덤으로 고른 인덱스 번호의 데이터를 복사본에서 잘라내어 result에 넣기
    // 복사본 배열에서 아예 빼버리고 다시 랜덤으로 돌려서 뽑아내는것이므로 중복이 발생하지않음
    result.push(freshCopy.splice(randomIndex, 1)[0])
  }

  return { result, shouldReset }
}
