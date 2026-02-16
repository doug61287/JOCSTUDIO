import { Router, Request, Response } from 'express'
import { queryBrain } from '../services/projectBrain.js'

const router = Router()

/**
 * POST /query
 * 
 * Ask a question about the project documents
 * 
 * Body:
 * - projectId: Project identifier
 * - question: Natural language question
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId, question } = req.body

    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' })
      return
    }

    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'question is required' })
      return
    }

    console.log(`Query: "${question}" for project ${projectId}`)

    const answer = await queryBrain(projectId, question)

    res.json({
      success: true,
      ...answer
    })
    
  } catch (error) {
    console.error('Query error:', error)
    res.status(500).json({
      error: 'Failed to process query',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /query/rooms
 * 
 * Get list of all rooms in the project
 */
router.get('/rooms', async (req: Request, res: Response) => {
  const { projectId } = req.query

  if (!projectId) {
    res.status(400).json({ error: 'projectId is required' })
    return
  }

  // TODO: Return rooms from brain's room index
  res.json({ rooms: [] })
})

/**
 * GET /query/room/:roomNumber
 * 
 * Get detailed scope for a specific room
 */
router.get('/room/:roomNumber', async (req: Request, res: Response) => {
  const { roomNumber } = req.params
  const { projectId } = req.query

  if (!projectId) {
    res.status(400).json({ error: 'projectId is required' })
    return
  }

  // Query brain for room-specific info
  const answer = await queryBrain(
    projectId as string, 
    `What is the complete scope for Room ${roomNumber}? Include finishes, doors, equipment, and any other relevant information.`
  )

  res.json({
    roomNumber,
    ...answer
  })
})

/**
 * GET /query/schedules
 * 
 * List all schedules found in the project
 */
router.get('/schedules', async (req: Request, res: Response) => {
  const { projectId } = req.query

  if (!projectId) {
    res.status(400).json({ error: 'projectId is required' })
    return
  }

  // TODO: Return schedules from brain
  res.json({ schedules: [] })
})

/**
 * POST /query/compare
 * 
 * Compare two documents (e.g., original spec vs addendum)
 */
router.post('/compare', async (req: Request, res: Response) => {
  const { projectId, doc1, doc2 } = req.body

  if (!projectId || !doc1 || !doc2) {
    res.status(400).json({ error: 'projectId, doc1, and doc2 are required' })
    return
  }

  // Query brain for comparison
  const answer = await queryBrain(
    projectId,
    `Compare ${doc1} and ${doc2}. What are the key differences? What changed between them?`
  )

  res.json({
    comparison: answer
  })
})

export default router
