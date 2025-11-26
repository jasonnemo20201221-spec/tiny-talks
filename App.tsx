import React, { useState, useEffect } from 'react';
import { generateDailyTopics } from './services/geminiService';
import { TopicCardData, AgeGroup, UserSettings } from './types';
import Card from './components/Card';
import LoadingScreen from './components/LoadingScreen';

const MAX_GROUPS = 50;

const App: React.FC = () => {
  const [topics, setTopics] = useState<TopicCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupIndex, setGroupIndex] = useState(1);
  
  // Settings State
  const [settings, setSettings] = useState<UserSettings | null>(null);
  // Temp state for selection screen
  const [tempAge, setTempAge] = useState<AgeGroup>(4);

  // Helper to get storage key
  const getStorageKey = (age: number) => `tinyTalks_group_progress_${age}`;

  const startGeneration = async () => {
    setLoading(true);
    setError(null);
    const currentSettings = { age: tempAge };
    setSettings(currentSettings);

    // Load saved progress
    const savedGroup = parseInt(localStorage.getItem(getStorageKey(tempAge)) || '1', 10);
    setGroupIndex(savedGroup);

    try {
      const data = await generateDailyTopics(currentSettings.age, savedGroup);
      if (data && data.length > 0) {
        setTopics(data);
        setCurrentIndex(0);
      } else {
        setError("没有生成话题，请重试。");
      }
    } catch (err) {
      setError("发生错误，请检查网络。");
    } finally {
      setLoading(false);
    }
  };

  const loadNextGroup = async () => {
    if (!settings) return;
    
    if (groupIndex >= MAX_GROUPS) {
      alert("恭喜！你已经完成了所有50组话题，太棒了！");
      return;
    }

    setLoading(true);
    const nextGroup = groupIndex + 1;
    
    try {
      const data = await generateDailyTopics(settings.age, nextGroup);
      if (data && data.length > 0) {
        setTopics(data);
        setCurrentIndex(0);
        setGroupIndex(nextGroup);
        // Save progress
        localStorage.setItem(getStorageKey(settings.age), nextGroup.toString());
      } else {
        setError("获取下一组话题失败，请重试。");
      }
    } catch (err) {
      setError("网络错误，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < topics.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Reached the end, load next group
      loadNextGroup();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const resetSettings = () => {
    setSettings(null);
    setTopics([]);
    setGroupIndex(1);
  };

  // --- View: Loading ---
  if (loading) {
    return <LoadingScreen />;
  }

  // --- View: Settings / Landing ---
  if (!settings || (topics.length === 0 && !error)) {
    return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10" style={{
                backgroundImage: 'radial-gradient(#FF9F1C 2px, transparent 2px)',
                backgroundSize: '20px 20px'
            }}></div>

            <div className="bg-white p-8 rounded-[2rem] border-4 border-black shadow-cartoon-lg w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-brand-yellow mx-auto rounded-full border-4 border-black flex items-center justify-center text-4xl shadow-cartoon mb-4">
                        🦁
                    </div>
                    <h1 className="text-3xl font-black text-gray-800 mb-2">TinyTalks</h1>
                    <p className="text-gray-500 font-bold">定制今天的亲子话题</p>
                </div>

                {/* Age Selection */}
                <div className="mb-8">
                    <label className="block text-lg font-black text-gray-800 mb-3 text-center">宝宝今年几岁啦？</label>
                    <div className="flex gap-4">
                        {[3, 4, 5].map((age) => (
                            <button
                                key={age}
                                onClick={() => setTempAge(age as AgeGroup)}
                                className={`flex-1 py-4 rounded-xl border-4 font-black text-xl transition-all ${
                                    tempAge === age 
                                    ? 'bg-brand-blue border-black text-white shadow-cartoon transform -translate-y-1' 
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-brand-blue/50'
                                }`}
                            >
                                {age}岁
                            </button>
                        ))}
                    </div>
                    {/* Show saved progress hint */}
                    <p className="text-center text-xs text-gray-400 mt-2 font-semibold">
                       上次进度: 第 {localStorage.getItem(getStorageKey(tempAge)) || 1} 组
                    </p>
                </div>

                <button 
                    onClick={startGeneration}
                    className="w-full bg-brand-yellow text-black text-xl font-black py-4 rounded-xl border-4 border-black shadow-cartoon hover:shadow-cartoon-lg hover:-translate-y-1 active:translate-y-0 active:shadow-cartoon transition-all"
                >
                    {(parseInt(localStorage.getItem(getStorageKey(tempAge)) || '1') > 1) ? '继续下一组话题 🚀' : '开始生成话题 ✨'}
                </button>
            </div>
        </div>
    );
  }

  // --- View: Error ---
  if (error) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream text-center p-4">
            <h2 className="text-2xl font-bold mb-4">哎呀，出错了!</h2>
            <p className="mb-8">{error}</p>
            <div className="flex gap-4">
                <button onClick={resetSettings} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full border-4 border-black font-bold">
                    返回设置
                </button>
                <button onClick={() => window.location.reload()} className="bg-brand-blue text-white px-8 py-3 rounded-full border-4 border-black shadow-cartoon font-bold hover:translate-y-1 hover:shadow-cartoon-hover transition-all">
                    重试一下
                </button>
            </div>
        </div>
    );
  }

  // --- View: Cards ---
  const progressPercentage = ((currentIndex + 1) / topics.length) * 100;
  const isLastCard = currentIndex === topics.length - 1;

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <header className="p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2" onClick={resetSettings}>
            <div className="w-10 h-10 bg-brand-orange rounded-full border-2 border-black flex items-center justify-center text-xl shadow-cartoon-hover cursor-pointer">
                🎈
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tight text-gray-800 leading-none">TinyTalks</h1>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">适龄：{settings.age}岁</span>
                    <span className="text-xs font-black bg-black text-white px-1.5 rounded-md">第 {groupIndex}/{MAX_GROUPS} 组</span>
                </div>
            </div>
        </div>
        <button 
            onClick={resetSettings}
            className="bg-white px-3 py-2 rounded-xl border-2 border-black font-bold text-xs shadow-cartoon-hover active:translate-y-1 active:shadow-none transition-all"
        >
            ⚙️ 调整年龄
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto relative">
        
        {/* Progress Bar */}
        <div className="w-full max-w-md mb-4 flex items-center gap-3">
            <div className="flex-1 h-4 bg-white rounded-full border-2 border-black overflow-hidden relative">
                <div 
                    className="absolute top-0 left-0 h-full bg-brand-green transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            <span className="font-black text-lg w-12 text-right">{currentIndex + 1}/{topics.length}</span>
        </div>

        {/* Card Container */}
        <div className="w-full relative perspective-1000">
             {topics.map((topic, index) => (
                index === currentIndex ? (
                    <Card key={topic.id} data={topic} isVisible={true} />
                ) : null
             ))}
        </div>

        {/* Navigation Controls */}
        <div className="w-full max-w-md mt-6 flex justify-between items-center gap-4 z-20">
            <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`
                    flex-1 py-4 rounded-2xl border-4 border-black font-black text-xl transition-all
                    ${currentIndex === 0 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border-gray-400' 
                        : 'bg-white text-black shadow-cartoon hover:-translate-y-1 hover:shadow-cartoon-lg active:translate-y-0 active:shadow-cartoon'}
                `}
            >
                ⬅️ 上一个
            </button>

            <button 
                onClick={handleNext}
                className={`
                    flex-1 py-4 rounded-2xl border-4 border-black font-black text-xl transition-all
                    ${isLastCard
                        ? 'bg-brand-green text-white shadow-cartoon hover:-translate-y-1 hover:shadow-cartoon-lg active:translate-y-0 active:shadow-cartoon'
                        : 'bg-brand-blue text-white shadow-cartoon hover:-translate-y-1 hover:shadow-cartoon-lg active:translate-y-0 active:shadow-cartoon'}
                `}
            >
                 {isLastCard ? '下一组 🚀' : '下一个 ➡️'}
            </button>
        </div>

      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-4 bg-repeat-x opacity-30 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
        backgroundSize: '10px 10px'
      }}></div>
    </div>
  );
};

export default App;