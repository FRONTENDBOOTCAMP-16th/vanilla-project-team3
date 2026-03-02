// 외부 API 통신 함수와 상수, 유틸리티들을 가져옵니다.
import { getData, getUser, UserAPI } from '../../../api/api'
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
  if (bookList && bookList.children.length === 0) {
    bookList.innerHTML = '<p class="empty-msg">찜한 내역이 없습니다.</p>'
  }
}

/**
 * [2] 비밀번호 변경 폼 초기화
 * 팝업을 닫거나 새로 열 때 입력했던 값과 에러 메시지를 싹 지워줍니다.
 */
function resetPWForm() {
  const pwForm = document.querySelector('.pw-form')
  if (pwForm) {
    pwForm.reset()
    const errorMsg = document.querySelector('.pw-error-msg')
    if (errorMsg) errorMsg.style.display = 'none'
  }
}

/**
 * [3] 하트(찜) 버튼 상태 토글
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
  const changePWDialog = document.querySelector('.change-pw-dialog')
  const pwForm = document.querySelector('.pw-form')
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

  // --- 메인 화면 등의 찜 버튼(하트) 클릭 이벤트 (핵심 로직) ---
  saveBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!isLoggedIn) {
        loginDialog?.showModal()
        return
      }

      const isAlreadyActive = btn.classList.contains('heart-active')
      // 로컬 스토리지에서 현재 내가 몇 개를 찜했는지 확인 (6개 제한 체크용)
      const savedData = JSON.parse(
        localStorage.getItem(LOGIN_AUTH_DATA) || '{}',
      )
      const currentCount = savedData?.heart?.length ?? 0

      // 새로 찜하려는데 이미 6개라면 더 이상 못하게 막음
      if (!isAlreadyActive && currentCount >= 6) {
        heartLimitDialog?.showModal()
      } else {
        toggleHeart(btn) // 하트 불 켜기/끄기

        // 클릭된 하트가 어떤 책인지 찾기 위해 이미지 경로를 키값으로 사용
        const imgSrc = btn.querySelector('.book-cover-img').src
        const currentData = JSON.parse(
          localStorage.getItem('selectedBookList') || '[]',
        )
        const book = currentData.find((b) => b.bookCover === imgSrc)

        if (book) {
          const nowActive = btn.classList.contains('heart-active')
          const latestData = JSON.parse(
            localStorage.getItem(LOGIN_AUTH_DATA) || '{}',
          )

          // 1. 로컬 스토리지의 하트 배열 업데이트 (즉각적인 화면 반응용)
          if (nowActive) {
            latestData.heart = [...(latestData.heart || []), String(book.id)]
          } else {
            latestData.heart = (latestData.heart || []).filter(
              (id) => id !== String(book.id),
            )
          }
          localStorage.setItem(LOGIN_AUTH_DATA, JSON.stringify(latestData))

          // 2. 서버에 실제 데이터 반영 (비동기)
          await updateHeartToServer(book.id, nowActive)

          // 3. 유저의 장르 취향 점수 반영
          if (book.tags) {
            updateGenrePreference(book.tags, nowActive ? 1 : -1)
          }
        }
      }
    })
  })

  // --- 비밀번호 변경 폼 제출 처리 ---
  if (pwForm) {
    pwForm.addEventListener('submit', (e) => {
      const newPw = document.querySelector('#new-pw')?.value || ''
      const confirmPw = document.querySelector('#confirm-pw')?.value || ''
      const errorMsg = document.querySelector('.pw-error-msg')

      if (newPw !== confirmPw) {
        e.preventDefault() // 비번 다르면 전송 막기
        if (errorMsg) errorMsg.style.display = 'block'
        return
      }
      alert('비밀번호가 변경되었습니다.')
      changePWDialog?.close()
    })
  }

  // --- 공통 닫기 버튼 (모든 팝업의 X 버튼) ---
  closeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog')
      if (dialog) {
        if (dialog === changePWDialog) resetPWForm() // 비번창은 내용 리셋
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

  checkEmptyList() // 초기 로딩 시 목록 확인
})

/**
 * [4] 찜 목록 데이터 호출 및 그리기 준비
 */
async function getHeartList() {
  // 반응성을 위해 서버 응답을 기다리지 않고 로컬 스토리지 데이터를 먼저 참조합니다.
  const savedData = JSON.parse(localStorage.getItem(LOGIN_AUTH_DATA) || '{}')
  const heart = savedData?.heart || []

  if (!isLoggedIn || !currentUser) return

  const heartID = heart.map((item) => Number(item))
  const allBooks = await getData() // 전체 도서 목록 가져오기

  // 내 하트 목록(ID)과 일치하는 실제 책 데이터를 찾아 배열로 만듭니다.
  const bookItems = heartID
    .map((id) => allBooks.find((book) => book.id === id))
    .filter(Boolean)

  const bookList = document.querySelector('.book-list')
  const heartList = document.querySelectorAll('.book-list li')

  if (heartList.length === 0) return

  // 준비된 li 요소들에 책 데이터를 그려넣습니다.
  heartLists(heartList, bookItems)
  // 그려진 요소들에 각각 삭제 기능을 붙여줍니다.
  removeHeart(bookList)
}

/**
 * [5] 책 리스트를 HTML로 변환하여 화면에 그리는 함수
 */
function heartLists(heartList, bookItems) {
  heartList.forEach((item, index) => {
    const currentBook = bookItems[index]
    if (!currentBook) return

    // 리스트 내부에 삭제 버튼과 책 이미지를 삽입합니다.
    item.innerHTML = `
      <button type="button" class="delete-item-button" aria-label="삭제">
        <svg data-delete="button" data-id="${currentBook.id}" ...>
          </svg>
      </button>
      <a href="${currentBook.bookstoreUrl}" target="_blank">
        <img src="${currentBook.bookCover}" alt="${currentBook.author}" />
      </a>
    `
  })
}

/**
 * [6] 찜 목록 개별 삭제 처리 (가장 복잡하고 중요한 로직)
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
      (id) => id !== String(deleteBookValue),
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

/**
 * [7] 마이페이지 상단에 로그인한 유저의 ID를 표시하는 함수
 */
function updateUserDiSplay() {
  const { isLoggedIn: loginStatus, currentUser: user } = initSession()
  if (loginStatus && user) {
    const myPageDialog = document.querySelector('.my-page-dialog')
    let userIdDisplay = myPageDialog.querySelector('.user-id-text')
    if (userIdDisplay) userIdDisplay.textContent = user.userId
    getHeartList() // 마이페이지 열릴 때 리스트 새로고침
  }
}
