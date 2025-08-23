import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface User {
  id: string;
  username: string;
  phone: string;
  name: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
  avatar?: string;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'auth' | 'main'>('auth');
  const [authStep, setAuthStep] = useState<'phone' | 'password' | 'register'>('phone');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');

  const [chats] = useState<Chat[]>([
    {
      id: '1',
      name: 'Алексей Петров',
      lastMessage: 'Привет! Как дела?',
      timestamp: '14:30',
      unreadCount: 2,
      isGroup: false,
    },
    {
      id: '2',
      name: 'IT Команда',
      lastMessage: 'Собираемся на встречу',
      timestamp: '13:15',
      unreadCount: 5,
      isGroup: true,
    },
    {
      id: '3',
      name: 'Мария Иванова',
      lastMessage: 'Спасибо за помощь!',
      timestamp: 'вчера',
      unreadCount: 0,
      isGroup: false,
    },
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Как дела?',
      sender: 'Алексей',
      timestamp: new Date(),
      isOwn: false,
    },
    {
      id: '2',
      text: 'Все отлично, спасибо! А у тебя?',
      sender: 'Я',
      timestamp: new Date(),
      isOwn: true,
    },
  ]);

  const handleAuth = () => {
    if (authStep === 'phone' && phone) {
      setAuthStep('password');
    } else if (authStep === 'password' && password) {
      setCurrentView('main');
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Здесь была бы логика отправки сообщения
      setMessageText('');
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
          {authStep === 'phone' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона
                </label>
                <Input
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={handleAuth} className="w-full bg-telegram-blue hover:bg-telegram-blue/90">
                Продолжить
              </Button>
              <Button
                variant="outline"
                onClick={() => setAuthStep('register')}
                className="w-full"
              >
                Зарегистрироваться
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
                  placeholder="@username"
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
                  placeholder="+7 (999) 123-45-67"
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
                  placeholder="Создайте пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={() => setCurrentView('main')} className="w-full bg-telegram-blue hover:bg-telegram-blue/90">
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
          
          {/* Поиск */}
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Вкладки */}
        <Tabs defaultValue="chats" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="chats">Чаты</TabsTrigger>
            <TabsTrigger value="groups">Группы</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              {chats.filter(chat => !chat.isGroup).map((chat) => (
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
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <Badge className="ml-2 bg-telegram-blue text-white">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="groups" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              {chats.filter(chat => chat.isGroup).map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center p-4 hover:bg-telegram-gray cursor-pointer transition-colors ${
                    selectedChat === chat.id ? 'bg-telegram-gray' : ''
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <Avatar className="mr-3">
                    <AvatarFallback className="bg-telegram-lightBlue text-white">
                      <Icon name="Users" size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-telegram-darkGray truncate">{chat.name}</h3>
                      <span className="text-xs text-gray-500">{chat.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <Badge className="ml-2 bg-telegram-blue text-white">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 m-0 p-4">
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-telegram-gray rounded-lg">
                <Avatar className="mr-3">
                  <AvatarFallback className="bg-telegram-blue text-white">
                    И
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Иван Петров</h3>
                  <p className="text-sm text-gray-500">@ivan_petrov</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="User" size={16} className="mr-3" />
                  Профиль
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Bell" size={16} className="mr-3" />
                  Уведомления
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Shield" size={16} className="mr-3" />
                  Приватность
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Palette" size={16} className="mr-3" />
                  Темы
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-600">
                  <Icon name="LogOut" size={16} className="mr-3" />
                  Выйти
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Кнопка создания группы */}
        <div className="p-4 border-t">
          <Button className="w-full bg-telegram-blue hover:bg-telegram-blue/90">
            <Icon name="Plus" size={16} className="mr-2" />
            Создать группу
          </Button>
        </div>
      </div>

      {/* Правая панель - чат */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Заголовок чата */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center">
                <Avatar className="mr-3">
                  <AvatarFallback className="bg-telegram-lightBlue text-white">
                    {chats.find(c => c.id === selectedChat)?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="font-medium text-telegram-darkGray">
                    {chats.find(c => c.id === selectedChat)?.name}
                  </h2>
                  <p className="text-sm text-gray-500">онлайн</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Icon name="Phone" size={18} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon name="Video" size={18} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon name="MoreVertical" size={18} />
                </Button>
              </div>
            </div>

            {/* Сообщения */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
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
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Поле ввода */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm">
                  <Icon name="Paperclip" size={18} />
                </Button>
                <Input
                  placeholder="Введите сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm" className="bg-telegram-blue hover:bg-telegram-blue/90">
                  <Icon name="Send" size={18} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-telegram-gray/20">
            <div className="text-center">
              <div className="mb-4 w-24 h-24 bg-telegram-lightBlue/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="MessageCircle" size={48} className="text-telegram-blue" />
              </div>
              <h2 className="text-xl font-semibold text-telegram-darkGray mb-2">
                Добро пожаловать в Topgram!
              </h2>
              <p className="text-gray-500">
                Выберите чат, чтобы начать общение
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return currentView === 'auth' ? <AuthScreen /> : <MainScreen />;
};

export default Index;