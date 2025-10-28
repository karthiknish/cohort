'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  BarChart3, 
  Users, 
  CheckSquare, 
  CreditCard, 
  FileText, 
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Star,
  ChevronRight,
  Play,
  Menu,
  X
} from 'lucide-react'

export default function MarketingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time insights from all major ad platforms with AI-powered recommendations and predictive analytics.',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Centralized client database with comprehensive profiles, campaign history, and performance tracking.',
      color: 'bg-green-500'
    },
    {
      icon: CheckSquare,
      title: 'Task Collaboration',
      description: 'Streamlined task management with team assignments, deadlines, and automated workflow optimization.',
      color: 'bg-purple-500'
    },
    {
      icon: CreditCard,
      title: 'Financial Management',
      description: 'Automated invoicing, expense tracking, and revenue analytics with Stripe integration.',
      color: 'bg-yellow-500'
    },
    {
      icon: FileText,
      title: 'Proposal Generator',
      description: 'AI-powered proposal creation with professional templates and one-click PDF generation.',
      color: 'bg-red-500'
    },
    {
      icon: MessageSquare,
      title: 'Team Communication',
      description: 'Real-time chat, file sharing, and multi-channel notifications to keep your team synchronized.',
      color: 'bg-indigo-500'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO at Digital Agency Pro',
      content: 'Cohorts transformed how we manage our marketing agency. The AI insights alone have increased our ROAS by 35%.',
      avatar: 'SJ',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Marketing Director at GrowthCo',
      content: 'The unified dashboard saves us hours every day. Everything we need is in one place.',
      avatar: 'MC',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Founder at Creative Solutions',
      content: 'Best investment we\'ve made for our agency. The proposal generator is a game-changer.',
      avatar: 'ER',
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for small agencies getting started',
      features: [
        'Up to 5 clients',
        'Basic analytics dashboard',
        'Task management',
        'Email support'
      ],
      featured: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'Ideal for growing marketing agencies',
      features: [
        'Up to 20 clients',
        'Advanced analytics & AI insights',
        'Custom proposals & invoices',
        'Priority support',
        'Team collaboration tools'
      ],
      featured: true,
      cta: 'Get Started Now'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large agencies with complex needs',
      features: [
        'Unlimited clients',
        'White-label options',
        'Advanced integrations',
        'Dedicated account manager',
        'Custom training & onboarding'
      ],
      featured: false,
      cta: 'Contact Sales'
    }
  ]

  const integrations = [
    { name: 'Google Ads', icon: '🔍', color: 'bg-blue-100 text-blue-600' },
    { name: 'Meta Ads', icon: '📘', color: 'bg-blue-100 text-blue-600' },
    { name: 'TikTok Ads', icon: '🎵', color: 'bg-black text-white' },
    { name: 'LinkedIn Ads', icon: '💼', color: 'bg-blue-100 text-blue-600' },
    { name: 'Stripe', icon: '💳', color: 'bg-purple-100 text-purple-600' },
    { name: 'Slack', icon: '💬', color: 'bg-purple-100 text-purple-600' },
    { name: 'Gmail', icon: '📧', color: 'bg-red-100 text-red-600' },
    { name: 'WhatsApp', icon: '📱', color: 'bg-green-100 text-green-600' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Cohorts
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                Testimonials
              </Link>
              <Link href="#integrations" className="text-gray-600 hover:text-gray-900 transition-colors">
                Integrations
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/auth" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth" 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Start Free Trial
              </Link>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="#features" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Testimonials</Link>
              <Link href="#integrations" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Integrations</Link>
              <Link href="/auth" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/auth" className="block px-3 py-2 bg-indigo-600 text-white rounded-lg">Start Free Trial</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              The All-in-One Dashboard for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {' '}Modern Marketing Agencies
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Unify your client management, ad analytics, team collaboration, and financial operations in one powerful platform. 
              Scale your agency with AI-powered insights and automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/auth" 
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center"
              >
                Start Your 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="bg-white text-gray-900 px-8 py-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all font-semibold text-lg flex items-center justify-center">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                Setup in minutes
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-500 mr-2" />
                Enterprise security
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Agency Needs to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From client acquisition to campaign optimization, Cohorts provides the tools you need to scale efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link href="#" className="text-indigo-600 font-medium flex items-center hover:text-indigo-700">
                  Learn more <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Agencies Trust Cohorts' },
              { value: '$2.5M+', label: 'Ad Spend Managed' },
              { value: '35%', label: 'Average ROAS Increase' },
              { value: '24/7', label: 'Support Available' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Marketing Agencies Worldwide
            </h2>
            <p className="text-xl text-gray-600">See what our customers have to say about Cohorts</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-indigo-600 font-semibold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">Choose the perfect plan for your agency size and needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl p-8 ${plan.featured ? 'ring-2 ring-indigo-600 shadow-lg' : 'border border-gray-200'}`}>
                {plan.featured && (
                  <div className="bg-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/auth" 
                  className={`w-full py-3 rounded-lg font-semibold transition-colors text-center block ${
                    plan.featured 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Integrates with Your Favorite Tools
            </h2>
            <p className="text-xl text-gray-600">Connect all your marketing platforms in one place</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-center">
                <div className={`w-16 h-16 ${integration.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl`}>
                  {integration.icon}
                </div>
                <div className="font-medium text-gray-900">{integration.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Marketing Agency?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of agencies that are already scaling with Cohorts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth" 
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-semibold text-lg flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="bg-transparent text-white px-8 py-4 rounded-lg border border-white hover:bg-white/10 transition-all font-semibold text-lg">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Cohorts</h3>
              <p className="text-sm">The all-in-one dashboard for modern marketing agencies.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#integrations" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
                <li><Link href="#" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Cohorts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
