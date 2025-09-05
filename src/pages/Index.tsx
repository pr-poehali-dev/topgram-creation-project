import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import { useRealtimeStore, User as StoreUser, Chat as StoreChat } from '@/store/realtime';

const Index = () => {
  // Состояния из глобального стора
  const {
    users,
    currentUser,
    chats,
    addUser,
    setCurrentUser,
    createChat,
    addMessage,
    markMessagesAsRead,
    findUserById,
    getChatByParticipants,
    updateUserStatus
  } = useRealtimeStore();

  // Локальные состояния UI
  const [currentView, setCurrentView] = useState<'auth' | 'main'>('auth');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Состояние регистрации
  const [authStep, setAuthStep] = useState<'phone' | 'password' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Состояние UI
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Валидация
  const validatePhone = (phone: string) => /^\+7\d{10}$/.test(phone);
  const validateUsername = (username: string) => /^[a-zA-Z0-9_]{3,20}$/.test(username);

  // Изменение размера окна
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Установка статуса онлайн для текущего пользователя
  useEffect(() => {
    if (currentUser) {
      updateUserStatus(currentUser.id, true);
      
      return () => {
        updateUserStatus(currentUser.id, false);
      };
    }
  }, [currentUser, updateUserStatus]);

  // Аутентификация
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!validatePhone(phone)) {
      setAuthError('Неверный формат номера телефона. Используйте +7XXXXXXXXXX');
      return;
    }

    // Проверяем, зарегистрирован ли пользователь
    const existingUser = users.find(u => u.phone === phone);
    if (existingUser) {
      setAuthStep('password');
    } else {
      setAuthStep('register');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    const user = users.find(u => u.phone === phone);
    if (user) {
      setCurrentUser(user);
      setCurrentView('main');
      resetAuth();
    } else {
      setAuthError('Неверный пароль');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!validateUsername(username)) {
      setAuthError('Username должен содержать 3-20 символов (буквы, цифры, _)');
      return;
    }

    if (users.some(u => u.username === username)) {
      setAuthError('Пользователь с таким username уже существует');
      return;
    }

    if (name.length < 2) {
      setAuthError('Имя должно содержать минимум 2 символа');
      return;
    }

    const newUser: StoreUser = {
      id: Date.now().toString(),
      username,
      phone,
      name,
      isOnline: true,
    };
    
    addUser(newUser);
    setCurrentUser(newUser);
    setCurrentView('main');
    resetAuth();
  };

  const resetAuth = () => {
    setPhone('');
    setPassword('');
    setUsername('');
    setName('');
    setAuthError('');
    setAuthStep('phone');
  };

  const handleLogout = () => {
    if (currentUser) {
      updateUserStatus(currentUser.id, false);
    }
    setCurrentUser(null);
    setCurrentView('auth');
    setSelectedChatId(null);
    setShowSettings(false);
    resetAuth();
  };

  // Работа с чатами
  const selectedChat = selectedChatId ? chats.find(c => c.id === selectedChatId) : null;
  
  const handleStartChat = (userId: string) => {
    if (!currentUser) return;
    
    const chatId = createChat(currentUser.id, userId);
    setSelectedChatId(chatId);
    setShowAddContact(false);
    setShowMobileSidebar(false);
    setSearchQuery(''); // Сбрасываем поиск
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChatId || !currentUser) return;

    addMessage(selectedChatId, {
      text: messageText,
      senderId: currentUser.id
    });
    
    setMessageText('');
  };

  // Фильтрация пользователей (только зарегистрированные, исключая текущего)
  const filteredUsers = users.filter(user => {
    if (user.id === currentUser?.id) return false;
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const matches = (
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.phone.includes(query)
    );
    
    // Отладочная информация
    if (searchQuery) {
      console.log(`Поиск "${query}": пользователь ${user.username} (${user.name}) - ${matches ? 'найден' : 'не найден'}`);
    }
    
    return matches;
  });

  const getOtherParticipant = (chat: StoreChat): StoreUser | undefined => {
    if (!currentUser) return undefined;
    const otherUserId = chat.participants.find(id => id !== currentUser.id);
    return otherUserId ? findUserById(otherUserId) : undefined;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatLastSeen = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ч назад`;
    return date.toLocaleDateString('ru-RU');
  };

  // Компонент аутентификации
  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Realtime Chat
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Войдите или зарегистрируйтесь
            </p>
          </CardHeader>
          <CardContent>
            {authStep === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Номер телефона</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+71234567890"
                    className="w-full"
                    required
                  />
                </div>
                {authError && (
                  <Alert variant="destructive">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full">
                  Продолжить
                </Button>
              </form>
            )}

            {authStep === 'password' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Пароль</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full"
                    required
                  />
                </div>
                {authError && (
                  <Alert variant="destructive">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAuthStep('phone')}
                    className="flex-1"
                  >
                    Назад
                  </Button>
                  <Button type="submit" className="flex-1">
                    Войти
                  </Button>
                </div>
              </form>
            )}

            {authStep === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ваше имя</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Как вас зовут?"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Пароль</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Придумайте пароль"
                    className="w-full"
                    required
                  />
                </div>
                {authError && (
                  <Alert variant="destructive">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAuthStep('phone')}
                    className="flex-1"
                  >
                    Назад
                  </Button>
                  <Button type="submit" className="flex-1">
                    Зарегистрироваться
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Основной интерфейс чата
  return (
    <div className={`h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex w-full bg-white dark:bg-gray-900">
        {/* Боковая панель */}
        <div className={`${isMobile ? 'hidden' : 'flex'} w-80 border-r dark:border-gray-700 flex-col`}>
          {/* Заголовок */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Чаты
              </h1>
              <div className="flex items-center gap-2">
                <Dialog open={showAddContact} onOpenChange={(open) => {
                  setShowAddContact(open);
                  if (!open) setSearchQuery(''); // Сбрасываем поиск при закрытии
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Icon name="UserPlus" size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Найти пользователей</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Поиск по имени, username или номеру..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                        autoFocus
                      />
                      <ScrollArea className="max-h-60">
                        <div className="space-y-2">
                          <p className={`text-sm mb-3 px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {searchQuery ? `Поиск "${searchQuery}" (${filteredUsers.length} из ${users.length}):` : `Все пользователи (${filteredUsers.length} из ${users.length}):`}
                          </p>
                        {filteredUsers.length > 0 ? (
                          <div className="space-y-2">
                            {filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                                onClick={() => handleStartChat(user.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback>
                                        {user.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div
                                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                                        user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {user.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                      @{user.username}
                                      {!user.isOnline && user.lastSeen && (
                                        <span className="ml-2">
                                          {formatLastSeen(user.lastSeen)}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Icon name="MessageCircle" size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'Пользователи не найдены' : 'Нет зарегистрированных пользователей'}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Icon name="Settings" size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Настройки</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Темная тема</span>
                        <Switch
                          checked={isDarkMode}
                          onCheckedChange={setIsDarkMode}
                        />
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Текущий пользователь:
                        </p>
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar>
                            <AvatarFallback>
                              {currentUser?.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{currentUser?.name}</p>
                            <p className="text-sm text-gray-500">@{currentUser?.username}</p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={handleLogout}
                        >
                          <Icon name="LogOut" size={16} className="mr-2" />
                          Выйти
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Список чатов */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {chats.length > 0 ? (
                chats.map((chat) => {
                  const otherUser = getOtherParticipant(chat);
                  if (!otherUser) return null;
                  
                  return (
                    <div
                      key={chat.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChatId === chat.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        setSelectedChatId(chat.id);
                        markMessagesAsRead(chat.id, currentUser?.id || '');
                      }}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>
                            {otherUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                            otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {otherUser.name}
                          </p>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                              {formatTime(chat.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {chat.lastMessage?.text || 'Нет сообщений'}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge className="ml-2 bg-blue-500 text-white text-xs px-2 py-1">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Нет активных чатов</p>
                  <p className="text-sm">Найдите пользователей для общения</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Мобильная боковая панель */}
        {isMobile && (
          <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Чаты</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                  {/* Здесь повторяется контент боковой панели */}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Область чата */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Заголовок чата */}
              <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowMobileSidebar(true)}
                      >
                        <Icon name="Menu" size={16} />
                      </Button>
                    )}
                    
                    {(() => {
                      const otherUser = getOtherParticipant(selectedChat);
                      return otherUser ? (
                        <>
                          <div className="relative">
                            <Avatar>
                              <AvatarFallback>
                                {otherUser.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                                otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            />
                          </div>
                          <div>
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                              {otherUser.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {otherUser.isOnline ? (
                                'онлайн'
                              ) : otherUser.lastSeen ? (
                                `был(а) ${formatLastSeen(otherUser.lastSeen)}`
                              ) : (
                                'не в сети'
                              )}
                            </p>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>

              {/* Сообщения */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedChat.messages.length > 0 ? (
                    selectedChat.messages.map((message) => {
                      const isOwn = message.senderId === currentUser?.id;
                      const sender = findUserById(message.senderId);
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <p className="break-words">{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Начните диалог</p>
                      <p className="text-sm">Отправьте первое сообщение</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Ввод сообщения */}
              <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="flex-1"
                    maxLength={1000}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={() => {/* файлы пока не поддерживаются */}}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="Paperclip" size={16} />
                  </Button>
                  <Button type="submit" size="sm" disabled={!messageText.trim()}>
                    <Icon name="Send" size={16} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            // Экран приветствия
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                {isMobile && (
                  <Button
                    className="mb-4"
                    onClick={() => setShowMobileSidebar(true)}
                  >
                    <Icon name="Menu" size={16} className="mr-2" />
                    Открыть чаты
                  </Button>
                )}
                <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Добро пожаловать в Realtime Chat
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Выберите чат или найдите пользователей для общения
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;