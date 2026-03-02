// 1. DOM 요소 참조: 사용자가 입력하는 input창들과 경고 메시지를 보여줄 span 요소들을 가져옵니다.
const newAddIdValue = document.getElementById('new-id-input-area') // 아이디 입력란
const newAddPwValue = document.getElementById('new-pw-input-area') // 비밀번호 입력란
const newAddEmailValue = document.getElementById('new-email-input-area') // 이메일 입력란

// 각 입력란 하단에 나타날 경고 문구 요소들
const idInputBottomAlert = document.querySelector('.new-id-blank-warning')
const pwInputBottomAlert = document.querySelector('.new-pw-blank-warning')
const emailInputBottomAlert = document.querySelector('.new-email-blank-warning')

// 최종 가입 버튼
const sendingSignup = document.querySelector('.submit-button')

// 2. 정규표현식(Regex) 설정: 입력 데이터의 형식을 강제합니다.
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

// 회원 정보를 저장하고 조회할 서버 API 주소 (MockAPI)
const USERS_API = 'https://69898725c04d974bc69f8907.mockapi.io/todayPhrase/user'

/**
 * 회원가입 메인 로직 함수
 */
function signupLogic() {
  sendingSignup.addEventListener('click', async (e) => {
    e.preventDefault() // 버튼 클릭 시 페이지 새로고침 방지

    // 입력값의 앞뒤 공백을 제거하여 가져옵니다.
    const newId = newAddIdValue.value.trim()
    const newPw = newAddPwValue.value.trim()
    const newEmail = newAddEmailValue.value.trim()

    // [Step 1] 경고 문구 초기화: 검사를 시작하기 전 모든 경고를 숨깁니다.
    idInputBottomAlert.style.visibility = 'hidden'
    pwInputBottomAlert.style.visibility = 'hidden'
    emailInputBottomAlert.style.visibility = 'hidden'

    // [Step 2] 아이디 유효성 검사
    if (newId === '') {
      idInputBottomAlert.textContent = '아이디 입력은 필수입니다.'
      idInputBottomAlert.style.visibility = 'visible'
      newAddIdValue.focus() // 사용자가 바로 입력할 수 있게 커서 이동
      return // 검사 실패 시 함수 종료 (중단)
    } else if (!idRegex.test(newId)) {
      idInputBottomAlert.textContent = '영문, 숫자 4~20자로 입력해주세요.'
      idInputBottomAlert.style.visibility = 'visible'
      newAddIdValue.focus()
      return
    }

    // [Step 3] 비밀번호 유효성 검사
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

    // [Step 4] 이메일 유효성 검사
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
      // [Step 5] 아이디 중복 검사 (비동기 통신)
      // 서버에 해당 아이디(userId)를 사용하는 유저가 있는지 쿼리 스트링(?userId=)으로 조회합니다.
      const checkResponse = await fetch(`${USERS_API}?userId=${newId}`)
      // const members = await checkResponse.json()
      // [수정] 404면 중복 없음(빈 배열)으로 처리, json() 파싱 에러 방지
      const members = checkResponse.ok ? await checkResponse.json() : []

      // 응답 결과가 배열이고 데이터가 있다면 이미 존재하는 아이디입니다.
      if (Array.isArray(members) && members.length > 0) {
        idInputBottomAlert.textContent = '이미 사용 중인 아이디입니다.'
        idInputBottomAlert.style.visibility = 'visible'
        newAddIdValue.focus()
        return // 중복된 경우 가입 프로세스 중단
      }

      // [Step 5-1] 이메일 중복 검사
      const emailCheckResponse = await fetch(`${USERS_API}?email=${newEmail}`)
      // const emailMembers = await emailCheckResponse.json()
      // [수정] 404면 중복 없음(빈 배열)으로 처리, json() 파싱 에러 방지
      const emailMembers = emailCheckResponse.ok
        ? await emailCheckResponse.json()
        : []

      if (Array.isArray(emailMembers) && emailMembers.length > 0) {
        emailInputBottomAlert.textContent = '이미 사용 중인 이메일입니다.'
        emailInputBottomAlert.style.visibility = 'visible'
        newAddEmailValue.focus()
        return
      }

      // [Step 6] 모든 관문을 통과하면 최종적으로 서버에 유저 정보를 전송(POST)합니다.
      const userData = { userId: newId, password: newPw, email: newEmail }
      const responseSignUp = await fetch(USERS_API, {
        method: 'POST', // 새로운 데이터를 생성할 때는 POST 메서드를 사용합니다.
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData), // 자바스크립트 객체를 서버가 이해할 수 있는 JSON 문자열로 변환
      })

      if (responseSignUp.ok) {
        alert('가입이 완료되었습니다!')
        window.location.href = '/index.html' // 가입 성공 시 로그인 페이지로 이동
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

  // 새로운 추천 목록을 만들기 위해 기존의 목록을 비웁니다.
  datalist.innerHTML = ''

  // 사용자가 @를 입력하기 시작했을 때만 추천을 제공합니다.
  if (value.includes('@')) {
    const localPart = value.split('@')[0] // @ 앞의 사용자 아이디 부분만 추출

    // 미리 정의된 도메인 리스트를 돌면서 <option> 태그를 생성합니다.
    emailDomains.forEach((domain) => {
      const option = document.createElement('option')
      option.value = localPart + domain // 사용자가 입력한 아이디 + 도메인 조합 (ex: test@naver.com)
      datalist.appendChild(option) // <datalist>에 추가하여 화면에 표시
    })
  }
})

// 가입 로직 실행
signupLogic()
