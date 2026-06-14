import { defineNuxtConfig } from 'nuxt/config'
import federation from '@originjs/vite-plugin-federation'

export default defineNuxtConfig({
  app: {
    head: {
      title: 'CMSv2',
      meta: [
        { name: 'description', content: 'version 2.0' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://jil-cms.canadacentral.cloudapp.azure.com:8080',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '102141595773-j5945pt7t100bm59je2ko17ga4n5culu.apps.googleusercontent.com'
    }
  },
  css: ['~/assets/css/tailwind.css'],
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    viewer: false
  },
  vite: {
    plugins: [
      federation({
        name: 'reports',
        filename: 'remoteEntry.js',
        exposes: {
          './RemoteEntry': './components/RemoteEntry.vue'
        },
        shared: {}
      })
    ]
  }
})
