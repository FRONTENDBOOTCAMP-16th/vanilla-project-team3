/* global Typed */ // 외부 라이브러리인 Typed.js를 전역으로 사용하겠다는 선언

/**
 * [1] 사용자가 선택한 체크박스 값들을 가져오는 함수
 * @param {string} valueName - HTML input의 name 속성값
 */
export function getSelectedValues(valueName) {
  // 특정 이름을 가진 input 중 체크된 것들만 모두 선택
  const checkedInputs = document.querySelectorAll(
    `input[name="${valueName}"]:checked`,
  )
  // 선택된 요소들(NodeList)을 배열로 바꾸고, 각 요소의 data-value 값을 추출하여 배열로 반환
  return Array.from(checkedInputs).map((input) => input.dataset.value)
}

/**
 * [2] 전체 데이터에서 사용자가 선택한 기분/날씨와 일치하는 데이터만 걸러내는 함수
 */
export function filterData(allData, selectedMoods, selectedWeathers) {
  const filteredData = allData.filter((item) => {
    // 기분 필터: 아무것도 선택 안 했으면 패스(true), 선택했다면 데이터의 mood가 포함되어 있는지 확인
    const matchMood =
      selectedMoods.length === 0 || selectedMoods.includes(item.mood)
    // 날씨 필터: 위와 동일하게 선택 안 했으면 패스, 선택했다면 데이터의 weather가 일치하는지 확인
    const matchWeather =
      selectedWeathers.length === 0 || selectedWeathers.includes(item.weather)

    // 두 조건(기분 AND 날씨)을 모두 만족하는 데이터만 남김
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
  // 원본 데이터를 건드리지 않기 위해 스프레드 연산자(...)로 복사본 생성
  const copyData = [...filteredData]

  for (let i = 0; i < count; i++) {
    // 더 이상 뽑을 데이터가 없으면 반복문 종료
    if (copyData.length === 0) break

    // 남아있는 복사본 데이터 개수 안에서 랜덤 인덱스 생성
    const randomIndex = Math.floor(Math.random() * copyData.length)

    // splice를 사용해 랜덤으로 선택된 데이터를 배열에서 '잘라내기' (중복 방지 핵심)
    const seletedRandomData = copyData.splice(randomIndex, 1)[0]
    // 뽑힌 데이터를 결과 배열에 추가
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
  // 데이터가 없으면 실행 중단
  if (selectedJsonData.length === 0) return

  // 0번째 데이터를 메인 추천 도서로 설정
  const mainRecommendData = selectedJsonData[0]
  const bookTitle = document.querySelector('.book-title')
  const bookAuthor = document.querySelector('.author')
  const phraseReader = document.querySelector('.phrase-reader') // 스크린 리더용 또는 보조 문구
  const resultDisplay = document.querySelector('.result-display')

  // 메인 도서 정보 주입
  bookTitle.textContent = mainRecommendData.bookTitle
  bookAuthor.textContent = mainRecommendData.author
  phraseReader.textContent = `추천 문구: ${mainRecommendData.phrase}`

  // 배경 이미지를 CSS 변수(--bg-image)를 통해 변경 (커버 이미지 적용)
  resultDisplay.style.setProperty(
    '--bg-image',
    `url(${mainRecommendData.bookCover})`,
  )

  // 이전에 돌아가던 타이핑 애니메이션이 있다면 파괴(초기화)
  if (phraseTypedInstance) {
    phraseTypedInstance.destroy()
  }

  // Typed.js 라이브러리를 사용하여 추천 문구를 타이핑 효과로 출력
  phraseTypedInstance = new Typed('.phrase', {
    strings: [mainRecommendData.phrase],
    typeSpeed: 50, // 글자 써지는 속도
    backSpeed: 0, // 지우는 속도는 0 (지울 일 없음)
    showCursor: false, // 커서는 안 보이게 설정
    cursorChar: '|',
  })

  // 서브 추천 도서(나머지 데이터) 처리
  const bookInfoButtons = document.querySelectorAll('.more-book-info') // 상세정보 버튼들
  const bookCoverImages = document.querySelectorAll('.book-cover-img') // 서브 책 커버들

  // 1번째 인덱스부터 끝까지 잘라서 서브 도서 리스트 생성
  const subBooks = selectedJsonData.slice(1)

  subBooks.forEach((data, index) => {
    // 화면에 해당 순서의 서브 도서 자리가 있다면 데이터 주입
    if (bookCoverImages[index]) {
      bookCoverImages[index].src = data.bookCover
      bookCoverImages[index].alt = data.bookTitle

      // 상세 정보 버튼(a 태그)의 링크를 해당 도서의 구매/정보 페이지 URL로 연결
      bookInfoButtons[index].href = data.bookstoreUrl
    }
  })
}
