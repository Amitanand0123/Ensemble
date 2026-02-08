import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import SidebarHeader from './SidebarHeader';
import SidebarQuickActions from './SidebarQuickActions';
import SidebarProjectSection from './SidebarProjectSection';
import SidebarDirectMessages from './SidebarDirectMessages';
import SidebarFooter from './SidebarFooter';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
    const location = useLocation();
    const [collapsedSections, setCollapsedSections] = useState({});

    const toggleSection = (sectionId) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`
                    fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50
                    transition-transform duration-300 ease-in-out
                    ${isMobile
                        ? (isOpen ? 'translate-x-0' : '-translate-x-full')
                        : 'translate-x-0'
                    }
                    lg:translate-x-0
                `}
            >
                {/* Sidebar Header - Workspace Switcher */}
                <SidebarHeader />

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
                    {/* Quick Actions */}
                    <SidebarQuickActions />

                    {/* Projects Section */}
                    <SidebarProjectSection
                        collapsedSections={collapsedSections}
                        toggleSection={toggleSection}
                        currentPath={location.pathname}
                        onNavigate={isMobile ? onClose : undefined}
                    />

                    {/* Direct Messages */}
                    <SidebarDirectMessages
                        currentPath={location.pathname}
                        onNavigate={isMobile ? onClose : undefined}
                    />
                </div>

                {/* Sidebar Footer - User Profile */}
                <SidebarFooter onNavigate={isMobile ? onClose : undefined} />
            </aside>
        </>
    );
};

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired
};

export default Sidebar;
