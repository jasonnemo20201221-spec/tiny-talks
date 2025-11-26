import React, { useState, useRef, useEffect } from 'react';

interface VideoRecorderProps {
  onClose: () => void;
}

type Resolution = '480p' | '720p' | '1080p';

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  // New States
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Resolution Constraints
  const getConstraints = (res: Resolution, mode: 'user' | 'environment') => {
    let width, height;
    switch (res) {
      case '480p': width = 640; height = 480; break;
      case '1080p': width = 1920; height = 1080; break;
      case '720p': default: width = 1280; height = 720; break;
    }
    return {
      audio: true,
      video: {
        facingMode: mode,
        width: { ideal: height }, // Mobile usually handles width/height swapped for portrait
        height: { ideal: width }
      }
    };
  };

  const initCamera = async () => {
    // Stop previous stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(getConstraints(resolution, facingMode));
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setPermissionError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setPermissionError("无法访问摄像头，请检查权限。");
    }
  };

  // Re-init camera when facing mode or resolution changes
  useEffect(() => {
    if (!recordedVideoUrl) {
      initCamera();
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [facingMode, resolution, recordedVideoUrl]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const startRecordingRef = () => {
    if (!stream) return;
    chunksRef.current = [];
    
    // Try to use a mobile-friendly mime type
    let options: MediaRecorderOptions = { mimeType: 'video/webm' };
    if (MediaRecorder.isTypeSupported('video/mp4')) {
        options = { mimeType: 'video/mp4' };
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        options = { mimeType: 'video/webm;codecs=vp9' };
    }

    try {
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: options.mimeType || 'video/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedVideoUrl(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (e) {
        console.error("MediaRecorder error:", e);
        setPermissionError("录制失败：设备不支持该分辨率或格式");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSave = async () => {
    if (!recordedVideoUrl || chunksRef.current.length === 0) return;

    const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'video/webm' });
    const fileExtension = blob.type.includes('mp4') ? 'mp4' : 'webm';
    const fileName = `tiny-talks-${Date.now()}.${fileExtension}`;
    const file = new File([blob], fileName, { type: blob.type });

    // Try Web Share API first (Native "Save to Files/Gallery" on iOS/Android)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'TinyTalks 亲子时刻',
          text: '我和宝宝的精彩对话！'
        });
        alert("请在弹出的菜单中选择“保存视频”或“存储图像”以存入相册。");
        onClose();
        return;
      } catch (err) {
        console.log("Share canceled or failed", err);
        // Fallback to download if share fails (or user cancels)
      }
    }

    // Fallback: Direct Download
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onClose();
  };

  const handleRetake = () => {
    setRecordedVideoUrl(null);
    chunksRef.current = [];
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-200">
      
      {/* Top Controls: Resolution & Close */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
         {!recordedVideoUrl && (
             <div className="bg-black/30 backdrop-blur-md rounded-full p-1 flex border border-white/20">
                 {(['480p', '720p', '1080p'] as Resolution[]).map(res => (
                     <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${resolution === res ? 'bg-brand-yellow text-black' : 'text-white'}`}
                     >
                         {res}
                     </button>
                 ))}
             </div>
         )}
         <button 
            onClick={onClose}
            className="bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center font-bold ml-auto"
         >
            ✕
         </button>
      </div>

      <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
        {permissionError ? (
            <div className="text-white text-center p-6">{permissionError}</div>
        ) : recordedVideoUrl ? (
          <video 
            src={recordedVideoUrl} 
            controls 
            className="w-full h-full object-contain" 
            autoPlay 
          />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
          />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end items-center gap-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20">
        
        {!recordedVideoUrl ? (
            <div className="flex items-center justify-center gap-12 w-full">
                 {/* Flip Camera Button */}
                 <button 
                    onClick={toggleCamera}
                    disabled={isRecording}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center active:scale-90 transition-all text-2xl border border-white/30"
                 >
                    🔄
                 </button>

                 {/* Record Button */}
                 <button 
                    onClick={isRecording ? stopRecording : startRecordingRef}
                    className={`
                        w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all
                        ${isRecording ? 'bg-red-500 scale-110' : 'bg-transparent hover:bg-white/10'}
                    `}
                 >
                    <div className={`transition-all duration-300 ${isRecording ? 'w-8 h-8 bg-white rounded-sm' : 'w-16 h-16 bg-red-500 rounded-full'}`}></div>
                 </button>

                 {/* Spacer to center record button */}
                 <div className="w-12"></div> 
            </div>
        ) : (
            <div className="flex gap-4 w-full max-w-xs">
              <button 
                onClick={handleRetake}
                className="flex-1 bg-white/20 backdrop-blur text-white py-3 rounded-full font-bold border-2 border-white/50"
              >
                重拍
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 bg-brand-yellow text-black py-3 rounded-full font-bold border-2 border-black shadow-cartoon"
              >
                保存到相册
              </button>
            </div>
        )}
        
        <p className="text-white/60 text-xs font-sans">
            {recordedVideoUrl ? "提示: 选择'存储视频'可直接保存到相册" : isRecording ? "正在录制..." : "点击红色按钮开始"}
        </p>
      </div>
    </div>
  );
};

export default VideoRecorder;