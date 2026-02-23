import { getData, getUser } from '../../../api/api'

/**
 * [전역 상태 설정]
 */
let isLoggedIn = false // 로그인 상태 (테스트 시 true/false로 변경)

// 1. 찜 목록이 비었을 때 메시지 표시 함수
function checkEmptyList() {
  const bookList = document.querySelector('.book-list')
  if (bookList && bookList.children.length === 0) {
    bookList.innerHTML = '<p class="empty-msg">찜한 내역이 없습니다.</p>'
  }
}

// 2. 비밀번호 변경 폼 초기화 함수
function resetPWForm() {
  const pwForm = document.querySelector('.pw-form')
  if (pwForm) {
    pwForm.reset()
    const errorMsg = document.querySelector('.pw-error-msg')
    if (errorMsg) {
      errorMsg.style.display = 'none'
    }
  }
}

// 3. 찜 버튼 토글 (애니메이션 및 접근성)
function toggleHeart(button) {
  const isActive = button.classList.toggle('heart-active')
  button.setAttribute('aria-pressed', isActive ? 'true' : 'false')
  console.log(isActive ? '찜 추가됨' : '찜 해제됨')
}

/**
 * [이벤트 리스너 등록]
 */
document.addEventListener('DOMContentLoaded', () => {
  // 주요 요소들
  const myPageBtn = document.querySelector('.navi-mypage-button')
  const saveBtns = document.querySelectorAll('.save-button')
  const loginDialog = document.querySelector('.login-dialog')
  const myPageDialog = document.querySelector('.my-page-dialog')
  const heartLimitDialog = document.querySelector('.heart-list-dialog')
  const bookList = document.querySelector('.book-list')
  const changePWBtn = document.querySelector('.change-pw-button')
  const changePWDialog = document.querySelector('.change-pw-dialog')
  const pwForm = document.querySelector('.pw-form')
  const delBookListBtn = document.querySelector('.delete-book-list-button')
  const closeBtns = document.querySelectorAll('.close-dialog')

  // --- 내비게이션 마이페이지 버튼 ---
  myPageBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      loginDialog?.showModal()
    } else {
      myPageDialog?.showModal()
    }
  })

  // --- 로그인 팝업 내 [로그인 페이지 이동] 버튼 ---
  const loginConfirmBtn = document.querySelector(
    '.login-dialog .confirm-button',
  )

  loginConfirmBtn?.addEventListener('click', () => {
    window.location.href = '/src/pages/login/login.html'
  })

  // --- 찜 버튼 클릭 (여러 개 대응) ---
  saveBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // 1. 로그인 체크
      if (!isLoggedIn) {
        loginDialog?.showModal()
        return
      }

      // 2. 갯수 제한 체크
      const isAlreadyActive = btn.classList.contains('heart-active')
      const currentCount = bookList?.querySelectorAll('li').length || 0

      if (!isAlreadyActive && currentCount >= 6) {
        heartLimitDialog?.showModal()
      } else {
        toggleHeart(btn)
      }
    })
  })

  // --- 비밀번호 변경 관련 ---
  changePWBtn?.addEventListener('click', () => {
    resetPWForm()
    changePWDialog?.showModal()
  })

  pwForm?.addEventListener('submit', (e) => {
    const newPw = document.querySelector('#new-pw')?.value
    const confirmPw = document.querySelector('#confirm-pw')?.value
    const errorMsg = document.querySelector('.pw-error-msg')

    if (newPw !== confirmPw) {
      e.preventDefault() // 폼 제출 방지
      if (errorMsg) {
        errorMsg.style.display = 'block'
      }
      return
    }

    alert('비밀번호가 변경되었습니다.')
    changePWDialog?.close()
  })

  // --- 공통 닫기 버튼 핸들러 ---
  closeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog')
      if (dialog) {
        if (dialog === changePWDialog) {
          resetPWForm()
        }
        dialog.close()
      }
    })
  })

  // --- 찜 제한 팝업 내 [마이페이지 이동] 버튼 ---
  const heartListConfirmBtn = document.querySelector(
    '.heart-list-dialog .confirm-button',
  )
  heartListConfirmBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    heartLimitDialog?.close()
    myPageDialog?.showModal()
  })

  // --- 찜 목록 편집 모드 전환 ---
  delBookListBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    if (myPageDialog) {
      const isEditMode = myPageDialog.classList.toggle('edit-mode')
      delBookListBtn.textContent = isEditMode ? '편집 완료' : '찜 항목 삭제'
    }
  })

  // --- 찜 목록 개별 삭제 (이벤트 위임) ---
  bookList?.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.delete-item-button')
    if (delBtn) {
      const targetLi = delBtn.closest('li')
      if (targetLi) {
        targetLi.style.opacity = '0'
        targetLi.style.transition = '0.3s'
        setTimeout(() => {
          targetLi.remove()
          checkEmptyList()
        }, 300)
      }
    }
  })

  // 초기 실행: 목록 상태 확인
  checkEmptyList()
})

// 찜 리스트 호출
async function getHeartList() {
  // TODO
  // 유저아이디 동적으로 가지고 와야함 <<<<<<< 일단 임시로 불러옴 ( 로그인 하는 아이디에 따라 바뀌어야함 )
  // 여기에 해당 로그인한 유저 EMAIL값 넣어야함
  const user = await getUser('email', 'email@email.com')
  const heart = await user.heart
  const heartID = heart.map((item) => Number(item.trim()))

  // 하트찍은 책 ID 매칭
  const bookItems = await Promise.all(heartID.map((id) => getData('id', id)))

  const heartList = document.querySelectorAll('.book-list li')
  if (!heartList) throw new Error('[data-book]을 찾지 못하였습니다.')

  // 책리스트 동적으로 가져오기
  heartList.forEach((item, index) => {
    const currentBook = bookItems[index]

    if (!currentBook) return

    item.innerHTML = `
      <button type="button" class="delete-item-button" aria-label="삭제">
        <svg
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
      <a data-book="book-item-${index}" href="${currentBook.bookstoreUrl}" rel="noopener noreferrer">
        <img src="${currentBook.bookCover}" alt="${currentBook.author}" />
      </a>
    `
  })
}

getHeartList()
