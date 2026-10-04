export enum OrderStatus {
  Pending = 'Pendiente',
  Preparing = 'En preparación',
  Ready = 'Listo para retiro',
  Completed = 'Completado',
  Cancelled = 'Cancelado',
}
export enum InventoryStatus {
  Available = 'Disponible',
  Low = 'Stock bajo',
  Out = 'Sin stock',
}
export enum StockMovementType {
  Entry = 'ENTRADA',
  Exit = 'SALIDA',
  Replenishment = 'REPOSICIÓN',
}
export enum UserRole {
  Admin = 'ADMINISTRADOR',
  Warehouse = 'ALMACÉN',
  Store = 'TIENDA',
}
export interface User {
  id: number;
  names: string;
  email: string;
  role: UserRole;
  active: boolean;
}
export interface Category {
  id: number;
  name: string;
}
export interface Branch {
  id: number;
  name: string;
  address: string;
  location: string;
  active: boolean;
}
export interface Product {
  categoryId: number;
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  image: string;
  active: boolean;
}
export interface BranchStock {
  branch: string;
  stock: number;
}
export interface InventoryItem {
  branchId: number;
  id: number;
  productId: number;
  product: string;
  category: string;
  branch: string;
  stock: number;
  minimumStock: number;
  status: InventoryStatus;
}
export interface StockMovement {
  id: number;
  code: string;
  date: string;
  product: string;
  type: StockMovementType;
  quantity: number;
  branch: string;
  reference: string;
  responsible: string;
  observation: string;
}
export interface OrderItem {
  productId: number;
  product: string;
  price: number;
  quantity: number;
  subtotal: number;
  size?: number;
}
export interface Order {
  id: number;
  number: string;
  date: string;
  customer: string;
  customerDocument: string;
  branch: string;
  status: OrderStatus;
  total: number;
  observations: string;
  items: OrderItem[];
}
export interface DashboardMetric {
  label: string;
  value: string;
  icon: string;
}
export interface BranchSummary {
  branch: string;
  percentage: number;
}
export interface RecentActivity {
  title: string;
  detail: string;
}
