import React from 'react';
import { Card, CardContent } from '../ui/card';
import { FileText } from 'lucide-react';

const FilesList = ({ workspaceId }) => {
    return (
        <Card className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-white animate-fade-in-up">
            <CardContent className="p-8 flex flex-col items-center justify-center"> {/* Added padding and flex centering */}
                <FileText className="w-12 h-12 text-gray-500 mb-4" /> {/* Larger icon, gray color, margin-bottom */}
                <p className="text-gray-400 text-center text-lg">Files feature coming soon...</p> {/* Centered text, larger font */}
                <p className="text-gray-500 text-center text-sm mt-2">Stay tuned for updates!</p> {/* Smaller text, hint for updates */}
            </CardContent>
        </Card>
    );
};

export default FilesList;