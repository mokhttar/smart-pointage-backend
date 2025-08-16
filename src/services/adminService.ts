import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/auth'
import { isValidEmail } from '../lib/utils'

export class AdminService {
  static async createUser(adminId: number, userData: {
    name: string
    email: string
    password: string
  }) {
    if (!isValidEmail(userData.email)) {
      throw new Error('Invalid email format')
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const hashedPassword = await hashPassword(userData.password)

    return prisma.user.create({
      data: {
        adminId,
        name: userData.name,
        email: userData.email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        adminId: true
      }
    })
  }

  static async getUsers(adminId: number) {
    return prisma.user.findMany({
      where: { adminId },
      select: {
        id: true,
        name: true,
        email: true,
        attendances: {
          select: {
            checkIn: true,
            checkOut: true,
            hoursWorked: true
          },
          orderBy: { checkIn: 'desc' },
          take: 5
        },
        monthlyReports: {
          select: {
            month: true,
            totalHours: true
          },
          orderBy: { month: 'desc' },
          take: 3
        }
      }
    })
  }

  static async getUserStats(adminId: number, userId: number) {
    const user = await prisma.user.findFirst({
      where: { id: userId, adminId },
      include: {
        attendances: {
          orderBy: { checkIn: 'desc' }
        },
        monthlyReports: {
          orderBy: { month: 'desc' }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  static async getAllStats(adminId: number) {
    const users = await this.getUsers(adminId)
    
    const totalUsers = users.length
    const activeToday = await prisma.attendance.count({
      where: {
        user: { adminId },
        checkIn: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthlyHours = await prisma.monthlyReport.aggregate({
      where: {
        user: { adminId },
        month: currentMonth
      },
      _sum: {
        totalHours: true
      }
    })

    return {
      totalUsers,
      activeToday,
      totalMonthlyHours: monthlyHours._sum.totalHours || 0,
      users
    }
  }
}
