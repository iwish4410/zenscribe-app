
import React, { useState, useEffect } from 'react';
import ArticleForm from './components/ArticleForm';
import ArticleDisplay from './components/ArticleDisplay';
import HistoryList from './components/HistoryList';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import { Article, ArticleConfig, User, WordPressConfig } from './types';
import { generateArticle } from './services/gemini';

const App: React.FC = () => {
  const [history, setHistory] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Settings state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [wpConfig, setWpConfig] = useState<WordPressConfig>({
    siteUrl: '',
    username: '',
    applicationPassword: '',
    isConfigured: false
  });

  // Initial load
  useEffect(() => {
    const savedHistory = localStorage.getItem('article_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedUser = localStorage.getItem('zenscribe_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setIsAuthModalOpen(true);
    }

    const savedWp = localStorage.getItem('zenscribe_wp_config');
    if (savedWp) setWpConfig(JSON.parse(savedWp));
  }, []);

  // Sync states to storage
  useEffect(() => {
    localStorage.setItem('article_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (user) localStorage.setItem('zenscribe_user', JSON.stringify(user));
    else localStorage.removeItem('zenscribe_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('zenscribe_wp_config', JSON.stringify(wpConfig));
  }, [wpConfig]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      setUser(null);
      setIsAuthModalOpen(true);
    }
  };

  const handleGenerate = async (config: ArticleConfig) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateArticle(config);
      const newArticle: Article = {
        id: crypto.randomUUID(),
        title: result.title,
        content: result.content,
        config: config,
        createdAt: Date.now(),
      };
      setHistory(prev => [newArticle, ...prev]);
      setCurrentArticle(newArticle);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError("記事の生成に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('この履歴を削除してもよろしいですか？')) {
      setHistory(prev => prev.filter(a => a.id !== id));
      if (currentArticle?.id === id) {
        setCurrentArticle(null);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onLogin={handleLogin} 
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={wpConfig}
        onSave={setWpConfig}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">ZenScribe</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">AI Content Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 mr-4">
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">ダッシュボード</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">テンプレート</a>
            </nav>
            
            {user && (
              <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                  <button onClick={handleLogout} className="text-[10px] text-red-500 font-bold hover:underline">ログアウト</button>
                </div>
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Creation Form & History */}
          <div className="lg:col-span-4 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                新しい記事を構成する
              </h2>
              <ArticleForm onSubmit={handleGenerate} isLoading={isLoading} />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                作成履歴
              </h2>
              <HistoryList 
                history={history} 
                onSelect={setCurrentArticle} 
                onDelete={handleDelete}
              />
            </section>
          </div>

          {/* Right Panel: Content Display */}
          <div className="lg:col-span-8">
            {currentArticle ? (
              <ArticleDisplay article={currentArticle} wpConfig={wpConfig} />
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">プレビューエリア</h3>
                <p className="text-slate-500 max-w-sm">
                  左のフォームから内容を入力して、「執筆を依頼する」ボタンを押すと、AIが記事を作成します。
                </p>
                {!user && (
                   <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="mt-6 py-2 px-6 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg"
                  >
                    ログインして始める
                  </button>
                )}
                <div className="mt-8 flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mb-2">1</div>
                    <span className="text-xs text-slate-400">構成入力</span>
                  </div>
                  <div className="w-12 h-[1px] bg-slate-100 mt-4"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mb-2">2</div>
                    <span className="text-xs text-slate-400">AI執筆</span>
                  </div>
                  <div className="w-12 h-[1px] bg-slate-100 mt-4"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mb-2">3</div>
                    <span className="text-xs text-slate-400">連携・公開</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 bg-slate-900 text-slate-400 text-center">
        <p className="text-sm">© 2024 ZenScribe - AI-Powered Blog Writing Assistant</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="#" className="hover:text-white transition-colors">利用規約</a>
          <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
          <a href="#" className="hover:text-white transition-colors">ヘルプ</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
