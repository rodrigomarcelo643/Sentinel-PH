import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Barangay Plan",
    price: "₱300",
    period: "/month",
    description: "Perfect for small communities",
    features: [
      "Up to 20 sentinels",
      "Basic observation tracking",
      "SMS notifications",
      "Community dashboard",
      "Email support"
    ]
  },
  {
    name: "Municipal Plan",
    price: "₱1,500",
    period: "/month",
    description: "For municipal health offices",
    features: [
      "Unlimited sentinels",
      "Advanced analytics",
      "Real-time heatmaps",
      "Multi-barangay management",
      "Priority support",
      "API access"
    ],
    popular: true
  },
  {
    name: "Provincial Plan",
    price: "₱4,000",
    period: "/month",
    description: "Enterprise-level monitoring",
    features: [
      "Regional pattern detection",
      "Predictive analytics",
      "Custom integrations",
      "Dedicated account manager",
      "Training & certification",
      "Research data licenses"
    ]
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#1B365D] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the plan that fits your community's needs. All plans include core outbreak detection features.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? "ring-2 ring-[#CE1126] scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#CE1126] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1B365D] mb-2">{plan.name}</h3>
                <p className="text-slate-600 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold text-[#1B365D]">{plan.price}</span>
                <span className="text-slate-600">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#CE1126] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full ${
                  plan.popular
                    ? "bg-[#CE1126] hover:bg-[#CE1126]/90"
                    : "bg-[#1B365D] hover:bg-[#1B365D]/90"
                }`}
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16 text-slate-600"
        >
          <p>All plans include a 30-day free trial. No credit card required.</p>
          <p className="mt-2">Need a custom plan? <Link to="/about" className="text-[#1B365D] font-semibold hover:underline">Contact us</Link></p>
        </motion.div>
      </div>
    </div>
  );
}
