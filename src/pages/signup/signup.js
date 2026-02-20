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

// 비밀번호 정규식 (영문, 숫자, 특수문자 조합 8자 이상)
const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

// [수정] doro@naver..naver.com 같은 연속 마침표를 막는 이메일 정규식
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const USERS_API = 'https://69898725c04d974bc69f8907.mockapi.io/todayPhrase/user'

function signupLogic() {
  sendingSignup.addEventListener('click', async (e) => {
    e.preventDefault()

    const newId = newAddIdValue.value.trim()
    const newPw = newAddPwValue.value.trim()
    const newEmail = newAddEmailValue.value.trim()

    // 1. 초기화
    idInputBottomAlert.hidden = true
    pwInputBottomAlert.hidden = true
    emailInputBottomAlert.hidden = true

    // 2. 아이디 빈값 검사
    if (newId === '') {
      idInputBottomAlert.textContent = '아이디 입력은 필수입니다.'
      idInputBottomAlert.hidden = false
      newAddIdValue.focus()
      return
    }

    // 3. 비밀번호 검사
    if (newPw === '') {
      pwInputBottomAlert.textContent = '비밀번호 입력은 필수입니다.'
      pwInputBottomAlert.hidden = false
      newAddPwValue.focus()
      return
    } else if (!pwRegex.test(newPw)) {
      pwInputBottomAlert.textContent = '영어, 숫자, 특수문자 혼합 8자리 이상.'
      pwInputBottomAlert.hidden = false
      newAddPwValue.focus()
      return
    }

    // 4. 이메일 검사 (빈값 + 구조적 오류 차단)
    if (newEmail === '') {
      emailInputBottomAlert.textContent = '이메일 주소를 입력해 주세요.'
      emailInputBottomAlert.hidden = false
      newAddEmailValue.focus()
      return
    }

    // 이메일 정규식 테스트
    if (!emailRegex.test(newEmail)) {
      emailInputBottomAlert.textContent =
        '"아이디@domain.com" 형식으로 작성해주세요.'
      emailInputBottomAlert.hidden = false
      newAddEmailValue.focus()
      return
    }

    try {
      // 5. 아이디 중복 검사 (URL에 ? 추가)
      // MockAPI에서 특정 필드를 찾으려면 ?필드명=값 형태여야 합니다
      const checkResponse = await fetch(`${USERS_API}?userId=${newId}`)
      const members = await checkResponse.json()

      // 데이터가 존재하면 중복된 아이디임
      if (Array.isArray(members) && members.length > 0) {
        idInputBottomAlert.textContent = '이미 사용 중인 아이디입니다.'
        idInputBottomAlert.hidden = false
        newAddIdValue.focus()
        return // 중복이면 여기서 가입 중단!
      }

      // 6. 모든 검사 통과 시 최종 전송
      const userData = { userId: newId, password: newPw, email: newEmail }
      const responseSignUp = await fetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (responseSignUp.ok) {
        alert('가입이 완료되었습니다!')
        window.location.href = '/index.html'
      }
    } catch (error) {
      console.error(error)
    }
  })
}

signupLogic()
