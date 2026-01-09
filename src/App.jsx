// import AvatarCanvas from "./components/AvatarCanvas";
// import Caption from "./components/Caption";
// import "./App.css";

// function App() {
//   return (
//     <div className="app-container">
//       <div className="avatar-section">
//         <AvatarCanvas />
//       </div>
//       <div className="caption-section">
//         <Caption />
//       </div>
//     </div>
//   );
// }

// export default App;




import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
