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
  FaKey,
  FaEnvelope,
  FaCheckCircle,
  FaUserPlus,
  FaShieldAlt
} from "react-icons/fa";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "deaf", // deaf, hearing, interpreter
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grid pattern SVG as a constant
  const gridPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const stats = [
    { label: "Community Members", value: "5.2K", color: "from-blue-500 to-cyan-500" },
    { label: "Daily Translations", value: "150K+", color: "from-purple-500 to-pink-500" },
    { label: "Accuracy Rate", value: "98.5%", color: "from-green-500 to-teal-500" },
    { label: "Countries Served", value: "45+", color: "from-amber-500 to-orange-500" }
  ];

  const userTypes = [
    {
      id: "deaf",
      title: "Deaf User",
      icon: <FaSignLanguage />,
      desc: "Use sign language to communicate",
      color: "text-purple-400",
      bg: "bg-gradient-to-br from-purple-900/30 to-pink-900/20",
      border: "border-purple-500/20"
    },
    {
      id: "hearing",
      title: "Hearing User",
      icon: <FaVolumeUp />,
      desc: "Communicate with deaf individuals",
      color: "text-cyan-400",
      bg: "bg-gradient-to-br from-blue-900/30 to-cyan-900/20",
      border: "border-cyan-500/20"
    },
    {
      id: "interpreter",
      title: "Interpreter",
      icon: <FaUsers />,
      desc: "Professional sign language interpreter",
      color: "text-amber-400",
      bg: "bg-gradient-to-br from-amber-900/30 to-orange-900/20",
      border: "border-amber-500/20"
    }
  ];

  const features = [
    {
      icon: <FaBrain />,
      text: "AI Sign Recognition",
      desc: "Real-time ASL detection",
      color: "text-cyan-400"
    },
    {
      icon: <FaShieldAlt />,
      text: "Secure & Private",
      desc: "End-to-end encryption",
      color: "text-green-400"
    },
    {
      icon: <FaRobot />,
      text: "3D Avatar Guide",
      desc: "Learn sign language",
      color: "text-teal-400"
    },
    {
      icon: <FaBolt />,
      text: "Instant Translation",
      desc: "Real-time communication",
      color: "text-amber-400"
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    // ✅ Dummy signup logic
    console.log("Signing up:", formData);
    
    // Simulate API call
    setTimeout(() => {
      navigate("/login", { 
        state: { 
          message: "Account created successfully! Please sign in." 
        } 
      });
    }, 1500);
  };

  const handleQuickSignUp = (userType) => {
    const dummyData = {
      deaf: { username: "deaf_user", email: "deaf@example.com", password: "password123" },
      hearing: { username: "hearing_user", email: "hearing@example.com", password: "password123" },
      interpreter: { username: "interpreter", email: "interpreter@example.com", password: "password123" }
    };

    const data = dummyData[userType];
    setFormData({
      ...formData,
      username: data.username,
      email: data.email,
      password: data.password,
      confirmPassword: data.password,
      userType: userType
    });
    setAgreeTerms(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 flex items-center justify-center p-2 md:p-4 relative overflow-hidden">
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

      <div className="w-full max-w-7xl h-full grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-8 relative z-10 px-2 md:px-6 py-4">
        {/* Left Panel - Features & Stats */}
        <div className="lg:col-span-7 flex flex-col space-y-4 md:space-y-6 overflow-y-auto max-h-[85vh] lg:max-h-[90vh] pr-2">
          {/* Logo & Title */}
          <div className="lg:col-span-7 flex flex-col space-y-2 md:space-y-3 overflow-y-auto max-h-[85vh] lg:max-h-[90vh] pr-2">
  {/* Logo & Title - Super Compact */}
  <div className="text-left">
    <div className="inline-flex items-center space-x-2 mb-1.5">
      <div className="relative">
        <div className="relative w-10 h-10 md:w-15 md:h-15 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <FaUserPlus className="text-base md:text-lg" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 tracking-tight">
          Join GestureLink AI
        </h1>
        <p className="text-gray-400 text-xs font-medium opacity-90">Create Account</p>
      </div>
    </div>

    <div className="mb-2">
      <h2 className="text-base md:text-xl font-bold text-white">
        Start Your <span className="text-cyan-400">Journey</span>
      </h2>
      <p className="text-gray-400 text-xs leading-relaxed">
        Experience AI-powered sign language translation.
      </p>
    </div>
  </div>

  {/* Combined Stats & User Type - Horizontal Layout */}
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-2">
      {stats.slice(0, 2).map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.color}/10 backdrop-blur-md border ${stat.color.replace('from-', 'border-')}/20 rounded-lg p-1.5 text-center`}
        >
          <div className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>
            {stat.value}
          </div>
          <p className="text-[19px] text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>

    {/* User Type Selection - Horizontal */}
    <div className="space-y-1">
      <h3 className="text-white font-bold text-xs">Select Role:</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {userTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => {
              setFormData({...formData, userType: type.id});
              handleQuickSignUp(type.id);
            }}
            className={`${type.bg} backdrop-blur-md border ${formData.userType === type.id ? 'border-white/50' : type.border} rounded-lg p-1.5 text-center transition-all duration-150`}
          >
            <div className="flex flex-col items-center space-y-0.5">
              <span className={`text-base ${formData.userType === type.id ? 'text-white' : type.color}`}>
                {type.icon}
              </span>
              <span className="text-[19px] text-white font-medium truncate w-full">
                {type.title.split(' ')[0]}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* Features - Single Line */}
  <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-md border border-cyan-500/20 rounded-lg p-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-white font-medium">Key Features:</span>
      <div className="flex space-x-1">
        {features.slice(0, 2).map((feature, index) => (
          <div key={index} className="flex items-center space-x-0.5">
            <span className={`text-[10px] ${feature.color}`}>{feature.icon}</span>
            <span className="text-[9px] text-gray-300 hidden sm:inline">{feature.text.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

          {/* Stats & Features Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${stat.color}/10 backdrop-blur-md border ${stat.color.replace('from-', 'border-')}/20 rounded-xl p-3 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-white/20 group`}
                >
                  <div className={`text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* User Type Selection */}
            <div className="space-y-2">
              <h3 className="text-white font-bold text-base">Choose Your Role</h3>
              <div className="grid grid-cols-1 gap-2">
                {userTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setFormData({...formData, userType: type.id});
                      handleQuickSignUp(type.id);
                    }}
                    className={`${type.bg} backdrop-blur-md border ${formData.userType === type.id ? 'border-white/40' : type.border} rounded-xl p-3 transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:border-white/20 text-left`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg ${type.bg} border ${type.border} shadow-inner`}>
                        <span className={`text-base md:text-lg ${type.color}`}>{type.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">{type.title}</h3>
                        <p className="text-xs text-gray-400 truncate">{type.desc}</p>
                      </div>
                      {formData.userType === type.id && (
                        <FaCheckCircle className="text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-md border border-cyan-500/20 rounded-xl p-4">
            <h3 className="text-white font-bold text-base mb-2">Why Join GestureLink AI?</h3>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50`}>
                    <span className={`text-xs ${feature.color}`}>{feature.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{feature.text}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Sign Up Form */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="w-full max-w-[500px] bg-white/5 backdrop-blur-2xl rounded-2xl md:rounded-[2rem] border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-4 md:p-6 lg:p-8 relative overflow-hidden h-fit">
            {/* Form Background Glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl"></div>

            {/* Form Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3">
                <div className="absolute w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full blur opacity-30 animate-ping"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FaUserPlus className="text-lg" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Create Account</h2>
              <p className="text-xs text-gray-400">Join our community in 30 seconds</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border-l-4 border-red-500 p-2 rounded-r-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  <FaUser className="inline mr-1 text-cyan-400" />
                  Username
                </label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg py-2 px-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Choose a username"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  <FaEnvelope className="inline mr-1 text-cyan-400" />
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg py-2 px-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  <FaLock className="inline mr-1 text-cyan-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg py-2 px-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300 pr-10"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 ml-1">Minimum 6 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  <FaLock className="inline mr-1 text-cyan-400" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg py-2 px-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                  className="w-3.5 h-3.5 mt-0.5 bg-gray-800 border-gray-700 rounded focus:ring-cyan-500 focus:ring-offset-gray-900 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-[11px] text-gray-400 cursor-pointer">
                  I agree to the <a href="#" className="text-cyan-400 hover:underline">Terms of Service</a> and <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a>.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative overflow-hidden group mt-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-full py-2.5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-xl transition-all duration-300 text-sm">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <FaArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {/* Quick Sign Up Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {userTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleQuickSignUp(type.id)}
                    className={`py-1.5 bg-gradient-to-br ${type.bg} border ${type.border} rounded-lg text-white hover:border-white/30 transition-all duration-300 text-[10px]`}
                  >
                    <div className="flex flex-col items-center space-y-0.5">
                      <span className={type.color}>{type.icon}</span>
                      <span className="truncate w-full px-1">{type.title.split(' ')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800/50"></div>
              </div>
              <div className="relative flex justify-center text-[9px]">
                <span className="px-2 bg-gray-900/80 text-gray-500 uppercase tracking-widest">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group"
              >
                <FaArrowRight size={10} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                <span>Sign in to existing account</span>
              </Link>
            </div>

            {/* Alternative Sign Up Options */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="py-2 bg-gray-900/30 border border-gray-800/50 rounded-lg text-white hover:border-cyan-500/30 transition-colors text-xs">
                <div className="flex items-center justify-center space-x-1.5">
                  <FaCamera className="text-cyan-400" size={12} />
                  <span>Camera Sign Up</span>
                </div>
              </button>
              <button className="py-2 bg-gray-900/30 border border-gray-800/50 rounded-lg text-white hover:border-purple-500/30 transition-colors text-xs">
                <div className="flex items-center justify-center space-x-1.5">
                  <FaHands className="text-purple-400" size={12} />
                  <span>Sign Language</span>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-800/50">
              <p className="text-center text-[9px] text-gray-500 leading-relaxed">
                🔒 Your data is protected with AES-256 encryption<br />
                🌐 Join a global community • 🎯 Personalized learning path
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;