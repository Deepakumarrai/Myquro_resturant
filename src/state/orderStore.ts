import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  items: OrderItem[];
  total: number;
  timestamp: string; // ISO Date String
  status: 'New' | 'Preparing' | 'Ready' | 'Picked up' | 'Rejected';
  receivedTime: string; // ISO Date String
  acceptedTime?: string; // ISO Date String
  readyTime?: string; // ISO Date String
  pickedUpTime?: string; // ISO Date String
  rejectedTime?: string; // ISO Date String
  rejectionReason?: string;
  customerType: 'New' | 'Returning';
}

interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  loadOrders: () => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  addSimulatedOrder: (isOnline: boolean) => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  markReady: (orderId: string) => Promise<void>;
  markPickedUp: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string, reason?: string) => Promise<void>;
  clearDatabase: () => Promise<void>;
}

const STORAGE_KEY = '@myquro_orders_db';

// Helper to generate initial database if empty
const generateMockHistory = (): Order[] => {
  const list: Order[] = [];
  const names = [
    { name: 'Deepak Kumar', type: 'Returning' },
    { name: 'Sneha Reddy', type: 'Returning' },
    { name: 'Rajesh Kumar', type: 'Returning' },
    { name: 'Neha Sharma', type: 'Returning' },
    { name: 'Aarav Sharma', type: 'New' },
    { name: 'Priya Patel', type: 'New' },
    { name: 'Rohan Gupta', type: 'New' },
    { name: 'Amit Patel', type: 'New' },
    { name: 'Vikram Singh', type: 'New' },
    { name: 'Divya Rao', type: 'New' },
    { name: 'Sunita Roy', type: 'New' },
    { name: 'Rahul Joshi', type: 'New' },
  ];

  const dishes = [
    { name: 'Butter Chicken', price: 280 },
    { name: 'Dal Makhani', price: 180 },
    { name: 'Kadhai Paneer', price: 220 },
    { name: 'Garlic Naan', price: 40 },
    { name: 'Tandoori Roti', price: 20 },
    { name: 'Veg Pulao', price: 140 },
    { name: 'Masala Dosa', price: 110 },
    { name: 'Samosa', price: 30 },
  ];

  const rejectionReasons = [
    'Kitchen at full capacity',
    'Item out of stock',
    'Store closing early',
    'Delivery agent unavailable',
  ];

  const now = new Date();
  
  // Generate ~80 orders distributed over the last 45 days
  for (let i = 85; i >= 1; i--) {
    const orderDate = new Date();
    // Distribute orders back in time
    const daysAgo = Math.floor(Math.random() * 45);
    orderDate.setDate(now.getDate() - daysAgo);

    // Distribution of times (Create clear peaks: 12-2 PM Lunch, 7-10 PM Dinner)
    const hourRand = Math.random();
    let hour = 19; // Default dinner
    if (hourRand < 0.35) {
      // Lunch peak
      hour = 12 + Math.floor(Math.random() * 3); // 12, 13, 14
    } else if (hourRand < 0.8) {
      // Dinner peak
      hour = 19 + Math.floor(Math.random() * 4); // 19, 20, 21, 22
    } else {
      // Off peak
      hour = 9 + Math.floor(Math.random() * 10); // 9 AM to 7 PM
    }

    const minutes = Math.floor(Math.random() * 60);
    orderDate.setHours(hour, minutes, 0, 0);

    const receivedTime = orderDate.toISOString();
    
    // Choose customer
    const custIndex = Math.floor(Math.random() * names.length);
    const customer = names[custIndex];

    // Determine status: 86% completed, 10% rejected, 4% active in-progress
    let status: Order['status'] = 'Picked up';
    const statusRand = Math.random();
    if (daysAgo === 0) {
      // Today can have active orders
      if (statusRand < 0.15) status = 'New';
      else if (statusRand < 0.3) status = 'Preparing';
      else if (statusRand < 0.4) status = 'Ready';
      else if (statusRand < 0.9) status = 'Picked up';
      else status = 'Rejected';
    } else {
      // Past days only completed or rejected
      if (statusRand < 0.9) status = 'Picked up';
      else status = 'Rejected';
    }

    // Select items (1-3 items)
    const itemCount = Math.floor(1 + Math.random() * 3);
    const items: OrderItem[] = [];
    let total = 0;
    for (let k = 0; k < itemCount; k++) {
      const dish = dishes[Math.floor(Math.random() * dishes.length)];
      const qty = Math.floor(1 + Math.random() * 2);
      items.push({
        name: dish.name,
        qty,
        price: dish.price,
      });
      total += dish.price * qty;
    }

    // Timestamps
    const prepMinutes = Math.floor(15 + Math.random() * 25); // 15 to 40 mins
    const acceptedTime = new Date(orderDate.getTime() + 2 * 60 * 1000).toISOString();
    const readyTime = new Date(orderDate.getTime() + (2 + prepMinutes) * 60 * 1000).toISOString();
    const pickedUpTime = new Date(orderDate.getTime() + (2 + prepMinutes + 10) * 60 * 1000).toISOString();
    const rejectedTime = new Date(orderDate.getTime() + 4 * 60 * 1000).toISOString();

    const order: Order = {
      id: `MQ-${9000 + i}`,
      customer: customer.name,
      customerType: customer.type as 'New' | 'Returning',
      items,
      total,
      timestamp: receivedTime,
      status,
      receivedTime,
      acceptedTime: status !== 'New' && status !== 'Rejected' ? acceptedTime : undefined,
      readyTime: status === 'Ready' || status === 'Picked up' ? readyTime : undefined,
      pickedUpTime: status === 'Picked up' ? pickedUpTime : undefined,
      rejectedTime: status === 'Rejected' ? rejectedTime : undefined,
      rejectionReason: status === 'Rejected' ? rejectedTime : undefined, // Keep reason string format
    };

    list.push(order);
  }

  // Sort newest first
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  isLoading: true,

  loadOrders: async () => {
    set({ isLoading: true });
    try {
      const dataStr = await AsyncStorage.getItem(STORAGE_KEY);
      if (dataStr) {
        set({ orders: JSON.parse(dataStr), isLoading: false });
      } else {
        // First run - populate mock history
        const mockHistory = generateMockHistory();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockHistory));
        set({ orders: mockHistory, isLoading: false });
      }
    } catch (e) {
      console.error('Error loading orders from AsyncStorage:', e);
      set({ isLoading: false });
    }
  },

  addOrder: async (order: Order) => {
    try {
      const updated = [order, ...get().orders];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ orders: updated });
    } catch (e) {
      console.error('Error adding order:', e);
    }
  },

  addSimulatedOrder: async (isOnline: boolean) => {
    if (!isOnline) return;
    const names = ['Amit Patel', 'Sneha Reddy', 'Rajesh Kumar', 'Vikram Singh', 'Neha Sharma', 'Divya Rao', 'Karan Johar', 'Sunita Roy'];
    const dishes = [
      { name: 'Butter Chicken', price: 280 },
      { name: 'Dal Makhani', price: 180 },
      { name: 'Kadhai Paneer', price: 220 },
      { name: 'Garlic Naan', price: 40 },
      { name: 'Tandoori Roti', price: 20 },
      { name: 'Veg Pulao', price: 140 },
      { name: 'Masala Dosa', price: 110 },
      { name: 'Samosa', price: 30 },
    ];

    const randomId = `MQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomName = names[Math.floor(Math.random() * names.length)];
    const isNew = Math.random() > 0.4 ? 'New' : 'Returning';

    // Choose 1-3 random items
    const itemCount = Math.floor(1 + Math.random() * 3);
    const selectedItems: OrderItem[] = [];
    let total = 0;

    for (let i = 0; i < itemCount; i++) {
      const dish = dishes[Math.floor(Math.random() * dishes.length)];
      const qty = Math.floor(1 + Math.random() * 2);
      selectedItems.push({
        name: dish.name,
        qty: qty,
        price: dish.price,
      });
      total += dish.price * qty;
    }

    const receivedTime = new Date().toISOString();
    const newOrder: Order = {
      id: randomId,
      customer: randomName,
      customerType: isNew as 'New' | 'Returning',
      items: selectedItems,
      total: total,
      timestamp: receivedTime,
      receivedTime,
      status: 'New',
    };

    await get().addOrder(newOrder);
  },

  acceptOrder: async (orderId: string) => {
    try {
      const nowStr = new Date().toISOString();
      const updated = get().orders.map(o => 
        o.id === orderId ? { ...o, status: 'Preparing' as const, acceptedTime: nowStr } : o
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ orders: updated });
    } catch (e) {
      console.error(e);
    }
  },

  markReady: async (orderId: string) => {
    try {
      const nowStr = new Date().toISOString();
      const updated = get().orders.map(o => 
        o.id === orderId ? { ...o, status: 'Ready' as const, readyTime: nowStr } : o
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ orders: updated });
    } catch (e) {
      console.error(e);
    }
  },

  markPickedUp: async (orderId: string) => {
    try {
      const nowStr = new Date().toISOString();
      const updated = get().orders.map(o => 
        o.id === orderId ? { ...o, status: 'Picked up' as const, pickedUpTime: nowStr } : o
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ orders: updated });
    } catch (e) {
      console.error(e);
    }
  },

  rejectOrder: async (orderId: string, reason = 'Out of stock') => {
    try {
      const nowStr = new Date().toISOString();
      const updated = get().orders.map(o => 
        o.id === orderId ? { ...o, status: 'Rejected' as const, rejectedTime: nowStr, rejectionReason: reason } : o
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ orders: updated });
    } catch (e) {
      console.error(e);
    }
  },

  clearDatabase: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ orders: [] });
    } catch (e) {
      console.error(e);
    }
  },
}));
