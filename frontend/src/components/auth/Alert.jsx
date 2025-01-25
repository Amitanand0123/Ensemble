import React,{useState} from 'react';
import {AlertCircle} from 'lucide-react';


const Alert=({message,type="error"})=>{
    const bgColor=type==="error"?"bg-red-500/10":"bg-green-500/10";
    const borderColor=type==="error"?"border-red-500/20":"border-green-500/20";
    const textcolor=type==="error"?"text-red-500":"text-green-500";

    return(
        <div className={`flex items-center gap-2 p-4 rounded-lg ${bgColor} ${borderColor} border backdrop:-blur-sm animate-fade-in-up`}>
            <AlertCircle className={`w-5 h-5 ${textcolor}`} />
            <p className={`text-sm ${textcolor}`}>{message}</p>
        </div>
    )
}

export default Alert;