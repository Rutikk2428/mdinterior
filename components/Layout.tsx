import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, useData } from '../store';
import { LogOut, LayoutDashboard, Calculator, UserCircle } from 'lucide-react';
import { COMPANY_INFO } from '../constants';

// Modern Text Logo
const MDLogo = ({ className = "" }: { className?: string }) => (
  <span className={`font-serif font-black tracking-tighter leading-none ${className}`}>
    MD
  </span>
);

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { clearCart } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearCart(); // Clear the estimate cart on logout
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col no-print font-sans">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/estimator')}>
              <div className="text-black transition-transform hover:scale-105">
                <MDLogo className="text-3xl md:text-4xl" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-serif font-bold text-gray-900 leading-none tracking-tight">{COMPANY_INFO.name}</h1>
                <p className="text-[9px] text-gray-400 font-bold tracking-[0.25em] uppercase mt-1 hidden sm:block">Interior Estimates</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3 text-sm">
                <div className="text-right">
                  <p className="font-bold text-gray-900 leading-none text-xs uppercase tracking-wide">{user.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{user.role}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-full">
                   <UserCircle size={20} className="text-gray-500" />
                </div>
              </div>
              <div className="h-6 w-px bg-gray-100 hidden md:block"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
                title="Logout"
              >
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Logout</span>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* Navigation Tabs */}
        <div className="mb-8 md:mb-10 overflow-x-auto">
          <nav className="flex space-x-8 min-w-max border-b border-gray-200" aria-label="Tabs">
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/inventory')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                  isActive('/inventory') 
                    ? 'border-black text-black' 
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                }`}
              >
                <LayoutDashboard size={16} className={isActive('/inventory') ? 'stroke-[2.5]' : 'stroke-2'} />
                Inventory
              </button>
            )}
            
            <button
              onClick={() => navigate('/estimator')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                isActive('/estimator') 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
              }`}
            >
              <Calculator size={16} className={isActive('/estimator') ? 'stroke-[2.5]' : 'stroke-2'} />
              Estimator
            </button>
          </nav>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;