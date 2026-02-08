const Testimonials = () => {
    const testimonials = [
      {
        quote: "Ensemble has transformed how our team collaborates. It's intuitive, powerful, and just works.",
        author: "Amit Anand",
        role: "Product Manager",
        company: "Ensemble"
      },
      {
        quote: "The best project management tool we've used till now. The real-time features are game-changing.",
        author: "Vaishali Gupta",
        role: "Engineering Lead",
        company: "InnovateLabs"
      },
      {
        quote: "Outstanding support and constant improvements. Ensemble keeps getting better every month.",
        author: "Bruce Wayne",
        role: "Operations Director",
        company: "GrowthCo"
      }
    ];
  
    return (
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See what others are saying about their experience with Ensemble
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.author}
                className="bg-card rounded-2xl border border-border p-6 animate-fade-in-up ensemble-card-shadow"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-chart-3">★</span>
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-6">
                  {testimonial.quote}
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-full" />
                  <div className="ml-4">
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

export default Testimonials