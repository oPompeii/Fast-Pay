import React from 'react';
import { Bell, Shield, Users, HelpCircle } from 'lucide-react';

export default function Notifications() {
  const tabs = [
    { id: 'all', label: 'Todas' },
    { id: 'affiliates', label: 'Afiliados' },
    { id: 'security', label: 'Segurança' },
    { id: 'help', label: 'Central de Ajuda' },
  ];

  const notifications = [
    {
      id: 1,
      type: 'affiliate',
      icon: <Users className="text-emerald-500" />,
      title: 'Novo Afiliado',
      message: 'João Silva se juntou à sua rede de afiliados',
      time: '08/02 11:51',
    },
    {
      id: 2,
      type: 'security',
      icon: <Shield className="text-red-500" />,
      title: 'Alerta de Segurança',
      message: 'Novo acesso detectado em seu dispositivo',
      time: '08/02 10:51',
    },
    {
      id: 3,
      type: 'help',
      icon: <HelpCircle className="text-blue-500" />,
      title: 'Central de Ajuda',
      message: 'Confira nosso novo guia sobre como maximizar seus ganhos',
      time: '07/02 12:51',
    },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-emerald-500" size={24} />
          <div>
            <h1 className="text-2xl font-bold">Central de Notificações</h1>
            <p className="text-gray-400">Acompanhe suas notificações, alertas de segurança e novidades</p>
          </div>
        </div>

        <div className="bg-navy-800 rounded-lg p-6">
          <div className="border-b border-navy-700 mb-6">
            <nav className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className="text-gray-400 hover:text-white pb-4 border-b-2 border-transparent hover:border-emerald-500"
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-4 p-4 bg-navy-700 rounded-lg hover:bg-navy-600 transition-colors"
              >
                <div className="p-2 bg-navy-800 rounded-lg">
                  {notification.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{notification.title}</h3>
                    <span className="text-sm text-gray-400">{notification.time}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}