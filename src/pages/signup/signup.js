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

// 아이디 정규식 (영문, 숫자 조합 4~20자)
const idRegex = /^[a-zA-Z0-9]{4,20}$/

// 비밀번호 정규식 (영문, 숫자, 특수문자 조합 8자 이상)
const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

// [수정] doro@naver..naver.com 같은 연속 마침표를 막는 이메일 정규식
// const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
// 위에 수정된 정규식은 .. 두번이 여전히 작성됨
// 연속 마침표(..), 도메인 시작/끝 마침표 차단 이메일 정규식
const emailRegex =
  /^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

const USERS_API = 'https://69898725c04d974bc69f8907.mockapi.io/todayPhrase/user'

function signupLogic() {
  sendingSignup.addEventListener('click', async (e) => {
    e.preventDefault()

    const newId = newAddIdValue.value.trim()
    const newPw = newAddPwValue.value.trim()
    const newEmail = newAddEmailValue.value.trim()

    // 1. 초기화
    // 마크업의 hidden을 css의 style.visibility로 수정
    // idInputBottomAlert.hidden = true
    // pwInputBottomAlert.hidden = true
    // emailInputBottomAlert.hidden = true
    idInputBottomAlert.style.visibility = 'hidden'
    pwInputBottomAlert.style.visibility = 'hidden'
    emailInputBottomAlert.style.visibility = 'hidden'

    // 2. 아이디 빈값 검사
    if (newId === '') {
      idInputBottomAlert.textContent = '아이디 입력은 필수입니다.'

      // 마크업의 hidden을 css의 style.visibility로 수정
      // idInputBottomAlert.hidden = false
      idInputBottomAlert.style.visibility = 'visible'
      newAddIdValue.focus()
      return
    } else if (!idRegex.test(newId)) {
      idInputBottomAlert.textContent = '영문, 숫자 4~20자로 입력해주세요.'
      idInputBottomAlert.style.visibility = 'visible'
      newAddIdValue.focus()
      return
    }

    // 3. 비밀번호 검사
    if (newPw === '') {
      pwInputBottomAlert.textContent = '비밀번호 입력은 필수입니다.'

      // 마크업의 hidden을 css의 style.visibility로 수정
      // pwInputBottomAlert.hidden = false
      pwInputBottomAlert.style.visibility = 'visible'
      newAddPwValue.focus()
      return
    } else if (!pwRegex.test(newPw)) {
      pwInputBottomAlert.textContent = '영어, 숫자, 특수문자 혼합 8자리 이상.'

      // 마크업의 hidden을 css의 style.visibility로 수정
      // pwInputBottomAlert.hidden = false
      pwInputBottomAlert.style.visibility = 'visible'
      newAddPwValue.focus()
      return
    }

    // 4. 이메일 검사 (빈값 + 구조적 오류 차단)
    if (newEmail === '') {
      emailInputBottomAlert.textContent = '이메일 주소를 입력해 주세요.'

      // 마크업의 hidden을 css의 style.visibility로 수정
      // emailInputBottomAlert.hidden = false
      emailInputBottomAlert.style.visibility = 'visible'
      newAddEmailValue.focus()
      return
    }

    // 이메일 정규식 테스트
    if (!emailRegex.test(newEmail)) {
      emailInputBottomAlert.textContent =
        '"아이디@domain.com" 형식으로 작성해주세요.'

      // 마크업의 hidden을 css의 style.visibility로 수정
      // emailInputBottomAlert.hidden = false
      emailInputBottomAlert.style.visibility = 'visible'
      newAddEmailValue.focus()
      return
    }

    try {
      // 5. 아이디 중복 검사 (URL에 ? 추가)
      // MockAPI에서 특정 필드를 찾으려면 ?필드명=값 형태여야 합니다
      // MockAPI에서 ?userId=값으로 조회했을 때
      // 해당 유저가 없으면 404를 반환 (서버 동작, 콘솔에 나옴)
      const checkResponse = await fetch(`${USERS_API}?userId=${newId}`)
      const members = await checkResponse.json()

      // 데이터가 존재하면 중복된 아이디임
      if (Array.isArray(members) && members.length > 0) {
        idInputBottomAlert.textContent = '이미 사용 중인 아이디입니다.'

        // 마크업의 hidden을 css의 style.visibility로 수정
        // idInputBottomAlert.hidden = false
        idInputBottomAlert.style.visibility = 'visible'
        newAddIdValue.focus()
        return // 중복이면 여기서 가입 중단!
      }

      // 5-1. 이메일 중복 검사 (추가)
      const emailCheckResponse = await fetch(`${USERS_API}?email=${newEmail}`)
      const emailMembers = await emailCheckResponse.json()

      if (Array.isArray(emailMembers) && emailMembers.length > 0) {
        emailInputBottomAlert.textContent = '이미 사용 중인 이메일입니다.'

        // 마크업의 hidden을 css의 style.visibility로 수정
        // emailInputBottomAlert.hidden = false
        emailInputBottomAlert.style.visibility = 'visible'
        newAddEmailValue.focus()
        return
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

// 마크업으로 추가한 list 속성에 대한 작동 코드
// 자주 사용하는 이메일 도메인 목록
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
  // 이전에 생성된 option 목록 초기화 (중복 방지)
  datalist.innerHTML = ''

  // @가 포함되어 있을 때만 추천 목록 표시
  if (value.includes('@')) {
    const localPart = value.split('@')[0] // @ 앞부분 추출

    // 도메인 목록만큼 option 요소를 생성해서 datalist에 추가
    emailDomains.forEach((domain) => {
      const option = document.createElement('option')
      option.value = localPart + domain // ex) hong@naver.com
      datalist.appendChild(option) // datalist에 option 추가
    })
  }
})

signupLogic()
