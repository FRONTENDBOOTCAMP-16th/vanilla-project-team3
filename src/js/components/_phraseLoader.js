// 데이터 받아오기
function loadJsonData() {
  fetch('https://69898725c04d974bc69f8907.mockapi.io/todayPhrase/todaysPhrase')
    .then((response) => response.json())
    .then((data) => {
      const jsonDataList = data.map((list) => {
        return {
          bookTitle: list.bookTitle,
          phrase: list.phrase,
          author: list.author,
          bookCover: list.bookCover,
        }
      })
      const randomIndex = Math.floor(Math.random() * jsonDataList.length)
      const selectedData = jsonDataList[randomIndex]
      console.log('선택된 데이터 : ', selectedData)

      displayPhraseResult(selectedData)
    })
    .catch((error) => console.log('데이터를 가져오지 못했습니다: ', error))
}

// 화면에 글자와 이미지 변경하기
function displayPhraseResult(selectedJsonData) {
  const bookTitle = document.querySelector('.book-title')
  const bookAuthor = document.querySelector('.author')
  const recommendPhrase = document.querySelector('.phrase')
  const resultDisplay = document.querySelector('.result-display')

  bookTitle.textContent = selectedJsonData.bookTitle
  bookAuthor.textContent = selectedJsonData.author
  recommendPhrase.textContent = selectedJsonData.phrase

  resultDisplay.style.setProperty(
    '--bg-image',
    `url(${selectedJsonData.bookCover})`,
  )
}

loadJsonData()
