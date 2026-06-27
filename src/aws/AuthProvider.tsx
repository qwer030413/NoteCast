import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { fetchUserAttributes, getCurrentUser } from "@aws-amplify/auth"
import { Hub } from "aws-amplify/utils"
import { toast } from "sonner"

type UserAttributes = Record<string, string | undefined>

type AuthContextType = {
  user: string | null
  userLoading: boolean
  attributes: UserAttributes
  setAttributes: (attributes: UserAttributes) => void
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [attributes, setAttributes] = useState<UserAttributes>({})
  const hasWelcomed = useRef(false)
  const refreshInFlight = useRef<Promise<void> | null>(null)

  const refreshAuth = useCallback(() => {
    if (refreshInFlight.current) return refreshInFlight.current

    const refresh = (async () => {
      setUserLoading(true)
      try {
        const currentUser = await getCurrentUser()
        const userAttributes = await fetchUserAttributes()
        setUser(currentUser.username)
        setAttributes(userAttributes)

        if (!hasWelcomed.current) {
          toast(`Welcome back, ${currentUser.username}!`, {
            description: "Your library is ready.",
          })
          hasWelcomed.current = true
        }
      } catch {
        setUser(null)
        setAttributes({})
      } finally {
        setUserLoading(false)
      }
    })()

    refreshInFlight.current = refresh
    refresh.finally(() => {
      if (refreshInFlight.current === refresh) refreshInFlight.current = null
    })
    return refresh
  }, [])

  useEffect(() => {
    refreshAuth()

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") {
        refreshAuth()
      }
      if (payload.event === "signedOut") {
        hasWelcomed.current = false
        setUser(null)
        setAttributes({})
        setUserLoading(false)
      }
    })

    return unsubscribe
  }, [refreshAuth])

  return (
    <AuthContext.Provider value={{ user, userLoading, attributes, setAttributes, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
