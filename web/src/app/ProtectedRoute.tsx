import { Navigate } from 'react-router-dom'
import useAuth from '@/store/useAuth'

export default function ProtectedRoute({ children }: { children: JSX.Element }){
  const { user, hydrated, loadFromStorage } = useAuth()
  if(!hydrated){
    try{ loadFromStorage() }catch{}
    // 等待一次 hydration 完成，避免误判为未登录
    return null
  }
  if(!user){
    return <Navigate to="/auth" replace />
  }
  return children
}

