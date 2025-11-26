import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-cream px-4">
      <div className="relative w-32 h-32 mb-8">
        {/* Animated Sun/Idea */}
        <div className="absolute inset-0 bg-brand-yellow rounded-full border-4 border-black shadow-cartoon animate-bounce flex items-center justify-center text-5xl">
          💡
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">正在捕捉奇思妙想...</h2>
      <p className="text-gray-600 text-center animate-pulse">魔法机器正在为宝宝准备今天的话题</p>
    </div>
  );
};

export default LoadingScreen;