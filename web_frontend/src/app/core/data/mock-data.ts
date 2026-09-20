import {
  Branch,
  DashboardMetric,
  InventoryItem,
  InventoryStatus,
  Order,
  OrderStatus,
  Product,
  RecentActivity,
  StockMovement,
  StockMovementType,
  User,
  UserRole,
} from '../models/shopchain.models';

const shoe = (color: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect width="360" height="220" rx="18" fill="#f1f3f5"/><path d="M65 137c38-6 49-43 63-72 29 31 53 51 108 58 28 4 49 17 55 36H69c-20 0-23-19-4-22z" fill="${color}"/><path d="M73 160h221c0 16-13 24-30 24H90c-14 0-22-8-17-24z" fill="#fff"/><path d="M144 103l44 9m-51 4 41 8" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>`)}`;
export const PRODUCTS: Product[] = [
  {
    id: 1,
    sku: 'NK-PEG-001',
    name: 'Nike Air Zoom Pegasus',
    brand: 'Nike',
    category: 'Running',
    price: 429.9,
    description:
      'Calzado deportivo para entrenamiento diario, con amortiguación ligera y diseño enfocado en comodidad.',
    image: shoe('#0d6efd'),
    active: true,
  },
  {
    id: 2,
    sku: 'AD-ULT-014',
    name: 'Adidas Ultraboost Light',
    brand: 'Adidas',
    category: 'Running',
    price: 499.9,
    description: 'Retorno de energía y ajuste adaptable para carreras de alto rendimiento.',
    image: shoe('#343a40'),
    active: true,
  },
  {
    id: 3,
    sku: 'PM-VEL-006',
    name: 'Puma Velocity Nitro',
    brand: 'Puma',
    category: 'Running',
    price: 359.9,
    description: 'Calzado ligero y reactivo para entrenamientos de velocidad.',
    image: shoe('#dc3545'),
    active: true,
  },
  {
    id: 4,
    sku: 'NB-1080-021',
    name: 'New Balance 1080',
    brand: 'New Balance',
    category: 'Running',
    price: 479.9,
    description: 'Amortiguación premium para carreras largas y recuperación.',
    image: shoe('#6f42c1'),
    active: true,
  },
  {
    id: 5,
    sku: 'AS-NIM-013',
    name: 'Asics Gel Nimbus',
    brand: 'Asics',
    category: 'Running',
    price: 459.9,
    description: 'Protección y suavidad para corredores de pisada neutra.',
    image: shoe('#17a2b8'),
    active: true,
  },
  {
    id: 6,
    sku: 'NK-REV-017',
    name: 'Nike Revolution',
    brand: 'Nike',
    category: 'Running',
    price: 299.9,
    description: 'Pisada suave y estable para corredores que están comenzando.',
    image: shoe('#fd7e14'),
    active: true,
  },
];
export const BRANCHES: Branch[] = [
  { id: 1, name: 'San Miguel', address: 'Av. La Marina 2000', location: 'Lima', active: true },
  { id: 2, name: 'San Isidro', address: 'Av. Javier Prado 420', location: 'Lima', active: true },
  { id: 3, name: 'Breña', address: 'Jr. Huaraz 780', location: 'Lima', active: true },
  { id: 4, name: 'Bellavista', address: 'Av. Colonial 4580', location: 'Callao', active: true },
];
const stocks: number[][] = [
  [12, 8, 4, 12],
  [5, 6, 3, 4],
  [2, 1, 1, 3],
  [7, 6, 4, 5],
  [1, 2, 1, 1],
  [0, 0, 0, 0],
];
export const INVENTORY: InventoryItem[] = PRODUCTS.flatMap((p, pi) =>
  BRANCHES.map((b, bi) => {
    const stock = stocks[pi][bi];
    const minimum = pi === 5 ? 2 : 3;
    return {
      id: pi * 4 + bi + 1,
      productId: p.id,
      product: p.name,
      category: p.category,
      branch: b.name,
      stock,
      minimumStock: minimum,
      status:
        stock === 0
          ? InventoryStatus.Out
          : stock <= minimum
            ? InventoryStatus.Low
            : InventoryStatus.Available,
    };
  }),
);
export const ORDERS: Order[] = [
  {
    id: 1048,
    number: 'PED-1048',
    date: '06/09/2026 10:20',
    customer: 'Carlos Ramírez',
    customerDocument: '74125896',
    branch: 'San Isidro',
    status: OrderStatus.Preparing,
    total: 429.9,
    observations: 'Retiro presencial. Confirmar disponibilidad antes de preparar.',
    items: [
      {
        productId: 1,
        product: 'Nike Air Zoom Pegasus',
        price: 429.9,
        quantity: 1,
        subtotal: 429.9,
        size: 42,
      },
    ],
  },
  {
    id: 1047,
    number: 'PED-1047',
    date: '05/09/2026 16:40',
    customer: 'María Torres',
    customerDocument: '70856421',
    branch: 'San Miguel',
    status: OrderStatus.Pending,
    total: 499.9,
    observations: '',
    items: [
      {
        productId: 2,
        product: 'Adidas Ultraboost Light',
        price: 499.9,
        quantity: 1,
        subtotal: 499.9,
        size: 39,
      },
    ],
  },
  {
    id: 1046,
    number: 'PED-1046',
    date: '05/09/2026 13:15',
    customer: 'Luis Mendoza',
    customerDocument: '45123698',
    branch: 'Bellavista',
    status: OrderStatus.Ready,
    total: 719.8,
    observations: '',
    items: [
      {
        productId: 3,
        product: 'Puma Velocity Nitro',
        price: 359.9,
        quantity: 2,
        subtotal: 719.8,
        size: 41,
      },
    ],
  },
  {
    id: 1045,
    number: 'PED-1045',
    date: '04/09/2026 11:05',
    customer: 'Ana Rojas',
    customerDocument: '72859631',
    branch: 'Breña',
    status: OrderStatus.Completed,
    total: 479.9,
    observations: '',
    items: [
      {
        productId: 4,
        product: 'New Balance 1080',
        price: 479.9,
        quantity: 1,
        subtotal: 479.9,
        size: 38,
      },
    ],
  },
];
export const MOVEMENTS: StockMovement[] = [
  {
    id: 1,
    code: 'MOV-001',
    date: '06/09/2026 10:30',
    product: 'Nike Air Zoom Pegasus',
    type: StockMovementType.Exit,
    quantity: -1,
    branch: 'San Isidro',
    reference: 'PED-1048',
    responsible: 'Ana Torres',
    observation: 'Salida por pedido',
  },
  {
    id: 2,
    code: 'MOV-002',
    date: '06/09/2026 09:45',
    product: 'Adidas Ultraboost Light',
    type: StockMovementType.Entry,
    quantity: 8,
    branch: 'San Miguel',
    reference: 'REP-071',
    responsible: 'Luis Vega',
    observation: 'Ingreso de mercadería',
  },
  {
    id: 3,
    code: 'MOV-003',
    date: '05/09/2026 17:20',
    product: 'Puma Velocity Nitro',
    type: StockMovementType.Replenishment,
    quantity: 5,
    branch: 'Bellavista',
    reference: 'REP-069',
    responsible: 'María Díaz',
    observation: 'Reposición programada',
  },
  {
    id: 4,
    code: 'MOV-004',
    date: '05/09/2026 15:10',
    product: 'New Balance 1080',
    type: StockMovementType.Exit,
    quantity: -2,
    branch: 'Breña',
    reference: 'PED-1039',
    responsible: 'José Ríos',
    observation: 'Salida por pedido',
  },
  {
    id: 5,
    code: 'MOV-005',
    date: '05/09/2026 11:05',
    product: 'Asics Gel Nimbus',
    type: StockMovementType.Entry,
    quantity: 10,
    branch: 'San Isidro',
    reference: 'REP-066',
    responsible: 'Ana Torres',
    observation: 'Ingreso de mercadería',
  },
];
export const DASHBOARD_METRICS: DashboardMetric[] = [
  { label: 'Productos activos', value: '248', icon: 'shoe' },
  { label: 'Stock total', value: '1,864', icon: 'boxes' },
  { label: 'Pedidos pendientes', value: '18', icon: 'bag' },
  { label: 'Alertas de stock', value: '7', icon: 'alert' },
];
export const BRANCH_SUMMARY = [
  { branch: 'San Miguel', percentage: 72 },
  { branch: 'San Isidro', percentage: 55 },
  { branch: 'Breña', percentage: 82 },
  { branch: 'Bellavista', percentage: 63 },
  { branch: 'Central', percentage: 88 },
];
export const RECENT_ACTIVITY: RecentActivity[] = [
  { title: '#PED-1048', detail: 'Pedido preparado en San Isidro' },
  { title: 'Nike Air Zoom', detail: 'Reposición de 12 unidades' },
  { title: 'Bellavista', detail: 'Stock bajo en 3 productos' },
];
export const USERS: User[] = [
  {
    id: 1,
    names: 'Administrador ShopChain',
    email: 'admin@shopchain.pe',
    role: UserRole.Admin,
    active: true,
  },
  {
    id: 2,
    names: 'Ana Torres',
    email: 'almacen@shopchain.pe',
    role: UserRole.Warehouse,
    active: true,
  },
  { id: 3, names: 'Luis Vega', email: 'tienda@shopchain.pe', role: UserRole.Store, active: true },
];
