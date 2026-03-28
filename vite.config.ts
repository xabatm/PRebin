import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // ئەمە ڕێگری دەکات لەوەی سێرڤەرەکە بوەستێت ئەگەر نەیتوانی فایلێکی دەرەکی بخوێنێتەوە
      strict: false 
    }
  },
  resolve: {
    alias: {
      // ئەمە یارمەتی تایپسکریپت دەدات بۆ دۆزینەوەی فایلەکان بە ئاسانی
      "@": "/src",
    },
  },
})