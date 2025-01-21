import { BarChart, Briefcase, Calendar, Lock, Users, Zap } from 'lucide-react';
import React from 'react';

const Features=()=>{
    const features = [
        {
          icon: <Zap className="w-8 h-8" />,
          title: "Lightning Fast",
          description: "Experience real-time updates and seamless collaboration across your entire team.",
          color: "from-blue-400 to-blue-600"
        },
        {
          icon: <Users className="w-8 h-8" />,
          title: "Team Management",
          description: "Organize your team efficiently with roles, permissions, and detailed activity tracking.",
          color: "from-purple-400 to-purple-600"
        },
        {
          icon: <Lock className="w-8 h-8" />,
          title: "Enterprise Security",
          description: "Bank-grade encryption and security measures to keep your data safe and secure.",
          color: "from-pink-400 to-pink-600"
        },
        {
          icon: <Briefcase className="w-8 h-8" />,
          title: "Project Templates",
          description: "Start projects quickly with customizable templates suited to your workflow.",
          color: "from-green-400 to-green-600"
        },
        {
          icon: <BarChart className="w-8 h-8" />,
          title: "Analytics Dashboard",
          description: "Gain insights with comprehensive project analytics and team performance metrics.",
          color: "from-yellow-400 to-yellow-600"
        },
        {
          icon: <Calendar className="w-8 h-8" />,
          title: "Smart Scheduling",
          description: "Automate task scheduling and deadlines with intelligent time management.",
          color: "from-red-400 to-red-600"
        }
    ];

    return (
        <section className="py-24 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-20 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Powerful Features for Modern Teams
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Everything you need to manage projects, collaborate with your team, and deliver results on time.
              </p>
            </div>
    
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="relative group p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
}

export default Features;