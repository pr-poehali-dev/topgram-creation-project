import React, { useState, useRef } from 'react';
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

interface User {
  id: string;
  username: string;
  phone: string;
  name: string;
  isOnline: boolean;
  avatar?: string;
}

interface Message {
  id: string;
  text?: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

interface Chat {
  id: string;
  participantId: string;
  name: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
  messages: Message[];
}

// Статические данные пользователей
const ALL_USERS: User[] = [
  {
    id: '1',
    username: 'alice_dev',
    phone: '+71234567890',
    name: 'Алиса Разработчица',
    isOnline: true,
  },
  {
    id: '2',
    username: 'bob_designer',
    phone: '+71234567891',
    name: 'Боб Дизайнер',
    isOnline: false,
  },
  {
    id: '3',
    username: 'charlie_pm',
    phone: '+71234567892',
    name: 'Чарли Менеджер',
    isOnline: true,
  }
];

const Index = () => {
  // Основные состояния
  const [currentView, setCurrentView] = useState<'auth' | 'main'>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Данные
  const [users] = useState<User[]>(ALL_USERS);
  const [chats, setChats] = useState<Chat[]>([]);
  
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
  React.useEffect(() => {
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

  // Аутентификация
  const handleAuth = () => {
    setAuthError('');

    if (authStep === 'phone') {
      if (!validatePhone(phone)) {
        setAuthError('Введите номер телефона в формате +7XXXXXXXXXX');
        return;
      }
      
      const existingUser = users.find(u => u.phone === phone);
      if (existingUser) {
        setAuthStep('password');
      } else {
        setAuthStep('register');
      }
    } else if (authStep === 'password') {
      const user = users.find(u => u.phone === phone);
      if (user && password === 'password123') {
        setCurrentUser(user);
        setCurrentView('main');
      } else {
        setAuthError('Неверный пароль');
      }
    }
  };

  const handleRegister = () => {
    setAuthError('');

    if (!name.trim()) {
      setAuthError('Введите ваше имя');
      return;
    }
    
    if (!validateUsername(username)) {
      setAuthError('Username должен содержать 3-20 символов (буквы, цифры, _)');
      return;
    }
    
    if (users.some(u => u.username === username)) {
      setAuthError('Пользователь с таким username уже существует');
      return;
    }
    
    if (!validatePhone(phone)) {
      setAuthError('Введите номер телефона в формате +7XXXXXXXXXX');
      return;
    }
    
    if (password.length < 6) {
      setAuthError('Пароль должен содержать не менее 6 символов');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      phone,
      name,
      isOnline: true,
    };
    
    setCurrentUser(newUser);
    setCurrentView('main');
  };

  // Создание чата
  const startChat = (user: User) => {
    const existingChat = chats.find(chat => chat.participantId === user.id);
    
    if (existingChat) {
      setSelectedChat(existingChat.id);
    } else {
      const newChat: Chat = {
        id: Date.now().toString(),
        participantId: user.id,
        name: user.name,
        username: user.username,
        lastMessage: '',
        timestamp: 'сейчас',
        unreadCount: 0,
        isGroup: false,
        messages: [],
      };
      
      setChats(prev => [...prev, newChat]);
      setSelectedChat(newChat.id);
    }
    
    setShowAddContact(false);
    setSearchQuery('');
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  };

  // Отправка сообщения
  const sendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const message = messageText.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: currentUser?.name || 'Я',
      timestamp: new Date(),
      isOwn: true,
      type: 'text',
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === selectedChat) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: message,
          timestamp: 'сейчас',
        };
      }
      return chat;
    }));

    setMessageText('');
  };

  // Обработка Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Загрузка файла
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChat) return;

    const isImage = file.type.startsWith('image/');
    const fileUrl = URL.createObjectURL(file);

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: currentUser?.name || 'Я',
      timestamp: new Date(),
      isOwn: true,
      type: isImage ? 'image' : 'file',
      fileUrl,
      fileName: file.name,
      text: isImage ? '' : file.name,
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === selectedChat) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: isImage ? '📷 Фото' : `📎 ${file.name}`,
          timestamp: 'сейчас',
        };
      }
      return chat;
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    setCurrentView('auth');
    setCurrentUser(null);
    setChats([]);
    setSelectedChat(null);
    setShowSettings(false);
    setShowMobileSidebar(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  // Фильтрация пользователей
  const filteredUsers = searchQuery 
    ? users.filter(user => 
        user.id !== currentUser?.id &&
        (user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : users.filter(user => user.id !== currentUser?.id);

  const themeClasses = isDarkMode 
    ? 'dark bg-gray-900 text-white' 
    : 'bg-white text-gray-900';

  // Экран авторизации
  if (currentView === 'auth') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-telegram-blue to-telegram-lightBlue flex items-center justify-center p-4 ${themeClasses}`}>
        <Card className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-telegram-blue rounded-full flex items-center justify-center">
              <Icon name="MessageCircle" size={40} className="text-white" />
            </div>
            <CardTitle className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-telegram-darkGray'}`}>
              Topgram
            </CardTitle>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Современный мессенджер
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {authError && (
              <Alert className="border-red-200 bg-red-50">
                <Icon name="AlertCircle" size={16} className="text-red-600" />
                <AlertDescription className="text-red-600">{authError}</AlertDescription>
              </Alert>
            )}

            {authStep === 'phone' && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Номер телефона
                  </label>
                  <Input
                    type="tel"
                    placeholder="+71234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Тестовые номера: +71234567890, +71234567891, +71234567892
                  </p>
                </div>
                <Button onClick={handleAuth} className="w-full bg-telegram-blue hover:bg-telegram-blue/90">
                  Продолжить
                </Button>
              </>
            )}

            {authStep === 'password' && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Пароль
                  </label>
                  <Input
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Демо-пароль: password123
                  </p>
                </div>
                <Button onClick={handleAuth} className="w-full bg-telegram-blue hover:bg-telegram-blue/90">
                  Войти
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAuthStep('phone')}
                  className="w-full"
                >
                  Назад
                </Button>
              </>
            )}

            {authStep === 'register' && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Имя
                  </label>
                  <Input
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Имя пользователя
                  </label>
                  <Input
                    placeholder="username (без @)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Телефон
                  </label>
                  <Input
                    type="tel"
                    placeholder="+71234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Пароль
                  </label>
                  <Input
                    type="password"
                    placeholder="Создайте пароль (мин. 6 символов)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
                <Button onClick={handleRegister} className="w-full bg-telegram-blue hover:bg-telegram-blue/90">
                  Зарегистрироваться
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAuthStep('phone')}
                  className="w-full"
                >
                  Назад
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Основной экран
  return (
    <div className={`h-screen flex ${themeClasses}`}>
      {/* Мобильная боковая панель */}
      {isMobile && (
        <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
          <SheetContent side="left" className="p-0 w-full max-w-sm">
            <div className={`w-full h-full border-r flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              {/* Заголовок */}
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-telegram-darkGray'}`}>
                    Topgram
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileSidebar(false)}>
                      <Icon name="X" size={20} />
                    </Button>
                    <Sheet open={showSettings} onOpenChange={setShowSettings}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Icon name="Settings" size={20} />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                        <SheetHeader>
                          <SheetTitle className={isDarkMode ? 'text-white' : ''}>Настройки</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-6 mt-6">
                          <div className={`flex items-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-telegram-gray'}`}>
                            <Avatar className="mr-3">
                              <AvatarFallback className="bg-telegram-blue text-white">
                                {currentUser?.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{currentUser?.name}</h3>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{currentUser?.username}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Icon name="Palette" size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                                <span className={isDarkMode ? 'text-white' : ''}>Темная тема</span>
                              </div>
                              <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-red-600 hover:bg-red-50"
                              onClick={handleLogout}
                            >
                              <Icon name="LogOut" size={16} className="mr-3" />
                              Выйти
                            </Button>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
                
                <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-telegram-blue hover:bg-telegram-blue/90">
                      <Icon name="UserPlus" size={16} className="mr-2" />
                      Найти пользователей
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                    <DialogHeader>
                      <DialogTitle className={isDarkMode ? 'text-white' : ''}>Поиск пользователей</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Поиск пользователей..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        autoFocus
                      />
                      <ScrollArea className="max-h-60">
                        {filteredUsers.length > 0 ? (
                          <div className="space-y-2">
                            <p className={`text-sm mb-3 px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {searchQuery ? `Результаты поиска:` : 'Все пользователи:'}
                            </p>
                            {filteredUsers.map(user => (
                              <div key={user.id} className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : ''}`}>
                                <div className="flex items-center">
                                  <Avatar className="mr-3">
                                    <AvatarFallback className="bg-telegram-lightBlue text-white">
                                      {user.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{user.name}</p>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{user.username}</p>
                                    {user.isOnline && (
                                      <div className="flex items-center mt-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                        <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Онлайн</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => startChat(user)}
                                  className="bg-telegram-blue hover:bg-telegram-blue/90 flex-shrink-0"
                                >
                                  Написать
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Icon name="Users" size={32} className={`mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {searchQuery ? 'Пользователи не найдены' : 'Нет доступных пользователей'}
                            </p>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Список чатов */}
              <ScrollArea className="flex-1">
                {chats.length > 0 ? (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center p-4 cursor-pointer transition-colors ${
                        selectedChat === chat.id 
                          ? isDarkMode ? 'bg-gray-700' : 'bg-telegram-gray'
                          : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-telegram-gray'
                      }`}
                      onClick={() => {
                        setSelectedChat(chat.id);
                        setShowMobileSidebar(false);
                      }}
                    >
                      <Avatar className="mr-3">
                        <AvatarFallback className="bg-telegram-lightBlue text-white">
                          {chat.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-telegram-darkGray'}`}>
                            {chat.name}
                          </h3>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {chat.timestamp}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          @{chat.username}
                        </p>
                        {chat.lastMessage && (
                          <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {chat.lastMessage}
                          </p>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <Badge className="ml-2 bg-telegram-blue text-white">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Icon name="MessageCircle" size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p>Пока нет чатов</p>
                    <p className="text-sm">Найдите пользователей, чтобы начать общение</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Десктопная боковая панель */}
      {!isMobile && (
        <div className={`w-80 border-r flex flex-col h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Заголовок */}
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-telegram-darkGray'}`}>
                Topgram
              </h1>
              <Sheet open={showSettings} onOpenChange={setShowSettings}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Icon name="Settings" size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <SheetHeader>
                    <SheetTitle className={isDarkMode ? 'text-white' : ''}>Настройки</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className={`flex items-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-telegram-gray'}`}>
                      <Avatar className="mr-3">
                        <AvatarFallback className="bg-telegram-blue text-white">
                          {currentUser?.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{currentUser?.name}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{currentUser?.username}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon name="Palette" size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                          <span className={isDarkMode ? 'text-white' : ''}>Темная тема</span>
                        </div>
                        <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <Icon name="LogOut" size={16} className="mr-3" />
                        Выйти
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
              <DialogTrigger asChild>
                <Button className="w-full bg-telegram-blue hover:bg-telegram-blue/90">
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Найти пользователей
                </Button>
              </DialogTrigger>
              <DialogContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <DialogHeader>
                  <DialogTitle className={isDarkMode ? 'text-white' : ''}>Поиск пользователей</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Поиск пользователей..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                    autoFocus
                  />
                  <ScrollArea className="max-h-60">
                    {filteredUsers.length > 0 ? (
                      <div className="space-y-2">
                        <p className={`text-sm mb-3 px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {searchQuery ? `Результаты поиска:` : 'Все пользователи:'}
                        </p>
                        {filteredUsers.map(user => (
                          <div key={user.id} className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : ''}`}>
                            <div className="flex items-center">
                              <Avatar className="mr-3">
                                <AvatarFallback className="bg-telegram-lightBlue text-white">
                                  {user.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{user.name}</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{user.username}</p>
                                {user.isOnline && (
                                  <div className="flex items-center mt-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                    <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Онлайн</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => startChat(user)}
                              className="bg-telegram-blue hover:bg-telegram-blue/90 flex-shrink-0"
                            >
                              Написать
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Icon name="Users" size={32} className={`mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {searchQuery ? 'Пользователи не найдены' : 'Нет доступных пользователей'}
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Список чатов */}
          <ScrollArea className="flex-1">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center p-4 cursor-pointer transition-colors ${
                    selectedChat === chat.id 
                      ? isDarkMode ? 'bg-gray-700' : 'bg-telegram-gray'
                      : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-telegram-gray'
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <Avatar className="mr-3">
                    <AvatarFallback className="bg-telegram-lightBlue text-white">
                      {chat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-telegram-darkGray'}`}>
                        {chat.name}
                      </h3>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {chat.timestamp}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      @{chat.username}
                    </p>
                    {chat.lastMessage && (
                      <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <Badge className="ml-2 bg-telegram-blue text-white">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Icon name="MessageCircle" size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p>Пока нет чатов</p>
                <p className="text-sm">Найдите пользователей, чтобы начать общение</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
      
      {/* Правая панель - чат */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (() => {
          const chat = chats.find(c => c.id === selectedChat);
          if (!chat) return null;

          return (
            <>
              {/* Заголовок чата */}
              <div className={`p-4 border-b flex items-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mr-3"
                    onClick={() => setShowMobileSidebar(true)}
                  >
                    <Icon name="ArrowLeft" size={20} />
                  </Button>
                )}
                <Avatar className="mr-3">
                  <AvatarFallback className="bg-telegram-lightBlue text-white">
                    {chat.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className={`font-medium ${isDarkMode ? 'text-white' : 'text-telegram-darkGray'}`}>
                    {chat.name}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    @{chat.username}
                  </p>
                </div>
              </div>

              {/* Сообщения */}
              <ScrollArea className={`flex-1 p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                {chat.messages.length > 0 ? (
                  <div className="space-y-4">
                    {chat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            message.isOwn
                              ? 'bg-telegram-blue text-white'
                              : isDarkMode ? 'bg-gray-700 text-white' : 'bg-telegram-gray text-telegram-darkGray'
                          }`}
                        >
                          {message.type === 'image' && message.fileUrl && (
                            <img
                              src={message.fileUrl}
                              alt="Изображение"
                              className="max-w-full h-auto rounded-lg mb-2"
                            />
                          )}
                          {message.type === 'file' && (
                            <div className="flex items-center mb-2">
                              <Icon name="FileText" size={16} className="mr-2" />
                              <span className="text-sm">{message.fileName}</span>
                            </div>
                          )}
                          {message.text && (
                            <p className="text-sm">{message.text}</p>
                          )}
                          <p className={`text-xs mt-1 ${
                            message.isOwn ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`flex items-center justify-center h-full ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="text-center">
                      <Icon name="MessageCircle" size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p>Начните беседу!</p>
                      <p className="text-sm">Отправьте первое сообщение</p>
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Поле ввода */}
              <div className={`p-4 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,*"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="Paperclip" size={18} />
                  </Button>
                  <Input
                    placeholder="Введите сообщение..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  />
                  <Button
                    onClick={sendMessage}
                    size="sm"
                    className="bg-telegram-blue hover:bg-telegram-blue/90"
                    disabled={!messageText.trim()}
                  >
                    <Icon name="Send" size={18} />
                  </Button>
                </div>
              </div>
            </>
          );
        })() : (
          <div className={`flex-1 flex flex-col items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-telegram-gray/20'}`}>
            {isMobile && (
              <Button 
                onClick={() => setShowMobileSidebar(true)}
                className="mb-6 bg-telegram-blue hover:bg-telegram-blue/90"
              >
                <Icon name="Menu" size={16} className="mr-2" />
                Открыть чаты
              </Button>
            )}
            <div className="text-center">
              <div className={`mb-4 w-24 h-24 rounded-full flex items-center justify-center mx-auto ${isDarkMode ? 'bg-gray-700' : 'bg-telegram-lightBlue/20'}`}>
                <Icon name="MessageCircle" size={48} className="text-telegram-blue" />
              </div>
              <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-telegram-darkGray'}`}>
                Добро пожаловать в Topgram!
              </h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Найдите пользователей и начните общение
              </p>
              <Button
                onClick={() => setShowAddContact(true)}
                className="bg-telegram-blue hover:bg-telegram-blue/90"
              >
                <Icon name="UserPlus" size={16} className="mr-2" />
                Найти пользователей
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;