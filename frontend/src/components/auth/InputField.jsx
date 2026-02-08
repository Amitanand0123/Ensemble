import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react'
import PropTypes from 'prop-types';

const InputField=({icon:Icon,type:initialType,placeholder,value,onChange,name,error})=>{
    const [showPassword,setShowPassword]=useState(false);
    const type=initialType==="password" && showPassword?"text":initialType;

    return (
        <div className='space-y-1'>
            <div className='relative'>
                <div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                    <Icon className="w-5 h-5"/>
                </div>
                <input
                    type={type}
                    name={name}
                    className={`w-full bg-input border-2 ${error?'border-destructive/50':'border-border'} rounded-lg py-3 px-10 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
                {type==="password" &&(
                    <button
                        type="button"
                        onClick={()=>setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'>
                        {showPassword? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                )}
            </div>
            {error && (
                <p className='text-sm text-destructive pl-1'>{error}</p>
            )}
        </div>
    )
}

InputField.propTypes={
    icon:PropTypes.elementType.isRequired,
    type:PropTypes.string.isRequired,
    placeholder:PropTypes.string.isRequired,
    value:PropTypes.string.isRequired,
    onChange:PropTypes.func.isRequired,
    name:PropTypes.string.isRequired,
    error:PropTypes.string,
}


export default InputField;