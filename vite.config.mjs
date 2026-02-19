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
        result: resolve(__dirname, 'src/pages/result/result.html'), // 결과페이지
        login: resolve(__dirname, 'src/pages/login/login.html'), // 로그인 페이지
        signup: resolve(__dirname, 'src/pages/signup/signup.html'), // 회원가입 페이지
      },
    },
  },
})
