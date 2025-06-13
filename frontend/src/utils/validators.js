export const validateEmail=(email)=>{
    const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

export const validatePassword=(password)=>{
    return {
        isValid:password.length>=8,
        hasUpperCase:/[A-Z]/.test(password),
        hasLowerCase:/[a-z]/.test(password),
        hasNumber:/[0-9]/.test(password),
        hasSpecialChar:/[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
}

export const validateWorkspaceName=(name)=>{
    return name.length>=3 && name.length<=50
}

export const validateProjectName=(name)=>{
    return name.length>=3 && name.length<=100;
}

export const validateTaskTitle=(title)=>{
    return title.length>=3 && title.length<=200;
}

export const validateURL=(url)=>{
    try {
        new URL(url)
        return true
    } catch (error) {
        console.log(error)
        console.error('Invalid URL:',url)
    }
}