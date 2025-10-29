import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from '@/app/ProtectedRoute'
import PageLoader from '@/components/ui/PageLoader'

// 懒加载页面组件
const HomePage = lazy(() => import('@/app/home/HomePage'))
const Login = lazy(() => import('@/app/auth/Login'))
const Register = lazy(() => import('@/app/auth/Register'))
const ForgotPassword = lazy(() => import('@/app/auth/ForgotPassword'))
const Account = lazy(() => import('@/app/account/Index'))
const SqlConsole = lazy(() => import('@/app/sql/SqlConsole'))


export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader message="加载首页中..." />}>
        <HomePage />
      </Suspense>
    )
  },
  {
    path: '/auth',
    element: (
      <Suspense fallback={<PageLoader message="加载登录页面..." />}>
        <Login />
      </Suspense>
    )
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<PageLoader message="加载注册页面..." />}>
        <Register />
      </Suspense>
    )
  },
  {
    path: '/forget',
    element: (
      <Suspense fallback={<PageLoader message="加载忘记密码页面..." />}>
        <ForgotPassword />
      </Suspense>
    )
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader message="加载登录页面..." />}>
        <Login />
      </Suspense>
    )
  },
  {
    path: '/account',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader message="加载账户中心..." />}>
          <Account />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/chat',
    element: <Navigate to="/account" replace />
  },

  {
    path: '/sql',
    element: (
      <Suspense fallback={<PageLoader message="加载SQL控制台..." />}>
        <SqlConsole />
      </Suspense>
    )
  },
  {
    path: '*',
    element: <Navigate to="/account" replace />
  },

])

