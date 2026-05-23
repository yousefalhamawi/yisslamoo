# Graph Report - WEBSITE  (2026-05-23)

## Corpus Check
- 104 files · ~66,899 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 346 nodes · 833 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d7025534`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `useSharedStore` - 32 edges
2. `supabase` - 19 edges
3. `Product` - 19 edges
4. `checkSupabaseConfig()` - 18 edges
5. `dependencies` - 16 edges
6. `compilerOptions` - 16 edges
7. `cn()` - 14 edges
8. `useProducts()` - 10 edges
9. `useAuth()` - 9 edges
10. `useNotifications()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  src/utils/cn.ts → package.json
- `CustomerOrders()` --calls--> `useSharedStore`  [EXTRACTED]
  src/components/public/CustomerOrders.tsx → src/store/useSharedStore.ts
- `SliderPage()` --calls--> `useSharedStore`  [EXTRACTED]
  src/pages/admin/Slider.tsx → src/store/useSharedStore.ts
- `App()` --calls--> `useSharedStore`  [EXTRACTED]
  src/App.tsx → src/store/useSharedStore.ts
- `App()` --calls--> `useAuth()`  [EXTRACTED]
  src/App.tsx → src/contexts/AuthContext.tsx

## Communities (19 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (26): cn(), InventoryPage(), ProductsPage(), usePricedProduct(), useProductDisplayPrice(), useProducts(), CartDrawer(), CartDrawerProps (+18 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (24): useNotifications(), FEATURES, PRODUCTS, TESTIMONIALS, BestsellersProps, CustomerOrders(), CustomerOrdersProps, LoginModal() (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (32): dependencies, clsx, date-fns, framer-motion, idb-keyval, lucide-react, react, react-dom (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.38
Nodes (6): Dashboard(), useDashboard(), ChartData, dashboardService, DashboardStats, TopProduct

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (18): AdminDashboard(), AdminLoginProps, PaymentsPage(), ProfilePage(), AuthContext, AuthContextType, useAuth(), usePayments() (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (16): CategoriesPage(), ImageUpload(), ImageUploadProps, PlusProps, SettingsPage(), SliderPage(), useCategories(), useSettings() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (19): CustomersPage(), OrdersPage(), useCustomers(), useOrders(), MOCK_COUPONS, MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_REVIEWS (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (7): CustomerSettingsProps, LoginModalProps, addressService, Address, validateEmail(), validatePassword(), validatePhone()

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (13): CollectionsPage(), CouponsPage(), useCollections(), useCoupons(), CategoriesSection(), CollectionsPage(), CollectionsPageProps, collectionService (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.38
Nodes (7): ExchangeRateWidget(), ExchangeRateWidgetProps, useExchangeRate(), ExchangeRateLog, exchangeRateService, supabase, isValidExchangeRate()

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (3): description, name, requestFramePermissions

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (17): AdminLayout(), AdminLayoutProps, AnalyticsPage(), CATEGORY_DATA, COLORS, ReviewsPage(), AdminNotification, useAdminNotifications() (+9 more)

### Community 19 - "Community 19"
Cohesion: 0.1
Nodes (14): ErrorBoundary, Props, State, AuthProvider(), getColorClass(), getIcon(), Notification, NotificationContext (+6 more)

## Knowledge Gaps
- **96 isolated node(s):** `name`, `description`, `requestFramePermissions`, `name`, `private` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 18` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 9`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Why does `clsx` connect `Community 2` to `Community 18`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **What connects `name`, `description`, `requestFramePermissions` to the rest of the system?**
  _96 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._