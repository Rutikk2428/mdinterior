export type Role = 'admin' | 'employee';

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
}

export interface CartItem extends Item {
  quantity: number;
}

export interface Estimate {
  id: string;
  customerName: string;
  date: string;
  items: CartItem[];
  total: number;
}