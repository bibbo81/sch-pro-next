export const queryKeys = {
  shipments: {
    all: ['shipments'] as const,
    list: (orgIds: string[]) => ['shipments', 'list', ...orgIds] as const,
    detail: (id: string) => ['shipments', 'detail', id] as const,
  },
  trackings: {
    all: ['trackings'] as const,
    list: (userId: string) => ['trackings', 'list', userId] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    data: (userId: string) => ['dashboard', 'data', userId] as const,
  },
  products: {
    all: ['products'] as const,
    list: (orgIds: string[]) => ['products', 'list', ...orgIds] as const,
  },
}
