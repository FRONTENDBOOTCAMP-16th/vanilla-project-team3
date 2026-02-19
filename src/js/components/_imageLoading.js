// API URL
const API_URL = 'https://69898725c04d974bc69f8907.mockapi.io/todayPhrase/todaysPhrase'

// 로딩 시간 설정 (밀리초)
const LOADING_TIMEOUT = 400

// 문서의 요소 객체 참조
const bookTitle = document.querySelector('.book-title')
const bookAuthor = document.querySelector('.author')
const recommendPhrase = document.querySelector('.phrase')
const resultDisplay = document.querySelector('.result-display')
const loadingDisplay = document.querySelector('.loading-display')
const resultContentDisplay = document.querySelector('.result-content-display')

// API에서 가져온 데이터를 저장할 변수
let selectedJsonData = null

// 이미지 프리로드 상태 추적
let isImagePreloaded = false
let preloadStartTime = null

// 페이지 로드 시 API 데이터 가져오기
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // API에서 데이터 가져오기
    const response = await fetch(API_URL)
    const data = await response.json()
    
    // 첫 번째 데이터 또는 랜덤 데이터 선택
    selectedJsonData = Array.isArray(data) ? data[0] : data
    
    console.log('API 데이터 로드 완료:', selectedJsonData)
    
    // 이미지 프리로드
    if (selectedJsonData?.bookCover) {
      preloadImage(
        selectedJsonData.bookCover,
        () => {
          console.log('이미지 프리로드 완료')
          isImagePreloaded = true
        },
        () => {
          console.error('이미지 프리로드 실패')
          isImagePreloaded = false
        }
      )
    }
  } catch (error) {
    console.error('API 데이터 로드 실패:', error)
    // API 실패 시 기본 데이터 사용
    selectedJsonData = {
      bookTitle: '데이터를 불러올 수 없습니다',
      author: '',
      phrase: '잠시 후 다시 시도해주세요',
      bookCover: ''
    }
  }
})

// 테스트용: 페이지 로드 후 자동으로 결과 표시 (개발 중 확인용)
// 실제 사용 시에는 아래 코드를 주석 처리하고 버튼 이벤트만 사용
setTimeout(() => {
  handleShowResult()
}, 1500) // API 로드 시간을 고려해 1.5초로 설정

// 결과 표시 핸들러 함수
function handleShowResult() {
  // 데이터가 아직 로드되지 않은 경우
  if (!selectedJsonData) {
    console.warn('데이터가 아직 준비되지 않았습니다.')
    return
  }
  
  preloadStartTime = Date.now()
  
  // 로딩 화면 표시
  showLoadingDisplay()
  
  if (isImagePreloaded) {
    // 이미지가 이미 로드된 경우: 최소 로딩 시간만 보장
    setTimeout(() => {
      displayPhraseResult(selectedJsonData)
      hideLoadingDisplay()
    }, LOADING_TIMEOUT)
  } else {
    // 이미지가 아직 로드되지 않은 경우: 로드 완료 대기
    preloadImage(
      selectedJsonData.bookCover,
      () => {
        // 이미지 로드 성공
        const elapsedTime = Date.now() - preloadStartTime
        const remainingTime = Math.max(0, LOADING_TIMEOUT - elapsedTime)
        
        setTimeout(() => {
          displayPhraseResult(selectedJsonData)
          hideLoadingDisplay()
        }, remainingTime)
      },
      () => {
        // 이미지 로드 실패
        console.error('이미지를 불러오는 중 오류가 발생했습니다.')
        setTimeout(() => {
          displayPhraseResult(selectedJsonData)
          hideLoadingDisplay()
        }, LOADING_TIMEOUT)
      }
    )
  }
}

// 유틸리티 함수 ------------------------------------------

// 로딩 화면 표시 함수
function showLoadingDisplay() {
  loadingDisplay.classList.add('result-active')
  resultContentDisplay.classList.remove('result-active')
}

// 로딩 화면 감춤 함수
function hideLoadingDisplay() {
  loadingDisplay.classList.remove('result-active')
  resultContentDisplay.classList.add('result-active')
}

// 이미지 프리로드(Preload) 함수
function preloadImage(imageUrl, successCallback, errorCallback) {
  if (!imageUrl) {
    errorCallback?.()
    return
  }
  
  const preloader = new Image()
  preloader.addEventListener('load', successCallback, { once: true })
  preloader.addEventListener('error', errorCallback, { once: true })
  preloader.src = imageUrl
}

// 결과 표시 함수
function displayPhraseResult({
  bookTitle: title = '',
  author = '',
  phrase = '',
  bookCover: cover = ''
} = {}) {
  bookTitle.textContent = title
  bookAuthor.textContent = author
  recommendPhrase.textContent = phrase
  
  // 배경 이미지 설정 (이미 캐시되어 있어 즉시 표시됨)
  if (cover) {
    resultDisplay.style.setProperty('--bg-image', `url('${cover}')`)
  }
}

// 나중에 실제 버튼에 연결할 때 사용할 예시:
/*
const userTestCheckButton = document.querySelector('.user-test-check')
userTestCheckButton.addEventListener('click', handleShowResult)
*/