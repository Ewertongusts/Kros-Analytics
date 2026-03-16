import { defineConfig } from '@trigger.dev/sdk/v3'

export default defineConfig({
  project: 'kros-billing', // Mude para o ID do seu projeto no Trigger.dev
  logLevel: 'log',
  retryWithExponentialBackoff: {
    initialDelayInMs: 1000,
    maxDelayInMs: 60000,
    randomizationFactor: 0.2,
  },
  instrumentations: [],
})
