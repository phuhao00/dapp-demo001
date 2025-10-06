import { create } from 'zustand'
import { type Address } from 'viem'

export interface Transaction {
  id: string
  hash: string
  type: 'transfer' | 'mint' | 'burn'
  from: Address
  to: Address
  amount: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
}

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  title?: string
  autoHide?: boolean
}

export interface AppState {
  // 交易历史
  transactions: Transaction[]
  
  // UI 状态
  isLoading: boolean
  notifications: Notification[]
  
  // 操作
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  setLoading: (loading: boolean) => void
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void
  hideNotification: (id: string) => void
  clearTransactions: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  transactions: [],
  isLoading: false,
  notifications: [],
  
  addTransaction: (transaction) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }
    
    set((state) => ({
      transactions: [newTransaction, ...state.transactions]
    }))
  },
  
  updateTransaction: (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map(tx => 
        tx.id === id ? { ...tx, ...updates } : tx
      )
    }))
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading })
  },
  
  showNotification: (message, type = 'info', title) => {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      title,
      autoHide: true
    }
    
    set((state) => ({
      notifications: [...state.notifications, notification]
    }))
  },
  
  hideNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },
  
  clearTransactions: () => {
    set({ transactions: [] })
  }
}))