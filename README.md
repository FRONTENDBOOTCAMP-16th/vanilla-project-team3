# vanilla-project-team3

---

# Personalized Sentence Curation Site(Vanilla JS)

- HTML, CSS, JavaScript로 구현한 사용자 맞춤 문학 문장 추천 웹 프로젝트
- 배포 링크: 예정

---

# 프로젝트 소개

- 프로젝트명: Personalized Sentence Curation Site
- 팀명: 문학소녀
- 한 줄 소개: 사용자의 선택에 따라 문학 문장을 추천하는 사이트
- 개발 기간: 2026년 02월 09일 - 2026년 03월 04일

---

# 기술 스택

<img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
<img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white">
<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

### Tools

- Git / GitHub
- VS Code
- DOMPurify

---

# 주요 기능

## 1. main 페이지

- 날씨 / 기분 아이콘 선택 후 비회원확인버튼 클릭으로 페이지 이동
- 로그인 버튼 클릭시 로그인 페이지로 이동
- 회원가입 버튼 클릭시 회원가입 페이지로 이동

## 2. 문장 페이지

- 책 제목, 작가, 문장(한글자씩 생성) 화면에 표시
- 찜 버튼으로 해당 문장 my 페이지에 저장(최대6개)-우선순위2
- 공유 버튼으로 외부로 공유하기(URL방식)-우선순위2

## 3. 로그인 페이지

- 아이디 / 비밀번호 입력
- 회원가입 버튼으로 회원가입 페이지로 이동
- 홈버튼으로 메인 db 페이지로 이동

## 4. 회원가입 페이지

- 아이디(중복확인) / 비밀번호 / 이메일 입력
- 홈버튼으로 메인 db 페이지로 이동

## 5. my 페이지

- 비밀번호 변경
- 찜 리스트 확인
- 홈버튼으로 메인 db 페이지로 이동

---

# 팀원 소개

각자 담당한 파트(기획, 디자인, 개발 등)

|  이름  | 역할 |             GitHub             |
| :----: | :--: | :----------------------------: |
| 송하늬 | 역할 |  https://github.com/songha-5   |
| 김근영 | 역할 |   https://github.com/sasasak   |
| 백희연 | 역할 | https://github.com/HeeYeonBaek |
| 문유정 | 역할 | https://github.com/myj9713-dev |

---

# 폴더 구조

```
VANILLA-PROJECT-TEAM3/
src/
├── css/
│   ├── common/
│   │   ├── _a11y.css # 접근성
│   │   ├── _base.css # 기본 리셋
│   │   ├── _fonts.css # 폰트 세팅
│   │   ├── _normalize.css # 정규화
│   │   └── _theme.css # 색상 테마
│   ├── components/
│   │   ├── _button.css # 기본 버튼 
│   │   ├── _emoji.css # 이모지
│   │   ├── _index.css # HTML / BODY 세팅
│   │   ├── _layout.css # 전체 틀 
│   │   ├── _login-signup.css # 회원가입 / 로그인 폼
│   │   ├── _morebookinfo.css # 책 상세보기 버튼
│   │   ├── _navi.css # 네비게이션
│   │   ├── _popup.css # 팝업
│   │   ├── _result-display.css # 추천하는 책 페이지
│   │   ├── _text-copy.css # 문구복사
│   │   └── _title.css # 타이틀
│   ├── style.css
│   ├── font /
│   │   ├── JejuHallasan.woff2
│   │   └── PretendardVariable.woff2
│   └── image
│
├── js/
│   ├── components/
│   │   ├── _imageLoading.js # 이미지 로딩 함수 모음
│   │   ├── _phraseLoader.js # 문구 함수 모음
│   │   ├── _popup.js # 팝업 관련 함수
│   │   ├── _share.js # 공유 함수
│   │   └── _text-copy.js # 텍스트 카피 함수
│   ├── constants/
│   │   └── index.js # 공용 CONST만 불러오는 파일
│   ├── services/
│   │   └── bookService.js # 공통 모듈만 포함하는 파일
│   └── utils/
│       └── index.js # utils 호출 함수
│       └── storage.js # 로컬스토리지 함수
├── main.js
├── pages/
│    ├── login/
│    │   ├── login.html # 로그인 페이지
│    │   ├── login.js # 로그인 함수
│    │   └── loginSession.js # 로그인 세션
│    ├── result/
│    │   ├── result.html # result.js 파일을 불러오는 페이지
│    │   └── result.js # result.html 페이지에서만 호출되어야 하는 파일 (정리)
│    └── signup/
│        ├── signup.html # 회원가입 페이지
│        └── signup.js # 회원가입 함수
├── .env
├── .gitignore
├── .prettierrc
├── bun.lock
├── eslint.config.mjs
├── index.html
├── index.html
├── package.json
├── README.md
└── vite.config.mjs
```

---

# 트러블 슈팅

개발 중 겪은 문제와 해결 과정

1. 문제 상황
2. 원인 파악
3. 해결 방법
4. 배운 점

[문제상황] 
공유 기능 수정 및 팀원 코드 병합 후, 결과 페이지 진입 시 데이터 로드에 실패함.
"데이터가 존재하지 않습니다"라는 알림과 함께 메인 페이지(index.html)로 강제 리다이렉트되는 현상 발생.
일부 로직에서 유저 데이터를 불러오기 전 호출이 일어나 null 혹은 undefined가 전달되어 추천 로직이 정상 작동하지 않음.

[원인]
모든 페이지에서 공통으로 사용하는 main.js가 _popup.js를 불러오고, _popup.js가 다시 특정 페이지 전용 로직인 result.js를 참조함.
관심사 분리 실패 : result.js 내부에 UI 렌더링 로직과 데이터 처리(비즈니스 로직)가 뒤섞여 있어, 특정 함수 호출 시 의도치 않게 페이지 전체의 초기화 로직이 간섭을 받음.

[해결]
비즈니스 로직 분리: result.js에 묶여 있던 데이터 계산 및 API 통신 로직을 별도의 bookService.js로 분리함.
_popup.js가 더 이상 result.js를 직접 참조하지 않도록 수정하고, 필요한 로직은 분리된 bookService.js에서 가져오도록 변경하여 의존성 오염을 제거함.
bookService.js: 순수 데이터 처리 및 API 통신 담당 (페이지 종속성 없음).
result.js: result.html 전용 UI 제어 및 렌더링 담당.

[배운점]
이론으로 접한 원칙을 코드에 적용하려고 노력했으나 기능 간의 결합도가 높아지는 스파게티 코드를 경험하게 되고 이를 해결하는 과정에서 초기 설계 단계에서 명확한 역할 분리가 얼마나 중요한지 깨닫는 계기가 되었다.
꼬여있는 로직을 피드백 받은대로 분리하고 재구성하는 리팩토링 과정을 통해서 유지보수가 용이한 설계를 어떻게 하는지 알 수 있는 경험을 할 수 있었다.
또한 동일한 기능을 중복 구현하거나 코드 충돌이 발생하는 문제를 겪으면서 효율적인 협업 및 분업을 위해서는 정말 세밀한 의논과 협의 과정이 필수라는것을 깨닫게 되었다.
스파게티 코드를 경험하고 관심사의 분리를 진행하면서 앞으로는 구조를 어떻게 짜야할지 경험을 할 수 있어서 정말 좋은 기회였다.
팀원들과 협업하는 과정에서 각자 코드를 작업하더라도 코드가 중복되거나 같은 곳에서 작동해 충돌이 일어나게 되는 문제들을 겪으면서 협업은 정말 많은 의논과 협의를 거쳐서 진행해야한다는것도 알게되었다.

1.  문제 상황
- SPA에서 네비게이션을 눌렀을때 페이지 전환을 해야하는 상황이였습니다. 페이지 전환을 하기위해 이때까지 작업을 한 페이지들을 index.html에 전부 몰아넣어야했고, 버튼을 누르면 class하나로 페이지를 제어했어야 했습니다. 

2. 원인 파악
- 데이터를 전부 가져오는것이 문제였습니다. email, id, heart 등 한 유저의 모든 정보를 가져와서 비교를 하였어서 느렸었습니다.

3. 해결 방법
- 

4. 배운 점



---

# 설치 및 실행

## 로컬에서 프로젝트 실행하는 방법

### Step1

`bun install` node_modules 폴더 생성 확인

### Step2

`git init` .git 폴더 존재 여부 확인(새 프로젝트 시)

### Step3

`bun run prepare` .husky/ 경로 생성 확인

### Step 4

`chmod +x` 훅 실행 시 권한 거부 오류 방지
