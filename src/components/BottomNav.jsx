import { Home, TrendingUp, ShoppingCart, MessageCircle, Settings } from 'lucide-react';

const BottomNav = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'groceries', label: 'Groceries', icon: ShoppingCart },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-20">
      <div className="flex justify-around items-center max-w-md mx-auto px-2 py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-w-touch py-2 px-3 rounded-lg transition-all ${
                isActive
                  ? 'text-primary bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
