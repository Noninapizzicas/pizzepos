import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './'),
      '@config': path.resolve(__dirname, './config'),
      '@estado': path.resolve(__dirname, './estado'),
      '@eventos': path.resolve(__dirname, './eventos'),
      '@validacion': path.resolve(__dirname, './validacion'),
      '@utils': path.resolve(__dirname, './utils')
    }
  },
  server: {
    port: 3333,
    open: false
  }
})
