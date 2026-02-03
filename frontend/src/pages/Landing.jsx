/**
 * Landing Page Component
 * Marketing surface for the DPI platform, with data fetched from backend.
 * * Made by: A highly caffeinated college student.
 */

import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShieldCheck,
  CalendarCheck,
  ArrowRight,
  Sparkles,
  Users,
  Star,
  PhoneCall,
  Laptop,
  Compass,
  Smile
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';

// 3. ICON MAP and Helper Function
// Maps string names (used in static data) to the imported Lucide React component
const iconMap = { Heart, ShieldCheck, CalendarCheck, ArrowRight, Sparkles, Users, Star, PhoneCall, Laptop, Compass, Smile };
const getIconComponent = (iconName) => iconMap[iconName] || Smile;


const Landing = () => {
    // Hooks from context/router
    const { user } = useAuth();
    const navigate = useNavigate();

    // Static marketing data (no longer fetched from backend)
    const staticStats = [
        { label: 'Students supported', value: '1.5k+' },
        { label: 'Counsellor sessions / month', value: '900+' },
        { label: 'Avg. response time', value: '<4 min' },
        { label: 'Data security score', value: 'A+' }
    ];
    const staticFeatures = [
        { title: 'Integrated workspace', description: 'Bookings, notes, and chat live inside one secure pane.', icon: 'Laptop' },
        { title: 'Role-aware access', description: 'Students, counsellors, and admins see the workflows that matter to them.', icon: 'Users' },
        { title: 'Clinical privacy', description: 'Audit trails, RBAC, and encryption keep sensitive data safe.', icon: 'ShieldCheck' }
    ];
    const staticJourney = [
        { title: 'Screen & triage', description: 'Smart intake surveys highlight red flags before escalation.', icon: 'Sparkles' },
        { title: 'Match & schedule', description: 'Students match with counsellors and self-book in seconds.', icon: 'CalendarCheck' },
        { title: 'Care & measure', description: 'Sessions, resources, and follow-up tasks stay connected.', icon: 'Heart' }
    ];
    const staticTestimonials = [
        { quote: '“DPI feels like a digital safety net. Students check in early, and our team can monitor sentiment all semester.”', name: 'Dr. Elaine Jacobs', role: 'Head of Counselling, Northwind University' },
        { quote: '“Booking therapy used to be intimidating. DPI made it as easy as reserving a study room.”', name: 'Leo Martins', role: 'Final-year Computer Science student' }
    ];
    const staticFaqs = [
        { question: 'How do I get campus data into DPI?', answer: 'Connect your SIS export or CSV during onboarding. We help you migrate user data safely.', icon: 'Compass' },
        { question: 'Can we customise the care pathways?', answer: 'Yes. Admins can configure focus areas and tailor booking forms per counsellor.', icon: 'Compass' },
    ];

    // Helper for primary CTA routing
    const handlePrimaryCta = useCallback(() => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/signup');
        }
    }, [user, navigate]);
    

    return (
        // Minimal/Soft Gradient Background
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 text-gray-800 font-sans">
            
            {/* Top Nav (Simplified & Sticky) */}
            <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-md">
                            <Heart className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">DPI Platform</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            to="/login"
                            className="hidden sm:inline-flex px-3 py-1 text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            Sign in
                        </Link>
                        <button
                            onClick={handlePrimaryCta}
                            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
                        >
                            {user ? 'Dashboard' : 'Launch App'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="max-w-6xl mx-auto px-4">
                
                {/* 1. Hero Section */}
                <section className="py-20 lg:py-24 grid gap-12 lg:grid-cols-2 items-center">
                    <div>
                        <p className="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full">
                            SUPPORT EVERY STUDENT
                        </p>
                        <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                            A resilient campus needs thoughtful, intelligent care.
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-lg">
                            DPI unifies bookings, resources, and crisis signaling so counsellors see the whole story in one glance.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={handlePrimaryCta}
                                className="inline-flex items-center px-6 py-3 text-base font-bold text-white bg-primary-600 rounded-xl shadow-lg hover:bg-primary-700 transition-all"
                            >
                                {user ? 'Continue' : 'Book a Demo'}
                                <ArrowRight className="w-5 h-5 ml-3" />
                            </button>
                        </div>

                        <div className="mt-12 grid gap-4 sm:grid-cols-2">
                            {staticStats.slice(0, 2).map((stat) => (
                                <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                    <p className="text-3xl font-extrabold text-primary-600">{stat.value}</p>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Simple Mockup/Data Card */}
                    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Live wellbeing pulse</p>
                                <p className="text-lg font-bold text-gray-900">Campus Calm Index</p>
                            </div>
                            <span className="inline-flex items-center text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Stable
                            </span>
                        </div>

                        <div className="rounded-xl bg-primary-700 text-white p-5 shadow-lg">
                            <p className="text-sm uppercase tracking-wide opacity-80">Need urgent care?</p>
                            <p className="mt-1 text-xl font-bold">24/7 Crisis Hotline</p>
                            <div className="mt-3 inline-flex items-center text-base font-medium text-white/90">
                                <PhoneCall className="w-4 h-4 mr-2" />
                                +1 (800) 555-CARE
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="my-10 border-gray-100"/>

                {/* 2. Platform Highlights */}
                <section id="platform" className="py-16">
                    <div className="text-center max-w-xl mx-auto">
                        <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">PLATFORM OVERVIEW</p>
                        <h2 className="mt-3 text-3xl font-bold text-gray-900">Everything you need for proactive care</h2>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {staticFeatures.map((feature) => {
                            const Icon = getIconComponent(feature.icon);
                            return (
                                <div key={feature.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-md hover:shadow-lg transition-all duration-300">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="mt-5 text-xl font-bold text-gray-900">{feature.title}</h3>
                                    <p className="mt-2 text-gray-600 text-sm">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <hr className="my-10 border-gray-100"/>


                {/* 3. Care Journey */}
                <section id="journey" className="py-16">
                    <div className="max-w-xl mx-auto text-center">
                        <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">CARE JOURNEY</p>
                        <h2 className="mt-3 text-3xl font-bold text-gray-900">Guide students from first check-in to wellbeing.</h2>
                    </div>

                    <div className="mt-12 space-y-6 max-w-3xl mx-auto">
                        {staticJourney.map((step, index) => {
                            const Icon = getIconComponent(step.icon);
                            return (
                                <div key={step.title} className="flex items-start space-x-4 rounded-xl border border-gray-100 bg-white p-5 shadow-lg">
                                    <div className="w-8 h-8 rounded-full bg-indigo-700 text-white flex items-center justify-center flex-shrink-0 mt-1">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-700 uppercase">Step {index + 1}</p>
                                        <h3 className="text-lg font-bold text-gray-900 mt-1">{step.title}</h3>
                                        <p className="text-gray-600 text-sm">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <hr className="my-10 border-gray-100"/>


                {/* 4. Testimonials */}
                <section id="stories" className="py-16">
                    <div className="max-w-xl mx-auto text-center">
                        <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">IMPACT STORIES</p>
                        <h2 className="mt-3 text-3xl font-bold text-gray-900">Loved by students and teams</h2>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-2">
                        {staticTestimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center space-x-1 text-yellow-500">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-current" />
                                    ))}
                                </div>
                                <p className="mt-4 text-base italic text-gray-800 leading-relaxed">"{testimonial.quote}"</p>
                                <div className="mt-6 pt-3 border-t border-gray-100">
                                    <p className="font-bold text-gray-900 text-md">{testimonial.name}</p>
                                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="my-10 border-gray-100"/>


                {/* 5. FAQ (Minimal Accordion Style) */}
                <section id="faq" className="py-16">
                    <div className="max-w-xl mx-auto text-center">
                        <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">FAQ</p>
                        <h2 className="mt-3 text-3xl font-bold text-gray-900">Launch DPI confidently</h2>
                    </div>

                    <div className="mt-12 space-y-4 max-w-3xl mx-auto">
                        {staticFaqs.map((faq, index) => {
                            const Icon = getIconComponent(faq.icon || 'Compass'); 
                            return (
                                <details key={index} className="bg-white rounded-xl border border-gray-100 shadow-md">
                                    <summary className="flex items-center space-x-4 p-5 cursor-pointer list-none">
                                        <Icon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                        <h3 className="text-lg font-semibold text-gray-900 flex-1">{faq.question}</h3>
                                        <ArrowRight className="w-4 h-4 text-gray-400 transform transition-transform duration-300" />
                                    </summary>
                                    <p className="px-5 pb-5 text-gray-600 border-t border-gray-100">{faq.answer}</p>
                                </details>
                            );
                        })}
                    </div>
                </section>

                {/* Final CTA */}
                <section id="cta" className="pb-20 pt-10">
                    <div className="bg-white border border-primary-100 rounded-2xl p-10 shadow-xl text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Get started in minutes</h2>
                        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                            Spin up the DPI platform and invite your team to start collaborating today.
                        </p>
                        <button
                            onClick={handlePrimaryCta}
                            className="mt-8 inline-flex items-center px-6 py-3 text-base font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-lg"
                        >
                            {user ? 'Open dashboard' : 'Get started now'}
                            <ArrowRight className="w-5 h-5 ml-3" />
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-100 py-8">
                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-white">Digital Psychological Intervention</p>
                        <p className="text-gray-400 mt-1">
                            © {new Date().getFullYear()} DPI Team.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-400">
                        <Link to="/login" className="hover:text-white">Login</Link>
                        <Link to="/signup" className="hover:text-white">Sign up</Link>
                        <a href="mailto:support@dpi.com" className="hover:text-white">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;