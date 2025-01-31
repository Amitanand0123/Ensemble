import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react'

const InputField=({icon:Icon,type:initialType,placeholder,value,onChange,name,error})=>{
    const [showPassword,setShowPassword]=useState(false);
    const type=initialType==="password" && showPassword?"text":initialType;

    return (
        <div className='space-y-1'>
            <div className='relative'>
                <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                    <Icon className="w-5 h-5"/>
                </div>
                <input 
                    type={type} 
                    name={name}
                    className={`w-full bg-gray-800/50 border ${error?'border-red-500/50':'border-gray-700'} rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors backdrop-blur-sm`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
                {type==="password" &&(
                    <button
                        type="button"
                        onClick={()=>setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300'>
                        {showPassword? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                )}
            </div>
            {error && (
                <p className='text-sm text-red-500 pl-1'>{error}</p>
            )}
        </div>
    )
}

export default InputField;