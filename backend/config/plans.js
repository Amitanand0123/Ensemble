export const PLANS={
    FREE:{
        id:'free',
        name:'Free',
        amount:0,
        currency:'INR',
        features:['1 Workspace','2 Projects','Basic Chat']
    },
    BASIC:{
        id:'basic',
        name:'Basic',
        amount:500,
        currency:'INR',
        features:['5 Workspaces','Unlimited Projects','File Sharing','Basic Support']
    },
    PREMIUM:{
        id:'premium',
        name:'Premium',
        amount:1500,
        currency:'INR',
        features:['Unlimited Workspaces','Priority Support','AI Summarise','Advanced Reporting']
    }
}

export const getPlanById=(planId)=>{
    if(!planId) return null;
    const upperCaseId=planId.toUpperCase();
    return PLANS[upperCaseId] || null;
}