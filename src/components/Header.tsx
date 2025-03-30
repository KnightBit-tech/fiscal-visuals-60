
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <div>
            <h1 className="font-bold text-xl">Fiscal Visuals</h1>
            <p className="text-xs text-muted-foreground">Financial Data Visualization</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
