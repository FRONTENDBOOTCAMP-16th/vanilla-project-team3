function validateKey(key) {
  if (typeof key !== 'string') {
    throw new Error('로컬 스토리지 key 설정은 필수')
  }
}

// 로컬 스토리지 불러오기
export function loadStorage(key) {
  validateKey(key)

  const storageData = localStorage.getItem(key)
  if (!storageData) return null

  try {
    return JSON.parse(storageData)
  } catch (error) {
    console.error('로컬 스토리지 데이터 파싱 중 오류 발생:', error)
    return null
  }
}

// 로컬 스토리지에 저장
export function saveStorage(key, value) {
  validateKey(key)

  if (value === undefined) {
    throw new Error('로컬 스토리지 key에 저장할 값 입력 필요')
  }

  try {
    const jsonValue = JSON.stringify(value)
    localStorage.setItem(key, jsonValue)
  } catch (error) {
    console.error('로컬 스토리지 데이터 저장 중 오류 발생:', error)
  }
}

// 로컬 스토리지 삭제
export function removeStorage(key) {
  validateKey(key)
  localStorage.removeItem(key)
}

// 로컬 스토리지 전체 삭제
export function removeAllStorage() {
  localStorage.clear()
}
