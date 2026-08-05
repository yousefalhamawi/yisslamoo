import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Navbar from './Navbar';

vi.mock('../../contexts/NotificationContext', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    removeNotification: vi.fn(),
  }),
}));

describe('mobile bottom navigation', () => {
  it('uses the Yisslamoo primary color and keeps the requested right-to-left order', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/']}>
        <Navbar
          cartCount={0}
          wishlistCount={0}
          onOpenCart={vi.fn()}
          onNavigate={vi.fn()}
          user={null}
          onOpenLogin={vi.fn()}
          onLogout={vi.fn()}
        />
      </MemoryRouter>,
    );
    const mobileNavigation = markup.slice(markup.lastIndexOf('dir="rtl"'));

    expect(mobileNavigation).toContain('text-[#4b3976]');
    expect(mobileNavigation).not.toContain('#FF3B30');
    expect(mobileNavigation).toContain('lucide-house');
    expect(mobileNavigation).toContain('lucide-grid-2x2');
    expect(mobileNavigation).toContain('lucide-shopping-bag');
    expect(mobileNavigation).toContain('lucide-circle-user-round');

    const homePosition = mobileNavigation.indexOf('>الرئيسية</span>');
    const categoriesPosition = mobileNavigation.indexOf('>الفئات</span>');
    const cartPosition = mobileNavigation.indexOf('>السلة</span>');
    const accountPosition = mobileNavigation.indexOf('>حسابي</span>');

    expect([homePosition, categoriesPosition, cartPosition, accountPosition].every(position => position >= 0)).toBe(true);
    expect(homePosition).toBeLessThan(categoriesPosition);
    expect(categoriesPosition).toBeLessThan(cartPosition);
    expect(cartPosition).toBeLessThan(accountPosition);
  });
});
