import React from "react"
import { Navigate } from "react-router-dom"
import UserPool from "@/aws/UserPool"

interface AuthRouteProps {
  children: React.ReactElement
}

export function AuthRoute({ children }: AuthRouteProps) {
  const currentUser = UserPool.getCurrentUser()

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />
  }

  // Logged in, render the requested component
  return children
}
