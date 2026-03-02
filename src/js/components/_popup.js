const VITE_API_BASE_URL = import.meta.env.VITE_DATA_API_URL

import { getData, getUser, putUser } from '../../../api/api'
import { EMAIL, LOGIN_AUTH_DATA } from '../constants'
import { initSession } from '../../pages/login/loginSession'
// [수정] updateHeartToServer 추가
import {
  updateGenrePreference,
  updateHeartToServer,
} from '../service/bookService'
import { loadStorage } from '../utils/storage'

const { isLoggedIn, currentUser } = initSession()
const loadEmail = loadStorage(LOGIN_AUTH_DATA)

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

  // 결과 페이지에서는 result.js가 찜 이벤트를 처리하므로 중복 실행 방지
  if (!document.querySelector('.result-display')) {
   // 메인 화면 등의 찜 버튼(하트) 클릭 시 (다중 요소 대응)
   saveBtns.forEach((btn) => {
     // [수정] async 추가 (await 사용을 위해)
     btn.addEventListener('click', async () => {
        // 1. 로그인 확인
        if (!isLoggedIn) {
          loginDialog?.showModal()
          return
         }

       // 2. 갯수 제한 체크 (최대 6개까지만 허용)
       const isAlreadyActive = btn.classList.contains('heart-active')
 
       // [수정] 기존 li 개수로 체크하던 방식 → heart 배열 길이로 체크
       // 기존 코드 (li 개수로 체크 - 항상 0 나옴)
       // const currentCount = bookList
       //   ? bookList.querySelectorAll('li:not(:empty)').length
       //   : 0
       const savedData = JSON.parse(
         localStorage.getItem(LOGIN_AUTH_DATA) || '{}',
       )
       const currentCount = savedData?.heart?.length ?? 0
 
       if (!isAlreadyActive && currentCount >= 6) {
         heartLimitDialog?.showModal() // 6개 초과 시 찜 제한 안내 팝업
        } else {
         toggleHeart(btn)
 
         const imgSrc = btn.querySelector('.book-cover-img').src
         const currentData = JSON.parse(
           localStorage.getItem('selectedBookList') || '[]',
         )
         const book = currentData.find((b) => b.bookCover === imgSrc)
 
         if (book) {
           const nowActive = btn.classList.contains('heart-active')
 
           // [추가] localStorage heart 배열도 업데이트 (6개 제한 체크에 사용)
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
 
           // [추가] 서버에 찜 추가/삭제 반영
           await updateHeartToServer(book.id, nowActive)
 
           if (book.tags) {
             updateGenrePreference(book.tags, nowActive ? 1 : -1)
           }
          }
        }
      })
    })
  }

  // 비밀번호 변경 팝업 열기
  if (changePWBtn) {
    changePWBtn.addEventListener('click', () => {
      resetPWForm() // 열 때마다 이전 입력 기록 초기화
      changePWDialog?.showModal()
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
      changePWDialog?.close()
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
  delBookListBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    if (myPageDialog) {
      const isEditMode = myPageDialog.classList.toggle('edit-mode')
      delBookListBtn.textContent = isEditMode ? '편집 완료' : '찜 항목 삭제'
    }
  })

  // removeHeart에서 서버 반영 + 화면 제거를 같이 처리하고 있어서 주석 처리
  // // 찜 목록 개별 삭제 (이벤트 위임 활용)
  // // bookList 내부에 동적으로 생성되는 삭제 버튼 클릭 시 대응
  // bookList?.addEventListener('click', (e) => {
  //   const delBtn = e.target.closest('.delete-item-button')
  //   if (delBtn) {
  //     const targetLi = delBtn.closest('li')
  //     if (targetLi) {
  //       // 투명도 애니메이션 후 요소 제거
  //       targetLi.style.opacity = '0'
  //       targetLi.style.transition = '0.3s'
  //       setTimeout(() => {
  //         targetLi.remove()
  //         checkEmptyList() // 삭제 후 목록이 비었는지 확인
  //       }, 300)
  //     }
  //   }
  // })

  // 초기 로드 시 목록이 비어있는지 확인
  checkEmptyList()
})

// 찜 리스트 호출
async function getHeartList() {
  // [수정] localStorage에서 먼저 heart 가져오기 (서버 응답 대기 없이 즉시 반영)
  // const user = await getUser(EMAIL, loadEmail.email)
  // const heart = await user.heart
  const savedData = JSON.parse(localStorage.getItem(LOGIN_AUTH_DATA) || '{}')
  const heart = savedData?.heart || []

  if (!isLoggedIn || !currentUser) {
    console.log('비회원 상태이므로 찜 목록을 불러올 수 없습니다.')
    return
  }

  const heartID = heart.map((item) => Number(item))

  // [수정] getData 전체 가져온 후 find로 id 매칭 (기존 Promise.all 방식 대체)
  // 하트찍은 책 find로 ID 매칭
  // const bookItems = await Promise.all(heartID.map((id) => getData('id', id)))
  const allBooks = await getData()
  const bookItems = heartID
    .map((id) => allBooks.find((book) => book.id === id))
    .filter(Boolean)

  const bookList = document.querySelector('.book-list')
  const heartList = document.querySelectorAll('.book-list li')
  // [수정] querySelectorAll은 null을 반환하지 않아서 length === 0으로 방어 코드 수정
  // if (!heartList) throw new Error('[data-book]을 찾지 못하였습니다.')
  if (heartList.length === 0) return

  // [수정] heartLists는 li 목록 렌더링만 해서 bookList 불필요
  // heartLists(heartList, bookItems, bookList)
  heartLists(heartList, bookItems)

  // 삭제 이벤트 등록 (중복 방지를 위해 cloneNode로 기존 이벤트 제거)
  // [수정] latestUser.heart 사용 (bookItems 불필요)
  // removeHeart(bookItems, bookList)
  removeHeart(bookList)
}

// 책리스트 동적으로 가져오기
function heartLists(heartList, bookItems) {
  heartList.forEach((item, index) => {
    const currentBook = bookItems[index]
    if (!currentBook) return

    item.innerHTML = `
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
      <a data-book="book-item-${index}" href="${currentBook.bookstoreUrl}" rel="noopener noreferrer" target="_blank">
        <img src="${currentBook.bookCover}" alt="${currentBook.author}" />
      </a>
    `
  })
}

// 하트 지우기
// [수정] latestUser.heart 사용 (bookItems 불필요)
// async function removeHeart(bookItems, bookList) {
async function removeHeart(bookList) {
  // 책 리스트가 없을경우 코드 종료
  if (!bookList) return

  // [추가] cloneNode로 기존 이벤트 제거 후 새로 등록 (중복 방지)
  // getHeartList가 마이페이지를 열 때마다 호출되는데,
  // removeHeart 안의 addEventListener도 매번 새로 등록 됨.
  // 그러면 마이페이지를 3번 열면 삭제 이벤트가 3번 실행되고 서버에 요청도 3번 감.
  // cloneNode로 기존 이벤트를 전부 제거하고 새로 등록하면 항상 1번만 실행되는 걸 보장
  const newBookList = bookList.cloneNode(true)
  bookList.replaceWith(newBookList)

  //  const user = await getUser(EMAIL, loadEmail.email)
  //  const updateUrl = `${VITE_API_BASE_URL}/todayPhrase/user/${user.id}`

  newBookList.addEventListener('click', async (e) => {
    const target = e.target
    const deleteButton = target.closest('[data-delete="button"]')

    // 책 삭제 버튼이 없을 경우 코드 종료(null 체크 완료)
    if (!deleteButton) return

    // [수정] data-id가 SVG 태그에 있는데 클릭 위치에 따라 closest('[data-id]')가 null을 반환할 수 있어서
    // deleteButton에서 직접 dataset.id를 가져오는 방식으로 수정
    // const deleteBook = target.closest('[data-id]')
    // const deleteBookValue = deleteBook.dataset.id
    const deleteBookValue = deleteButton.dataset.id

    // data-id가 없을 경우 코드 종료
    if (!deleteBookValue) return

    // [수정] 기존 bookItems 기준 필터링 → 매번 서버에서 최신 데이터 가져와서 필터링
    // 연속 삭제 시 정확하게 반영되도록 수정
    // const idNumber = bookItems.map((item) => item['id'])
    // 선택한 책 id값을 제외한 다른 책들을 담아 업데이트할 준비
    // if (deleteButton) {
    //   const updateHeart = idNumber.filter((id) => {
    //     return id !== Number(deleteBookValue)
    //   })

    // const updateHeart = idNumber.filter((id) => {
    //   return id !== Number(deleteBookValue)
    // })

    //   // 기존 데이터 추가 및 바뀐 찜목록만 추가 (숫자 -> 문자 변경)
    //   const updateData = {
    //     ...user,
    //     heart: updateHeart.map((num) => String(num)),
    //   }

    // 매번 서버에서 최신 유저 데이터 가져오기
    const latestUser = await getUser(EMAIL, loadEmail.email)
    const latestUpdateUrl = `${VITE_API_BASE_URL}/todayPhrase/user/${latestUser.id}`

    // 최신 heart 배열 기준으로 필터링
    const updateHeart = latestUser.heart.filter(
      (id) => id !== String(deleteBookValue),
    )

    const updateData = {
      ...latestUser,
      heart: updateHeart,
    }

    try {
      // 바뀐 데이터 PUT
      // await putUser(updateUrl, updateData)
      await putUser(latestUpdateUrl, updateData)

      // [추가] localStorage heart 배열도 업데이트 (6개 제한 체크에 사용)
      const savedData = JSON.parse(
        localStorage.getItem(LOGIN_AUTH_DATA) || '{}',
      )
      savedData.heart = updateHeart
      localStorage.setItem(LOGIN_AUTH_DATA, JSON.stringify(savedData))

      // [추가] 화면에서도 제거 (기존 removeHeart에는 없었음)
      const targetLi = deleteButton.closest('li')
      if (targetLi) {
        targetLi.style.opacity = '0'
        targetLi.style.transition = '0.3s'
        setTimeout(() => {
          targetLi.remove()
          checkEmptyList()
        }, 300)
      }
    } catch (error) {
      console.error('삭제 중 오류발생', error)
      alert('좋아요 삭제에 실패했습니다. 다시 시도해주세요.')
    }
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

// [수정] DOMContentLoaded 안에 이미 동일한 로직이 있어서 중복이어서 주석처리
// setTimeout(() => {
//   const saveBtns = document.querySelectorAll('.save-button')

//   saveBtns.forEach((btn) => {
//     btn.addEventListener('click', () => {
//       if (!isLoggedIn) return

//       toggleHeart(btn)

//       const imgSrc = btn.querySelector('.book-cover-img').src
//       const cachedData = JSON.parse(
//         localStorage.getItem('cachedBookData') || '[]',
//       )
//       const book = cachedData.find((b) => b.bookCover === imgSrc)

//       if (book && book.tags) {
//         const isActive = btn.classList.contains('heart-active')
//         updateGenrePreference(book.tags, isActive ? 1 : -1)
//       }
//     })
//   })
// }, 1500)
