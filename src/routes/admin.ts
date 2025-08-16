import { Router } from 'express'
import { verifyToken, requireAdmin, AuthRequest } from '../lib/auth'
import { AdminService } from '../services/adminService'

const router = Router()

// Apply authentication middleware to all admin routes
router.use(verifyToken)
router.use(requireAdmin)

// Create a new user
router.post('/users', async (req: AuthRequest, res) => {
  try {
    const { name, email, password } = req.body
    const adminId = req.user!.id

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    const user = await AdminService.createUser(adminId, { name, email, password })
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

// Get all users for this admin
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const adminId = req.user!.id
    const users = await AdminService.getUsers(adminId)
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// Get specific user stats
router.get('/users/:userId/stats', async (req: AuthRequest, res) => {
  try {
    const adminId = req.user!.id
    const userId = parseInt(req.params.userId)

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    const userStats = await AdminService.getUserStats(adminId, userId)
    res.json(userStats)
  } catch (error) {
    res.status(404).json({ error: (error as Error).message })
  }
})

// Get dashboard stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const adminId = req.user!.id
    const stats = await AdminService.getAllStats(adminId)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
