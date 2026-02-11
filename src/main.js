// CSS 호출
import './css/style.css'


// 필요한 요소 가져오기 (DOM 선택)
const showDialogBtn = document.querySelector('.heart-btn')
const closeDialogBtn = document.querySelector('.close-dialog')
const dialogEl = document.querySelector('.common-dialog')
const myPageBtn = document.querySelector('.my-page-dialog')
const heartListConfirm = document.querySelector('.heart-list-dialog .confirm-button')

// 찜 버튼 클릭 시 다이얼로그 표시
showDialogBtn.addEventListener('click', () => {
  dialogEl.showModal()
})

// 닫기 버튼 클릭 시 다이얼로그 닫기
closeDialogBtn.addEventListener('click', () => {
  dialogEl.close()
})


heartListConfirm.addEventListener('click', () => {
  console.log('마이페이지로 이동합니다!')
})

heartListConfirm.addEventListener('click', () => {
  dialogEl.close()

  myPageBtn.showModal()
})

