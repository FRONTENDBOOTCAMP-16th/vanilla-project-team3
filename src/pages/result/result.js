import { displayPhraseResult } from '../../js/components/_phraseLoader.js'
import { shareResult } from '../../js/components/_share.js'

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search)
  const sharedTitle = urlParams.get('title')

  let currentData = null

  if (sharedTitle) {
    currentData = [
      {
        bookTitle: sharedTitle,
        author: urlParams.get('author'),
        phrase: urlParams.get('phrase'),
        bookCover: urlParams.get('bookCover'),
      },
    ]
    displayPhraseResult(currentData)
  } else {
    const savedLocalData = localStorage.getItem('selectedBookList')

    if (savedLocalData) {
      currentData = JSON.parse(savedLocalData)
      displayPhraseResult(currentData)
    } else {
      alert('저장된 데이터가 존재하지않습니다.')
      location.href = '/index.html'
      return
    }
  }
  const shareButton = document.querySelector('.share-button')
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      if (shareButton && currentData) {
        shareResult(currentData[0])
      } else {
        console.error('공유할 데이터를 준비하지 못했습니다.')
      }
    })
  }
})
