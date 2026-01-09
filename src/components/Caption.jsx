// import useLandmarks from "../hooks/useLandmarks";

// export default function Caption() {
//   const data = useLandmarks();

//   let caption = "No gesture";

//   if (data?.pose?.RIGHT_WRIST && data?.pose?.RIGHT_SHOULDER) {
//     if (data.pose.RIGHT_WRIST.y < data.pose.RIGHT_SHOULDER.y) {
//       caption = "Right hand raised ✋";
//     }
//   }

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>AI Caption</h2>
//       <p>{caption}</p>
//     </div>
//   );
// }

//TRY - 2
// import { useState, useEffect } from "react";
// import useLandmarks from "../hooks/useLandmarks";

// export default function Caption() {
//   const data = useLandmarks();
//   const [caption, setCaption] = useState("No gesture detected");
//   const [gesture, setGesture] = useState(null);

//   useEffect(() => {
//     if (!data?.pose) {
//       setCaption("Waiting for camera...");
//       setGesture(null);
//       return;
//     }

//     const p = data.pose;

//     // ===== GESTURE DETECTION LOGIC =====
    
//     // Both hands raised
//     if (
//       p.LEFT_WRIST?.y < p.LEFT_SHOULDER?.y &&
//       p.RIGHT_WRIST?.y < p.RIGHT_SHOULDER?.y
//     ) {
//       setCaption("🙌 Both hands raised!");
//       setGesture("both_up");
//       return;
//     }

//     // Right hand raised
//     if (p.RIGHT_WRIST?.y < p.RIGHT_SHOULDER?.y) {
//       setCaption("✋ Right hand raised");
//       setGesture("right_up");
//       return;
//     }

//     // Left hand raised
//     if (p.LEFT_WRIST?.y < p.LEFT_SHOULDER?.y) {
//       setCaption("✋ Left hand raised");
//       setGesture("left_up");
//       return;
//     }

//     // Arms crossed (wrists close to opposite shoulders)
//     if (
//       p.LEFT_WRIST &&
//       p.RIGHT_WRIST &&
//       p.LEFT_SHOULDER &&
//       p.RIGHT_SHOULDER
//     ) {
//       const leftToRight = Math.abs(p.LEFT_WRIST.x - p.RIGHT_SHOULDER.x);
//       const rightToLeft = Math.abs(p.RIGHT_WRIST.x - p.LEFT_SHOULDER.x);
      
//       if (leftToRight < 0.15 && rightToLeft < 0.15) {
//         setCaption("❌ Arms crossed");
//         setGesture("crossed");
//         return;
//       }
//     }

//     // Arms wide (T-pose)
//     if (
//       p.LEFT_WRIST &&
//       p.RIGHT_WRIST &&
//       p.LEFT_SHOULDER &&
//       p.RIGHT_SHOULDER
//     ) {
//       const leftDist = Math.abs(p.LEFT_WRIST.y - p.LEFT_SHOULDER.y);
//       const rightDist = Math.abs(p.RIGHT_WRIST.y - p.RIGHT_SHOULDER.y);
      
//       if (leftDist < 0.15 && rightDist < 0.15) {
//         setCaption("🤸 T-Pose detected");
//         setGesture("t_pose");
//         return;
//       }
//     }

//     // Default
//     setCaption("👋 Move your arms!");
//     setGesture(null);
//   }, [data]);

//   return (
//     <div style={{
//       padding: "30px",
//       background: "#2a2a2a",
//       color: "#fff",
//       minHeight: "100vh",
//       display: "flex",
//       flexDirection: "column",
//       gap: "20px"
//     }}>
//       <h2 style={{ margin: 0, fontSize: "28px" }}>AI Caption</h2>
      
//       <div style={{
//         padding: "20px",
//         background: gesture ? "#1e5128" : "#333",
//         borderRadius: "8px",
//         fontSize: "20px",
//         fontWeight: "600",
//         transition: "all 0.3s ease"
//       }}>
//         {caption}
//       </div>

//       {data?.pose && (
//         <div style={{
//           padding: "15px",
//           background: "#1a1a1a",
//           borderRadius: "8px",
//           fontSize: "14px",
//           fontFamily: "monospace"
//         }}>
//           <div>✅ Live tracking active</div>
//           <div>📊 Landmarks: {Object.keys(data.pose).length}</div>
//           {data.left_hand && (
//             <div>🤚 Left hand: {Object.keys(data.left_hand).length} points</div>
//           )}
//           {data.right_hand && (
//             <div>🤚 Right hand: {Object.keys(data.right_hand).length} points</div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }



//TRY - 3
// import { useState, useEffect } from "react";
// import useLandmarks from "../hooks/useLandmarks";
// import useSign from "../hooks/useSign";

// export default function Caption() {
//   const data = useLandmarks();
//   const sign = useSign();

//   const [caption, setCaption] = useState("No gesture detected");
//   const [gesture, setGesture] = useState(null);

//   // =============================
//   // BODY / POSE BASED CAPTIONS
//   // =============================
//   useEffect(() => {
//     if (!data?.pose) {
//       setCaption("Waiting for camera...");
//       setGesture(null);
//       return;
//     }

//     const p = data.pose;

//     // Both hands raised
//     if (
//       p.LEFT_WRIST?.y < p.LEFT_SHOULDER?.y &&
//       p.RIGHT_WRIST?.y < p.RIGHT_SHOULDER?.y
//     ) {
//       setCaption("🙌 Both hands raised!");
//       setGesture("both_up");
//       return;
//     }

//     // Right hand raised
//     if (p.RIGHT_WRIST?.y < p.RIGHT_SHOULDER?.y) {
//       setCaption("✋ Right hand raised");
//       setGesture("right_up");
//       return;
//     }

//     // Left hand raised
//     if (p.LEFT_WRIST?.y < p.LEFT_SHOULDER?.y) {
//       setCaption("✋ Left hand raised");
//       setGesture("left_up");
//       return;
//     }

//     // Arms crossed
//     if (
//       p.LEFT_WRIST &&
//       p.RIGHT_WRIST &&
//       p.LEFT_SHOULDER &&
//       p.RIGHT_SHOULDER
//     ) {
//       const leftToRight = Math.abs(p.LEFT_WRIST.x - p.RIGHT_SHOULDER.x);
//       const rightToLeft = Math.abs(p.RIGHT_WRIST.x - p.LEFT_SHOULDER.x);

//       if (leftToRight < 0.15 && rightToLeft < 0.15) {
//         setCaption("❌ Arms crossed");
//         setGesture("crossed");
//         return;
//       }
//     }

//     // T-Pose
//     if (
//       p.LEFT_WRIST &&
//       p.RIGHT_WRIST &&
//       p.LEFT_SHOULDER &&
//       p.RIGHT_SHOULDER
//     ) {
//       const leftDist = Math.abs(p.LEFT_WRIST.y - p.LEFT_SHOULDER.y);
//       const rightDist = Math.abs(p.RIGHT_WRIST.y - p.RIGHT_SHOULDER.y);

//       if (leftDist < 0.15 && rightDist < 0.15) {
//         setCaption("🤸 T-Pose detected");
//         setGesture("t_pose");
//         return;
//       }
//     }

//     setCaption("👋 Move your arms!");
//     setGesture(null);
//   }, [data]);

//   // =============================
//   // UI
//   // =============================
//   return (
//     <div
//       style={{
//         padding: "30px",
//         background: "#2a2a2a",
//         color: "#fff",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         gap: "20px",
//       }}
//     >
//       <h2 style={{ margin: 0, fontSize: "28px" }}>AI Caption</h2>

//       {/* BODY GESTURE CAPTION */}
//       <div
//         style={{
//           padding: "20px",
//           background: gesture ? "#1e5128" : "#333",
//           borderRadius: "8px",
//           fontSize: "20px",
//           fontWeight: "600",
//           transition: "all 0.3s ease",
//         }}
//       >
//         {caption}
//       </div>

//       {/* SIGN LANGUAGE RESULT */}
//       <div
//         style={{
//           padding: "20px",
//           background: "#111",
//           borderRadius: "10px",
//           border: "1px solid #00ffcc",
//         }}
//       >
//         <div style={{ fontSize: "14px", color: "#aaa" }}>
//           🤟 Sign Language
//         </div>

//         {!sign && (
//           <div style={{ color: "#555", marginTop: "10px" }}>
//             Show hand to camera…
//           </div>
//         )}

//         {sign && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "baseline",
//               gap: "16px",
//               marginTop: "10px",
//             }}
//           >
//             <span
//               style={{
//                 fontSize: "72px",
//                 fontWeight: "bold",
//                 color: "#00ffcc",
//               }}
//             >
//               {sign.letter}
//             </span>
//             <span style={{ fontSize: "18px", color: "#aaa" }}>
//               {(sign.confidence * 100).toFixed(1)}%
//             </span>
//           </div>
//         )}
//       </div>

//       {/* DEBUG INFO */}
//       {data?.pose && (
//         <div
//           style={{
//             padding: "15px",
//             background: "#1a1a1a",
//             borderRadius: "8px",
//             fontSize: "14px",
//             fontFamily: "monospace",
//           }}
//         >
//           <div>✅ Live tracking active</div>
//           <div>📊 Pose landmarks: {Object.keys(data.pose).length}</div>
//           {data.left_hand && (
//             <div>🤚 Left hand: {Object.keys(data.left_hand).length}</div>
//           )}
//           {data.right_hand && (
//             <div>🤚 Right hand: {Object.keys(data.right_hand).length}</div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


//TRY - 4
// components/Caption.jsx
import { useState, useEffect, useRef } from "react";
import useLandmarks from "../hooks/useLandmarks";
import useSign from "../hooks/useSign";
import './Caption.css'

export default function Caption() {
  const data = useLandmarks();
  const sign = useSign();
  
  const [caption, setCaption] = useState("Waiting for camera...");
  const [gesture, setGesture] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const lastSignRef = useRef(null);
  const lastSignTimeRef = useRef(null);
  const wordTimeoutRef = useRef(null);

  // =============================
  // SIGN PREDICTION HANDLING
  // =============================
  useEffect(() => {
    if (!sign) return;

    const now = Date.now();
    
    // Debounce predictions to avoid flickering
    if (lastSignRef.current && lastSignTimeRef.current) {
      const timeDiff = now - lastSignTimeRef.current;
      const isSameSign = lastSignRef.current.letter === sign.letter;
      
      // If same sign within 500ms, don't update too frequently
      if (isSameSign && timeDiff < 500) {
        return;
      }
    }

    lastSignRef.current = sign;
    lastSignTimeRef.current = now;

    // Add to history if confidence is above threshold
    if (sign.confidence >= confidenceThreshold) {
      setPredictionHistory(prev => {
        const newHistory = [...prev, sign];
        // Keep only last 10 predictions
        return newHistory.slice(-10);
      });
    }

    // Update caption based on sign
    if (sign.confidence >= confidenceThreshold) {
      if (sign.letter === "del") {
        setCaption("🗑️ Delete last character");
      } else if (sign.letter === "space") {
        setCaption("␣ Space added");
      } else if (sign.letter === "nothing") {
        setCaption("👋 No sign detected");
      } else {
        setCaption(`✅ Detected letter: ${sign.letter}`);
      }
    } else {
      setCaption("❓ Low confidence sign");
    }

  }, [sign, confidenceThreshold]);

  // =============================
  // WORD FORMATION LOGIC
  // =============================
  useEffect(() => {
    if (!sign || sign.confidence < confidenceThreshold) return;

    if (sign.letter === "space") {
      // Add space to current word
      setCurrentWord(prev => prev + " ");
      setCaption("␣ Space added to word");
      return;
    }

    if (sign.letter === "del") {
      // Delete last character
      setCurrentWord(prev => prev.slice(0, -1));
      setCaption("🗑️ Deleted last character");
      return;
    }

    if (sign.letter !== "nothing") {
      // Add letter to current word
      setCurrentWord(prev => prev + sign.letter);
      
      // Reset timeout for word completion
      if (wordTimeoutRef.current) {
        clearTimeout(wordTimeoutRef.current);
      }
      
      // Set timeout to clear word after 3 seconds of inactivity
      wordTimeoutRef.current = setTimeout(() => {
        if (currentWord.trim().length > 0) {
          setCaption(`📝 Word completed: ${currentWord}`);
        }
      }, 3000);
    }

    return () => {
      if (wordTimeoutRef.current) {
        clearTimeout(wordTimeoutRef.current);
      }
    };
  }, [sign, currentWord, confidenceThreshold]);

  // =============================
  // BODY GESTURE DETECTION
  // =============================
  useEffect(() => {
    if (!data?.pose) return;

    const p = data.pose;

    // Both hands raised 🙌
    if (
      p.LEFT_WRIST?.y < p.LEFT_SHOULDER?.y &&
      p.RIGHT_WRIST?.y < p.RIGHT_SHOULDER?.y
    ) {
      setCaption("🙌 Both hands raised!");
      setGesture("both_up");
      return;
    }

    // Right hand raised ✋
    if (p.RIGHT_WRIST?.y < p.RIGHT_SHOULDER?.y) {
      setCaption("✋ Right hand raised");
      setGesture("right_up");
      return;
    }

    // Left hand raised ✋
    if (p.LEFT_WRIST?.y < p.LEFT_SHOULDER?.y) {
      setCaption("✋ Left hand raised");
      setGesture("left_up");
      return;
    }

    // Arms crossed ❌
    if (
      p.LEFT_WRIST &&
      p.RIGHT_WRIST &&
      p.LEFT_SHOULDER &&
      p.RIGHT_SHOULDER
    ) {
      const leftToRight = Math.abs(p.LEFT_WRIST.x - p.RIGHT_SHOULDER.x);
      const rightToLeft = Math.abs(p.RIGHT_WRIST.x - p.LEFT_SHOULDER.x);

      if (leftToRight < 0.15 && rightToLeft < 0.15) {
        setCaption("❌ Arms crossed");
        setGesture("crossed");
        return;
      }
    }

    // T-Pose 🤸
    if (
      p.LEFT_WRIST &&
      p.RIGHT_WRIST &&
      p.LEFT_SHOULDER &&
      p.RIGHT_SHOULDER
    ) {
      const leftDist = Math.abs(p.LEFT_WRIST.y - p.LEFT_SHOULDER.y);
      const rightDist = Math.abs(p.RIGHT_WRIST.y - p.RIGHT_SHOULDER.y);

      if (leftDist < 0.15 && rightDist < 0.15) {
        setCaption("🤸 T-Pose detected");
        setGesture("t_pose");
        return;
      }
    }

    setGesture(null);
  }, [data]);

  // =============================
  // HELPER FUNCTIONS
  // =============================
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return "#00ff88";
    if (confidence >= 0.7) return "#ffcc00";
    return "#ff5555";
  };

  const clearCurrentWord = () => {
    setCurrentWord("");
    setCaption("📝 Word cleared");
  };

  const startRecording = () => {
    setIsRecording(true);
    setCurrentWord("");
    setPredictionHistory([]);
    setCaption("🎤 Recording started...");
  };

  const stopRecording = () => {
    setIsRecording(false);
    setCaption(`📝 Recording stopped. Final word: ${currentWord}`);
  };

  // =============================
  // RENDER
  // =============================
  return (
    <div className="caption-container">
      <div className="caption-header">
        <h2>🤖 AI Sign Language Translator</h2>
        <p className="subtitle">Real-time ASL letter detection and translation</p>
      </div>

      {/* CURRENT PREDICTION SECTION */}
      <div className="current-prediction-section">
        <div className="section-header">
          <span className="section-icon">🎯</span>
          <h3>Current Sign</h3>
        </div>
        
        <div className="prediction-display">
          {sign && sign.letter !== "nothing" ? (
            <>
              <div className="prediction-letter" style={{ 
                color: getConfidenceColor(sign.confidence),
                borderColor: getConfidenceColor(sign.confidence)
              }}>
                {sign.letter}
              </div>
              <div className="prediction-info">
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ 
                      width: `${sign.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(sign.confidence)
                    }}
                  ></div>
                </div>
                <span className="confidence-text">
                  Confidence: {(sign.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </>
          ) : (
            <div className="no-sign">
              <div className="no-sign-icon">👋</div>
              <p>Show your right hand to the camera to detect ASL signs</p>
            </div>
          )}
        </div>

        <div className="caption-text">
          <span className="caption-icon">💬</span>
          {caption}
        </div>
      </div>

      {/* WORD FORMATION SECTION */}
      <div className="word-section">
        <div className="section-header">
          <span className="section-icon">📝</span>
          <h3>Current Word</h3>
          <button 
            className="clear-btn"
            onClick={clearCurrentWord}
            disabled={!currentWord}
          >
            Clear
          </button>
        </div>
        
        <div className="word-display">
          {currentWord || <span className="empty-word">Type letters using ASL signs...</span>}
        </div>
        
        <div className="recording-controls">
          <button
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
          </button>
          <div className="recording-status">
            {isRecording ? (
              <span className="recording-indicator">
                <span className="pulse"></span>
                Recording...
              </span>
            ) : 'Ready to record'}
          </div>
        </div>
      </div>

      {/* PREDICTION HISTORY */}
      <div className="history-section">
        <div className="section-header">
          <span className="section-icon">📋</span>
          <h3>Recent Predictions</h3>
        </div>
        
        <div className="history-list">
          {predictionHistory.length > 0 ? (
            predictionHistory.slice().reverse().map((item, index) => (
              <div key={index} className="history-item">
                <span className="history-letter">{item.letter}</span>
                <div className="history-confidence">
                  <div 
                    className="history-bar"
                    style={{ 
                      width: `${item.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(item.confidence)
                    }}
                  ></div>
                  <span className="history-percent">
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-history">
              <p>No predictions yet. Make some ASL signs!</p>
            </div>
          )}
        </div>
      </div>

      {/* CONFIDENCE THRESHOLD SETTING */}
      <div className="settings-section">
        <div className="section-header">
          <span className="section-icon">⚙️</span>
          <h3>Settings</h3>
        </div>
        
        <div className="threshold-control">
          <label>
            Confidence Threshold: {(confidenceThreshold * 100).toFixed(0)}%
            <span className="threshold-help">
              (Only show predictions above this confidence)
            </span>
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="threshold-slider"
          />
          <div className="threshold-labels">
            <span>Low (10%)</span>
            <span>Medium (50%)</span>
            <span>High (90%)</span>
          </div>
        </div>
      </div>

      {/* DEBUG INFO */}
      <div className="debug-section">
        <div className="section-header">
          <span className="section-icon">🔧</span>
          <h3>System Status</h3>
        </div>
        
        <div className="debug-info">
          <div className="debug-item">
            <span className="debug-label">Connection:</span>
            <span className="debug-value status-connected">✅ Connected</span>
          </div>
          
          {data?.pose && (
            <div className="debug-item">
              <span className="debug-label">Body Landmarks:</span>
              <span className="debug-value">{Object.keys(data.pose).length} points</span>
            </div>
          )}
          
          {data?.left_hand && (
            <div className="debug-item">
              <span className="debug-label">Left Hand:</span>
              <span className="debug-value">{Object.keys(data.left_hand).length} points</span>
            </div>
          )}
          
          {data?.right_hand && (
            <div className="debug-item">
              <span className="debug-label">Right Hand:</span>
              <span className="debug-value">{Object.keys(data.right_hand).length} points</span>
            </div>
          )}
          
          <div className="debug-item">
            <span className="debug-label">Sign Model:</span>
            <span className="debug-value status-ready">✅ Loaded</span>
          </div>
          
          <div className="debug-item">
            <span className="debug-label">Frame Rate:</span>
            <span className="debug-value">~30 FPS</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <p className="instructions">
          <strong>How to use:</strong> Show your right hand to the camera to detect ASL letters.
          Use "space" sign to add space, "del" to delete last character.
        </p>
        <p className="credits">
          ASL Sign Recognition System • Powered by TensorFlow & MediaPipe
        </p>
      </div>
    </div>
  );
}
