import React, { useEffect } from 'react'
import 'react-contexify/dist/ReactContexify.css'
import { Outlet } from 'react-router-dom'
import { BeatLoader } from 'react-spinners'
import 'src/assets/App.css'
import { AuthModal, useAuth } from 'src/features/auth'
import { usePostStreak } from 'src/features/hits'
// Removed MarketingBanner import
import { identifyUserStreak } from 'src/lib/analytics'
import { AuthProvider } from 'src/providers/AuthProvider'
import { Header } from './Header'

export const AppLayout = () => {
  const { isAuthModalOpen, setStreak, isConnected } = useAuth()
  const postStreakMutation = usePostStreak()

  useEffect(() => {
    if (isConnected) {
      postStreakMutation.mutateAsync(undefined).then((data) => {
        setStreak(data.streak)
        identifyUserStreak(data.streak)
      })
    }
  }, [isConnected])

  return (
    <AuthProvider>
      {/* Removed MarketingBanner component */}

      <div className="App">
        <Header />
        <AuthModal showAuth={isAuthModalOpen} />
        <React.Suspense
          fallback={
            <div className="appLoading">
              <BeatLoader color={'#A9B2BD'} loading={true} size={15} />
            </div>
          }>
          <Outlet />
        </React.Suspense>
      </div>
    </AuthProvider>
  )
}