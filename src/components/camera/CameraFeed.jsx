import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Webcam from 'react-webcam';
import { FaVideo, FaVideoSlash, FaCamera, FaStop, FaSpinner } from 'react-icons/fa';
import { toggleCamera } from '../../store/slices/uiSlice';

const CameraFeed = () => {
  const dispatch = useDispatch();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  const { cameraEnabled } = useSelector((state) => state.ui);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedText, setDetectedText] = useState('');

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  const handleCameraToggle = () => {
    dispatch(toggleCamera());
  };

  const captureFrame = () => {
    if (webcamRef.current && cameraEnabled) {
      const imageSrc = webcamRef.current.getScreenshot();
      // In real app, send to backend for sign recognition
      return imageSrc;
    }
    return null;
  };

  const startSignDetection = () => {
    if (!cameraEnabled) return;
    
    setIsDetecting(true);
    // In real app, start continuous detection
  };

  const stopSignDetection = () => {
    setIsDetecting(false);
  };

  useEffect(() => {
    let interval;
    if (isDetecting && cameraEnabled) {
      interval = setInterval(() => {
        captureFrame();
        // Simulate detection
        if (Math.random() > 0.7) {
          setDetectedText('Hello');
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDetecting, cameraEnabled]);

  return (
    <div className="bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCameraToggle}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${cameraEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-deafcomm-blue hover:bg-deafcomm-purple'} text-white transition-colors`}
            >
              {cameraEnabled ? (
                <>
                  <FaVideoSlash />
                  <span>Turn Off Camera</span>
                </>
              ) : (
                <>
                  <FaVideo />
                  <span>Turn On Camera</span>
                </>
              )}
            </button>

            {cameraEnabled && (
              <button
                onClick={isDetecting ? stopSignDetection : startSignDetection}
                disabled={isLoading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDetecting ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors disabled:opacity-50`}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : isDetecting ? (
                  <>
                    <FaStop />
                    <span>Stop Detection</span>
                  </>
                ) : (
                  <>
                    <FaCamera />
                    <span>Start Sign Detection</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Detected Text Display */}
          {detectedText && (
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="text-sm text-gray-600">Detected: </span>
              <span className="font-semibold text-deafcomm-blue">{detectedText}</span>
            </div>
          )}
        </div>

        {/* Camera Feed */}
        <div className="relative rounded-xl overflow-hidden bg-black">
          {cameraEnabled ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              
              {/* Overlay Instructions */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="inline-block bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm">Sign clearly in front of the camera</p>
                  <p className="text-xs opacity-75">Keep your hands visible and well-lit</p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-4xl mb-4">📷</div>
                <p className="text-xl font-medium mb-2">Camera is disabled</p>
                <p className="text-gray-400">Turn on camera to start signing</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${cameraEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Camera {cameraEnabled ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isDetecting ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span>Detection {isDetecting ? 'Running' : 'Ready'}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            Sign language recognition powered by AI
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;