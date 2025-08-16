import { Router } from 'express'
import { AuthService } from '../services/authService'

const router = Router()

router.post('/login/admin', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const result = await AuthService.loginAdmin(email, password)
    res.json(result)
  } catch (error) {
    res.status(401).json({ error: (error as Error).message })
  }
})

router.post('/login/user', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const result = await AuthService.loginUser(email, password)
    res.json(result)
  } catch (error) {
    res.status(401).json({ error: (error as Error).message })
  }
})

router.post('/register/admin', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    const result = await AuthService.createAdmin({ name, email, password })
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

export default router
