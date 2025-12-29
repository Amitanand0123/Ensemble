import { BarChart, Briefcase, Calendar, Lock, Users, Zap } from 'lucide-react';

const Features=()=>{
    const features = [
        {
          icon: <Zap className="w-8 h-8" />,
          title: "Lightning Fast",
          description: "Experience real-time updates and seamless collaboration across your entire team.",
          colorClass: "from-chart-1/80 to-chart-1",
          borderColor: "border-chart-1/20"
        },
        {
          icon: <Users className="w-8 h-8" />,
          title: "Team Management",
          description: "Organize your team efficiently with roles, permissions, and detailed activity tracking.",
          colorClass: "from-chart-3/80 to-chart-3",
          borderColor: "border-chart-3/20"
        },
        {
          icon: <Lock className="w-8 h-8" />,
          title: "Enterprise Security",
          description: "Bank-grade encryption and security measures to keep your data safe and secure.",
          colorClass: "from-chart-5/80 to-chart-5",
          borderColor: "border-chart-5/20"
        },
        {
          icon: <Briefcase className="w-8 h-8" />,
          title: "Project Templates",
          description: "Start projects quickly with customizable templates suited to your workflow.",
          colorClass: "from-chart-4/80 to-chart-4",
          borderColor: "border-chart-4/20"
        },
        {
          icon: <BarChart className="w-8 h-8" />,
          title: "Analytics Dashboard",
          description: "Gain insights with comprehensive project analytics and team performance metrics.",
          colorClass: "from-chart-2/80 to-chart-2",
          borderColor: "border-chart-2/20"
        },
        {
          icon: <Calendar className="w-8 h-8" />,
          title: "Smart Scheduling",
          description: "Automate task scheduling and deadlines with intelligent time management.",
          colorClass: "from-primary/80 to-primary",
          borderColor: "border-primary/20"
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className='absolute left-1/3 top-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse'/>
            <div className='absolute right-1/4 bottom-20 w-80 h-80 bg-chart-1/15 rounded-full blur-3xl animate-pulse' style={{animationDelay: '1s'}}/>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Section Header */}
            <div className="text-center mb-12 md:mb-16 lg:mb-20 animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-lg">
                  Powerful Features for Modern Teams
                </span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                Everything you need to manage projects, collaborate with your team, and deliver results on time.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="relative group p-6 lg:p-8 bg-card/80 backdrop-blur-md rounded-xl border-2 border-accent/30 hover:border-accent/60 transition-all duration-300 animate-fadeInUp hover:shadow-2xl hover:shadow-accent/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.colorClass} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
                  <div className={`relative inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.colorClass} mb-5 shadow-2xl group-hover:scale-110 transition-transform duration-300 border-2 border-white/10`}>
                    <div className="text-background">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="relative text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">{feature.title}</h3>
                  <p className="relative text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
}

export default Features;
