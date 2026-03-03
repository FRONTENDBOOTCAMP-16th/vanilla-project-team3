const newAddIdValue = document.getElementById('new-id-input-area')
const newAddPwValue = document.getElementById('new-pw-input-area')
const newAddEmailValue = document.getElementById('new-email-input-area')

const idInputBottomAlert = document.querySelector('.new-id-blank-warning')
const pwInputBottomAlert = document.querySelector('.new-pw-blank-warning')
const emailInputBottomAlert = document.querySelector('.new-email-blank-warning')

const sendingSignup = document.querySelector('.submit-button')

// 아이디: 영문 대소문자, 숫자 조합으로 4~20자 사이
const idRegex = /^[a-zA-Z0-9]{4,20}$/

// 비밀번호: 영문, 숫자, 특수문자가 각각 최소 하나 이상 포함되어야 하며 8자 이상
const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

/**
 * 이메일 정규식 설명:
 * - 연속된 마침표(..) 차단
 * - 도메인의 시작과 끝에 마침표 차단
 * - 일반적인 이메일 구조(@와 .com 등)를 엄격하게 검사
 */
const emailRegex =
  /^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

const USERS_API = 'https://69898725c04d974bc69f8907.mockapi.io/todayPhrase/user'

/**
 * 회원가입 메인 로직 함수
 */
function signupLogic() {
  sendingSignup.addEventListener('click', async (e) => {
    e.preventDefault()

    const newId = newAddIdValue.value.trim()
    const newPw = newAddPwValue.value.trim()
    const newEmail = newAddEmailValue.value.trim()

    idInputBottomAlert.style.visibility = 'hidden'
    pwInputBottomAlert.style.visibility = 'hidden'
    emailInputBottomAlert.style.visibility = 'hidden'

    if (newId === '') {
      idInputBottomAlert.textContent = '아이디 입력은 필수입니다.'
      idInputBottomAlert.style.visibility = 'visible'
      newAddIdValue.focus()
      return
    } else if (!idRegex.test(newId)) {
      idInputBottomAlert.textContent = '영문, 숫자 4~20자로 입력해주세요.'
      idInputBottomAlert.style.visibility = 'visible'
      newAddIdValue.focus()
      return
    }

    if (newPw === '') {
      pwInputBottomAlert.textContent = '비밀번호 입력은 필수입니다.'
      pwInputBottomAlert.style.visibility = 'visible'
      newAddPwValue.focus()
      return
    } else if (!pwRegex.test(newPw)) {
      pwInputBottomAlert.textContent = '영어, 숫자, 특수문자 혼합 8자리 이상.'
      pwInputBottomAlert.style.visibility = 'visible'
      newAddPwValue.focus()
      return
    }

    if (newEmail === '') {
      emailInputBottomAlert.textContent = '이메일 주소를 입력해 주세요.'
      emailInputBottomAlert.style.visibility = 'visible'
      newAddEmailValue.focus()
      return
    }
    if (!emailRegex.test(newEmail)) {
      emailInputBottomAlert.textContent =
        '"아이디@domain.com" 형식으로 작성해주세요.'
      emailInputBottomAlert.style.visibility = 'visible'
      newAddEmailValue.focus()
      return
    }

    try {
      const checkResponse = await fetch(`${USERS_API}?userId=${newId}`)
      const members = checkResponse.ok ? await checkResponse.json() : []

      if (Array.isArray(members) && members.length > 0) {
        idInputBottomAlert.textContent = '이미 사용 중인 아이디입니다.'
        idInputBottomAlert.style.visibility = 'visible'
        newAddIdValue.focus()
        return
      }

      const emailCheckResponse = await fetch(`${USERS_API}?email=${newEmail}`)
      const emailMembers = emailCheckResponse.ok
        ? await emailCheckResponse.json()
        : []

      if (Array.isArray(emailMembers) && emailMembers.length > 0) {
        emailInputBottomAlert.textContent = '이미 사용 중인 이메일입니다.'
        emailInputBottomAlert.style.visibility = 'visible'
        newAddEmailValue.focus()
        return
      }

      const userData = {
        userId: newId,
        password: newPw,
        email: newEmail,
        heart: [],
        viewed: [],
      }
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
      console.error('회원가입 중 서버 통신 오류:', error)
    }
  })
}

/**
 * 이메일 도메인 자동완성 기능: 사용자가 @를 입력하면 대표적인 도메인들을 추천 리스트로 보여줍니다.
 */
const emailDomains = [
  '@naver.com',
  '@gmail.com',
  '@daum.net',
  '@kakao.com',
  '@hanmail.net',
  '@nate.com',
  '@icloud.com',
]

newAddEmailValue.addEventListener('input', () => {
  const value = newAddEmailValue.value
  const datalist = document.getElementById('email-domains')

  datalist.innerHTML = ''

  if (value.includes('@')) {
    const localPart = value.split('@')[0]

    emailDomains.forEach((domain) => {
      const option = document.createElement('option')
      option.value = localPart + domain
      datalist.appendChild(option)
    })
  }
})

signupLogic()
