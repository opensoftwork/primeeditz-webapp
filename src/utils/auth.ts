/**
 * Auth Utilities
 * 
 * Role-based access control utilities.
 */

// Role definitions
export const ROLES = {
  admin: 'admin',
  employee: 'employee',
  client: 'client',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// Role hierarchy (higher index = higher privilege)
const ROLE_HIERARCHY: Role[] = ['client', 'employee', 'admin']

/**
 * Check if user has a specific role
 */
export function hasRole(userRole: Role | undefined, requiredRole: Role): boolean {
  if (!userRole) return false
  return userRole === requiredRole
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRole: Role | undefined, roles: Role[]): boolean {
  if (!userRole) return false
  return roles.includes(userRole)
}

/**
 * Check if user has at least the minimum required role
 */
export function hasMinimumRole(userRole: Role | undefined, minimumRole: Role): boolean {
  if (!userRole) return false
  const userIndex = ROLE_HIERARCHY.indexOf(userRole)
  const requiredIndex = ROLE_HIERARCHY.indexOf(minimumRole)
  return userIndex >= requiredIndex
}

/**
 * Check if user is an admin
 */
export function isAdmin(role: Role | undefined): boolean {
  return role === ROLES.admin
}

/**
 * Check if user is an employee
 */
export function isEmployee(role: Role | undefined): boolean {
  return role === ROLES.employee
}

/**
 * Check if user is a client
 */
export function isClient(role: Role | undefined): boolean {
  return role === ROLES.client
}

/**
 * Check if user is staff (admin or employee)
 */
export function isStaff(role: Role | undefined): boolean {
  return role === ROLES.admin || role === ROLES.employee
}

/**
 * Get dashboard path based on role
 */
export function getDashboardPath(role: Role | undefined): string {
  switch (role) {
    case ROLES.admin:
      return '/dashboard'
    case ROLES.employee:
      return '/dashboard'
    case ROLES.client:
      return '/dashboard'
    default:
      return '/'
  }
}

/**
 * Check if user can access a role-specific route
 */
export function canAccessRoleRoute(userRole: Role | undefined, routeRole: Role): boolean {
  if (!userRole) return false
  
  // Admin can access any route
  if (userRole === ROLES.admin) return true
  
  // Staff routes - employees and admins can access
  if (routeRole === ROLES.employee) {
    return hasAnyRole(userRole, [ROLES.employee, ROLES.admin])
  }
  
  // Role must match exactly for other routes
  return userRole === routeRole
}
