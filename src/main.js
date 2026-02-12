// CSS 호출
import './css/style.css'

;(() => {
  // 필요한 요소 가져오기 (DOM 선택)
const heartBtn = document.querySelector('.heart-btn')
const allCloseBtns = document.querySelectorAll('.close-dialog')

const loginDialog = document.querySelector('.login-dialog')
const heartLimitDialog = document.querySelector('.heart-list-dialog')
const myPageDialog = document.querySelector('.my-page-dialog')

const heartListConfirm = document.querySelector(
  '.heart-list-dialog .confirm-button',
)
const changePWBtn = document.querySelector('.change-pw-button')

const delBookListBtn = document.querySelector('.delete-book-list-button')
const bookList = document.querySelector('.book-list')

let isLogginIn = true // 로그인 상태 가정

// 찜 버튼 클릭 시
heartBtn.addEventListener('click', () => {
  // 로그인 상태 체크
  if (!isLogginIn) {
    loginDialog.showModal()
    return
  }

  // 찜 개수 체크
  const currentHeartCount = bookList.querySelectorAll('li').length

  if (currentHeartCount >= 6) {
    heartLimitDialog.showModal()
  } else {
    heartBtn.classList.toggle('heart-active')
    console.log('찜하기가 완료되었습니다.')
  }
})

// 닫기 버튼 클릭 시 (복수 버튼 처리)
allCloseBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.closest('dialog').close()
  })
})

// ★ 마이페이지 연결 로직 보완
heartListConfirm.addEventListener('click', (e) => {
  e.preventDefault() // form 안에 있을 경우 대비
  console.log('마이페이지로 이동합니다!')

  heartLimitDialog.close()
  myPageDialog.showModal()
})

// 비밀번호 변경
changePWBtn?.addEventListener('click', () => {
  console.log('비밀번호를 변경합니다.')
})

// 찜 항목 삭제 모드 토글
delBookListBtn?.addEventListener('click', (e) => {
  e.preventDefault()
  myPageDialog.classList.toggle('edit-mode')
  delBookListBtn.textContent = myPageDialog.classList.contains('edit-mode')
    ? '편집 완료'
    : '찜 항목 삭제'
})

// 개별 항목 삭제
bookList.addEventListener('click', (e) => {
  const delBtn = e.target.closest('.delete-item-button')
  if (delBtn) {
    const targetLi = delBtn.closest('li')

    targetLi.style.opacity = '0'

    setTimeout(() => {
      targetLi.remove()
      checkEmptyList()
    }, 300)
  }
})

function checkEmptyList() {
  if (bookList.children.length === 0) {
    bookList.innerHTML = '<p class="empty-msg">찜한 내역이 없습니다.</p>'
  }
}

}) //()



const DialogManager = {
  getElements() {
    return {
      heartBtn: document.querySelector('.heart-btn'),
      allCloseBtns: document.querySelectorAll('.close-dialog'),
      
      loginDialog: document.querySelector('.login-dialog'),
      heartLimitDialog: document.querySelector('.heart-list-dialog'),
      myPageDialog: document.querySelector('.my-page-dialog'),
      
      heartListConfirm: document.querySelector('.heart-list-dialog .confirm-button'),
      changePWBtn: document.querySelector('.change-pw-button'),
      
      delBookListBtn: document.querySelector('.delete-book-list-button'),
      bookList: document.querySelector('.book-list')
    }
  },

  // 찜 목록이 비었을 때
  checkEmptyList(bookList) {
    if (bookList && bookList.children.length === 0) {
      bookList.innerHTML = '<p class="empty-msg">찜한 내역이 없습니다.</p>'
    }
  },

  // [3] 초기화 및 이벤트 등록
  init() {
    const el = this.getElements()
    let isLogginIn = true // 로그인 상태 가정 (나중에 팀원 데이터와 연동)

    // 요소가 없는 페이지에서 실행되어 에러가 나는 것을 방지
    if (!el.heartBtn || !el.bookList) return

    // --- 찜 버튼 클릭 핸들러 ---
    el.heartBtn.addEventListener('click', () => {
      // 1순위: 로그인 체크
      if (!isLogginIn) {
        el.loginDialog?.showModal()
        return
      }

      // 2순위: 찜 개수 체크
      const currentHeartCount = el.bookList.querySelectorAll('li').length
      if (currentHeartCount >= 6) {
        el.heartLimitDialog?.showModal()
      } else {
        // 3순위: 조건 충족 시 활성화
        el.heartBtn.classList.toggle('heart-active')
        console.log('찜하기가 완료되었습니다.')
      }
    })

    // --- 공통 닫기 버튼 핸들러 ---
    el.allCloseBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.closest('dialog')?.close()
      })
    })

    // --- 마이페이지 이동 핸들러 ---
    el.heartListConfirm?.addEventListener('click', (e) => {
      e.preventDefault()
      console.log('마이페이지로 이동합니다!')
      el.heartLimitDialog?.close()
      el.myPageDialog?.showModal()
    })

    // --- 비밀번호 변경 버튼 핸들러 ---
    el.changePWBtn?.addEventListener('click', () => {
      console.log('비밀번호 변경 팝업을 띄웁니다.')
      // 만약 비번변경 팝업이 별도로 있다면 여기에 .showModal() 추가
    })

    // --- 찜 목록 편집 모드 토글 ---
    el.delBookListBtn?.addEventListener('click', (e) => {
      e.preventDefault()
      if (el.myPageDialog) {
        el.myPageDialog.classList.toggle('edit-mode')
        el.delBookListBtn.textContent = el.myPageDialog.classList.contains('edit-mode')
          ? '편집 완료'
          : '찜 항목 삭제'
      }
    })

    // --- 찜 항목 개별 삭제 (이벤트 위임 방식) ---
    el.bookList.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.delete-item-button')
      if (delBtn) {
        const targetLi = delBtn.closest('li')
        if (targetLi) {
          targetLi.style.opacity = '0'
          setTimeout(() => {
            targetLi.remove()
            this.checkEmptyList(el.bookList)
          }, 300)
        }
      }
    })
  }
}

// DOM이 준비되면 초기화 실행
document.addEventListener('DOMContentLoaded', () => {
  DialogManager.init()
})