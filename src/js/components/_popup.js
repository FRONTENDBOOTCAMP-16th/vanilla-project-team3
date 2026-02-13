// 팝업
const DialogManager = {
  getElements() {
    return {
      heartBtn: document.querySelector('.heart-btn'),
      allCloseBtns: document.querySelectorAll('.close-dialog'),
      loginDialog: document.querySelector('.login-dialog'),
      heartLimitDialog: document.querySelector('.heart-list-dialog'),
      myPageDialog: document.querySelector('.my-page-dialog'),
      heartListConfirm: document.querySelector(
        '.heart-list-dialog .confirm-button',
      ),
      delBookListBtn: document.querySelector('.delete-book-list-button'),
      bookList: document.querySelector('.book-list'),
      changePWBtn: document.querySelector('.change-pw-button'),
      changePWDialog: document.querySelector('.change-pw-dialog'),
      pwForm: document.querySelector('.pw-form'),
    }
  },

  checkEmptyList(bookList) {
    if (bookList && bookList.children.length === 0) {
      bookList.innerHTML = '<p class="empty-msg">찜한 내역이 없습니다.</p>'
    }
  },

  init() {
    const el = this.getElements()
    let isLogginIn = true

    // --- 1. 찜 버튼 관련 (있을 때만 실행) ---
    if (el.heartBtn && el.bookList) {
      el.heartBtn.addEventListener('click', () => {
        if (!isLogginIn) {
          el.loginDialog?.showModal()
          return
        }
        const currentHeartCount = el.bookList.querySelectorAll('li').length
        if (currentHeartCount >= 6) {
          el.heartLimitDialog?.showModal()
        } else {
          el.heartBtn.classList.toggle('heart-active')
        }
      })
    }

    // --- 2. 비밀번호 변경 관련 (있을 때만 실행) ---
    if (el.changePWBtn) {
      el.changePWBtn.addEventListener('click', () => {
        el.pwForm?.reset()
        const errorMsg = document.querySelector('.pw-error-msg')
        if (errorMsg) errorMsg.style.display = 'none'
        el.changePWDialog?.showModal()
      })
    }

    if (el.pwForm) {
      el.pwForm.addEventListener('submit', (e) => {
        const newPw = document.getElementById('new-pw').value
        const confirmPw = document.getElementById('confirm-pw').value
        const errorMsg = document.querySelector('.pw-error-msg')

        if (newPw !== confirmPw) {
          e.preventDefault()
          if (errorMsg) errorMsg.style.display = 'block'
          return
        }

        if (errorMsg) errorMsg.style.display = 'none'
        alert('비밀번호가 변경되었습니다.')
        el.pwForm.reset()
      })
    }

    // --- 3. 공통 닫기 버튼 핸들러 ---
    el.allCloseBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const dialog = btn.closest('dialog')
        if (dialog) {
          if (dialog.classList.contains('change-pw-dialog')) {
            el.pwForm?.reset()
          }
          dialog.close()
        }
      })
    })

    // --- 4. 마이페이지 이동 ---
    el.heartListConfirm?.addEventListener('click', (e) => {
      e.preventDefault()
      el.heartLimitDialog?.close()
      el.myPageDialog?.showModal()
    })

    // --- 5. 찜 목록 편집 및 삭제 ---
    el.delBookListBtn?.addEventListener('click', (e) => {
      e.preventDefault()
      if (el.myPageDialog) {
        el.myPageDialog.classList.toggle('edit-mode')
        el.delBookListBtn.textContent = el.myPageDialog.classList.contains(
          'edit-mode',
        )
          ? '편집 완료'
          : '찜 항목 삭제'
      }
    })

    el.bookList?.addEventListener('click', (e) => {
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
  },
}

document.addEventListener('DOMContentLoaded', () => {
  DialogManager.init()
})
