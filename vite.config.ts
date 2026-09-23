import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({plugins:[react()],server:{proxy:{'/public':{target:'http://127.0.0.1:8097'},'/v1':{target:'http://127.0.0.1:8097'}}}})
