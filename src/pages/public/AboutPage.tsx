import { motion } from 'framer-motion';
import { Shield, Users, MapPin, TrendingUp, Heart, Award, Target, Eye, Activity, Zap, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      
      <div className="pt-5">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    <Shield className="h-4 w-4" />
                    <span>Community Health Protection</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">SentinelPH</span>
                  </h1>
                  
                  <div className="space-y-3">
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                      Empowering Filipino communities to become the first line of defense against health outbreaks through collective vigilance and intelligent early warning systems.
                    </p>
                    <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                      We transform everyday Filipinos into community health sentinels, creating an intelligent network that detects potential health threats before they spread.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link 
                    to="/register"
                    className="inline-flex items-center justify-center bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Join Our Mission
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link 
                    to="/pricing"
                    className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                  >
                    View Pricing
                  </Link>
                </div>
                
                <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">17</div>
                    <div className="text-xs sm:text-sm text-gray-600">Regions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">1000+</div>
                    <div className="text-xs sm:text-sm text-gray-600">Sentinels</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">24/7</div>
                    <div className="text-xs sm:text-sm text-gray-600">Monitoring</div>
                  </div>
                </div>
              </motion.div>
              
              {/* Right Content - Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-sm sm:rounded-sm overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Community health workers in the Philippines"
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                {/* Floating Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">Active Protection</div>
                      <div className="text-xs text-gray-500">Real-time monitoring</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">Community Driven</div>
                      <div className="text-xs text-gray-500">1000+ sentinels</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12 lg:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B365D] mb-3 sm:mb-4">Our Purpose</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">Driving change through innovation and community empowerment</p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8 lg:p-10 rounded-xl sm:rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-500 h-full">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="p-3 bg-blue-100 rounded-xl sm:rounded-2xl mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-6 w-6 sm:h-8 sm:w-8 text-[#1B365D]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Our Mission</h3>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                    To transform everyday Filipinos into community health sentinels, creating an intelligent early warning system that detects outbreaks before they spread.
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                    Saving lives through the power of collective observation and digital innovation.
                  </p>
                  <div className="flex items-center text-[#1B365D] font-bold text-sm sm:text-base">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Active in 17 Regions
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 sm:p-8 lg:p-10 rounded-xl sm:rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-500 h-full">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="p-3 bg-purple-100 rounded-xl sm:rounded-2xl mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Our Vision</h3>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                    A Philippines where every community is equipped with the tools and knowledge to detect health threats early.
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                    Where technology bridges the gap between grassroots observation and professional healthcare response.
                  </p>
                  <div className="flex items-center text-purple-600 font-bold text-sm sm:text-base">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Real-time Monitoring
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16 lg:mb-20"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B365D] mb-3 sm:mb-4">How SentinelPH Works</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Our community-driven approach combines local knowledge with AI-powered analysis for early outbreak detection
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  icon: Users,
                  title: "Community Sentinels",
                  description: "Train local observers like sari-sari store owners and tricycle drivers",
                  color: "blue"
                },
                {
                  icon: MapPin,
                  title: "Real-time Reporting",
                  description: "Mobile-first reporting system for immediate health observations",
                  color: "green"
                },
                {
                  icon: Shield,
                  title: "AI Verification",
                  description: "Smart filtering to separate genuine signals from noise",
                  color: "purple"
                },
                {
                  icon: TrendingUp,
                  title: "Pattern Analysis",
                  description: "Advanced analytics to detect outbreak patterns early",
                  color: "orange"
                }
              ].map((feature, index) => {
                const colorClasses: Record<string, string> = {
                  blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
                  green: 'bg-green-100 text-green-600 hover:bg-green-200',
                  purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
                  orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                };
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group"
                  >
                    <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 h-full">
                      <div className={`inline-flex p-4 sm:p-5 rounded-2xl ${colorClasses[feature.color]} mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16 lg:mb-20"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B365D] mb-3 sm:mb-4">Our Impact</h2>
              <p className="text-base sm:text-lg text-gray-600">Making a difference in Filipino communities nationwide</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {[
                { number: "17", label: "Regions Covered", icon: MapPin, color: "blue" },
                { number: "1000+", label: "Community Sentinels", icon: Users, color: "green" },
                { number: "24/7", label: "Monitoring System", icon: Shield, color: "purple" }
              ].map((stat, index) => {
                const colorClasses: Record<string, string> = {
                  blue: 'bg-blue-100 text-blue-600',
                  green: 'bg-green-100 text-green-600',
                  purple: 'bg-purple-100 text-purple-600'
                };
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group"
                  >
                    <div className="bg-white p-8 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 h-full">
                      <div className={`inline-flex p-4 sm:p-5 rounded-2xl ${colorClasses[stat.color]} mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B365D] mb-2 sm:mb-3">{stat.number}</div>
                      <div className="text-gray-600 text-base sm:text-lg font-medium">{stat.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12 sm:mt-16 text-center"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-12 shadow-lg border border-gray-100 max-w-4xl mx-auto">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1B365D] mb-3 sm:mb-4">Join Our Growing Network</h3>
                <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed">
                  Be part of the Philippines' most innovative community health monitoring system
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#1B365D] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg hover:bg-[#1B365D]/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  onClick={() => window.location.href = '/register'}
                >
                  Become a Sentinel
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Values */}
        <section className="py-16 sm:py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16 lg:mb-20"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B365D] mb-3 sm:mb-4">Our Values</h2>
              <p className="text-base sm:text-lg text-gray-600">The principles that guide our mission and drive our innovation</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {[
                {
                  icon: Heart,
                  title: "Community First",
                  description: "We believe in the power of Filipino communities to protect themselves when equipped with the right tools.",
                  color: "red"
                },
                {
                  icon: Shield,
                  title: "Privacy & Trust",
                  description: "We protect personal health information while enabling collective intelligence for the greater good.",
                  color: "blue"
                },
                {
                  icon: Award,
                  title: "Innovation for Good",
                  description: "We harness cutting-edge technology to solve real-world health challenges in the Philippines.",
                  color: "yellow"
                }
              ].map((value, index) => {
                const colorClasses: Record<string, string> = {
                  red: 'bg-red-100 text-red-600 hover:bg-red-200',
                  blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
                  yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                };
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group"
                  >
                    <div className="bg-gradient-to-br from-gray-50 to-white p-8 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 h-full">
                      <div className={`inline-flex p-5 sm:p-6 rounded-2xl ${colorClasses[value.color]} mb-8 sm:mb-10 group-hover:scale-110 transition-transform duration-300`}>
                        <value.icon className="h-10 w-10 sm:h-12 sm:w-12" />
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{value.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-[#1B365D] via-blue-700 to-[#0f2444] text-white overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-10 right-20 w-48 h-48 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/4 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8 sm:space-y-12"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                  Ready to Make a Difference?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
                  Join us in building a safer, healthier Philippines through community-powered early warning systems
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-[#1B365D] px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-base sm:text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl"
                  onClick={() => window.location.href = '/register'}
                >
                  Get Started Today
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-white text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-base sm:text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  onClick={() => window.location.href = '/contact'}
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}