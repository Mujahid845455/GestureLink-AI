import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaSignLanguage,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaBrain,
  FaComments,
  FaRobot,
  FaBolt,
  FaCamera,
  FaHands,
  FaVolumeUp,
  FaUsers,
  FaKey
} from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grid pattern SVG as a constant
  const gridPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const stats = [
    { label: "Active Users", value: "1.2K", color: "from-blue-500 to-cyan-500" },
    { label: "Signs Detected", value: "50K+", color: "from-purple-500 to-pink-500" },
    { label: "Accuracy", value: "98.5%", color: "from-green-500 to-teal-500" },
    { label: "Response Time", value: "<50ms", color: "from-amber-500 to-orange-500" }
  ];

  const features = [
    { 
      icon: <FaBrain />, 
      text: "AI Sign Recognition", 
      desc: "Real-time ASL detection",
      color: "text-cyan-400",
      bg: "bg-gradient-to-br from-blue-900/30 to-cyan-900/20",
      border: "border-cyan-500/20"
    },
    { 
      icon: <FaComments />, 
      text: "Text-to-Speech", 
      desc: "Natural voice synthesis",
      color: "text-purple-400",
      bg: "bg-gradient-to-br from-purple-900/30 to-pink-900/20",
      border: "border-purple-500/20"
    },
    { 
      icon: <FaRobot />, 
      text: "3D Avatar", 
      desc: "Animated sign visualization",
      color: "text-teal-400",
      bg: "bg-gradient-to-br from-teal-900/30 to-emerald-900/20",
      border: "border-teal-500/20"
    },
    { 
      icon: <FaBolt />, 
      text: "Real-time Chat", 
      desc: "Instant communication",
      color: "text-amber-400",
      bg: "bg-gradient-to-br from-amber-900/30 to-orange-900/20",
      border: "border-amber-500/20"
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ✅ Dummy credentials
    if (
      formData.identifier === "deaf_user" &&
      formData.password === "password123"
    ) {
      localStorage.setItem("isLoggedIn", "true");
      if (rememberMe) {
        localStorage.setItem("rememberedUser", formData.identifier);
      }
      navigate("/dashboard");
    } else {
      setError("Invalid username or password");
    }

    setIsSubmitting(false);
  };

  const handleDemoLogin = (identifier, password) => {
    setFormData({ identifier, password });
    // Auto submit after a delay
    setTimeout(() => {
      if (
        identifier === "deaf_user" &&
        password === "password123"
      ) {
        localStorage.setItem("isLoggedIn", "true");
        navigate("/dashboard");
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundImage: gridPattern }}
      ></div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 relative z-10 px-4 md:px-8">
        
        {/* Left Panel - Features & Stats */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-10">
          {/* Logo & Title */}
          <div className="text-left mb-4">
            <div className="inline-flex items-center space-x-6 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-70 animate-pulse"></div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <FaSignLanguage className="text-white text-3xl md:text-4xl" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 tracking-tight">
                  GestureLink AI
                </h1>
                <p className="text-gray-400 mt-2 text-lg font-medium opacity-90">Next-Gen Sign Language Platform</p>
              </div>
            </div>
            
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Bridge the Communication Gap with <span className="text-cyan-400">AI</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light">
                Experience seamless communication between deaf and hearing communities through real-time sign language translation, 3D avatars, and intelligent chat systems.
              </p>
            </div>
          </div>

          {/* Stats & Features Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-br ${stat.color}/10 backdrop-blur-md border ${stat.color.replace('from-', 'border-')}/20 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-white/20 group`}
                >
                  <div className={`text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform`}>
                    {stat.value}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`${feature.bg} backdrop-blur-md border ${feature.border} rounded-2xl p-5 transition-all duration-300 hover:translate-x-2 hover:shadow-xl hover:border-white/20`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${feature.bg} border ${feature.border} shadow-inner`}>
                      <span className={`text-xl md:text-2xl ${feature.color}`}>{feature.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{feature.text}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-md border border-cyan-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Transform Communication?</h3>
                <p className="text-gray-400 text-base font-light">Join thousands already using GestureLink AI</p>
              </div>
              <div className="flex items-center space-x-4 text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                <FaHands className="text-3xl animate-bounce" />
                <FaVolumeUp className="text-3xl animate-pulse" />
                <FaUsers className="text-3xl animate-bounce [animation-delay:200ms]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="w-full max-w-[640px] bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-10 lg:p-12 relative overflow-hidden">
            {/* Form Background Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

            {/* Connection Status Badge */}
            <div className="absolute -top-3 right-8">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 backdrop-blur-sm rounded-full border border-cyan-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-cyan-300 font-medium">SERVER ONLINE</span>
              </div>
            </div>

            {/* Form Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
                <div className="absolute w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-30 animate-ping"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaKey className="text-white text-2xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to continue your journey</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username/Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <FaUser className="inline mr-2 text-cyan-400" />
                  Username or Email
                </label>
                <div className="relative">
                  <input
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300"
                    placeholder="Enter username or email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <FaLock className="inline mr-2 text-cyan-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300 pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-gray-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-cyan-500 focus:ring-offset-gray-900"
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-3 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {/* Demo Login Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => handleDemoLogin("hearing_user", "password123")}
                  className="py-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white hover:border-cyan-500/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FaUser className="text-cyan-400" />
                    <span>Hearing User</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Standard Access</div>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleDemoLogin("deaf_user", "password123")}
                  className="py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-700/50 rounded-xl text-white hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FaSignLanguage className="text-purple-400" />
                    <span>Deaf User</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Full Features</div>
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900/80 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Alternative Login Options */}
            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 bg-gray-900/30 border border-gray-800/50 rounded-xl text-white hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center justify-center space-x-2">
                  <FaCamera className="text-cyan-400" />
                  <span>Camera Login</span>
                </div>
              </button>
              <button className="py-3 bg-gray-900/30 border border-gray-800/50 rounded-xl text-white hover:border-purple-500/30 transition-colors">
                <div className="flex items-center justify-center space-x-2">
                  <FaHands className="text-purple-400" />
                  <span>Sign Login</span>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-800/50">
              <p className="text-center text-sm text-gray-500">
                By signing in, you agree to our{" "}
                <a href="#" className="text-cyan-400 hover:text-cyan-300">Terms</a>
                {" "}and{" "}
                <a href="#" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
              </p>
              <p className="text-center text-xs text-gray-600 mt-4">
                🔐 End-to-end encrypted • 🚀 Powered by AI • 🌐 Global Access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;