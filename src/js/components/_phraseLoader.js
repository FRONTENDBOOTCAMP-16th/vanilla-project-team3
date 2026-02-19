// 사용자가 선택한 값 받아오기(valueName으로 들어올 수 있는 값 : checkbox-mood, checkbox-weather)
export function getSelectedValues(valueName) {
  const checkedInputs = document.querySelectorAll(
    `input[name="${valueName}"]:checked`,
  )
  return Array.from(checkedInputs).map((input) => input.dataset.value)
}

export function filterData(allData, selectedMoods, selectedWeathers) {
  const filteredData = allData.filter((item) => {
    // 기분 필터: 선택된 기분이 없으면 기분 전체 포함, 있으면 해당 기분만 포함
    const matchMood =
      selectedMoods.length === 0 || selectedMoods.includes(item.mood)
    // 날씨 필터: 선택된 날씨가 없으면 날씨 전체 포함, 있으면 해당 날씨만 포함
    const matchWeather =
      selectedWeathers.length === 0 || selectedWeathers.includes(item.weather)
    // 최종 결과: 기분과 날씨 조건을 모두 만족해야 필터링됨
    return matchMood && matchWeather
  })
  // 가져온 전체 데이터에서 사용자가 선택한 키값이 같은 경우를 필터링
  return filteredData
}

// 필터링 된 데이터에서 랜덤으로 뽑기
export function getRandomData(filteredData, count) {
  const result = []
  // 원본을 훼손하지 않을 복사본 데이터
  const copyData = [...filteredData]

  for (let i = 0; i < count; i++) {
    if (copyData.length === 0) break

    const randomIndex = Math.floor(Math.random() * copyData.length)

    // 랜덤으로 고른 인덱스 번호의 데이터를 복사본에서 잘라내어 result에 넣기
    // 복사본 배열에서 아예 빼버리고 다시 랜덤으로 돌려서 뽑아내는것이므로 중복이 발생하지않음
    const seletedRandomData = copyData.splice(randomIndex, 1)[0]
    result.push(seletedRandomData)
  }
  return result
}

// 화면에 글자와 이미지 변경하기
export function displayPhraseResult(selectedJsonData) {
  if (selectedJsonData.length === 0) return

  const mainRecommendData = selectedJsonData[0]
  const bookTitle = document.querySelector('.book-title')
  const bookAuthor = document.querySelector('.author')
  const recommendPhrase = document.querySelector('.phrase')
  const resultDisplay = document.querySelector('.result-display')

  bookTitle.textContent = mainRecommendData.bookTitle
  bookAuthor.textContent = mainRecommendData.author
  recommendPhrase.textContent = mainRecommendData.phrase

  resultDisplay.style.setProperty(
    '--bg-image',
    `url(${mainRecommendData.bookCover})`,
  )

  const bookCoverImages = document.querySelectorAll('.book-cover-img')
  const subBooks = selectedJsonData.slice(1)
  subBooks.forEach((data, index) => {
    if (bookCoverImages[index]) {
      bookCoverImages[index].src = data.bookCover
      bookCoverImages[index].alt = data.bookTitle
    }
  })
}
