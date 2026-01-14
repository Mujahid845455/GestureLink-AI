// src/components/chat/CameraCapture.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaTimes, FaRedo, FaPaperPlane } from 'react-icons/fa';

const CameraCapture = ({ onCapture, onClose }) => {
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Start camera
    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err) {
            console.error('Camera error:', err);
            setError('Could not access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const sendPhoto = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {capturedImage ? 'Preview Photo' : 'Take Photo'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <FaTimes className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Camera/Preview Area */}
                <div className="relative bg-black aspect-video">
                    {error ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white p-6">
                                <FaCamera className="text-6xl mx-auto mb-4 opacity-50" />
                                <p className="text-lg">{error}</p>
                            </div>
                        </div>
                    ) : capturedImage ? (
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Hidden canvas for capture */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                {/* Controls */}
                <div className="p-4 flex items-center justify-center space-x-4">
                    {capturedImage ? (
                        <>
                            <button
                                onClick={retake}
                                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium flex items-center space-x-2 transition-all hover:scale-105 active:scale-95"
                            >
                                <FaRedo />
                                <span>Retake</span>
                            </button>
                            <button
                                onClick={sendPhoto}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg text-white rounded-xl font-medium flex items-center space-x-2 transition-all hover:scale-105 active:scale-95"
                            >
                                <FaPaperPlane />
                                <span>Send Photo</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={capturePhoto}
                            disabled={!stream || error}
                            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg text-white rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaCamera className="text-2xl" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraCapture;
