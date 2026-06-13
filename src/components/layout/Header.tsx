import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, X, User } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const pageTitles: Record<string, string> = {
  '/': '仪表盘',
  '/revenue': '收入流水',
  '/experiments': '实验记录',
  '/reviews': '复盘文章',
  '/groups': '同行小组'
};

export function Header() {
  const location = useLocation();
  const { state, dispatch } = useApp();
  const { user, viewingAs } = state;
  const title = pageTitles[location.pathname] || '复盘台';

  const handleClearViewingAs = () => {
    dispatch({ type: 'SET_VIEWING_AS', payload: null });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      {viewingAs && (
        <div className="bg-gradient-to-r from-accent/10 to-orange-500/10 px-6 py-2 border-b border-accent/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-accent" />
              <span className="text-sm text-gray-700">
                当前视角：<span className="font-semibold text-accent">{viewingAs.name}</span>
              </span>
              <span className="text-xs text-gray-500">（成员视角）</span>
            </div>
            <button
              onClick={handleClearViewingAs}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-accent transition-colors"
            >
              <X className="w-3 h-3" />
              退出视角
            </button>
          </div>
        </div>
      )}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
            />
          </div>

          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {(user || viewingAs) && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {viewingAs?.name || user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {viewingAs?.email || user?.email}
                </p>
              </div>
              <img
                src={viewingAs ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingAs.name}` : user?.avatar}
                alt={viewingAs?.name || user?.name}
                className="w-10 h-10 rounded-full border-2 border-gray-200"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
