import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

const Index = () => {
  // Состояние приложения
  const [currentView, setCurrentView] = useState<'auth' | 'main'>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  // Данные пользователей и чатов
  const [users, setUsers] = useState<User[]>([
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
  ]);
  const [chats, setChats] = useState<Chat[]>([]);
  
  // Состояние регистрации
  const [authStep, setAuthStep] = useState<'phone' | 'password' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Состояние чата и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Утилиты валидации
  const validatePhone = (phone: string) => /^\+7\d{10}$/.test(phone);
  const validateUsername = (username: string) => /^[a-zA-Z0-9_]{3,20}$/.test(username);

  // Функции аутентификации
  const handleAuth = () => {
    setAuthError('');

    if (authStep === 'phone') {
      if (!validatePhone(phone)) {
        setAuthError('Введите номер телефона в формате +7XXXXXXXXXX');
        return;
      }
      
      // Проверяем, существует ли пользователь
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

    // Создаем нового пользователя
    const newUser: User = {
      id: Date.now().toString(),
      username,
      phone,
      name,
      isOnline: true,
    };
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setCurrentView('main');
  };

  // Поиск пользователей
  const searchUsers = (query: string) => {
    if (query.length < 2) {
      setFoundUsers([]);
      return;
    }
    
    const results = users.filter(user => 
      user.id !== currentUser?.id &&
      (user.username.toLowerCase().includes(query.toLowerCase()) ||
       user.name.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFoundUsers(results);
  };

  // Создание чата с пользователем
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
    setFoundUsers([]);
  };

  // Отправка сообщений
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
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
          lastMessage: messageText,
          timestamp: 'сейчас',
        };
      }
      return chat;
    }));

    setMessageText('');
  };

  // Отправка файлов
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

    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const AuthScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-telegram-blue to-telegram-lightBlue flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-telegram-blue rounded-full flex items-center justify-center">
            <Icon name="MessageCircle" size={40} className="text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-telegram-darkGray">Topgram</CardTitle>
          <p className="text-gray-600">Современный мессенджер</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона
                </label>
                <Input
                  type="tel"
                  placeholder="+71234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль
                </label>
                <Input
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Демо-пароль: password123</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <Input
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя пользователя
                </label>
                <Input
                  placeholder="username (без @)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <Input
                  type="tel"
                  placeholder="+71234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль
                </label>
                <Input
                  type="password"
                  placeholder="Создайте пароль (мин. 6 символов)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

  const MainScreen = () => (
    <div className="h-screen flex bg-white">
      {/* Левая панель */}
      <div className="w-80 border-r bg-white flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-telegram-darkGray">Topgram</h1>
            <Button variant="ghost" size="sm">
              <Icon name="Settings" size={20} />
            </Button>
          </div>
          
          {/* Поиск и добавление контактов */}
          <div className="space-y-2">
            <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
              <DialogTrigger asChild>
                <Button className="w-full bg-telegram-blue hover:bg-telegram-blue/90">
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Найти пользователей
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Поиск пользователей</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Введите username или имя..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchUsers(e.target.value);
                    }}
                  />
                  <ScrollArea className="max-h-60">
                    {foundUsers.length > 0 ? (
                      <div className="space-y-2">
                        {foundUsers.map(user => (
                          <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Avatar className="mr-3">
                                <AvatarFallback className="bg-telegram-lightBlue text-white">
                                  {user.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-500">@{user.username}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => startChat(user)}
                              className="bg-telegram-blue hover:bg-telegram-blue/90"
                            >
                              Написать
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery.length >= 2 ? (
                      <p className="text-gray-500 text-center py-4">Пользователи не найдены</p>
                    ) : searchQuery.length > 0 ? (
                      <p className="text-gray-500 text-center py-4">Введите минимум 2 символа</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 mb-3">Доступные пользователи:</p>
                        {users.filter(u => u.id !== currentUser?.id).map(user => (
                          <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Avatar className="mr-3">
                                <AvatarFallback className="bg-telegram-lightBlue text-white">
                                  {user.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-500">@{user.username}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => startChat(user)}
                              className="bg-telegram-blue hover:bg-telegram-blue/90"
                            >
                              Написать
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Список чатов */}
        <ScrollArea className="flex-1">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center p-4 hover:bg-telegram-gray cursor-pointer transition-colors ${
                  selectedChat === chat.id ? 'bg-telegram-gray' : ''
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
                    <h3 className="font-medium text-telegram-darkGray truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    @{chat.username}
                  </p>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
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
            <div className="p-8 text-center text-gray-500">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Пока нет чатов</p>
              <p className="text-sm">Найдите пользователей, чтобы начать общение</p>
            </div>
          )}
        </ScrollArea>

        {/* Профиль пользователя */}
        <div className="p-4 border-t bg-telegram-gray/20">
          <div className="flex items-center">
            <Avatar className="mr-3">
              <AvatarFallback className="bg-telegram-blue text-white">
                {currentUser?.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{currentUser?.name}</h3>
              <p className="text-sm text-gray-500">@{currentUser?.username}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentView('auth');
                setCurrentUser(null);
                setChats([]);
                setSelectedChat(null);
              }}
            >
              <Icon name="LogOut" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Правая панель - чат */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (() => {
          const chat = chats.find(c => c.id === selectedChat);
          if (!chat) return null;

          return (
            <>
              {/* Заголовок чата */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center">
                  <Avatar className="mr-3">
                    <AvatarFallback className="bg-telegram-lightBlue text-white">
                      {chat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="font-medium text-telegram-darkGray">{chat.name}</h2>
                    <p className="text-sm text-gray-500">@{chat.username}</p>
                  </div>
                </div>
              </div>

              {/* Сообщения */}
              <ScrollArea className="flex-1 p-4">
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
                              : 'bg-telegram-gray text-telegram-darkGray'
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
                          <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Начните беседу!</p>
                      <p className="text-sm">Отправьте первое сообщение</p>
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Поле ввода */}
              <div className="p-4 border-t bg-white">
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
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
          <div className="flex-1 flex items-center justify-center bg-telegram-gray/20">
            <div className="text-center">
              <div className="mb-4 w-24 h-24 bg-telegram-lightBlue/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="MessageCircle" size={48} className="text-telegram-blue" />
              </div>
              <h2 className="text-xl font-semibold text-telegram-darkGray mb-2">
                Добро пожаловать в Topgram!
              </h2>
              <p className="text-gray-500 mb-4">
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

  return currentView === 'auth' ? <AuthScreen /> : <MainScreen />;
};

export default Index;