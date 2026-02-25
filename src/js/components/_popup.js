import { getData } from '../../../api/api'
import { initSession } from '../../pages/login/loginSession'

const { isLoggedIn, currentUser } = initSession()
/**
//  * [전역 상태 설정]
//  */
// let isLoggedIn = false // 로그인 상태 (테스트 시 true/false로 변경)

// 1. 찜 목록이 비었을 때 메시지 표시 함수
function checkEmptyList() {
  const bookList = document.querySelector('.book-list')

  // 목록 요소가 존재하고, 자식 요소(li)가 하나도 없을 때 실행
  if (bookList && bookList.children.length === 0) {
    bookList.innerHTML = '<p class="empty-msg">찜한 내역이 없습니다.</p>'
  }
}

// 2. 비밀번호 변경 폼 초기화 함수
function resetPWForm() {
  const pwForm = document.querySelector('.pw-form')
  if (pwForm) {
    pwForm.reset() // 입력 필드 초기화
    const errorMsg = document.querySelector('.pw-error-msg')
    if (errorMsg) errorMsg.style.display = 'none' // 에러 메시지 숨김
  }
}

// 3. 하트(찜) 버튼의 활성화 상태를 토글하고 접근성 속성(aria-pressed)을 갱신하는 함수
function toggleHeart(button) {
  const isActive = button.classList.toggle('heart-active')
  button.setAttribute('aria-pressed', isActive ? 'true' : 'false')
}

// [이벤트 리스너 등록] DOM이 모두 로드된 후 실행

document.addEventListener('DOMContentLoaded', () => {
  // 제어할 DOM 요소들 선택
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
      updateUserDiSplay()
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

  // 메인 화면 등의 찜 버튼(하트) 클릭 시 (다중 요소 대응)
  saveBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // 1. 로그인 확인
      if (!isLoggedIn) {
        if (loginDialog) loginDialog.showModal()
        return
      }

      // 2. 갯수 제한 체크 (최대 6개까지만 허용)
      const isAlreadyActive = btn.classList.contains('heart-active')
      const currentCount = bookList ? bookList.querySelectorAll('li').length : 0

      if (!isAlreadyActive && currentCount >= 6) {
        if (heartLimitDialog) heartLimitDialog.showModal() // 6개 초과 시 찜 제한 안내 팝업
      } else {
        toggleHeart(btn)
      }
    })
  })

  // 비밀번호 변경 팝업 열기
  if (changePWBtn) {
    changePWBtn.addEventListener('click', () => {
      resetPWForm() // 열 때마다 이전 입력 기록 초기화
      if (changePWDialog) changePWDialog.showModal()
    })
  }

  // 비밀번호 변경 폼 제출(Submit) 핸들러
  if (pwForm) {
    pwForm.addEventListener('submit', (e) => {
      const newPwInput = document.querySelector('#new-pw')
      const confirmPwInput = document.querySelector('#confirm-pw')
      const errorMsg = document.querySelector('.pw-error-msg')

      // input 요소가 있는지 확인 후 value 가져오기
      const newPw = newPwInput ? newPwInput.value : ''
      const confirmPw = confirmPwInput ? confirmPwInput.value : ''

      // 비밀번호 불일치 검증
      if (newPw !== confirmPw) {
        e.preventDefault() // 서버 전송 중단
        if (errorMsg) errorMsg.style.display = 'block'
        return
      }

      alert('비밀번호가 변경되었습니다.')
      if (changePWDialog) changePWDialog.close()
    })
  }

  // 공통 닫기 버튼 핸들러 (모든 dialog의 .close-dialog에 적용)
  closeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog')
      if (dialog) {
        if (dialog === changePWDialog) {
          resetPWForm() // 비번 변경창은 닫힐 때 내용 초기화
        }
        dialog.close()
      }
    })
  })

  // 찜 제한 팝업에서 [마이페이지 이동] 클릭 시
  const heartListConfirmBtn = document.querySelector(
    '.heart-list-dialog .confirm-button',
  )
  heartListConfirmBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    heartLimitDialog?.close()
    updateUserDiSplay()
    myPageDialog?.showModal()
  })

  // 찜 목록 편집 모드 전환 (삭제 버튼 노출/비노출)
  if (delBookListBtn) {
    delBookListBtn.addEventListener('click', (e) => {
      e.preventDefault()
      if (myPageDialog) {
        // .edit-mode 클래스를 토글하여 CSS로 삭제 버튼 등을 제어
        const isEditMode = myPageDialog.classList.toggle('edit-mode')
        delBookListBtn.textContent = isEditMode ? '편집 완료' : '찜 항목 삭제'
      }
    })
  }

  // 찜 목록 개별 삭제 (이벤트 위임 활용)
  // bookList 내부에 동적으로 생성되는 삭제 버튼 클릭 시 대응
  if (bookList) {
    bookList.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.delete-item-button')
      if (delBtn) {
        const targetLi = delBtn.closest('li')
        if (targetLi) {
          // 투명도 애니메이션 후 요소 제거
          targetLi.style.opacity = '0'
          targetLi.style.transition = '0.3s'
          setTimeout(() => {
            targetLi.remove()
            checkEmptyList() // 삭제 후 목록이 비었는지 확인
          }, 300)
        }
      }
    })
  }

  // 초기 로드 시 목록이 비어있는지 확인
  checkEmptyList()
})

// 찜 리스트 호출
async function getHeartList() {
  // TODO
  // 유저아이디 동적으로 가지고 와야함 <<<<<<< 일단 임시로 불러옴 ( 로그인 하는 아이디에 따라 바뀌어야함 )
  // 여기에 해당 로그인한 유저 EMAIL값 넣어야함
  if (!isLoggedIn || !currentUser) {
    console.log('비회원 상태이므로 찜 목록을 불러올 수 없습니다.')
    return
  }

  const heart = await currentUser.heart
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

// 마이페이지 내부 userId 변경하는 함수
function updateUserDiSplay() {
  const { isLoggedIn: loginStatus, currentUser: user } = initSession()

  if (loginStatus && user) {
    const myPageDialog = document.querySelector('.my-page-dialog')
    let userIdDisplay = myPageDialog.querySelector('.user-id-text')

    if (userIdDisplay) {
      userIdDisplay.textContent = user.userId
    }
    getHeartList()
  }
}
