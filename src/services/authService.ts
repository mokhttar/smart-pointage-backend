import { prisma } from '../lib/prisma'
import { hashPassword, comparePassword, generateToken } from '../lib/auth'
import { isValidEmail } from '../lib/utils'

export class AuthService {
  static async loginAdmin(email: string, password: string) {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format')
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await comparePassword(password, admin.password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    const token = generateToken(admin.id, 'admin')

    return {
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin' as const
      }
    }
  }

  static async loginUser(email: string, password: string) {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format')
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { admin: true }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    const token = generateToken(user.id, 'user')

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'user' as const,
        adminName: user.admin.name
      }
    }
  }

  static async createAdmin(adminData: {
    name: string
    email: string
    password: string
  }) {
    if (!isValidEmail(adminData.email)) {
      throw new Error('Invalid email format')
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminData.email }
    })

    if (existingAdmin) {
      throw new Error('Admin with this email already exists')
    }

    const hashedPassword = await hashPassword(adminData.password)

    const admin = await prisma.admin.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    const token = generateToken(admin.id, 'admin')

    return {
      token,
      user: {
        ...admin,
        role: 'admin' as const
      }
    }
  }
}
