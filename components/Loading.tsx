import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Carregando...', 
  fullScreen = false 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;