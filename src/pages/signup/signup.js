// input 변수 생성
const newAddIdValue = document.getElementById('new-id-input-area')
const newAddPwValue = document.getElementById('new-pw-input-area')
const newAddEmailValue = document.getElementById('new-email-input-area')

// input 하단 span 요소 가져오기
const idInputBottomAlert = document.querySelector('.new-id-blank-warning')
const pwInputBottomAlert = document.querySelector('.new-pw-blank-warning')
const emailInputBottomAlert = document.querySelector('.new-email-blank-warning')

// 송신(submit) 버튼 요소 가져오기
const sendingSignup = document.querySelector('.submit-button')

// 비밀번호 특수문자 정규식
const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

const API_URL = 'https://69898725c04d974bc69f8907.mockapi.io/todayPhrase/user'

function spanTagAlert() {
  sendingSignup.addEventListener('click', async (e) => {
    e.preventDefault()

    const newId = newAddIdValue.value.trim()
    const newPw = newAddPwValue.value.trim()
    const newEmail = newAddEmailValue.value.trim()

    // 알림 문구 초기화
    idInputBottomAlert.textContent = ''
    pwInputBottomAlert.textContent = ''
    emailInputBottomAlert.textContent = ''

    // 1. 아이디 빈값 검사
    if (newId === '') {
      idInputBottomAlert.textContent = '아이디 입력은 필수입니다.'
      idInputBottomAlert.removeAttribute('hidden')
      return // 에러가 있으면 여기서 중단
    }

    try {
      //중복 검사 로직 추가 시작
      const checkResponse = await fetch(API_URL)
      const userList = await checkResponse.json()

      // 서버에 저장된 userId들 중 입력한 newId와 같은 게 있는지 확인
      const isDuplicate = userList.some((user) => user.userId === newId)

      if (isDuplicate) {
        idInputBottomAlert.textContent = '이미 사용 중인 아이디입니다.'
        idInputBottomAlert.removeAttribute('hidden')
        return // 중복이면 아래 비밀번호/이메일 검사로 안 넘어가고 중단
      }

      // 비밀번호 검사
      if (newPw === '') {
        pwInputBottomAlert.textContent = '비밀번호 입력은 필수입니다.'
        pwInputBottomAlert.removeAttribute('hidden')
      } else if (!pwRegex.test(newPw)) {
        pwInputBottomAlert.textContent = '영어, 숫자, 특수문자 혼합 8자리 이상.'
        pwInputBottomAlert.removeAttribute('hidden')
      }
      //이메일 검사
      else if (newEmail === '') {
        emailInputBottomAlert.textContent =
          '올바른 이메일 양식으로 작성해주세요.'
        emailInputBottomAlert.removeAttribute('hidden')
      }
      // 4. 모든 관문 통과 후 최종 서버 송신
      else {
        const userData = {
          userId: newId,
          password: newPw,
          email: newEmail,
        }

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        })

        if (response.ok) {
          alert('가입이 완료되었습니다! 메인페이지로 이동합니다.')
          window.location.href = '/index.html'
        }
      }
    } catch (error) {
      alert('연결에 문제가 발생하였습니다.')
      console.error(error)
    }
  })
}

spanTagAlert()
