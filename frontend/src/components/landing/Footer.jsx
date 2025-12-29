import { Github, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
    const footerLinks = {
      Product: ['Features', 'Pricing', 'Security', 'Roadmap'],
      Company: ['About', 'Careers', 'Blog', 'Press'],
      Resources: ['Documentation', 'Help Center', 'API', 'Status'],
      Legal: ['Privacy', 'Terms', 'Cookie Policy']
    };
  
    return (
      <footer className="bg-background border-t border-border pt-16 md:pt-24 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-8 md:mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img src="/ensemble-logo-1.svg" alt="Ensemble Logo" className="h-8 w-auto" />
                <span className="text-2xl font-semibold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">Ensemble</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                Empower your team with the most intuitive project management platform.
                Built for modern teams who value efficiency and collaboration.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-foreground font-semibold mb-4">{category}</h3>
                <ul className="space-y-2.5">
                  {links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 md:pt-8 mt-6 md:mt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} Ensemble. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center space-x-6">
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  };

export default Footer;