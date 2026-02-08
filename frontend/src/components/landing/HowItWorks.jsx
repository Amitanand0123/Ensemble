import { ArrowRight } from "lucide-react";

const HowItWorks = () => {
    const steps = [
      {
        number: "01",
        title: "Create Your Workspace",
        description: "Set up your team workspace in minutes and invite your colleagues."
      },
      {
        number: "02",
        title: "Add Your Projects",
        description: "Create projects and organize tasks using our intuitive interface."
      },
      {
        number: "03",
        title: "Collaborate & Track",
        description: "Work together in real-time and monitor progress effortlessly."
      },
      {
        number: "04",
        title: "Deliver Results",
        description: "Complete projects on time and celebrate team success."
      }
    ];
  
    return (
      <section className="py-24 bg-muted relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Ensemble Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in minutes with our simple four-step process
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="bg-card rounded-2xl border border-border p-6 h-full hover:transform hover:-translate-y-2 transition-all duration-300 ensemble-card-shadow">
                  <span className="text-5xl font-bold text-primary">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-7 w-6 h-6 text-muted-foreground transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

export default HowItWorks;