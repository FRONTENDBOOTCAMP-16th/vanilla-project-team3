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

- Tools
 - Git / GitHub
 - VS Code

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
├── public/ # 정적 파일 (빌드 시 루트로 복사됨, favicon 등)
├───── src/ # 소스 코드 (실제 개발 작업 공간)
| | ├──css/ # 스타일 시트
│ | | ├── common
│ | │ | ├── _a11y.css
│ | │ | ├── _base.css
│ | │ | ├── _fonts.css
│ | │ | ├── _normalize.css
│ | │ | └── _theme.css
│ | | └── components/ # (선택) 재사용 가능한 UI 조각 (헤더, 카드 등)
│ | │   └── _example.css
| | └── style.css
| ├──font/ # 폰트
| | ├──JejuHallasan.woff2
| | └──PretendardVariable.woff2
| └──main.js
├── index.html # 메인 HTML (Vite는 index.html이 루트에 위치)
├── package.json # 의존성 관리
├── .gitignore # Git 제외 파일 목록
├── eslint.config.mjs # eslint 설정 파일
└── vite.config.mjs # Vite 설정 파일
```

---

# 트러블 슈팅

개발 중 겪은 문제와 해결 과정

1. 문제 상황
2. 원인 파악
3. 해결 방법
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
