import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, RefreshCw, X, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onClose: () => void;
  language: 'bn' | 'en';
}

// Sample presets for quick testing
const PRESET_MATH_EXAMPLES = [
  {
    titleBn: 'দ্বিঘাত সমীকরণ (হাতের লেখা স্টাইল)',
    titleEn: 'Quadratic Equation (Handwritten style)',
    prompt: '2x^2 - 7x + 3 = 0 সমীকরণটি সমাধান করো',
    category: 'Algebra',
    svgColor: '#4f46e5',
  },
  {
    titleBn: 'ত্রিকোণমিতিক প্রমাণ',
    titleEn: 'Trig Identity Proof',
    prompt: 'প্রমাণ করো: (1 + tan^2 A) / (1 + cot^2 A) = tan^2 A',
    category: 'Trigonometry',
    svgColor: '#059669',
  },
  {
    titleBn: 'ক্যালকুলাস ইন্টিগ্রেশন',
    titleEn: 'Calculus Integration',
    prompt: 'মান নির্ণয় করো: \\int (3x^2 + 4x - 5) dx',
    category: 'Calculus',
    svgColor: '#d97706',
  },
  {
    titleBn: 'জ্যামিতিক ক্ষেত্রফল',
    titleEn: 'Geometry Circle & Triangle',
    prompt: 'একটি সমবাহু ত্রিভুজের বাহুর দৈর্ঘ্য 6 সেমি হলে ক্ষেত্রফল কত?',
    category: 'Geometry',
    svgColor: '#db2777',
  }
];

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, language }) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('upload');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera
  const startCamera = async (facing: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        language === 'bn'
          ? 'ক্যামেরা চালু করা যায়নি। অনুগ্রহ করে ব্রাউজারে ক্যামেরার অনুমতি দিন অথবা ফটো আপলোড অপশন ব্যবহার করুন।'
          : 'Could not access camera. Please allow camera permissions or upload an image.'
      );
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, facingMode]);

  const snapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCapturedImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  // Generate an instant handwritten-looking SVG image for sample problems
  const generateSampleImage = (prompt: string, category: string, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // grid notebook lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let y = 30; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // margin line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 0);
      ctx.lineTo(80, canvas.height);
      ctx.stroke();

      // Badge
      ctx.fillStyle = color;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(`[ ${category.toUpperCase()} ]`, 100, 55);

      // Text math problem
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 26px "Hind Siliguri", "Inter", sans-serif';
      ctx.fillText(prompt, 100, 120);

      // Small instruction
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "Hind Siliguri", sans-serif';
      ctx.fillText('ধাপে ধাপে সমাধান এবং চিত্রসহ বিশ্লেষণ করুন।', 100, 180);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              📸
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">
                {language === 'bn' ? 'গণিতের ফটো তুলুন বা আপলোড করুন' : 'Snap Math Photo or Upload'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'বইয়ের পৃষ্ঠা, খাতার হাতের লেখা বা স্ক্রিনশট স্ক্যান করুন'
                  : 'Scan textbook page, notebook handwriting or screenshots'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Mode Switcher */}
          {!capturedImage && (
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setMode('upload')}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition ${
                  mode === 'upload'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                {language === 'bn' ? 'ফাইল / গ্যালারি' : 'Upload File'}
              </button>
              <button
                onClick={() => setMode('camera')}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition ${
                  mode === 'camera'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-4 h-4 mr-2" />
                {language === 'bn' ? 'লাইভ ক্যামেরা' : 'Live Camera'}
              </button>
            </div>
          )}

          {cameraError && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs">
              {cameraError}
            </div>
          )}

          {/* Captured Preview */}
          {capturedImage ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center max-h-[350px]">
                <img
                  src={capturedImage}
                  alt="Captured Math"
                  className="max-h-[350px] w-auto object-contain rounded-lg"
                />
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    if (mode === 'camera') startCamera(facingMode);
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg text-xs backdrop-blur flex items-center space-x-1.5 border border-white/20 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পুনরায় তুলুন' : 'Retake'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    if (mode === 'camera') startCamera(facingMode);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সমাধান করুন' : 'Confirm & Solve'}</span>
                </button>
              </div>
            </div>
          ) : mode === 'camera' ? (
            /* Camera Live Feed */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Target overlay guide */}
                <div className="absolute inset-8 border-2 border-dashed border-indigo-400/60 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-black/60 px-3 py-1 rounded text-[11px] text-indigo-200">
                    {language === 'bn'
                      ? 'গণিত সমস্যাটি ফ্রেমের মাঝে রাখুন'
                      : 'Align math problem inside the frame'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() =>
                    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                  }
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition"
                  title="Switch camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={snapPhoto}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border-4 border-slate-900 shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition"
                >
                  <Camera className="w-7 h-7" />
                </button>
              </div>
            </div>
          ) : (
            /* Upload Mode */
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-900/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 flex items-center justify-center mb-3 transition">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h4 className="text-white font-medium text-base mb-1">
                  {language === 'bn'
                    ? 'ফটো ড্রপ করুন অথবা ক্লিক করে নির্বাচন করুন'
                    : 'Drop photo or click to browse'}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  {language === 'bn'
                    ? 'JPG, PNG, WebP ফরম্যাটের পরিষ্কার ছবি আপলোড করুন'
                    : 'Upload clear photos of handwriting, textbook problems or formulas'}
                </p>
              </div>

              {/* Sample test presets */}
              <div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {language === 'bn'
                      ? 'অথবা ডেমো নমুনা দিয়ে সরাসরি পরীক্ষা করুন'
                      : 'Or test instantly with sample math cards'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_MATH_EXAMPLES.map((example, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        generateSampleImage(
                          example.prompt,
                          example.category,
                          example.svgColor
                        )
                      }
                      className="text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 transition group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                          {example.category}
                        </span>
                        <span className="text-[11px] text-slate-500 group-hover:text-indigo-400 transition">
                          {language === 'bn' ? 'পরীক্ষা করুন →' : 'Try →'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium truncate">
                        {language === 'bn' ? example.titleBn : example.titleEn}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
