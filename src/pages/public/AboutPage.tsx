import { motion } from 'framer-motion';
import { Shield, Users, MapPin, TrendingUp, Heart, Award, Target, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1B365D] to-blue-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">About SentinelPH</h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Empowering Filipino communities to become the first line of defense against health outbreaks
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-lg shadow-lg"
              >
                <div className="flex items-center mb-6">
                  <Target className="h-8 w-8 text-[#1B365D] mr-3" />
                  <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  To transform everyday Filipinos into community health sentinels, creating an intelligent early warning system that detects outbreaks before they spread, saving lives through the power of collective observation and digital innovation.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-lg shadow-lg"
              >
                <div className="flex items-center mb-6">
                  <Eye className="h-8 w-8 text-[#1B365D] mr-3" />
                  <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  A Philippines where every community is equipped with the tools and knowledge to detect health threats early, where technology bridges the gap between grassroots observation and professional healthcare response.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How SentinelPH Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our community-driven approach combines local knowledge with AI-powered analysis
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Users,
                  title: "Community Sentinels",
                  description: "Train local observers like sari-sari store owners and tricycle drivers"
                },
                {
                  icon: MapPin,
                  title: "Real-time Reporting",
                  description: "Mobile-first reporting system for immediate health observations"
                },
                {
                  icon: Shield,
                  title: "AI Verification",
                  description: "Smart filtering to separate genuine signals from noise"
                },
                {
                  icon: TrendingUp,
                  title: "Pattern Analysis",
                  description: "Advanced analytics to detect outbreak patterns early"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <feature.icon className="h-12 w-12 text-[#1B365D] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
              <p className="text-xl text-gray-600">Making a difference in Filipino communities</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { number: "17", label: "Regions Covered", icon: MapPin },
                { number: "1000+", label: "Community Sentinels", icon: Users },
                { number: "24/7", label: "Monitoring System", icon: Shield }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center bg-white p-8 rounded-lg shadow-lg"
                >
                  <stat.icon className="h-12 w-12 text-[#1B365D] mx-auto mb-4" />
                  <div className="text-4xl font-bold text-[#1B365D] mb-2">{stat.number}</div>
                  <div className="text-gray-600 text-lg">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Values */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600">The principles that guide our mission</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Heart,
                  title: "Community First",
                  description: "We believe in the power of Filipino communities to protect themselves when equipped with the right tools."
                },
                {
                  icon: Shield,
                  title: "Privacy & Trust",
                  description: "We protect personal health information while enabling collective intelligence for the greater good."
                },
                {
                  icon: Award,
                  title: "Innovation for Good",
                  description: "We harness cutting-edge technology to solve real-world health challenges in the Philippines."
                }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <value.icon className="h-16 w-16 text-[#1B365D] mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}