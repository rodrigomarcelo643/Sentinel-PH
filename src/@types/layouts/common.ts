// Types from src/layouts/admin/AdminLayout.tsx, src/layouts/bhw/BhwLayout.tsx, src/layouts/municipal/MunicipalLayout.tsx

export interface NavLinkProps {
  to: string;
  icon: any;
  label: string;
  onClick?: () => void;
  isDesktop?: boolean;
}

export interface SidebarContentProps {
  isDesktop?: boolean;
}