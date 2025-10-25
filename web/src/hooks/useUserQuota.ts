import { useState, useEffect } from 'react'
import { apiGet } from '@/api/client'
import { User } from '@/types/auth'

interface QuotaData {
  quota_used_today: number
  quota_daily: number
  quota_remaining_today: number
  quota_used_month: number
  quota_monthly: number
  quota_remaining_month: number
  resetDate?: string
}

export function useUserQuota(user: User | undefined) {
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchQuota = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiGet(`/api/users/${user.id}/quota`)
        
        if (response.success && response.data) {
          setQuotaData(response.data)
        } else {
          setError('获取配额信息失败')
        }
      } catch (err: any) {
        console.error('获取配额失败:', err)
        setError(err.message || '网络错误')
      } finally {
        setLoading(false)
      }
    }

    fetchQuota()
  }, [user])

  const refreshQuota = async () => {
    if (!user) return
    
    try {
      setError(null)
      const response = await apiGet(`/api/users/${user.id}/quota`)
      
      if (response.success && response.data) {
        setQuotaData(response.data)
      }
    } catch (err: any) {
      console.error('刷新配额失败:', err)
      setError(err.message || '刷新失败')
    }
  }

  return {
    quotaData,
    loading,
    error,
    refreshQuota
  }
}
