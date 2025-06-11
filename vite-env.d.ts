/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_VONAGE_API_KEY: string
  readonly VITE_VONAGE_API_SECRET: string
  readonly VITE_VONAGE_APPLICATION_ID: string
  readonly VITE_VONAGE_DEFAULT_NUMBER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}