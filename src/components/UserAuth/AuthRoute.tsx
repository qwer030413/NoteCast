import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { getCurrentUser } from '@aws-amplify/auth'

interface AuthRouteProps {
  children: React.ReactElement
}

export function AuthRoute({ children }: AuthRouteProps) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    getCurrentUser()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null 

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
