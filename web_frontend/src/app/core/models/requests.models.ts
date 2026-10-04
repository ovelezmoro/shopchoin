import { StockMovementType, UserRole } from './shopchain.models';

export interface ProductRequest {
  sku: string;
  name: string;
  brand: string;
  categoryId: number;
  price: number;
  description: string;
  image: string;
  active: boolean;
}
export interface UserRequest {
  names: string;
  email: string;
  password?: string;
  role: UserRole;
  active: boolean;
}
export interface InventoryRequest {
  productId: number;
  branchId: number;
  minimumStock: number;
}
export interface MovementRequest {
  productId: number;
  branchId: number;
  type: StockMovementType;
  quantity: number;
  reference: string;
  observation: string;
}
export interface OrderRequest {
  customer: string;
  customerDocument: string;
  branchId: number;
  observations: string;
  items: { productId: number; quantity: number; size?: number }[];
}
