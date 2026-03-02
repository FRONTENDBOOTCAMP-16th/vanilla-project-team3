// 1. 필요한 외부 모듈 및 상수/함수 로드
import { loadStorage } from '../../js/utils'
import {
  IS_CHECKED_KEY,
  IMOJI,
  LOGIN_AUTH_DATA,
  EMAIL,
} from '/src/js/constants'
import {
  getRecommendations,
  updateHeartToServer,
  updateGenrePreference,
} from '../../js/service/bookService.js'
import { filterData, getRandomData } from '../../js/components/_phraseLoader.js'
import {
  showLoadingDisplay,
  hideLoadingDisplay,
  handleShowResult,
} from '../../js/components/_imageLoading.js'
import { shareResult } from '../../js/components/_share.js'
import { getData, getUser } from '../../../api/api.js'

/**
 * 이 파일은 결과 페이지의 렌더링을 담당하며, 사용자의 선택과 서버 데이터를 결합합니다.
 */

// 2. DOM 요소 참조 (UI 조작용)
const container = document.querySelector('.container')
if (!container) throw new Error('문서에서 .container 요소를 찾을 수 없습니다.')

const doubleCheckedGroups = container.querySelectorAll(
  '[data-checked="doubleChecked"]',
)
const buttons = container.querySelectorAll('[data-checked="doubleChecked"]')

/**
 * [메인 함수] 페이지 진입 시 가장 먼저 실행되는 초기화 로직
 */
async function initPage() {
  // 전역 플래그 설정 (추천 로직 제어용)
  window.__skipSmartRecommendation = true
  const loadEmail = loadStorage(LOGIN_AUTH_DATA)

  // 사용자가 선택한 기분/날씨 데이터를 분류하여 담을 객체들
  let mood = {}
  let weather = {}
  let viewed = [] // 로그인 유저가 이미 확인한 책 목록

  // localStorage에서 선택된 이모지들을 가져와 감정군과 날씨군으로 매핑
  const savedEmoji = JSON.parse(localStorage.getItem(IMOJI)) || []
  savedEmoji.forEach((item) => {
    if (['happy', 'sad', 'soso', 'bad'].includes(item)) {
      mood[item] = 1
    }
    if (['sunny', 'rainy', 'snowy', 'dusty', 'cloudy'].includes(item)) {
      weather[item] = 1
    }
  })

  // 로그인 상태인 경우, 서버에서 유저의 '이미 본 도서(viewed)' 정보를 동기화
  if (loadEmail?.email) {
    const userData = await getUser(EMAIL, loadEmail.email)
    viewed = userData.viewed || []
  }

  // 전체 도서 데이터(DB) 로드
  const allBooks = await getData()

  // UI 초기화: 이전에 체크한 항목 복구 및 잠금
  applyDisableIfChecked()
  syncEmojiCheckboxes()

  // 추천 로직을 거쳐 최종 결과를 화면에 출력
  await handleResultDisplay(allBooks, mood, weather, viewed)

  // 하트(좋아요) 클릭 시 동작하는 이벤트 바인딩
  bindHeartEvents(loadEmail, allBooks)
}

/**
 * [UI] 이미 검사를 완료한 유저라면 체크박스를 비활성화(수정 불가) 처리
 */
function applyDisableIfChecked() {
  const isChecked = loadStorage(IS_CHECKED_KEY) === 'true'
  if (!isChecked) return
  doubleCheckedGroups.forEach((group) => {
    group.querySelectorAll('input').forEach((input) => (input.disabled = true))
  })
}

/**
 * [UI] 저장되어 있는 이모지 데이터를 바탕으로 체크박스의 체크 상태를 동기화
 */
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
 * [로직] 결과 화면 표시 처리 (공유 모드 vs 일반 추천 모드)
 */
/**
 * [로직] 결과 화면 표시 처리 (수정 버전)
 */
async function handleResultDisplay(allBooks, mood, weather, viewed) {
  const urlParams = new URLSearchParams(window.location.search)
  const sharedTitle = urlParams.get('title')
  const sharedIds = urlParams.get('ids')
  let currentData

  try {
    if (sharedTitle) {
      // 공유 링크 진입 시
      currentData = await getSharedData(sharedTitle, sharedIds, urlParams)
    } else {
      // 일반 추천 진입 시 로딩 시작
      showLoadingDisplay()
      const recommended = getRecommendations(allBooks, mood, weather, viewed)

      if (recommended && recommended.length > 0) {
        currentData = recommended
      } else {
        currentData = await getLocalOrCalculatedData()
      }
    }

    if (currentData) {
      // [중요 수정] 데이터를 바로 그리는 대신, 전역 변수에 저장하고
      // 분리된 로딩/렌더링 핸들러를 호출하여 이미지 로딩까지 체크합니다.
      window.selectedJsonData = Array.isArray(currentData)
        ? currentData
        : currentData

      // 우리가 새로 만든 '개인화 로딩 로직' 실행
      handleShowResult(currentData)

      // 공유 버튼 이벤트는 미리 연결
      bindShareEvent(currentData)
    } else {
      alert('저장된 데이터가 존재하지 않습니다.')
      location.href = '/index.html'
    }
  } catch (error) {
    console.error('데이터 로드 중 오류:', error)
    hideLoadingDisplay() // 에러 시에는 로딩을 강제로 끕니다.
  }
  // ※ 주의: finally { hideLoadingDisplay() }는 여기서 삭제합니다.
  // scheduleResultDisplay 함수가 대신 끌 것이기 때문입니다.
}

/**
 * [공유] 친구에게 전달받은 URL 파라미터를 분석해 특정 도서 정보 복구
 */
async function getSharedData(title, ids, params) {
  let allData =
    JSON.parse(localStorage.getItem('cachedBookData')) || (await getData())
  if (ids) {
    const idArray = ids.split(',')
    return idArray
      .map((id) => allData.find((b) => String(b.id) === String(id)))
      .filter(Boolean)
  }
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
 * [보조 로직] 저장된 결과 리스트가 있으면 가져오고, 없으면 필터링 후 랜덤 추출
 */
async function getLocalOrCalculatedData() {
  const savedLocalData = localStorage.getItem('selectedBookList')
  if (savedLocalData) return JSON.parse(savedLocalData)

  const savedEmoji = JSON.parse(localStorage.getItem(IMOJI))
  if (savedEmoji) {
    const cachedData = localStorage.getItem('cachedBookData')
    const allData = cachedData ? JSON.parse(cachedData) : await getData()
    const filtered = filterData(allData, savedEmoji, savedEmoji)
    const result = getRandomData(filtered, 4)
    localStorage.setItem('selectedBookList', JSON.stringify(result))
    return result
  }
  return null
}

/**
 * [공유 버튼] 현재 추천 결과(data)를 외부로 공유할 수 있도록 설정
 */
function bindShareEvent(data) {
  const shareButton = document.querySelector('.share-button')
  if (shareButton) {
    shareButton.onclick = (e) => {
      e.preventDefault()
      shareResult(data) // SNS 공유 로직 실행
    }
  }
}

/**
 * [좋아요/하트] 클릭 시 서버 저장 및 장르 선호도 점수 반영
 */
function bindHeartEvents(loadEmail, allBooks) {
  // 동적 생성된 UI 요소를 기다리기 위해 1.5초 지연 실행
  setTimeout(() => {
    document.querySelectorAll('.save-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!loadEmail) return // 비로그인 시 동작 방지

        // 현재 버튼에 하트가 켜져있는지 확인 (UI 상태 확인)
        const isActive = btn.classList.contains('heart-active')
        const imgSrc = btn.querySelector('.book-cover-img')?.src

        // 이미지 경로를 대조하여 전체 도서 데이터 중 어떤 책인지 식별
        const book = allBooks.find((b) => b.bookCover === imgSrc)

        if (book) {
          // 1. 로컬 스토리지의 하트 리스트 업데이트 (세션 유지용)
          const savedData = JSON.parse(
            localStorage.getItem(LOGIN_AUTH_DATA) || '{}',
          )
          if (isActive) {
            savedData.heart = [...(savedData.heart || []), String(book.id)]
          } else {
            savedData.heart = (savedData.heart || []).filter(
              (id) => id !== String(book.id),
            )
          }
          localStorage.setItem(LOGIN_AUTH_DATA, JSON.stringify(savedData))

          // 2. 서버 DB에 하트 상태 전송
          updateHeartToServer(book.id, isActive)

          // 3. 사용자의 취향 학습: 해당 도서의 태그(장르)에 점수 부여 (+1 / -1)
          if (book.tags) {
            updateGenrePreference(book.tags, isActive ? 1 : -1)
          }
        }
      })
    })
  }, 1500)
}

// 초기 실행 시작
initPage()
