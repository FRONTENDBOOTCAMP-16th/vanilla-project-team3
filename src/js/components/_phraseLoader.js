/**
 * [1] 사용자가 선택한 체크박스 값들을 가져오는 함수
 * @param {string} valueName - HTML input의 name 속성값
 */
export function getSelectedValues(valueName) {
  const checkedInputs = document.querySelectorAll(
    `input[name="${valueName}"]:checked`,
  )
  return Array.from(checkedInputs).map((input) => input.dataset.value)
}

/**
 * [2] 전체 데이터에서 사용자가 선택한 기분/날씨와 일치하는 데이터만 걸러내는 함수
 */
export function filterData(allData, selectedMoods, selectedWeathers) {
  const filteredData = allData.filter((item) => {
    const matchMood =
      selectedMoods.length === 0 || selectedMoods.includes(item.mood)
    const matchWeather =
      selectedWeathers.length === 0 || selectedWeathers.includes(item.weather)
    return matchMood && matchWeather
  })
  return filteredData
}

/**
 * [3] 필터링된 데이터 중에서 중복 없이 랜덤으로 n개를 뽑는 함수
 * @param {Array} filteredData - 필터링 완료된 데이터 배열
 * @param {number} count - 뽑고 싶은 개수
 */
export function getRandomData(filteredData, count) {
  const result = []
  const copyData = [...filteredData]

  for (let i = 0; i < count; i++) {
    if (copyData.length === 0) break

    const randomIndex = Math.floor(Math.random() * copyData.length)
    const seletedRandomData = copyData.splice(randomIndex, 1)[0]
    result.push(seletedRandomData)
  }
  return result
}

// 타이핑 애니메이션 인스턴스를 저장할 변수 (새로 추천할 때 이전 애니메이션을 지우기 위함)
let phraseTypedInstance = null

/**
 * [4] 최종 선택된 데이터를 화면(DOM)에 실제로 그려주는 함수
 */
export function displayPhraseResult(selectedJsonData) {
  if (selectedJsonData.length === 0) return

  const mainRecommendData = selectedJsonData[0]
  const bookTitle = document.querySelector('.book-title')
  const bookAuthor = document.querySelector('.author')
  const phraseReader = document.querySelector('.phrase-reader')
  const resultDisplay = document.querySelector('.result-display')

  bookTitle.textContent = mainRecommendData.bookTitle
  bookAuthor.textContent = mainRecommendData.author
  phraseReader.textContent = `추천 문구: ${mainRecommendData.phrase}`

  resultDisplay.style.setProperty(
    '--bg-image',
    `url(${mainRecommendData.bookCover})`,
  )

  if (phraseTypedInstance) {
    phraseTypedInstance.destroy()
  }

  phraseTypedInstance = new Typed('.phrase', {
    strings: [mainRecommendData.phrase],
    typeSpeed: 50, // 글자 써지는 속도
    backSpeed: 0, // 지우는 속도는 0 (지울 일 없음)
    showCursor: false, // 커서는 안 보이게 설정
    cursorChar: '|',
  })

  const bookInfoButtons = document.querySelectorAll('.more-book-info')
  const bookCoverImages = document.querySelectorAll('.book-cover-img')
  const subBooks = selectedJsonData.slice(1)

  subBooks.forEach((data, index) => {
    if (bookCoverImages[index]) {
      bookCoverImages[index].src = data.bookCover
      bookCoverImages[index].alt = data.bookTitle
      bookInfoButtons[index].href = data.bookstoreUrl
    }
  })
}
