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
│   │   ├── _a11y.css
│   │   ├── _base.css
│   │   ├── _fonts.css
│   │   ├── _normalize.css
│   │   └── _theme.css
│   ├── components/
│   │   ├── _button.css
│   │   ├── _emoji.css
│   │   ├── _index.css
│   │   ├── _layout.css
│   │   ├── _login-signup.css
│   │   ├── _morebookinfo.css
│   │   ├── _navi.css
│   │   ├── _popup.css
│   │   ├── _result-display.css
│   │   ├── _text-copy.css
│   │   └── _title.css
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

## 개발 중 겪은 문제와 해결 과정

### 찜하기 중복 추가 버그
1. 문제 상황: 같은 책을 여러 번 heart 배열에 중복 push
2. 원인 파악: includes 체크 없이 바로 push
3. 해결 방법: includes로 중복 체크 후 추가
4. 배운 점: 배열에 데이터 추가 시 항상 중복 검증 필요

### 찜한 책이 추천 목록에 재등장하는 버그
1. 문제 상황: 이미 찜한 책이 추천 결과에 계속 노출
2. 원인 파악: viewed(열람 기록)만 제외하고 heartIds는 제외 안 함
3. 해결 방법: excludeIds = [...new Set([...viewed, ...heartIds])]로 합산 후 제외
4. 배운 점: 사용자 경험 관점에서 "이미 접한 콘텐츠" 범위를 넓게 고려해야 함

### 하트 클릭 시 타이밍 이슈 (setTimeout 제거)
1. 문제 상황: 하트 이벤트가 DOM 렌더링 전에 바인딩되어 작동 안 함
2. 원인 파악: 비동기 처리 순서 미보장 상태에서 setTimeout(1500)으로 임시 해결
3. 해결 방법: initPage에서 await로 순서를 명확히 보장 후 setTimeout 제거
4. 배운 점: setTimeout으로 타이밍 맞추는 건 임시방편, 비동기 흐름 제어가 근본 해결책

### 찜 해제 시 마이페이지 팝업 실시간 미반영
1. 문제 상황: 찜 해제해도 열려있는 마이페이지 팝업에 즉시 반영 안 됨
2. 원인 파악: 서버 반영 후 UI 업데이트 로직 누락
3. 해결 방법: await updateHeartToServer 후 팝업 open 상태 확인 → updateUserDiSplay() 호출
4. 배운 점: 서버 통신 후 연관된 UI 컴포넌트 동기화까지 고려해야 함

### 로그아웃 상태 찜하기 처리 미흡
1. 문제 상황: 로그아웃 상태에서 찜 클릭 시 아무 반응 없음 (return만 됨)
2. 원인 파악: 로그인 페이지 리다이렉트 로직이 없음
3. 해결 방법: (현재 미해결 또는 다른 파일에서 처리) → 이 자체가 트러블슈팅 소재 가능
4. 배운 점: 비로그인 사용자 접근에 대한 UX 처리를 명확히 설계해야 함

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
