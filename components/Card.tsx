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

  // --- 优化后的字号计算逻辑 ---
  const totalLength = data.questions.join("").length;
  const questionCount = data.questions.length;
  
  let questionSizeClass = "text-xl leading-relaxed"; // 默认兜底大小

  // 如果只有1个问题，可以使用大字体
  if (questionCount === 1) {
      if (totalLength <= 8) {
          questionSizeClass = "text-4xl leading-tight"; // 极短：巨大字
      } else if (totalLength <= 16) {
          questionSizeClass = "text-3xl leading-snug"; // 短：大字
      } else if (totalLength <= 32) {
          questionSizeClass = "text-2xl leading-normal"; // 中：中字
      } else if (totalLength <= 60) {
          questionSizeClass = "text-xl leading-relaxed"; // 长：小字
      } else {
          questionSizeClass = "text-lg leading-relaxed"; // 超长：更小字
      }
  } 
  // 如果有多个问题，空间被分割，整体调小一级
  else {
      if (totalLength <= 20) {
          questionSizeClass = "text-2xl leading-snug"; 
      } else if (totalLength <= 40) {
          questionSizeClass = "text-xl leading-normal";
      } else {
          questionSizeClass = "text-lg leading-relaxed";
      }
  }

  if (!isVisible) return null;

  const handleCameraClick = () => {
    // This triggers the native camera app on mobile devices
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      // User has returned from camera with a file
      const file = e.target.files?.[0];
      if (file) {
          // Since we can't force "Save to Album" silently, we offer the share sheet
          // which typically includes "Save Video" on iOS/Android
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
              try {
                  await navigator.share({
                      files: [file],
                      title: '保存亲子视频',
                      text: '点击存储视频以保存到相册'
                  });
              } catch (err) {
                  // User canceled share, ignore
              }
          } else {
             // Fallback for devices that don't support sharing files directly
             const url = URL.createObjectURL(file);
             const a = document.createElement('a');
             a.href = url;
             a.download = `tiny-talks-${Date.now()}.mp4`;
             document.body.appendChild(a);
             a.click();
             document.body.removeChild(a);
             URL.revokeObjectURL(url);
          }
      }
      // Clear input so we can record again
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="w-full h-full flex flex-col relative animate-in fade-in zoom-in duration-300">
        <div 
          className={`
            w-full h-full rounded-[2rem] border-4 border-black shadow-cartoon 
            flex flex-col items-center p-4 text-center justify-between
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
          <div className="relative z-10 w-full flex flex-col items-center shrink-0 mb-2 mt-1">
              <div className="bg-white w-16 h-16 rounded-full border-4 border-black flex items-center justify-center text-3xl shadow-cartoon mb-2 transform hover:rotate-12 transition-transform">
                  {data.emoji}
              </div>
              
              <h2 className="font-cartoon text-2xl text-gray-900 leading-none drop-shadow-sm tracking-wide">
                  {data.title}
              </h2>
              <span className="mt-1 bg-black text-white px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider border border-white/50 opacity-80">
                  #{data.category}
              </span>
          </div>

          {/* --- MIDDLE SECTION: Questions (CENTERED & RESPONSIVE) --- */}
          {/* flex-1 with center alignment ensures questions are strictly in the middle */}
          <div className="flex-1 w-full flex items-center justify-center z-10 px-6 overflow-hidden">
              <div className="w-full max-h-full flex flex-col justify-center">
                {data.questions.map((q, idx) => (
                    <p 
                        key={idx} 
                        className={`
                            font-sans font-black text-gray-800 drop-shadow-sm text-center break-words
                            ${questionSizeClass}
                            ${idx > 0 ? 'mt-3 pt-3 border-t-2 border-black/10' : ''}
                        `}
                    >
                        “{q}”
                    </p>
                ))}
              </div>
          </div>

          {/* --- BOTTOM SECTION: Camera & Tips --- */}
          <div className="relative z-10 w-full flex flex-col items-center gap-2 shrink-0">
              
              {/* Camera Button - Centered above tips */}
              <button 
                onClick={handleCameraClick}
                className="bg-white text-black px-5 py-2 rounded-full border-4 border-black flex items-center gap-2 shadow-cartoon hover:scale-105 active:scale-95 transition-all group z-20"
              >
                 <span className="text-xl group-hover:rotate-12 transition-transform">📹</span>
                 <span className="font-cartoon font-bold text-base">拍视频记录</span>
              </button>
              
              {/* Hidden Native File Input */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="video/*" 
                capture="environment" 
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Tips Box */}
              <div className="w-full bg-white/60 backdrop-blur-md rounded-xl p-2.5 border-2 border-black/10">
                  <div className="flex items-center justify-center gap-1 mb-1 border-b border-black/10 pb-1">
                      <span className="text-sm">💡</span>
                      <span className="font-cartoon text-xs text-gray-800 tracking-widest">爸妈锦囊</span>
                  </div>
                  <div className="text-left space-y-1.5">
                      {data.guidance.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-900 font-bold leading-tight">
                              <span className="bg-black text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
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