import { displayPhraseResult } from './_phraseLoader.js'
import { runSmartRecommendation } from './_smartRecommendBridge.js'

const LOADING_TIMEOUT = 400
const loadingDisplay = document.querySelector('.loading-display')
const resultContentDisplay = document.querySelector('.result-content-display')

let isImagePreloaded = false
let preloadStartTime = null

window.addEventListener('DOMContentLoaded', () => {
  if (window.__skipSmartRecommendation) return
  runSmartRecommendation()
  window.addEventListener('recommendationReady', () => {
    handleShowResult()
  })
})

export function handleShowResult(data) {
  const finalData = data || window.selectedJsonData
  if (!finalData) return

  if (!data || (Array.isArray(data) && data.length === 0)) {
    console.warn('데이터가 준비되지 않았습니다.')
    return
  }

  preloadStartTime = Date.now()
  showLoadingDisplay()

  if (isImagePreloaded) {
    scheduleResultDisplay(data, LOADING_TIMEOUT)
  } else {
    const mainCover = Array.isArray(data) ? data[0].bookCover : data.bookCover
    preloadAndDisplayResult(data, mainCover)
  }
}

function scheduleResultDisplay(data, delay) {
  setTimeout(() => {
    displayPhraseResult(data)
    hideLoadingDisplay()
  }, delay)
}

function preloadAndDisplayResult(data, mainCover) {
  preloadImage(
    mainCover,
    () => {
      const elapsedTime = Date.now() - preloadStartTime
      const remainingTime = Math.max(0, LOADING_TIMEOUT - elapsedTime)
      scheduleResultDisplay(data, remainingTime)
    },
    () => {
      console.error('이미지 로딩 실패')
      scheduleResultDisplay(data, LOADING_TIMEOUT)
    },
  )
}

export function showLoadingDisplay() {
  if (!loadingDisplay || !resultContentDisplay) return
  loadingDisplay.classList.add('result-active')
  resultContentDisplay.classList.remove('result-active')
}

export function hideLoadingDisplay() {
  if (!loadingDisplay || !resultContentDisplay) return
  loadingDisplay.classList.remove('result-active')
  resultContentDisplay.classList.add('result-active')
}

export function preloadImage(imageUrl, successCallback, errorCallback) {
  if (!imageUrl) {
    errorCallback?.()
    return
  }
  const preloader = new Image()
  preloader.addEventListener('load', successCallback, { once: true })
  preloader.addEventListener('error', errorCallback, { once: true })
  preloader.src = imageUrl
}
