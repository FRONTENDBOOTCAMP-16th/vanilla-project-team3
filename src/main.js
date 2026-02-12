// CSS 호출
import './css/style.css'

// JS 호출
import './js/components/_checked.js'
// 필요한 요소 가져오기 (DOM 선택)
const heartBtn = document.querySelector('.heart-btn')
const allCloseBtns = document.querySelectorAll('.close-dialog') 


const loginDialog = document.querySelector('.login-dialog') 
const heartLimitDialog = document.querySelector('.heart-list-dialog') 
const myPageDialog = document.querySelector('.my-page-dialog')

const heartListConfirm = document.querySelector('.heart-list-dialog .confirm-button')
const changePWBtn = document.querySelector('.change-pw-button')

const delBookListBtn = document.querySelector('.delete-book-list-button') 
const bookList = document.querySelector('.book-list')

// 찜 버튼 클릭 시 
heartBtn.addEventListener('click', () => {
  loginDialog.showModal()
})

heartBtn.addEventListener('click', () => {
  heartLimitDialog.showModal()
})

// 닫기 버튼 클릭 시 (복수 버튼 처리)
allCloseBtns.forEach(btn => {
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
  delBookListBtn.textContent = myPageDialog.classList.contains('edit-mode') ? '편집 완료' : '찜 항목 삭제'
})

// 개별 항목 삭제
bookList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-item-button') || e.target.classList.contains('delete-item-btn')) {
    const targetLi = e.target.closest('li')
    
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
