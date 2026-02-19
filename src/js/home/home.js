import {
  getSelectedValues,
  filterData,
  getRandomData,
} from '../../js/components/_phraseLoader.js'
import { getData } from '../../../api/api.js'

const testCheckButton = document.querySelector('.user-test-check')

if (testCheckButton) {
  testCheckButton.addEventListener('click', async (e) => {
    e.preventDefault()

    try {
      const allData = await getData()
      const moods = getSelectedValues('checkbox-mood')
      const weathers = getSelectedValues('checkbox-weather')

      const filteredData = filterData(allData, moods, weathers)
      const selectedData = getRandomData(filteredData, 4)

      console.log('저장할 데이터 : ', selectedData)
      localStorage.setItem('selectedBookList', JSON.stringify(selectedData))

      location.href = '/src/pages/result/result.html'
    } catch (error) {
      console.error('데이터 저장 중 오류 발생 : ', error)
    }
  })
}
