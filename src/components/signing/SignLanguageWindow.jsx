// src/components/signing/SignLanguageWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaCamera, FaStop } from 'react-icons/fa';
import io from 'socket.io-client';

const SignLanguageWindow = ({ onBack }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentSign, setCurrentSign] = useState(null);
    const [confidence, setConfidence] = useState(0);
    const [predictionHistory, setPredictionHistory] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    const intervalRef = useRef(null);

    // Connect to Python backend on port 7001
    useEffect(() => {
        console.log('Connecting to Python backend...');
        const socket = io('http://localhost:7001', {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('✅ Connected to Python backend');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('🔴 Disconnected from Python backend');
            setIsConnected(false);
        });

        socket.on('sign_prediction', (data) => {
            console.log('Sign prediction received:', data);
            setCurrentSign(data.word);
            setConfidence(data.confidence);

            // Add to history (keep last 10)
            setPredictionHistory(prev => {
                const newHistory = [{
                    word: data.word,
                    confidence: data.confidence,
                    timestamp: new Date().toLocaleTimeString()
                }, ...prev];
                return newHistory.slice(0, 10);
            });
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, []);

    // Capture and send frames to Python backend
    const startFrameCapture = () => {
        if (!canvasRef.current || !videoRef.current || !socketRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Send frames every 500ms
        intervalRef.current = setInterval(() => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                // Draw video frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to base64
                const frameData = canvas.toDataURL('image/jpeg', 0.8);

                // Send to Python backend
                if (socketRef.current && socketRef.current.connected) {
                    socketRef.current.emit('process_frame', {
                        frame: frameData,
                        timestamp: Date.now()
                    });
                }
            }
        }, 500); // Send 2 frames per second
    };

    const stopFrameCapture = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Start webcam
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsActive(true);

                // Wait for video to be ready, then start frame capture
                videoRef.current.onloadedmetadata = () => {
                    startFrameCapture();
                };
            }
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Could not access webcam. Please check permissions.');
        }
    };

    // Stop webcam
    const stopCamera = () => {
        stopFrameCapture();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setIsActive(false);
            setCurrentSign(null);
            setConfidence(0);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 md:px-6 md:py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                            <FaCamera className="text-xl md:text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Sign Language Recognition</h2>
                            <div className="flex items-center space-x-2">
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Real-time word detection</p>
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected to backend' : 'Disconnected'}></span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isActive ? (
                            <button
                                onClick={startCamera}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium flex items-center space-x-2"
                            >
                                <FaCamera />
                                <span className="hidden md:inline">Start Camera</span>
                            </button>
                        ) : (
                            <button
                                onClick={stopCamera}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium flex items-center space-x-2"
                            >
                                <FaStop />
                                <span className="hidden md:inline">Stop Camera</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Video Feed */}
                        <div className="lg:col-span-2">
                            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: '500px' }}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full"
                                    style={{ height: '500px', objectFit: 'cover' }}
                                />

                                {!isActive && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95">
                                        <div className="text-center space-y-8 py-12">
                                            <FaCamera className="text-8xl text-gray-400 mx-auto" />
                                            <p className="text-white text-2xl font-medium">Camera is off</p>
                                            <button
                                                onClick={startCamera}
                                                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium"
                                            >
                                                Start Camera
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Current Prediction Overlay */}
                                {isActive && currentSign && (
                                    <div className="absolute top-4 left-4 right-4">
                                        <div className="bg-gradient-to-r from-blue-500/90 to-purple-600/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-blue-100 mb-1">Current Sign</p>
                                                    <h3 className="text-2xl font-bold text-white">{currentSign}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-blue-100 mb-1">Confidence</p>
                                                    <p className="text-2xl font-bold text-white">{(confidence * 100).toFixed(0)}%</p>
                                                </div>
                                            </div>
                                            {/* Confidence Bar */}
                                            <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-white rounded-full transition-all duration-300"
                                                    style={{ width: `${confidence * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Prediction History & Instructions */}
                        <div className="space-y-6">
                            {/* Prediction History */}
                            {predictionHistory.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Recent Predictions</h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {predictionHistory.slice(0, 5).map((prediction, index) => (
                                            <div
                                                key={index}
                                                className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{prediction.word}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{prediction.timestamp}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                                                            {(prediction.confidence * 100).toFixed(0)}%
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${prediction.confidence * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Instructions */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                                <h3 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-3">Supported Signs</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        "Hello", "Goodbye", "I love you", "Yes", "No", "Please",
                                        "Thank you", "Sorry", "Help", "OK", "Good", "Bad"
                                    ].map((sign) => (
                                        <div
                                            key={sign}
                                            className="px-2 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-center text-xs font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            {sign}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                                    💡 <strong>Tip:</strong> Python backend must be running!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hidden canvas for frame capture */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            </div>
        </div>
    );
};

export default SignLanguageWindow;
