import { getData, getUser } from '../../../api/api'

// getData('mood')
// getUser('id')

getData('mood', 'happy').then((res) => console.log(res))

// TODO
// 로그인 버튼을 눌렀을때 GET으로 조회해서 아이디와 비밀번호 맞는지 비교
// 비교? 어떻게? if를 쓰자
// 각각의 input에게 유효성 걸어야함
// 로그인 눌렀을때 get이랑 값 비교하여
// 1.아이디가 동일하지 않음 알람 선행
// > 아이디가 동일한데 비밀번호가 틀린경우
// 2. 비밀번호가 동일하지 않음 알람 후행
// 확인 디스에이블 > 에이블

// 페이지 뒤로가기 / 앞으로가기 했을때 데이터 싹 다 날아가야함

// 1.
// 로그인 버튼 눌릴때 a 버튼 막기
// disabled일때 기능 막기
// disabled 태그 추가

// 2.
// 로그인 눌렀을때 GET으로 데이터 조회
// 데이터 조회한것으로 input 아이디/ input password 비교

// 3.
//

getUser('email', 'anc1111@naver.com').then((res) => console.log(res))
