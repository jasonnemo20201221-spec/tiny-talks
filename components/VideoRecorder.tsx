import React, { useState, useRef, useEffect } from 'react';

interface VideoRecorderProps {
  onClose: () => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setPermissionError("无法访问摄像头或麦克风，请检查权限设置。");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [recordedVideoUrl]); // Re-init camera if we discard the video

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
        // Create blob from chunks
        const blob = new Blob(chunks, { type: 'video/webm' });
        // In a real effect, we'd use the current chunks, but state updates are async.
        // For simplicity in this demo, we rely on the final aggregation or reconstruct it.
        // Actually, let's fix the closure issue by not relying on state inside onstop directly 
        // or by using a Ref for chunks if needed. 
        // Better approach for React:
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Need a small delay to ensure the last chunk is pushed
      setTimeout(() => {
         const blob = new Blob(chunks, { type: 'video/webm' });
         const url = URL.createObjectURL(blob);
         setRecordedVideoUrl(url);
         setChunks([]); // Reset chunks
      }, 100);
    }
  };
  
  // Fix: The onstop handler above captures the initial empty 'chunks' state due to closure.
  // We need to handle blob creation differently. 
  // Let's rely on the `chunks` state variable which updates as we record.
  // But strictly speaking, `ondataavailable` updates state. 
  // Let's use a simpler approach: Just collect chunks in a ref during recording.
  const chunksRef = useRef<Blob[]>([]);

  const startRecordingRef = () => {
      if (!videoRef.current?.srcObject) return;
      chunksRef.current = [];
      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
  };

  const handleSave = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `tiny-talks-video-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert("视频已保存到您的设备下载文件夹！");
      onClose();
    }
  };

  const handleRetake = () => {
    setRecordedVideoUrl(null);
    chunksRef.current = [];
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-black rounded-2xl overflow-hidden border-2 border-gray-800 shadow-2xl">
        
        {permissionError ? (
            <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
                {permissionError}
            </div>
        ) : recordedVideoUrl ? (
          <video 
            src={recordedVideoUrl} 
            controls 
            className="w-full h-full object-cover" 
            autoPlay 
          />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
          />
        )}

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center font-bold z-20"
        >
          ✕
        </button>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-8 flex justify-center items-center gap-8 bg-gradient-to-t from-black/80 to-transparent">
          
          {!recordedVideoUrl ? (
            // Recording Controls
            <button 
              onClick={isRecording ? stopRecording : startRecordingRef}
              className={`
                w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all
                ${isRecording ? 'bg-red-500 scale-110' : 'bg-transparent hover:bg-white/10'}
              `}
            >
              <div className={`transition-all duration-300 ${isRecording ? 'w-8 h-8 bg-white rounded-sm' : 'w-16 h-16 bg-red-500 rounded-full'}`}></div>
            </button>
          ) : (
            // Preview Controls
            <>
              <button 
                onClick={handleRetake}
                className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-full font-bold border-2 border-white/50"
              >
                重拍
              </button>
              <button 
                onClick={handleSave}
                className="bg-brand-yellow text-black px-8 py-3 rounded-full font-bold border-2 border-black shadow-cartoon hover:translate-y-[-2px] transition-all"
              >
                保存视频
              </button>
            </>
          )}
        </div>
      </div>
      <p className="text-white/50 mt-4 text-sm font-sans">
        {recordedVideoUrl ? "预览您的美好瞬间" : isRecording ? "正在录制..." : "点击红色按钮开始录像"}
      </p>
    </div>
  );
};

export default VideoRecorder;