// 외부 API 통신 함수와 상수, 유틸리티들을 가져옵니다.
import { getData, getUser, UserAPI } from '../../api/api'
import DOMPurify from 'dompurify'
import { EMAIL, LOGIN_AUTH_DATA } from '../constants'
import { initSession } from '../../pages/login/loginSession'
import {
  updateGenrePreference,
  updateHeartToServer,
} from '../service/bookService'
import { loadStorage } from '../utils/storage'

// 현재 브라우저 세션의 로그인 상태와 유저 정보를 확인합니다.
const { isLoggedIn, currentUser } = initSession()
// 로컬 스토리지에 저장된 인증 데이터를 불러옵니다.
const loadEmail = loadStorage(LOGIN_AUTH_DATA)

/**
 * [1] 찜 목록 비었을 때 메시지 표시
 * 리스트에 책이 하나도 없으면 사용자에게 안내 문구를 보여줍니다.
 */
function checkEmptyList() {
  const bookList = document.querySelector('.book-list')
  if (!bookList) return

  const filledItems = [...bookList.querySelectorAll('li')].filter(
    (li) => li.innerHTML.trim() !== '',
  )
  const existingMsg = bookList.querySelector('.empty-msg')

  // 목록 요소가 존재하고, 자식 요소(li)가 하나도 없을 때 실행
  if (filledItems.length === 0) {
    if (!existingMsg) {
      const msg = document.createElement('p')
      msg.className = 'empty-msg'
      msg.textContent = '찜한 내역이 없습니다.'
      bookList.appendChild(msg)
    }
  } else {
    existingMsg?.remove()
  }
}

/**
 * [2] 하트(찜) 버튼 상태 토글
 * 버튼의 색상(클래스)을 바꾸고, 시각장애인용 리더기(aria-pressed)에 상태를 알립니다.
 */
function toggleHeart(button) {
  const isActive = button.classList.toggle('heart-active')
  button.setAttribute('aria-pressed', isActive ? 'true' : 'false')
}

/**
 * [이벤트 리스너 등록] 페이지의 모든 HTML 요소가 준비되면 실행됩니다.
 */
document.addEventListener('DOMContentLoaded', () => {
  // 제어할 모든 버튼과 팝업창(Dialog) 요소들을 선택합니다.
  const myPageBtn = document.querySelector('.navi-mypage-button')
  const saveBtns = document.querySelectorAll('.save-button')
  const loginDialog = document.querySelector('.login-dialog')
  const myPageDialog = document.querySelector('.my-page-dialog')
  const heartLimitDialog = document.querySelector('.heart-list-dialog')
  const delBookListBtn = document.querySelector('.delete-book-list-button')
  const closeBtns = document.querySelectorAll('.close-dialog')

  // --- 내비게이션의 마이페이지 버튼 클릭 이벤트 ---
  myPageBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      loginDialog?.showModal() // 로그인 안 되어 있으면 로그인 팝업
    } else {
      updateUserDiSplay() // 로그인 되어 있으면 내 정보 갱신 후 마이페이지 오픈
      myPageDialog?.showModal()
    }
  })

  // 로그인 팝업 내 [로그인 페이지 이동] 버튼
  const loginConfirmBtn = document.querySelector(
    '.login-dialog .confirm-button',
  )
  if (loginConfirmBtn) {
    loginConfirmBtn.addEventListener('click', () => {
      window.location.href = '/src/pages/login/login.html'
    })
  }

  // 결과 페이지에서는 result.js가 찜 이벤트를 처리하므로 중복 실행 방지
  if (!document.querySelector('.result-display')) {
    // 메인 화면 등의 찜 버튼(하트) 클릭 시 (다중 요소 대응)
    saveBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        // 1. 로그인 확인
        if (!isLoggedIn) {
          loginDialog?.showModal()
          return
        }

        // 2. 갯수 제한 체크 (최대 6개까지만 허용)
        const isAlreadyActive = btn.classList.contains('heart-active')
        const savedData = JSON.parse(
          localStorage.getItem(LOGIN_AUTH_DATA) || '{}',
        )
        const currentCount = savedData?.heart?.length ?? 0

        if (!isAlreadyActive && currentCount >= 6) {
          heartLimitDialog?.showModal() // 6개 초과 시 찜 제한 안내 팝업
        } else {
          toggleHeart(btn)

          const imgSrc = btn.querySelector('.book-cover-img').src
          const rawSelected = localStorage.getItem('selectedBookList')
          const rawCached = localStorage.getItem('cachedBookData')
          const validData = (raw) =>
            raw && raw !== 'undefined' && raw !== 'null'

          const currentData = validData(rawSelected)
            ? JSON.parse(rawSelected)
            : validData(rawCached)
              ? JSON.parse(rawCached)
              : await getData() // 둘 다 없으면 API에서 직접 가져오기

          const book = currentData.find((b) => b.bookCover === imgSrc)

          if (book) {
            const nowActive = btn.classList.contains('heart-active')
            const latestData = JSON.parse(
              localStorage.getItem(LOGIN_AUTH_DATA) || '{}',
            )
            if (nowActive) {
              latestData.heart = [...(latestData.heart || []), String(book.id)]
            } else {
              latestData.heart = (latestData.heart || []).filter(
                (id) => id !== String(book.id),
              )
            }
            localStorage.setItem(LOGIN_AUTH_DATA, JSON.stringify(latestData))
            await updateHeartToServer(book.id, nowActive)
            if (book.tags) {
              updateGenrePreference(book.tags, nowActive ? 1 : -1)
            }
          }
        }
      })
    })
  }

  // --- 공통 닫기 버튼 (모든 팝업의 X 버튼) ---
  closeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog')
      if (dialog) {
        dialog.close()
      }
    })
  })

  // --- 찜 목록 '편집 모드' 버튼 클릭 (삭제 버튼 보이게 하기) ---
  delBookListBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    if (myPageDialog) {
      const isEditMode = myPageDialog.classList.toggle('edit-mode')
      delBookListBtn.textContent = isEditMode ? '편집 완료' : '찜 항목 삭제'
    }
  })
})

/**
 * [3] 찜 목록 데이터 호출 및 그리기 준비
 */
async function getHeartList() {
  const bookList = document.querySelector('.book-list')
  const heartList = document.querySelectorAll('.book-list li')
  if (heartList.length === 0) return

  const savedData = JSON.parse(localStorage.getItem(LOGIN_AUTH_DATA) || '{}')
  const heart = savedData?.heart || []

  if (!isLoggedIn || !currentUser) return

  const heartID = heart.map((item) => Number(item))
  const allBooks = await getData()
  const bookItems = heartID
    .map((id) => allBooks.find((book) => book.id === id))
    .filter(Boolean)

  heartLists(heartList, bookItems)
  removeHeart(bookList)
  checkEmptyList()
}

/**
 * [4] 책 리스트를 HTML로 변환하여 화면에 그리는 함수
 */
function heartLists(heartList, bookItems) {
  heartList.forEach((item, index) => {
    const currentBook = bookItems[index]
    if (!currentBook) {
      item.innerHTML = ''
      return
    }

    const changeHTML = `
      <button type="button" class="delete-item-button" aria-label="삭제">
      <svg
      data-delete="button"
      data-id="${currentBook.id}"
      class="delete-item-button"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM16.44 14.76C16.92 15.24 16.92 15.96 16.44 16.44C15.96 16.92 15.24 16.92 14.76 16.44L12 13.68L9.24 16.44C8.76 16.92 8.04 16.92 7.56 16.44C7.08 15.96 7.08 15.24 7.56 14.76L10.32 12L7.56 9.24C7.08 8.76 7.08 8.04 7.56 7.56C8.04 7.08 8.76 7.08 9.24 7.56L12 10.32L14.76 7.56C15.24 7.08 15.96 7.08 16.44 7.56C16.92 8.04 16.92 8.76 16.44 9.24L13.68 12L16.44 14.76Z"
        fill="#FF0000"
      />
    </svg>
      </button>
      <a href="${currentBook.bookstoreUrl}" target="_blank">
        <img src="${currentBook.bookCover}" alt="${currentBook.author}" />
      </a>
    `

    const cleanHTML = DOMPurify.sanitize(changeHTML, {
      ADD_ATTR: ['target'],
    })

    item.innerHTML = cleanHTML
  })
}

/**
 * [5] 찜 목록 개별 삭제 처리 (가장 복잡하고 중요한 로직)
 */
async function removeHeart(bookList) {
  if (!bookList) return

  // [이벤트 중복 방지] 기존의 bookList를 복사해서 새로 갈아끼웁니다.
  // 이렇게 안 하면 마이페이지를 열 때마다 이벤트가 겹쳐서 삭제가 여러 번 실행됩니다.
  const newBookList = bookList.cloneNode(true)
  bookList.replaceWith(newBookList)

  newBookList.addEventListener('click', async (e) => {
    const deleteButton = e.target.closest('[data-delete="button"]')
    if (!deleteButton) return

    const deleteBookValue = deleteButton.dataset.id
    if (!deleteBookValue) return

    // 삭제 직전, 서버에서 가장 최신의 유저 데이터를 가져와서 동기화합니다.
    const latestUser = await getUser(EMAIL, loadEmail.email)
    // 현재 선택한 ID만 제외하고 새로운 하트 배열을 만듭니다.
    const updateHeart = latestUser.heart.filter(
      (id) => String(id) !== String(deleteBookValue),
    )
    const updateData = { ...latestUser, heart: updateHeart }

    try {
      // 1. 서버에 업데이트된 하트 배열 전송
      await UserAPI.updateUserData(latestUser.id, updateData)

      // 2. 로컬 스토리지도 동시에 최신화하여 6개 제한 로직과 맞춥니다.
      const savedData = JSON.parse(
        localStorage.getItem(LOGIN_AUTH_DATA) || '{}',
      )
      savedData.heart = updateHeart
      localStorage.setItem(LOGIN_AUTH_DATA, JSON.stringify(savedData))

      // 3. 화면(DOM)에서 부드럽게 제거하는 애니메이션 처리
      const targetLi = deleteButton.closest('li')
      if (targetLi) {
        targetLi.style.opacity = '0'
        targetLi.style.transition = '0.3s'
        setTimeout(() => {
          targetLi.remove()
          checkEmptyList() // 삭제 후 다 비었으면 안내 문구 표시
        }, 300)
      }
    } catch (error) {
      console.error('삭제 중 오류 발생', error)
      alert('좋아요 삭제에 실패했습니다.')
    }
  })
}

// 마이페이지 내부 userId 변경하는 함수
export function updateUserDiSplay() {
  const { isLoggedIn: loginStatus, currentUser: user } = initSession()
  if (loginStatus && user) {
    const myPageDialog = document.querySelector('.my-page-dialog')
    let userIdDisplay = myPageDialog.querySelector('.user-id-text')
    if (userIdDisplay) userIdDisplay.textContent = user.userId
    getHeartList() // 마이페이지 열릴 때 리스트 새로고침
  }
}
