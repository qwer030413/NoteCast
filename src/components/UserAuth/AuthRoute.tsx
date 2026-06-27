import type { ReactElement } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/aws/AuthProvider"

export function AuthRoute({ children }: { children: ReactElement }) {
  const { user, userLoading } = useAuth()

  if (userLoading) return null
  if (!user) return <Navigate to="/" replace />

  return children
}
