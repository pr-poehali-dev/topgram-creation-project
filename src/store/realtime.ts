import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  phone: string;
  name: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  isRead?: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

interface RealtimeStore {
  // Пользователи
  users: User[];
  currentUser: User | null;
  
  // Чаты и сообщения
  chats: Chat[];
  
  // Действия для пользователей
  addUser: (user: User) => void;
  setCurrentUser: (user: User | null) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  
  // Действия для чатов
  createChat: (participant1Id: string, participant2Id: string) => string;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  markMessagesAsRead: (chatId: string, userId: string) => void;
  
  // Утилиты
  findUserById: (userId: string) => User | undefined;
  getChatByParticipants: (user1Id: string, user2Id: string) => Chat | undefined;
}

export const useRealtimeStore = create<RealtimeStore>()(
  subscribeWithSelector((set, get) => ({
    users: [],
    currentUser: null,
    chats: [],
    
    // Пользователи
    addUser: (user) => {
      console.log('Добавляю пользователя:', user);
      set((state) => {
        const newUsers = [...state.users.filter(u => u.id !== user.id), user];
        console.log('Всего пользователей в сторе:', newUsers.length);
        return { users: newUsers };
      });
    },
    
    setCurrentUser: (user) =>
      set({ currentUser: user }),
    
    updateUserStatus: (userId, isOnline) =>
      set((state) => ({
        users: state.users.map(user =>
          user.id === userId 
            ? { ...user, isOnline, lastSeen: isOnline ? undefined : new Date() }
            : user
        )
      })),
    
    // Чаты
    createChat: (participant1Id, participant2Id) => {
      const existingChat = get().getChatByParticipants(participant1Id, participant2Id);
      if (existingChat) return existingChat.id;
      
      const chatId = `${participant1Id}_${participant2Id}_${Date.now()}`;
      const newChat: Chat = {
        id: chatId,
        participants: [participant1Id, participant2Id],
        messages: [],
        unreadCount: 0
      };
      
      set((state) => ({
        chats: [...state.chats, newChat]
      }));
      
      return chatId;
    },
    
    addMessage: (chatId, messageData) => {
      const message: Message = {
        ...messageData,
        id: `msg_${Date.now()}_${Math.random()}`,
        timestamp: new Date()
      };
      
      set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, message],
                lastMessage: message,
                unreadCount: messageData.senderId === state.currentUser?.id 
                  ? chat.unreadCount 
                  : chat.unreadCount + 1
              }
            : chat
        )
      }));
    },
    
    markMessagesAsRead: (chatId, userId) =>
      set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.senderId !== userId ? { ...msg, isRead: true } : msg
                ),
                unreadCount: 0
              }
            : chat
        )
      })),
    
    // Утилиты
    findUserById: (userId) => get().users.find(user => user.id === userId),
    
    getChatByParticipants: (user1Id, user2Id) =>
      get().chats.find(chat =>
        (chat.participants.includes(user1Id) && chat.participants.includes(user2Id))
      )
  }))
);

// Подписка на изменения для имитации реального времени
useRealtimeStore.subscribe(
  (state) => state.chats,
  (chats) => {
    // Здесь можно добавить логику синхронизации с сервером
    console.log('Chats updated:', chats.length);
  }
);

// Симуляция онлайн статусов
setInterval(() => {
  const store = useRealtimeStore.getState();
  store.users.forEach(user => {
    if (user.id !== store.currentUser?.id) {
      // Случайно меняем статус пользователей для демонстрации
      const shouldBeOnline = Math.random() > 0.3;
      if (user.isOnline !== shouldBeOnline) {
        store.updateUserStatus(user.id, shouldBeOnline);
      }
    }
  });
}, 10000); // Каждые 10 секунд