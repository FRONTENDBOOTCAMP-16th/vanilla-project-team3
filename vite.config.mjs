import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        // 키(key): 값(파일 경로) 형태로 모든 페이지를 등록
        main: resolve(__dirname, 'index.html'), // 홈 페이지
        about: resolve(__dirname, 'about.html'), // 소개 페이지
        login: resolve(__dirname, 'login/index.html'), // 로그인 페이지 (폴더 구조)
      },
    },
  },
})
