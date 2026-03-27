import { motion } from "framer-motion";
import { Check, CreditCard, Shield, Users, Building, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    id: "barangay",
    name: "Barangay Plan",
    price: "300",
    period: "/month",
    description: "Perfect for small communities",
    features: [
      "Up to 20 sentinels",
      "Basic analytics",
      "Email support"
    ],
    icon: Building
  },
  {
    id: "municipal",
    name: "Municipal Plan",
    price: "1,500",
    period: "/month",
    description: "For municipal health offices",
    features: [
      "Unlimited sentinels",
      "Advanced analytics",
      "Priority support"
    ],
    popular: true,
    icon: Users
  },
  {
    id: "provincial",
    name: "Provincial Plan",
    price: "4,000",
    period: "/month",
    description: "Enterprise-level monitoring",
    features: [
      "Regional coverage",
      "API access",
      "Dedicated support"
    ],
    icon: TrendingUp
  },
  {
    id: "regional",
    name: "Regional Plan",
    price: "5,000",
    period: "/municipality/month",
    description: "Comprehensive regional coverage with scalable municipalities",
    features: [
      "Multiple municipalities support",
      "Up to 20 barangays per municipality",
      "Full API Access & Dedicated Support",
      "Custom integrations & analytics",
      "Regional health insights dashboard"
    ],
    icon: Shield
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-8 lg:py-12 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
            <Shield className="h-16 w-16 sm:h-20 sm:w-20 text-[#1B365D] mx-auto relative z-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B365D] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Choose the plan that fits your community's needs. All plans include core outbreak detection features with no hidden fees. Regional plan scales with your municipalities.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`relative border-2 rounded-xl sm:rounded-2xl p-5 sm:p-6 cursor-pointer transition-all min-h-[520px] flex flex-col ${
                  plan.popular 
                    ? "border-[#1B365D] bg-blue-50 shadow-xl ring-2 ring-[#1B365D]/20" 
                    : "border-gray-200 bg-white hover:border-[#1B365D] hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B365D] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
                    Most Popular
                  </div>
                )}
                
                {/* Icon */}
                <div className="flex justify-center mb-3">
                  <div className={`p-2 sm:p-3 rounded-full ${
                    plan.popular ? 'bg-[#1B365D]/10' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${plan.popular ? 'text-[#1B365D]' : 'text-gray-600'}`} />
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-[#1B365D] mb-2">{plan.name}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm mb-3 line-clamp-2">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B365D]">₱{plan.price}</span>
                    <span className="text-slate-600 ml-1 text-xs sm:text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-xs sm:text-sm leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full h-10 sm:h-12 font-semibold transition-all text-sm sm:text-base ${
                    plan.popular
                      ? "bg-[#1B365D] hover:bg-[#1B365D]/90 shadow-lg"
                      : "bg-white border-2 border-[#1B365D] text-[#1B365D] hover:bg-[#1B365D] hover:text-white"
                  }`}
                >
                  <Link to="/register">
                    {plan.popular ? (
                      <>
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Get Started Now
                      </>
                    ) : (
                      "Get Started"
                    )}
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 sm:mt-20"
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B365D] mb-3">Compare Features</h2>
            <p className="text-base sm:text-lg text-slate-600">See what's included in each plan</p>
          </div>
          
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-2 sm:p-3 font-semibold text-gray-900 text-xs sm:text-sm">Feature</th>
                      <th className="text-center p-2 sm:p-3 font-semibold text-gray-900 text-xs sm:text-sm">Barangay</th>
                      <th className="text-center p-2 sm:p-3 font-semibold text-[#1B365D] text-xs sm:text-sm">Municipal</th>
                      <th className="text-center p-2 sm:p-3 font-semibold text-gray-900 text-xs sm:text-sm">Provincial</th>
                      <th className="text-center p-2 sm:p-3 font-semibold text-gray-900 text-xs sm:text-sm">Regional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-2 sm:p-3 text-gray-700 text-xs sm:text-sm">Community Sentinels</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">Up to 20</td>
                      <td className="p-2 sm:p-3 text-center font-semibold text-[#1B365D] text-xs sm:text-sm">Unlimited</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">Unlimited</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">Unlimited</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-2 sm:p-3 text-gray-700 text-xs sm:text-sm">Analytics Dashboard</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">Basic</td>
                      <td className="p-2 sm:p-3 text-center font-semibold text-[#1B365D] text-xs sm:text-sm">Advanced</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">Regional</td>
                      <td className="p-2 sm:p-3 text-center font-semibold text-purple-600 text-xs sm:text-sm">Regional</td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 text-gray-700 text-xs sm:text-sm">Real-time Alerts</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mx-auto" /></td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mx-auto" /></td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mx-auto" /></td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mx-auto" /></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-2 sm:p-3 text-gray-700 text-xs sm:text-sm">API Access</td>
                      <td className="p-2 sm:p-3 text-center text-gray-400 text-xs sm:text-sm">-</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mx-auto" /></td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mx-auto" /></td>
                      <td className="p-2 sm:p-3 text-center font-semibold text-green-600 text-xs sm:text-sm">Full API</td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 text-gray-700 text-xs sm:text-sm">Dedicated Support</td>
                      <td className="p-2 sm:p-3 text-center text-gray-400 text-xs sm:text-sm">-</td>
                      <td className="p-2 sm:p-3 text-center text-gray-400 text-xs sm:text-sm">-</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mx-auto" /></td>
                      <td className="p-2 sm:p-3 text-center font-semibold text-green-600 text-xs sm:text-sm">Priority</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-2 sm:p-3 text-gray-700 text-xs sm:text-sm">Municipalities</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">1</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">1</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">Multiple</td>
                      <td className="p-2 sm:p-3 text-center font-semibold text-[#1B365D] text-xs sm:text-sm">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 text-gray-700 text-xs sm:text-sm">Pricing Model</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">Fixed</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">Fixed</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">Fixed</td>
                      <td className="p-2 sm:p-3 text-center font-semibold text-[#1B365D] text-xs sm:text-sm">Per Municipality</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16 space-y-4"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-blue-200">
            <h3 className="text-lg sm:text-xl font-semibold text-[#1B365D] mb-3">Start with a 30-day free trial</h3>
            <p className="text-slate-600 mb-4 text-sm sm:text-base">No credit card required. Full access to all features. Regional plans scale as you add municipalities.</p>
            <Button asChild className="bg-[#1B365D] hover:bg-[#1B365D]/90 px-6 py-2 sm:px-8 sm:py-3">
              <Link to="/register">Start Free Trial</Link>
            </Button>
          </div>
          
          <p className="text-slate-600 text-sm sm:text-base">
            Need a custom plan? <Link to="/about" className="text-[#1B365D] font-semibold hover:underline">Contact our sales team</Link> for enterprise solutions.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
