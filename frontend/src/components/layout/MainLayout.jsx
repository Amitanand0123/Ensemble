import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import PropTypes from 'prop-types';

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setSidebarOpen(false);
            }
        };

        checkMobile();

        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isMobile={isMobile}
            />

            {/* Mobile overlay backdrop */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                />
            )}

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto lg:ml-64 bg-background">
                {/* Mobile header with hamburger menu */}
                {isMobile && (
                    <div className="sticky top-0 z-30 bg-card border-b border-border p-4 flex items-center justify-between lg:hidden">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-6 h-6 text-foreground" />
                        </button>
                        <div className="flex items-center gap-2">
                            <img
                                src="/ensemble-logo-1.svg"
                                alt="Ensemble Logo"
                                className="h-7 w-auto"
                            />
                            <span className="text-lg font-bold text-foreground">Ensemble</span>
                        </div>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </div>
                )}

                {/* Page content */}
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
};

MainLayout.propTypes = {
    children: PropTypes.node.isRequired
};

export default MainLayout;
