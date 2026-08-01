export const shouldUseLightNavbarText = (pathname: string, isScrolled: boolean): boolean => (
  pathname === '/policies' && !isScrolled
);
