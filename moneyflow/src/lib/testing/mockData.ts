// src/lib/testing/mockData.ts
/**
 * Mock Data for Testing
 * Provides realistic mock data for tests
 * Note: Install @faker-js/faker for enhanced mock data: npm install -D @faker-js/faker
 */

// Optional: Uncomment if @faker-js/faker is installed
// import { faker } from '@faker-js/faker';

// Simple faker alternative for basic mock data
const faker = {
  string: {
    uuid: () => crypto.randomUUID(),
    alphanumeric: (length: number) =>
      Array.from({ length }, () => Math.random().toString(36)[2]).join(''),
  },
  number: {
    int: (options: { min: number; max: number }) =>
      Math.floor(Math.random() * (options.max - options.min + 1)) + options.min,
    float: (options: { min: number; max: number; fractionDigits: number }) => {
      const num = Math.random() * (options.max - options.min) + options.min;
      return parseFloat(num.toFixed(options.fractionDigits));
    },
  },
  helpers: {
    arrayElement: <T>(array: T[]) => array[Math.floor(Math.random() * array.length)],
  },
  date: {
    past: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    recent: () => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    future: () => new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
  },
  company: {
    name: () => `Test Company ${Math.random().toString(36).slice(2, 7)}`,
    catchPhrase: () => 'Innovative business solutions',
  },
  internet: {
    email: () => `test${Math.random().toString(36).slice(2, 7)}@example.com`,
    url: () => `https://example-${Math.random().toString(36).slice(2, 7)}.com`,
  },
  phone: {
    number: () => `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
  },
  location: {
    streetAddress: () => `${Math.floor(Math.random() * 9999)} Main St`,
    city: () => ['New York', 'Los Angeles', 'Chicago', 'Houston'][Math.floor(Math.random() * 4)],
    state: () => ['NY', 'CA', 'IL', 'TX'][Math.floor(Math.random() * 4)],
    zipCode: () => Math.floor(Math.random() * 90000 + 10000).toString(),
    country: () => 'United States',
  },
  commerce: {
    productName: () => `Product ${Math.random().toString(36).slice(2, 7)}`,
    productDescription: () => 'High quality test product',
    department: () => ['Electronics', 'Clothing', 'Food', 'Books'][Math.floor(Math.random() * 4)],
  },
  finance: {
    transactionDescription: () => `Transaction ${Math.random().toString(36).slice(2, 7)}`,
    transactionType: () => ['payment', 'withdrawal', 'deposit'][Math.floor(Math.random() * 3)],
  },
  person: {
    firstName: () => ['John', 'Jane', 'Bob', 'Alice'][Math.floor(Math.random() * 4)],
    lastName: () => ['Smith', 'Johnson', 'Williams', 'Brown'][Math.floor(Math.random() * 4)],
  },
  image: {
    avatar: () => `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
  },
  seed: (_seed: number) => {
    // Seed function for faker - simplified version doesn't support seeding
  },
};

/**
 * Generate mock invoice
 */
export function generateMockInvoice(
  overrides?: Partial<{
    id: string;
    invoiceNumber: string;
    customerId: string;
    organizationId: string;
    status: string;
    amount: number;
    dueDate: string;
  }>
) {
  return {
    id: faker.string.uuid(),
    invoiceNumber: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
    customerId: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    status: faker.helpers.arrayElement(['draft', 'sent', 'paid', 'overdue']),
    amount: faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }),
    dueDate: faker.date.future().toISOString(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Generate mock customer
 */
export function generateMockCustomer(
  overrides?: Partial<{
    id: string;
    name: string;
    email: string;
    phone: string;
    organizationId: string;
  }>
) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
      country: faker.location.country(),
    },
    organizationId: faker.string.uuid(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Generate mock product
 */
export function generateMockProduct(
  overrides?: Partial<{
    id: string;
    name: string;
    price: number;
    organizationId: string;
  }>
) {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    category: faker.commerce.department(),
    organizationId: faker.string.uuid(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Generate mock transaction
 */
export function generateMockTransaction(
  overrides?: Partial<{
    id: string;
    amount: number;
    type: string;
    status: string;
    organizationId: string;
  }>
) {
  return {
    id: faker.string.uuid(),
    amount: faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }),
    type: faker.helpers.arrayElement(['income', 'expense']),
    status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
    description: faker.finance.transactionDescription(),
    category: faker.finance.transactionType(),
    date: faker.date.recent().toISOString(),
    organizationId: faker.string.uuid(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Generate mock user
 */
export function generateMockUser(
  overrides?: Partial<{
    id: string;
    email: string;
    role: string;
    organizationId: string;
  }>
) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: faker.helpers.arrayElement(['admin', 'manager', 'user', 'viewer']),
    organizationId: faker.string.uuid(),
    avatar: faker.image.avatar(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Generate mock organization
 */
export function generateMockOrganization(
  overrides?: Partial<{
    id: string;
    name: string;
    slug: string;
  }>
) {
  const name = faker.company.name();
  return {
    id: faker.string.uuid(),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: faker.company.catchPhrase(),
    industry: faker.commerce.department(),
    size: faker.helpers.arrayElement(['small', 'medium', 'large', 'enterprise']),
    website: faker.internet.url(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Generate array of mock data
 */
export function generateMockArray<T>(generator: (index: number) => T, count: number): T[] {
  return Array.from({ length: count }, (_, index) => generator(index));
}

/**
 * Generate paginated mock data
 */
export function generatePaginatedMockData<T>(
  generator: () => T,
  page: number,
  perPage: number,
  totalCount: number
) {
  const data = generateMockArray(() => generator(), perPage);

  return {
    data,
    pagination: {
      page,
      perPage,
      totalCount,
      totalPages: Math.ceil(totalCount / perPage),
      hasMore: page * perPage < totalCount,
    },
  };
}

/**
 * Seed faker for consistent test data
 */
export function seedFaker(seed: number) {
  faker.seed(seed);
}
