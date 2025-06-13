import {ArrowRight,Users,Calendar,CheckCircle} from 'lucide-react';

const Hero=()=>{
    return(
        <div className='relative'>
            <div className='absolute inset-0 overflow-hidden'>
                <div className='absolute -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse'/>
                <div className='absolute top-20 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500'/>
                <div className='absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000'/>
            </div>
            {/* Main content container */}
            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16'>
                <div className='grid lg:grid-cols-2 gap-12 items-center'>
                    {/* Left column */}
                    <div className='space-y-8 text-center lg:text-left'>
                        {/* Animated badge */}
                        <div className='inline-flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-smbackdrop-blur-sm rounded-full border border-gray-700 animate-fade-in-up'>
                            <span className='text-gray-300 text-sm'>
                                ✨ Streamline Your Workflow
                            </span>
                        </div>
                         {/* Main headline */}
                        <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold'>
                            <span className='block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient'>
                                Transform Your
                            </span>
                            <span className='block text-white mt-2'>
                                Team Collaboration
                            </span>
                        </h1>
                        {/* Subheadline */}
                        <p className='text-lg md:text-xl text-gray-300 max-w-2xl animate-fade-in-up delay-200'>
                            Empower your team with Ensembles intuitive project management platform. 
                            Organize, collaborate, and achieve more together.
                        </p>
                        {/* Buttons */}
                        <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300'>
                            <button className='px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 group'>
                                Get Started Free
                                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform'/>
                            </button>
                            <button className='px-8 py-4 rounded-full border border-gray-700 text-white hover:bg-gray-800/50 transition-all duration-300'>
                                Watch Demo
                            </button>
                        </div>
                        {/* Features List */}
                        <div className='grid grid-cols-2 gap-4 mt-12 animate-fade-in-up delay-400'>
                            <div className='flex items-center gap-2 text-gray-300'>
                                <CheckCircle className='"w-5 h-5 text-green-500' />
                                <span>Real-time Updates</span>
                            </div>
                            <div className='flex items-center gap-2 text-gray-300'>
                                <Users className='w-5 h-5 text-blue-500' />
                                <span>Team Collaboration</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                <span>Smart Scheduling</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <CheckCircle className="w-5 h-5 text-pink-500" />
                                <span>Task Management</span>
                            </div>
                        </div>
                    </div>
                    {/* Right column */}
                    <div className='relative lg:block animate-fade-in-up delay-500'>
                        <div className='relative'>
                            {/* Dashboard preview */}
                            <div className='bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 shadow-2xl'>
                                <div className='grid grid-cols-3 gap-4'>
                                    {/* Animated placeholder cards */}
                                    {[...Array(6)].map((_, i) => (
                                        <div 
                                        key={i}
                                        className="h-24 bg-gray-700/50 rounded-lg animate-pulse"
                                        style={{ animationDelay: `${i * 200}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Floating elements */}
                            <div className="absolute -top-6 -right-6 bg-blue-500/10 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20 animate-float">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-lg" />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-purple-500/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20 animate-float delay-500">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero;