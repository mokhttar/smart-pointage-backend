import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { verifyToken, AuthRequest } from '../lib/auth'
import { UserService } from '../services/userService'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only images and documents are allowed'))
    }
  }
})

// Apply authentication middleware to all user routes
router.use(verifyToken)

// Check in
router.post('/checkin', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const attendance = await UserService.checkIn(userId)
    res.json(attendance)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

// Check out
router.post('/checkout', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const attendance = await UserService.checkOut(userId)
    res.json(attendance)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

// Report sick
router.post('/sick', upload.single('document'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { note } = req.body
    const document = req.file ? req.file.filename : undefined

    const attendance = await UserService.reportSick(userId, { note, document })
    res.json(attendance)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

// Get my attendance history
router.get('/attendance', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const limit = parseInt(req.query.limit as string) || 30
    const attendance = await UserService.getMyAttendance(userId, limit)
    res.json(attendance)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// Start break
router.post('/break/start', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { reason } = req.body
    const breakRecord = await UserService.startBreak(userId, reason)
    res.json(breakRecord)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

// End break
router.post('/break/end', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const breakRecord = await UserService.endBreak(userId)
    res.json(breakRecord)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

// Get my stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const stats = await UserService.getMyStats(userId)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
