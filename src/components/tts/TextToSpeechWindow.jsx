// src/components/tts/TextToSpeechWindow.jsx
import React, { useState, useEffect } from 'react';
import { FaVolumeUp, FaArrowLeft } from 'react-icons/fa';

const TextToSpeechWindow = ({ onBack }) => {
    // Text-to-Speech state
    const [ttsText, setTtsText] = useState('');
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [speechRate, setSpeechRate] = useState(1);
    const [speechPitch, setSpeechPitch] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Load available voices for TTS
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Filter for English voices
            const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
            setAvailableVoices(englishVoices);

            // Set default voice (prefer female US English)
            const defaultVoice = englishVoices.find(v => v.name.includes('Female') && v.lang === 'en-US')
                || englishVoices.find(v => v.lang === 'en-US')
                || englishVoices[0];
            setSelectedVoice(defaultVoice);
        };

        loadVoices();
        // Chrome loads voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // Text-to-Speech functions
    const handleSpeak = () => {
        if (!ttsText.trim()) return;

        const synth = window.speechSynthesis;
        synth.cancel(); // Stop any ongoing speech

        const utterance = new SpeechSynthesisUtterance(ttsText);
        utterance.voice = selectedVoice;
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech error:', event);
            setIsSpeaking(false);
            setIsPaused(false);
        };

        synth.speak(utterance);
    };

    const handlePause = () => {
        window.speechSynthesis.pause();
        setIsPaused(true);
    };

    const handleResume = () => {
        window.speechSynthesis.resume();
        setIsPaused(false);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    const handleClearText = () => {
        setTtsText('');
    };

    const handleSampleText = () => {
        setTtsText('Hello! This is a sample text for testing the text-to-speech feature. You can adjust the voice, speed, and pitch to customize the speech output.');
    };

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
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white">
                            <FaVolumeUp className="text-xl md:text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Text-to-Speech</h2>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Convert text to natural speech</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Text Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Enter Text
                        </label>
                        <textarea
                            value={ttsText}
                            onChange={(e) => setTtsText(e.target.value)}
                            placeholder="Enter text to convert to speech..."
                            className="w-full h-48 md:h-64 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
                            maxLength={500}
                        />
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                {ttsText.length}/500 characters
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSampleText}
                                    className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    📝 Sample
                                </button>
                                <button
                                    onClick={handleClearText}
                                    disabled={!ttsText}
                                    className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    🗑️ Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Voice Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Voice
                        </label>
                        <select
                            value={selectedVoice?.name || ''}
                            onChange={(e) => {
                                const voice = availableVoices.find(v => v.name === e.target.value);
                                setSelectedVoice(voice);
                            }}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 text-gray-900 dark:text-white"
                        >
                            {availableVoices.map((voice) => (
                                <option key={voice.name} value={voice.name}>
                                    {voice.name} ({voice.lang})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Speed Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Speed
                            </label>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{speechRate.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={speechRate}
                            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>0.5x</span>
                            <span>1.0x</span>
                            <span>2.0x</span>
                        </div>
                    </div>

                    {/* Pitch Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Pitch
                            </label>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{speechPitch.toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={speechPitch}
                            onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>Low</span>
                            <span>Normal</span>
                            <span>High</span>
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4">
                        <button
                            onClick={handleSpeak}
                            disabled={!ttsText.trim() || isSpeaking}
                            className="flex-1 min-w-[140px] px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium text-base md:text-lg"
                        >
                            🔊 Speak
                        </button>
                        {isSpeaking && !isPaused && (
                            <button
                                onClick={handlePause}
                                className="px-6 py-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium text-base md:text-lg"
                            >
                                ⏸️ Pause
                            </button>
                        )}
                        {isSpeaking && isPaused && (
                            <button
                                onClick={handleResume}
                                className="px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium text-base md:text-lg"
                            >
                                ▶️ Resume
                            </button>
                        )}
                        {isSpeaking && (
                            <button
                                onClick={handleStop}
                                className="px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium text-base md:text-lg"
                            >
                                ⏹️ Stop
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextToSpeechWindow;
