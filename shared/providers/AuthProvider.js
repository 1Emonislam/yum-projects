import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import * as AuthService from '../services/AuthService'

const AuthContext = createContext()

const { Provider } = AuthContext

export const AuthProvider = props => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    AuthService.isAuthenticated().then(setIsAuthenticated)
  }, [])

  const logIn = useCallback(async (phoneNumber, code) => {
    try {
      await AuthService.logIn(phoneNumber, code)
      setIsAuthenticated(true)
    } catch (error) {
      setIsAuthenticated(false)

      throw error
    }
  }, [])

  const logOut = useCallback(async () => {
    await AuthService.logOut()
    setIsAuthenticated(false)
    setUserData({})
  }, [])

  useEffect(() => {
    AuthService.getUserData().then(setUserData)
  }, [isAuthenticated])

  const value = useMemo(() => {
    return {
      isAuthenticated,
      isAuthPending: isAuthenticated === null,
      initLogIn: AuthService.initLogIn,
      logIn,
      requestPasswordReset: AuthService.requestPasswordReset,
      resetPassword: AuthService.resetPassword,
      logOut,
      ...userData,
      branchId: userData?.branchId ? userData.branchId : null,
      isAdmin: userData?.role === 'admin',
      isBranchManager: userData?.role === 'branchManager',
      isLoanOfficer: userData?.role === 'loanOfficer',
      isAreaOrRegionalManager:
        userData?.role === 'areaManager' ||
        userData?.role === 'regionalManager',
    }
  }, [isAuthenticated, userData, logIn, logOut])

  return <Provider {...props} value={value} />
}

export const useAuth = () => useContext(AuthContext)
