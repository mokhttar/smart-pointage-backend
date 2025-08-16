export const calculateHours = (checkIn: Date, checkOut: Date): number => {
  const diffInMs = checkOut.getTime() - checkIn.getTime()
  return Math.round((diffInMs / (1000 * 60 * 60)) * 100) / 100 // Round to 2 decimal places
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
