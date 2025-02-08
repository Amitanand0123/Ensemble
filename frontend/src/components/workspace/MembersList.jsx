import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

const MembersList = ({ members }) => {
    if (!members || members.length === 0) {
        return <p className="text-gray-400 p-4">No members in this workspace yet.</p>;
    }

    return (
        <div className="space-y-4 p-4">
            {members.map((member) => (
                <Card key={member._id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-white">
                    <CardContent className="flex items-center space-x-4 p-4"> {/* Added padding inside CardContent */}
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={`https://avatar.vercel.sh/${member.user?.name}.png`} alt={member.user?.name} /> {/* Example avatar - replace if you have user images */}
                            <AvatarFallback>{member.user?.name?.first?.charAt(0)  || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{member.user?.name.first  || 'No Name'}</p>
                            <p className="text-sm text-gray-400">{member.user?.email || 'No Email'}</p>
                        </div>
                        <div className="ml-auto">
                            <span className="inline-block px-2 py-1 rounded-full bg-gray-700 text-gray-300 text-xs font-medium">{member.role}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default MembersList;