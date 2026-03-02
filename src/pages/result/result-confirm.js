// 1. 필요한 외부 모듈 및 상수/유틸리티 함수들을 불러옵니다.
import { loadStorage } from '../../js/utils' // 로컬 스토리지 데이터를 가져오는 유틸
import {
  IS_CHECKED_KEY,
  IMOJI,
  LOGIN_AUTH_DATA,
  EMAIL,
} from '/src/js/constants' // 프로젝트에서 사용하는 고정 키값들
import {
  getRecommendations,
  updateHeartToServer,
} from '../../js/services/booService.js' // 추천 서비스 및 서버 통신(좋아요) 관련
import { filterData, getRandomData } from '../../js/components/_phraseLoader.js' // 화면에 책 정보를 그리는 함수들
import {
  showLoadingDisplay,
  hideLoadingDisplay,
} from '../../js/components/_imageLoading.js' // 로딩 애니메이션 제어
import { shareResult } from '../../js/components/_share.js' // 공유하기 기능
import { getData, getUser } from '../../../api/api.js' // API 호출 함수
import { handleShowResult } from '../../js/components/_imageLoading.js'
/**
 * 이 파일은 페이지가 로드될 때 실행되며,
 * DOM에 접근하고 UI를 렌더링하는 역할을 수행합니다.
 */

// 2. DOM 요소 참조: 화면상의 주요 요소를 변수에 할당합니다.
const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')

// 데이터 속성([data-checked="doubleChecked"])을 가진 그룹과 버튼들을 선택합니다.
const doubleCheckedGroups = container.querySelectorAll(
  '[data-checked="doubleChecked"]',
)
const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')

/**
 * 3. 페이지 초기 진입 시 실행되는 메인 함수
 */
async function initPage() {
  // 로컬 스토리지에서 로그인된 유저 정보를 가져옵니다.
  const loadEmail = loadStorage(LOGIN_AUTH_DATA)

  // 전체 도서 데이터를 서버로부터 비동기로 받아옵니다.
  const allBooks = await getData()

  // 로그인된 유저라면 유저의 취향(기분/날씨 카운트)에 기반한 추천 로직을 추가로 실행합니다.
  if (loadEmail?.email) {
    const user = await getUser(EMAIL, loadEmail.email)
    getRecommendations(allBooks, user.mood_counts, user.weather_counts)
  }

  // 화면 설정을 위한 보조 함수들을 순차적으로 실행합니다.
  applyDisableIfChecked() // 이미 선택 완료된 경우 체크박스 잠금
  syncEmojiCheckboxes() // 내가 선택했던 이모지들을 화면에 다시 표시
  handleResultDisplay() // 최종 결과(추천 책)를 계산해서 화면에 출력
  bindHeartEvents() // 하트 버튼 클릭 이벤트 연결
}

// UI: 이미 검사가 끝났다면(isChecked) 체크박스를 클릭하지 못하게 비활성화합니다.
function applyDisableIfChecked() {
  const isChecked = loadStorage(IS_CHECKED_KEY) === 'true'
  if (!isChecked) return
  doubleCheckedGroups.forEach((group) => {
    group.querySelectorAll('input').forEach((input) => (input.disabled = true))
  })
}

// UI: 로컬 스토리지에 저장된 내가 고른 이모지 값을 찾아 체크박스에 체크 표시를 합니다.
function syncEmojiCheckboxes() {
  const savedEmojis = loadStorage(IMOJI)
  if (!savedEmojis) return

  buttons.forEach((checkbox) => {
    const checkImojis = checkbox.querySelectorAll('[data-value]')
    checkImojis.forEach((input) => {
      if (savedEmojis.includes(input.dataset.value)) input.checked = true
    })
  })
}

/**
 * 4. 메인 로직: 결과 표시 (직접 접속 vs 공유 링크 접속 구분)
 */
async function handleResultDisplay() {
  const urlParams = new URLSearchParams(window.location.search)
  const sharedTitle = urlParams.get('title') // URL에 제목 파라미터가 있는지 확인
  const sharedIds = urlParams.get('ids') // URL에 ID 파라미터가 있는지 확인
  let currentData

  try {
    if (sharedTitle) {
      // 케이스 A: 공유받은 링크로 들어온 경우 (URL 파라미터에서 데이터 추출)
      currentData = await getSharedData(sharedTitle, sharedIds, urlParams)
    } else {
      // 케이스 B: 직접 검사하고 들어온 경우 (로딩 화면 표시 후 계산)
      showLoadingDisplay()
      currentData = await getLocalOrCalculatedData()
    }

    if (currentData) {
      // 데이터가 준비되면 화면에 렌더링하고 공유하기 이벤트를 연결합니다.
      handleShowResult(currentData)
      bindShareEvent(currentData)
    } else {
      // 보여줄 데이터가 없으면 메인으로 튕겨냅니다.
      alert('저장된 데이터가 존재하지 않습니다.')
      location.href = '/index.html'
    }
  } catch (error) {
    console.error('데이터 로드 중 오류:', error)
  } finally {
    // 모든 작업(성공/실패)이 끝나면 로딩 창을 닫습니다.
    hideLoadingDisplay()
  }
}

/**
 * 공유 데이터 파싱: 친구가 공유한 링크의 URL 정보를 분석하여 책 정보를 복원합니다.
 */
async function getSharedData(title, ids, params) {
  let allData =
    JSON.parse(localStorage.getItem('cachedBookData')) || (await getData())

  if (ids) {
    // 여러 권의 ID가 전달된 경우 데이터베이스에서 해당 ID의 책들을 찾습니다.
    const idArray = ids.split(',')
    return idArray
      .map((id) => allData.find((b) => String(b.id) === String(id)))
      .filter(Boolean)
  }

  // 단일 문구가 공유된 경우 URL 파라미터를 기반으로 임시 데이터 객체를 생성합니다.
  return [
    {
      bookTitle: title,
      author: params.get('author'),
      phrase: params.get('phrase'),
      bookCover: params.get('bookCover'),
      bookstoreUrl: params.get('bookstoreUrl'),
    },
  ]
}

/**
 * 일반 진입 데이터 로직: 로컬 스토리지에 저장된 내 선택 결과를 가져오거나 계산합니다.
 */
async function getLocalOrCalculatedData() {
  // 이미 계산된 결과가 스토리지에 있다면 바로 반환합니다.
  const savedLocalData = localStorage.getItem('selectedBookList')
  if (savedLocalData) return JSON.parse(savedLocalData)

  // 고른 이모지가 있다면 필터링 로직을 통해 추천 목록을 새로 만듭니다.
  const savedEmoji = JSON.parse(localStorage.getItem(IMOJI))
  if (savedEmoji) {
    const cachedData = localStorage.getItem('cachedBookData')
    const allData = cachedData ? JSON.parse(cachedData) : await getData()

    // 내 감정 데이터와 전체 데이터를 대조하여 필터링합니다.
    const filtered = filterData(allData, savedEmoji, savedEmoji)
    // 필터링된 결과 중 무작위로 4개를 뽑습니다.
    const result = getRandomData(filtered, 4)

    // 계산된 결과를 저장하여 중복 계산을 방지합니다.
    localStorage.setItem('selectedBookList', JSON.stringify(result))
    return result
  }
  return null
}

// 공유하기 버튼 클릭 시 카카오톡이나 링크 복사 등의 기능을 실행하도록 연결합니다.
function bindShareEvent(data) {
  const shareButton = document.querySelector('.share-button')
  if (shareButton) {
    shareButton.onclick = (e) => {
      e.preventDefault()
      shareResult(data)
    }
  }
}

/**
 * 하트(좋아요) 이벤트 연결: 사용자가 추천된 책의 하트 버튼을 누르면 서버에 저장합니다.
 */
function bindHeartEvents() {
  // 화면이 다 그려진 후 버튼을 찾아야 하므로 1.5초의 여유를 둡니다. (비동기 렌더링 대응)
  setTimeout(() => {
    document.querySelectorAll('.save-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const imgSrc = btn.querySelector('.book-cover-img')?.src
        const cachedData = JSON.parse(
          localStorage.getItem('cachedBookData') || '[]',
        )
        // 클릭된 이미지 경로를 통해 데이터베이스에서 어떤 책인지 찾습니다.
        const book = cachedData.find((b) => b.bookCover === imgSrc)
        if (book) {
          // 서버로 좋아요 상태를 업데이트 요청 보냅니다.
          updateHeartToServer(book.id, btn.classList.contains('heart-active'))
        }
      })
    })
  }, 1500)
}

// 5. 브라우저의 HTML 구조가 모두 준비되면(DOMContentLoaded) initPage를 실행합니다.
window.addEventListener('DOMContentLoaded', initPage)
