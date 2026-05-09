import { defineNuxtConfig } from 'nuxt/config'

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
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://jil-cms.canadacentral.cloudapp.azure.com:8080:',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '181319976297-83r4e1dttlu30ripasluhukablvqs933.apps.googleusercontent.com'
    }
  },
  css: ['~/assets/css/tailwind.css'],
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    viewer: false
  }
})
