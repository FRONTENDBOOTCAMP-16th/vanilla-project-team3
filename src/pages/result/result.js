import { displayPhraseResult } from '../../js/components/_phraseLoader.js'

window.addEventListener('DOMContentLoaded', () => {
  const savedLocalData = localStorage.getItem('selectedBookList')

  if (savedLocalData) {
    // JSON 문자열을 다시 원래의 배열 형태로 복구
    const parseData = JSON.parse(savedLocalData)
    displayPhraseResult(parseData)
  } else {
    alert('저장된 데이터가 존재하지 않습니다.')
    location.href = '/index.html'
  }
})
