import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),  tailwindcss()],
  // الـ API يسمح بـ CORS فقط لـ http://localhost:3000 — تشغيل Vite على نفس المنفذ يزيل خطأ preflight
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      // يجعل الطلبات من المتصفح إلى نفس الأصل (localhost) ثم يمررها للسيرفر الحقيقي
      // هذا يساعد الكوكيز (Session/Refresh) أن تعمل أثناء التطوير.
      "/api": {
        target: "https://albarakametal.vercel.app",
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: "localhost",
      },
    },
  },
})
