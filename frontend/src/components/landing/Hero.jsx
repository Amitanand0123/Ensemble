import {ArrowRight,Users,Calendar,CheckCircle} from 'lucide-react';

const Hero=()=>{
    return(
        <div className='relative min-h-[calc(100vh-4rem)] flex items-center'>
            {/* Main content container */}
            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24'>
                <div className='grid lg:grid-cols-2 gap-12 items-center'>
                    {/* Left column */}
                    <div className='space-y-6 lg:space-y-8 text-center lg:text-left'>
                        {/* Animated badge */}
                        <div className='inline-flex items-center px-4 py-2 bg-accent/15 backdrop-blur-sm rounded-full border-2 border-accent/50 animate-fadeInUp shadow-lg hover:shadow-accent/20 transition-all'>
                            <span className='text-accent text-sm font-semibold'>
                                ✨ Streamline Your Workflow
                            </span>
                        </div>
                         {/* Main headline */}
                        <h1 className='text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight'>
                            <span className='block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-lg'>
                                Transform Your
                            </span>
                            <span className='block text-foreground mt-2 drop-shadow-md'>
                                Team Collaboration
                            </span>
                        </h1>
                        {/* Subheadline */}
                        <p className='text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fadeInUp'>
                            Empower your team with Ensemble&apos;s intuitive project management platform.
                            Organize, collaborate, and achieve more together.
                        </p>
                        {/* Buttons */}
                        <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fadeInUp pt-2'>
                            <button className='px-8 py-3.5 rounded-lg bg-sidebar text-sidebar-text font-bold hover:bg-sidebar-hover transition-all duration-200 flex items-center justify-center gap-2 group shadow-2xl hover:shadow-accent/30'>
                                Get Started Free
                                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform'/>
                            </button>
                            <button className='px-8 py-3.5 rounded-lg border-2 border-primary/60 text-foreground hover:bg-primary/10 hover:border-primary transition-all duration-200 font-bold shadow-lg hover:shadow-primary/20'>
                                Watch Demo
                            </button>
                        </div>
                        {/* Features List */}
                        <div className='grid grid-cols-2 gap-3 lg:gap-4 pt-4 animate-fadeInUp'>
                            <div className='flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors'>
                                <CheckCircle className='w-5 h-5 text-chart-4 flex-shrink-0' />
                                <span className='text-sm lg:text-base font-medium'>Real-time Updates</span>
                            </div>
                            <div className='flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors'>
                                <Users className='w-5 h-5 text-chart-1 flex-shrink-0' />
                                <span className='text-sm lg:text-base font-medium'>Team Collaboration</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                                <Calendar className="w-5 h-5 text-chart-3 flex-shrink-0" />
                                <span className='text-sm lg:text-base font-medium'>Smart Scheduling</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                                <CheckCircle className="w-5 h-5 text-chart-2 flex-shrink-0" />
                                <span className='text-sm lg:text-base font-medium'>Task Management</span>
                            </div>
                        </div>
                    </div>
                    {/* Right column */}
                    <div className='relative hidden lg:block animate-fadeInUp'>
                        <div className='relative'>
                            {/* Dashboard preview */}
                            <div className='bg-card/80 backdrop-blur-md rounded-2xl border-2 border-accent/40 p-6 shadow-2xl hover:shadow-accent/10 transition-all'>
                                <div className='grid grid-cols-3 gap-4'>
                                    {/* Animated placeholder cards */}
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                        key={i}
                                        className="h-24 bg-accent/10 rounded-lg animate-pulse border-2 border-accent/20 shadow-lg"
                                        style={{ animationDelay: `${i * 200}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Floating elements */}
                            <div className="absolute -top-6 -right-6 bg-chart-1/20 backdrop-blur-sm rounded-xl p-4 border-2 border-chart-1/50 animate-float shadow-2xl hover:shadow-accent/20 transition-all">
                                <div className="w-16 h-16 bg-chart-1/30 rounded-lg" />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-chart-3/20 backdrop-blur-sm rounded-xl p-4 border-2 border-chart-3/50 animate-float shadow-2xl hover:shadow-primary/20 transition-all" style={{animationDelay: '500ms'}}>
                                <div className="w-16 h-16 bg-chart-3/30 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero;