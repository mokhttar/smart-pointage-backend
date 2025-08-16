import { prisma } from '../lib/prisma'
import { calculateHours, getMonthKey } from '../lib/utils'

export class UserService {
  static async checkIn(userId: number) {
    // Check if user already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const existingCheckIn = await prisma.attendance.findFirst({
      where: {
        userId,
        checkIn: {
          gte: today
        },
        checkOut: null
      }
    })

    if (existingCheckIn) {
      throw new Error('Already checked in today')
    }

    return prisma.attendance.create({
      data: {
        userId,
        checkIn: new Date()
      }
    })
  }

  static async checkOut(userId: number) {
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null
      },
      orderBy: {
        checkIn: 'desc'
      }
    })

    if (!attendance) {
      throw new Error('No active check-in found')
    }

    const checkOut = new Date()
    const hoursWorked = calculateHours(attendance.checkIn, checkOut)

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut,
        hoursWorked
      }
    })

    // Update monthly report
    await this.updateMonthlyReport(userId, attendance.checkIn, hoursWorked)

    return updatedAttendance
  }

  static async reportSick(userId: number, data: {
    note?: string
    document?: string
  }) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already reported sick today
    const existingSick = await prisma.attendance.findFirst({
      where: {
        userId,
        checkIn: {
          gte: today
        },
        sickNote: {
          not: null
        }
      }
    })

    if (existingSick) {
      throw new Error('Already reported sick today')
    }

    return prisma.attendance.create({
      data: {
        userId,
        checkIn: new Date(),
        sickNote: data.note,
        sickDocument: data.document,
        hoursWorked: 0
      }
    })
  }

  static async getMyAttendance(userId: number, limit: number = 30) {
    return prisma.attendance.findMany({
      where: { userId },
      orderBy: { checkIn: 'desc' },
      take: limit
    })
  }

  static async startBreak(userId: number, reason?: string) {
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null
      },
      orderBy: {
        checkIn: 'desc'
      }
    })

    if (!attendance) {
      throw new Error('No active check-in found')
    }

    // Check if there's already an active break
    const activeBreak = await prisma.break.findFirst({
      where: {
        attendanceId: attendance.id,
        endTime: null
      }
    })

    if (activeBreak) {
      throw new Error('Break already in progress')
    }

    return prisma.break.create({
      data: {
        attendanceId: attendance.id,
        startTime: new Date(),
        reason
      }
    })
  }

  static async endBreak(userId: number) {
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null
      },
      orderBy: {
        checkIn: 'desc'
      }
    })

    if (!attendance) {
      throw new Error('No active check-in found')
    }

    const activeBreak = await prisma.break.findFirst({
      where: {
        attendanceId: attendance.id,
        endTime: null
      }
    })

    if (!activeBreak) {
      throw new Error('No active break found')
    }

    const endTime = new Date()
    const duration = calculateHours(activeBreak.startTime, endTime)

    return prisma.break.update({
      where: { id: activeBreak.id },
      data: {
        endTime,
        duration
      }
    })
  }

  static async getMyStats(userId: number) {
    const currentMonth = getMonthKey(new Date())
    
    const monthlyReport = await prisma.monthlyReport.findFirst({
      where: {
        userId,
        month: currentMonth
      }
    })

    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        checkIn: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      include: {
        breaks: true
      }
    })

    const totalDaysWorked = await prisma.attendance.count({
      where: {
        userId,
        hoursWorked: {
          gt: 0
        }
      }
    })

    // Calculate total break time for today
    const totalBreakTime = todayAttendance?.breaks?.reduce((total, breakItem) => {
      return total + (breakItem.duration || 0)
    }, 0) || 0

    // Check if currently on break
    const activeBreak = todayAttendance?.breaks?.find(b => !b.endTime)

    return {
      monthlyHours: monthlyReport?.totalHours || 0,
      todayStatus: todayAttendance ? {
        checkedIn: true,
        checkInTime: todayAttendance.checkIn,
        checkOutTime: todayAttendance.checkOut,
        hoursWorked: todayAttendance.hoursWorked,
        isSick: !!todayAttendance.sickNote,
        onBreak: !!activeBreak,
        breakStartTime: activeBreak?.startTime,
        totalBreakTime
      } : {
        checkedIn: false
      },
      totalDaysWorked
    }
  }

  private static async updateMonthlyReport(userId: number, date: Date, hoursToAdd: number) {
    const monthKey = getMonthKey(date)

    const existingReport = await prisma.monthlyReport.findFirst({
      where: {
        userId,
        month: monthKey
      }
    })

    if (existingReport) {
      await prisma.monthlyReport.update({
        where: { id: existingReport.id },
        data: {
          totalHours: existingReport.totalHours + hoursToAdd
        }
      })
    } else {
      await prisma.monthlyReport.create({
        data: {
          userId,
          month: monthKey,
          totalHours: hoursToAdd
        }
      })
    }
  }
}
