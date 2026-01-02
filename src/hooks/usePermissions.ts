/**
 * usePermissions Hook
 * 
 * Provides permission helpers at the component level
 */

import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import {
  ROLES,
  Role,
  hasMinimumRole,
  hasRole,
  hasAnyRole,
  isAdmin as isAdminUtil,
  isEmployee as isEmployeeUtil,
  isClient as isClientUtil,
  isStaff as isStaffUtil,
  getDashboardPath,
  canAccessRoleRoute,
} from '@/utils/auth'

/**
 * Hook for checking permissions in components
 * Uses the current user's profile from Convex
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { isAdmin, isLoading, getDashboardPath } = usePermissions()
 * 
 *   if (isLoading) return <Spinner />
 * 
 *   return (
 *     <div>
 *       {isAdmin && <AdminPanel />}
 *       <Link to={getDashboardPath()}>Go to Dashboard</Link>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @example Role-based rendering
 * ```tsx
 * const { hasRole, hasAnyRole, ROLES } = usePermissions()
 * 
 * // Check specific role
 * if (hasRole(ROLES.admin)) { ... }
 * 
 * // Check multiple roles
 * if (hasAnyRole([ROLES.admin, ROLES.employee])) { ... }
 * ```
 */
export function usePermissions() {
  const profile = useQuery(api.functions.profiles.queries.getMyProfile, {})
  
  const role = profile?.role as Role | undefined
  const isLoading = profile === undefined
  const hasProfile = profile !== null && profile !== undefined

  return {
    // Current state
    profile,
    role,
    isLoading,
    hasProfile,
    hasCompletedOnboarding: profile?.onboardingComplete ?? false,

    // Role checks
    isAdmin: isAdminUtil(role),
    isEmployee: isEmployeeUtil(role),
    isClient: isClientUtil(role),
    isStaff: isStaffUtil(role),

    // Permission helpers
    hasRole: (r: Role) => hasRole(role, r),
    hasAnyRole: (roles: Role[]) => hasAnyRole(role, roles),
    hasMinimumRole: (requiredRole: Role) => hasMinimumRole(role, requiredRole),
    canAccessRoleRoute: (routeRole: Role) => canAccessRoleRoute(role, routeRole),

    // Navigation helpers
    getDashboardPath: () => getDashboardPath(role),

    // Constants
    ROLES,
  }
}
