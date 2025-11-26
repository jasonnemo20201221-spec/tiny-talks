import React, { useState } from 'react';
import { TopicCardData } from '../types';
import VideoRecorder from './VideoRecorder';

interface CardProps {
  data: TopicCardData;
  isVisible: boolean;
}

const colorMap = {
  yellow: 'bg-brand-yellow',
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
  green: 'bg-brand-green',
  purple: 'bg-brand-purple',
  orange: 'bg-brand-orange',
};

// SVG Patterns as Data URIs
const dinoPattern = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 20c0-5 4-8 8-8s6 4 6 4 4-2 6 2v10h-20v-8zm30 10c0-4 3-6 6-6s5 2 5 2 0 8-4 8h-7v-4z' fill='%23000000' fill-opacity='0.08'/%3E%3Cpath d='M40 50l-5-10h10l-5 10z' fill='%23000000' fill-opacity='0.08'/%3E%3C/svg%3E`;

const girlPattern = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10l2 6h6l-4 4 2 6-6-4-6 4 2-6-4-4h6z' fill='%23000000' fill-opacity='0.08'/%3E%3Cpath d='M10 40c0-4 4-4 4-4s4 0 4 4-4 6-4 6-4-6-4-6z' fill='%23000000' fill-opacity='0.08'/%3E%3Ccircle cx='50' cy='50' r='4' fill='%23000000' fill-opacity='0.08'/%3E%3C/svg%3E`;

const Card: React.FC<CardProps> = ({ data, isVisible }) => {
  const [showRecorder, setShowRecorder] = useState(false);
  const themeColorClass = colorMap[data.colorTheme] || 'bg-brand-yellow';
  const patternUrl = data.genderTheme === 'boy' ? dinoPattern : girlPattern;

  if (!isVisible) return null;

  return (
    <>
      <div className="w-full max-w-md mx-auto h-[550px] relative animate-in fade-in zoom-in duration-300">
        <div 
          className={`
            w-full h-full rounded-[3rem] border-4 border-black shadow-cartoon-lg 
            flex flex-col items-center p-6 text-center justify-between
            ${themeColorClass} relative overflow-hidden transition-all transform
          `}
        >
          {/* Background Pattern */}
          <div 
              className="absolute inset-0 z-0 pointer-events-none opacity-60"
              style={{ backgroundImage: `url("${patternUrl}")`, backgroundSize: '60px 60px' }}
          ></div>

          {/* Decorative Background Circles */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white opacity-20 rounded-full z-0"></div>

          {/* Header: Category & Camera Button */}
          <div className="relative z-10 w-full flex justify-between items-start">
              <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider border-2 border-white shadow-sm">
                  #{data.category}
              </span>
              
              <button 
                onClick={() => setShowRecorder(true)}
                className="bg-white text-black w-10 h-10 rounded-full border-2 border-black flex items-center justify-center shadow-cartoon-hover hover:scale-110 active:scale-95 transition-all"
                aria-label="录制视频"
              >
                📹
              </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-start w-full z-10 mt-2 overflow-y-auto no-scrollbar">
              <div className="bg-white w-20 h-20 rounded-full border-4 border-black flex items-center justify-center text-4xl shadow-cartoon mb-4 shrink-0">
                  {data.emoji}
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-4 leading-tight px-2 stroke-white shrink-0">
                  {data.title}
              </h2>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border-4 border-black shadow-sm w-full mb-4">
                  {data.questions.map((q, idx) => (
                      <p key={idx} className={`text-xl font-bold text-gray-800 leading-relaxed ${idx > 0 ? 'mt-3 pt-3 border-t-2 border-dashed border-gray-200' : ''}`}>
                          “{q}”
                      </p>
                  ))}
              </div>
          </div>

          {/* Parent Tip (Progressive Steps) - Smaller Text */}
          <div className="relative z-10 w-full mt-2">
              <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border-2 border-black/10">
                  <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💡</span>
                      <span className="text-[10px] font-black uppercase text-gray-800 tracking-widest">爸妈锦囊</span>
                  </div>
                  <div className="text-left space-y-1.5">
                      {data.guidance.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-900 font-semibold leading-tight">
                              <span className="bg-black text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                                  {idx + 1}
                              </span>
                              <span className="opacity-90">{step}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* Video Recorder Overlay */}
      {showRecorder && (
        <VideoRecorder onClose={() => setShowRecorder(false)} />
      )}
    </>
  );
};

export default Card;