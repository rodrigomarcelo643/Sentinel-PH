/** Dashboard path for an authenticated role (web app). */
export function getDashboardPathForRole(role?: string | null): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "regional_admin":
      return "/regional/dashboard";
    case "municipal_admin":
      return "/municipal/dashboard";
    case "bhw":
      return "/bhw/dashboard";
    case "doh_region_vii":
      return "/doh-r7/dashboard";
    default:
      return "/dashboard";
  }
}
