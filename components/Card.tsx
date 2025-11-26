import React, { useRef } from 'react';
import { TopicCardData } from '../types';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeColorClass = colorMap[data.colorTheme] || 'bg-brand-yellow';
  const patternUrl = data.genderTheme === 'boy' ? dinoPattern : girlPattern;

  // Determine font size based on text length to keep it centered and looking good
  const totalLength = data.questions.join("").length;
  let questionSizeClass = "text-2xl"; // Default
  if (totalLength < 15) questionSizeClass = "text-4xl leading-tight";
  else if (totalLength < 30) questionSizeClass = "text-3xl leading-snug";
  else if (totalLength > 60) questionSizeClass = "text-xl leading-normal";

  if (!isVisible) return null;

  const handleCameraClick = () => {
    // This triggers the native camera app on mobile devices
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Logic if we wanted to process the video in-app
      // For now, the user just wants to jump to camera. 
      // The file is selected here if they return.
      // We can clear it so they can record again later.
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="w-full h-full flex flex-col relative animate-in fade-in zoom-in duration-300">
        <div 
          className={`
            w-full h-full rounded-[2rem] border-4 border-black shadow-cartoon 
            flex flex-col items-center p-5 text-center justify-between
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

          {/* --- TOP SECTION: Icon & Title --- */}
          <div className="relative z-10 w-full flex flex-col items-center shrink-0 mb-4 mt-2">
              <div className="bg-white w-20 h-20 rounded-full border-4 border-black flex items-center justify-center text-4xl shadow-cartoon mb-3 transform hover:rotate-12 transition-transform">
                  {data.emoji}
              </div>
              
              <h2 className="font-cartoon text-3xl text-gray-900 leading-none drop-shadow-sm tracking-wide">
                  {data.title}
              </h2>
              <span className="mt-2 bg-black text-white px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider border border-white/50 opacity-80">
                  #{data.category}
              </span>
          </div>

          {/* --- MIDDLE SECTION: Questions (CENTERED & RESPONSIVE) --- */}
          {/* flex-1 ensures it takes all available space, justify-center keeps it in the middle */}
          <div className="flex-1 w-full flex items-center justify-center z-10 px-2 py-4">
              <div className="w-full">
                {data.questions.map((q, idx) => (
                    <p 
                        key={idx} 
                        className={`
                            font-sans font-black text-gray-800 drop-shadow-sm
                            ${questionSizeClass}
                            ${idx > 0 ? 'mt-6 pt-6 border-t-2 border-black/10' : ''}
                        `}
                    >
                        “{q}”
                    </p>
                ))}
              </div>
          </div>

          {/* --- BOTTOM SECTION: Camera & Tips --- */}
          <div className="relative z-10 w-full flex flex-col items-center gap-3 shrink-0 mb-1">
              
              {/* Camera Button - Centered above tips */}
              <button 
                onClick={handleCameraClick}
                className="bg-white text-black px-6 py-2 rounded-full border-4 border-black flex items-center gap-2 shadow-cartoon hover:scale-105 active:scale-95 transition-all group"
              >
                 <span className="text-2xl group-hover:rotate-12 transition-transform">📹</span>
                 <span className="font-cartoon font-bold text-lg">拍个视频</span>
              </button>
              
              {/* Hidden Native File Input */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="video/*" 
                capture="environment" // Forces native camera intent
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Tips Box */}
              <div className="w-full bg-white/60 backdrop-blur-md rounded-xl p-3 border-2 border-black/10">
                  <div className="flex items-center justify-center gap-2 mb-2 border-b border-black/10 pb-1">
                      <span className="text-base">💡</span>
                      <span className="font-cartoon text-sm text-gray-800 tracking-widest">爸妈锦囊</span>
                  </div>
                  <div className="text-left space-y-2">
                      {data.guidance.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-900 font-bold leading-tight">
                              <span className="bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                                  {idx + 1}
                              </span>
                              <span className="opacity-90 font-sans">{step}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;