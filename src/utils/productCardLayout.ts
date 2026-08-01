export type ProductCardLayout = 'grid' | 'list';

export const getProductCardLayout = (layout: ProductCardLayout) => (
  layout === 'list'
    ? {
      card: 'flex-row min-h-[190px] sm:min-h-[240px]',
      image: 'w-[42%] max-w-[280px] shrink-0 aspect-auto',
      content: 'p-4 sm:p-6',
      description: 'line-clamp-2',
    }
    : {
      card: 'flex-col h-full',
      image: 'w-full aspect-[4/5]',
      content: 'p-3 sm:p-5',
      description: 'hidden',
    }
);
