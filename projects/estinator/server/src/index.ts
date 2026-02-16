import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import documentsRouter from './routes/documents.js'
import queryRouter from './routes/query.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'estinator-brain',
    version: '0.1.0',
    features: ['text-extraction', 'vision-analysis', 'schedule-parsing', 'rag-query']
  })
})

// Routes
app.use('/documents', documentsRouter)
app.use('/query', queryRouter)

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🧠 ESTINATOR - Project Brain Server                 ║
║                                                       ║
║   Running on http://localhost:${PORT}                    ║
║                                                       ║
║   Features:                                           ║
║   ├── Text Document Analysis (specs, addenda)         ║
║   ├── Vision Drawing Analysis (plans, schedules)      ║
║   ├── Schedule Extraction (finish, door, MEP)         ║
║   ├── Room Scope Aggregation                          ║
║   └── Unified RAG Query Engine                        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `)
})

export default app
