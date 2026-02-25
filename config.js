import { fileURLToPath, URL } from 'node:url'
export const dirGCS = fileURLToPath(new URL('./assets/gcs', import.meta.url))
