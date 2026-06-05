import { motion } from 'framer-motion';
import { 
  Shield, Users, Heart, Target,
  Activity, Zap, QrCode, AlertTriangle, 
  Bot, Wifi, ChevronRight, Store, 
  Truck, Church, Stethoscope, UserCheck, Map, Bell, 
  Database, Sparkles, Layers, ShieldCheck, MessageCircle, 
  Clock, Building2,
  AlertCircle, CheckCircle, Scan,
  FileCheck, Gift,
  Smartphone, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const fadeUpView = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section - Problem Statement Focused */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp} className="space-y-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-[5px] text-xs font-semibold border border-red-100 dark:border-red-900/30">
              <AlertTriangle className="h-3.5 w-3.5" />
              Critical Health Intelligence Gap
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                The Philippines Has No Shortage of{' '}
                <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  Health Data
                </span>
                <br />
                It Has a Shortage of{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  The Right Data at the Right Time
                </span>
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                Outbreaks are detected only after hospital admissions spike — when it's already too late for prevention. Communities have no structured way to share what they see.
              </p>
            </div>

            {/* Stats row - Problem metrics */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-red-50/50 dark:bg-red-950/20 rounded-[5px] p-3 border border-red-100 dark:border-red-900/30">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">Weeks</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Paper reports take weeks to process</div>
              </div>
              <div className="bg-orange-50/50 dark:bg-orange-950/20 rounded-[5px] p-3 border border-orange-100 dark:border-orange-900/30">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Critical time lost between symptoms and response</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-5 py-2.5 rounded-[5px] text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                Join HealthWatch
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-[5px] text-sm font-semibold border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200"
              >
                See Intelligence Map
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-[5px] overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1000&q=80"
                alt="Community health workers in the Philippines"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-[5px]" />
            </div>

            {/* Floating card — Problem */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-4 -right-4 bg-white dark:bg-gray-900 rounded-[5px] shadow-lg p-3 border-l-4 border-red-500"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-[5px]">
                  <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Reactive System</div>
                  <div className="text-[10px] text-gray-400">Detects outbreaks too late</div>
                </div>
              </div>
            </motion.div>

            {/* Floating card — Solution */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-900 rounded-[5px] shadow-lg p-3 border-l-4 border-green-500"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-[5px]">
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Proactive Intelligence</div>
                  <div className="text-[10px] text-gray-400">Catch outbreaks before they spread</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Current System Inefficiencies - Updated with uniform card heights */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-red-50/30 to-transparent dark:from-red-950/10">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUpView} className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-[5px] text-sm font-semibold mb-3">
              <AlertCircle className="h-4 w-4" />
              The Current Reality
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Broken From the Start
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
              The current approach to outbreak detection is failing Filipino communities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: FileCheck, title: 'Manual Reporting Delays', desc: 'Paper-based reports take weeks to process and reach health authorities', bgClass: 'bg-white dark:bg-gray-900 border-red-100 dark:border-red-900/30 hover:shadow-lg', iconClass: 'bg-red-100 dark:bg-red-900/40 text-red-600' },
              { icon: Building2, title: 'Health Center Bottlenecks', desc: 'Long waiting times during outbreak investigations while cases multiply', bgClass: 'bg-white dark:bg-gray-900 border-orange-100 dark:border-orange-900/30 hover:shadow-lg', iconClass: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' },
              { icon: Database, title: 'Repetitive Data Collection', desc: 'BHWs repeatedly ask the same questions during health visits, wasting valuable time that could be spent on actual care', bgClass: 'bg-white dark:bg-gray-900 border-amber-100 dark:border-amber-900/30 hover:shadow-lg', iconClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' },
              { icon: Layers, title: 'Information Silos', desc: 'Resident health histories scattered across different systems with no centralized access', bgClass: 'bg-white dark:bg-gray-900 border-yellow-100 dark:border-yellow-900/30 hover:shadow-lg', iconClass: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600' },
              { icon: Clock, title: 'Delayed Response', desc: 'Critical time lost between symptom onset and official health response', bgClass: 'bg-white dark:bg-gray-900 border-red-100 dark:border-red-900/30 hover:shadow-lg', iconClass: 'bg-red-100 dark:bg-red-900/40 text-red-600' },
              { icon: AlertTriangle, title: 'Reactive Detection', desc: 'Outbreaks spotted only after hospital admissions spike — when it\'s already too late for prevention', bgClass: 'bg-white dark:bg-gray-900 border-orange-100 dark:border-orange-900/30 hover:shadow-lg', iconClass: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' },
            ].map(({ icon: Icon, title, desc, bgClass, iconClass }, i) => {
              return (
                <motion.div
                  key={i}
                  {...fadeUpView}
                  transition={{ delay: i * 0.05 }}
                  className="group h-full"
                >
                  <div className={`rounded-[5px] border p-5 transition-all duration-300 ${bgClass} h-full flex flex-col`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-[5px] flex-shrink-0 ${iconClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 leading-tight">{title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution - HealthWatch */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div {...fadeUpView} className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-[5px] text-sm font-semibold mb-3">
            <Sparkles className="h-4 w-4" />
            The HealthWatch Solution
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Building a Community Intelligence Network
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
            Training everyday Residents to become the first line of outbreak detection
          </p>
        </motion.div>

        {/* Community Residents Grid - Changed from Sentinels to Residents */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { icon: Store, label: 'Sari-Sari Store Owners', colorClass: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-100 dark:border-blue-900/30' },
            { icon: Truck, label: 'Tricycle Drivers', colorClass: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 border-teal-100 dark:border-teal-900/30' },
            { icon: Users, label: 'Market Vendors', colorClass: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100 dark:border-emerald-900/30' },
            { icon: Church, label: 'Religious Leaders', colorClass: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 border-purple-100 dark:border-purple-900/30' },
            { icon: Heart, label: 'Traditional Hilots', colorClass: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-100 dark:border-rose-900/30' },
            { icon: Stethoscope, label: 'Barangay Health Workers', colorClass: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 border-cyan-100 dark:border-cyan-900/30' },
          ].map(({ icon: Icon, label, colorClass }, i) => {
            return (
              <motion.div
                key={i}
                {...fadeUpView}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className={`${colorClass} rounded-[5px] p-3 text-center border hover:shadow-lg transition-all duration-300`}
              >
                <Icon className="h-7 w-7 mx-auto mb-1.5" />
                <p className="text-xs font-semibold leading-tight">{label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Key Innovation - QR Code Highlight */}
        <motion.div
          {...fadeUpView}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[5px] p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 text-white">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="h-6 w-6" />
                <span className="text-sm font-semibold uppercase tracking-wider">Digital QR Health Passport</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Scan. Access. Respond.</h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Each resident receives a unique QR code that health workers, partner clinics, and authorized providers can scan to instantly access complete health profiles, self-reported symptoms, verified health trends, and real-time pattern analysis — transforming weeks of manual processing into seconds of digital intelligence.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-[5px] shadow-lg">
                <div className="w-24 h-24 bg-gray-900 rounded-[5px] flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-white" />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2 font-medium">Sample QR Code</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How It Works Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { step: '01', icon: UserCheck, title: 'Register & Verify', desc: 'Multi-step registration with ID verification and selfie confirmation', iconClass: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' },
            { step: '02', icon: Scan, title: 'Get QR Code', desc: 'Receive unique digital health passport for instant access', iconClass: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600' },
            { step: '03', icon: Bell, title: 'Report & Monitor', desc: 'Real-time observations with 3-resident validation rule', iconClass: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600' },
          ].map(({ step, icon: Icon, title, desc, iconClass }, i) => (
            <motion.div
              key={i}
              {...fadeUpView}
              transition={{ delay: i * 0.1 }}
              className="relative h-full"
            >
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[5px] p-5 hover:shadow-lg transition-all duration-300 h-full">
                <div className="text-4xl font-bold text-gray-200 dark:text-gray-800 absolute top-3 right-4">
                  {step}
                </div>
                <div className={`inline-flex p-2.5 rounded-[5px] mb-3 ${iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Key Innovations */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/60 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUpView} className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Key Innovations</h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-2">Technology that makes the difference</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Wifi, title: 'Mobile-First PWA', desc: 'Works offline, low-bandwidth optimized for remote areas', colorClass: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-100 dark:border-blue-900/30' },
              { icon: Bot, title: 'AI Trust Scoring', desc: 'Validates resident reliability with 0-100 score', colorClass: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 border-purple-100 dark:border-purple-900/30' },
              { icon: ShieldCheck, title: '3-Resident Rule', desc: 'Multi-source validation before outbreak alerts', colorClass: 'bg-green-50 dark:bg-green-950/30 text-green-600 border-green-100 dark:border-green-900/30' },
              { icon: Map, title: 'Observation Heatmaps', desc: 'Real-time geographic clustering of health data', colorClass: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 border-orange-100 dark:border-orange-900/30' },
              { icon: MessageCircle, title: 'Two-Way Feedback', desc: 'Communities receive acknowledgments and advisories', colorClass: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 border-teal-100 dark:border-teal-900/30' },
              { icon: Shield, title: 'Spam Prevention', desc: 'Rate limiting, behavior monitoring, AI filtering', colorClass: 'bg-red-50 dark:bg-red-950/30 text-red-600 border-red-100 dark:border-red-900/30' },
              { icon: Target, title: 'Proximal Intelligence', desc: 'Catches outbreaks at pre-clinic stage', colorClass: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 border-cyan-100 dark:border-cyan-900/30' },
              { icon: Gift, title: 'Incentive System', desc: 'Load credits, recognition badges, community rankings', colorClass: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-100 dark:border-amber-900/30' },
            ].map(({ icon: Icon, title, desc, colorClass }, i) => {
              return (
                <motion.div
                  key={i}
                  {...fadeUpView}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="h-full"
                >
                  <div className={`bg-white dark:bg-gray-900 rounded-[5px] border p-4 ${colorClass} hover:shadow-lg transition-all duration-300 h-full`}>
                    <Icon className="h-5 w-5 mb-2" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div {...fadeUpView} className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Who We Serve</h2>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2">Building a healthier Philippines together</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Users */}
          <motion.div {...fadeUpView} className="bg-blue-50/30 dark:bg-blue-950/20 rounded-[5px] p-6 border border-blue-100 dark:border-blue-900/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-[5px]">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Primary Users</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Sari-Sari Store Owners', 'Market Vendors', 'Tricycle Drivers', 'Barangay Tanods', 'Religious Leaders', 'Traditional Hilots', 'Barangay Health Workers', 'PUV Operators'].map((user, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  <span>{user}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Beneficiaries */}
          <motion.div {...fadeUpView} className="bg-green-50/30 dark:bg-green-950/20 rounded-[5px] p-6 border border-green-100 dark:border-green-900/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-[5px]">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Beneficiaries</h3>
            </div>
            <div className="space-y-2">
              {['Entire Communities (faster detection = faster response)', 'Vulnerable Populations (elderly, children, pregnant women, PWDs)', 'Municipal & Provincial Health Officers', 'Department of Health & Epidemiologists'].map((beneficiary, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{beneficiary}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* MVP Features */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/60 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUpView} className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">MVP Core Features</h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-2">Powerful tools for community health intelligence</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* BHW Dashboard */}
            <motion.div {...fadeUpView} className="bg-white dark:bg-gray-900 rounded-[5px] p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-[5px]">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">BHW Dashboard</h3>
              </div>
              <ul className="space-y-2">
                {['Resident Management', 'Real-time Observations', 'QR Code Scanner', 'Interactive Mapping', 'Outbreak Pattern Recognition', 'Community Announcements'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Community Resident Network - Changed from Sentinel */}
            <motion.div {...fadeUpView} className="bg-white dark:bg-gray-900 rounded-[5px] p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-[5px]">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Community Resident Network</h3>
              </div>
              <ul className="space-y-2">
                {['Multi-Step Registration', 'Mobile App Dashboard', 'Real-Time Information Feed', 'Community Intelligence', 'Observation Reporting', 'Two-Way Communication'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Real-Time Intelligence */}
            <motion.div {...fadeUpView} className="bg-white dark:bg-gray-900 rounded-[5px] p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-[5px]">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Real-Time Intelligence</h3>
              </div>
              <ul className="space-y-2">
                {['Live Data Sync', '3-Resident Rule', 'AI Trust Scoring', 'Spatial Clustering', 'Predictive Analytics'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Mobile-First Design */}
            <motion.div {...fadeUpView} className="bg-white dark:bg-gray-900 rounded-[5px] p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-[5px]">
                  <Smartphone className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mobile-First Design</h3>
              </div>
              <ul className="space-y-2">
                {['Progressive Web App (PWA)', 'Audio Feedback', 'Real-time Notifications', 'Cross-Platform'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          {...fadeUpView}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[5px] p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-3">Be Part of HealthWatch</h2>
          <p className="text-white/90 mb-6 max-w-md mx-auto text-sm">
            Join the community intelligence network helping detect outbreaks before they spread
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/resident/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-6 py-2.5 rounded-[5px] text-sm font-semibold transition-all duration-200 shadow-lg"
            >
              Register as Resident
              <UserPlus className="h-4 w-4" />
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-6 py-2.5 rounded-[5px] text-sm font-semibold transition-all duration-200"
            >
              Explore Intelligence Map
              <Map className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}