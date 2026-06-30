import express from 'express'
import compression from 'compression'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = Number(process.env.PORT) || 3000
const host = '0.0.0.0'
const distPath = path.join(__dirname, 'dist')
const indexPath = path.join(distPath, 'index.html')

app.disable('x-powered-by')
app.use(compression())

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(
  '/assets',
  express.static(path.join(distPath, 'assets'), {
    immutable: true,
    maxAge: '1y',
  }),
)

app.use(
  express.static(distPath, {
    index: false,
    setHeaders: (res, filePath) => {
      const base = path.basename(filePath)
      // O service worker do MSW NUNCA pode ser cacheado, senao mocks param
      // de funcionar em deploys subsequentes.
      if (base === 'mockServiceWorker.js') {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate')
      }
    },
  }),
)

app.get('*', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()
  res.set('Cache-Control', 'no-cache, must-revalidate')
  res.sendFile(indexPath, (err) => {
    if (err) next(err)
  })
})

app.listen(port, host, () => {
  console.log(`Servidor rodando em http://${host}:${port}`)
})
