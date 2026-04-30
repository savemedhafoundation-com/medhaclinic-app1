export type Role = 'super_admin' | 'admin' | 'support' | 'viewer';

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type Paginated<T> = {
  success: boolean;
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  summary?: Record<string, number>;
};

export type ListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  userId?: string;
  from?: string;
  to?: string;
  minScore?: string;
  maxScore?: string;
  category?: string;
  featured?: string;
  active?: string;
  lowStock?: string;
};

export type AdminMe = {
  uid: string;
  email: string;
  role: Role;
  active: boolean;
};

export type PatientProfile = {
  gender?: string | null;
  age?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  purpose?: string | null;
  address?: string | null;
};

export type UserRecord = {
  id: string;
  firebaseUid: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  provider?: string | null;
  disabled: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: PatientProfile | null;
  _count?: {
    submissions: number;
    reports: number;
    aiSummaries: number;
    orders: number;
    notes?: number;
  };
};

export type UserNote = {
  id: string;
  userId: string;
  note: string;
  createdBy?: string | null;
  createdAt: string;
};

export type UserDetails = UserRecord & {
  notes: UserNote[];
  submissions: ImmunitySubmission[];
  reports: WeeklyReport[];
  orders: OrderRecord[];
};

export type ImmunitySubmission = {
  id: string;
  userId: string;
  immunityScore: number;
  immunityLevel: string;
  physicalEnergy?: number | null;
  appetite?: number | null;
  digestionComfort?: number | null;
  burningPain?: number | null;
  bloatingGas?: number | null;
  bloodPressure?: number | null;
  swelling?: number | null;
  fever?: number | null;
  infection?: number | null;
  breathingProblem?: number | null;
  menstrualRegularity?: number | null;
  libidoStability?: number | null;
  hairHealth?: number | null;
  sleepHours?: number | null;
  submittedAt: string;
  createdAt: string;
  user?: UserRecord;
};

export type WeeklyReport = {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  overallCurrent: number;
  overallPrevious?: number | null;
  overallDelta?: number | null;
  trend: string;
  payloadJson: unknown;
  generatedAt: string;
  user?: UserRecord;
};

export type AiSummary = {
  id: string;
  userId: string;
  sourceSubmissionId?: string | null;
  resultText: string;
  outputPreview?: string;
  promptPreview?: string;
  model: string;
  createdAt: string;
  user?: UserRecord;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  capacity: string;
  pricePaise: number;
  priceType: 'FIXED' | 'RANGE';
  minPricePaise?: number | null;
  maxPricePaise?: number | null;
  mrpPaise: number;
  category: 'BOOSTERS' | 'SUPPLEMENTS' | 'PACKAGES';
  description: string;
  detailDescription: string;
  benefits?: string | null;
  usage?: string | null;
  howToUse: string;
  subtitle: string;
  supportLine: string;
  stock: number;
  sku?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
  sortOrder: number;
  featured: boolean;
  hidden: boolean;
  active: boolean;
  archived: boolean;
  deletedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  variants?: ProductVariant[];
  gallery?: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  title: string;
  pricePaise: number;
  stock: number;
  sku?: string | null;
  active: boolean;
  sortOrder: number;
};

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minSubtotalPaise: number;
  maxDiscountPaise?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  active: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  title: string;
  productSlug: string;
  capacity: string;
  quantity: number;
  unitPricePaise: number;
  lineTotalPaise: number;
};

export type OrderRecord = {
  id: string;
  userId: string;
  status: 'PAYMENT_PENDING' | 'PAID' | 'PAYMENT_FAILED';
  shippingStatus: 'NOT_STARTED' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  refundStatus: 'NOT_REQUESTED' | 'REQUESTED' | 'PROCESSING' | 'REFUNDED' | 'REJECTED';
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  couponCode?: string | null;
  addressSnapshot: unknown;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  trackingNumber?: string | null;
  courier?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: UserRecord;
};

export type DashboardData = {
  totals: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersWeek: number;
    newUsersMonth: number;
    immunitySubmissions: number;
    averageLatestImmunityScore: number;
    reportsGenerated: number;
    aiSummaries: number;
    revenue: number;
    paidOrders: number;
  };
  orderCountsByStatus: { status: string; total: number }[];
  topProducts: { productSlug: string; title: string; quantity: number; revenue: number }[];
  latestOrders: Array<{
    id: string;
    userName?: string | null;
    userEmail?: string | null;
    total: number;
    status: string;
    shippingStatus: string;
    createdAt: string;
    itemsCount: number;
  }>;
  latestUsers: UserRecord[];
  systemHealth: {
    databaseConfigured: boolean;
    firebaseAdminConfigured: boolean;
    openaiConfigured: boolean;
    razorpayConfigured: boolean;
  };
};

export type HealthStatus = {
  status: string;
  databaseReachable: boolean;
  databaseMessage?: string | null;
  firebaseAdminConfigured: boolean;
  openaiConfigured: boolean;
  razorpayConfigured: boolean;
  envMode: string;
  backendVersion: string;
  uptimeSeconds: number;
  hostname: string;
};

export type AuditLog = {
  id: string;
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
  createdAt: string;
  actor?: { email: string; role: Role } | null;
};
