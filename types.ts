interface CartInfoItem {
  id: number;
  price: number;
  product_name: string;
  currency: { label: string; icon: string };
}

interface CartInfo {
  count: number;
  totalPrice: number;
  item: CartInfoItem;
}

export type Cart = Record<string, CartInfo>;
