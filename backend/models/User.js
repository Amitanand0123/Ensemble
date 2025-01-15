import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const NotificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: [
      'workspace_invite',
      'project_invite', 
      'task_assignment',
      'mention',
      'deadline',
      'comment',
      'status_change',
      'system'
    ]
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  link: { type: String }, // URL to the relevant content
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const UserSchema = new mongoose.Schema(
  {
    name: { 
      first: { type: String, required: true, trim: true },
      last: { type: String, required: true, trim: true } 
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
      index: true
    },

    password: { 
      type: String, 
      required: true, 
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
  },

    role: { 
      type: String, 
      enum: ['user', 'admin', 'moderator'], 
      default: 'user' 
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },

    avatar: { 
      url: { type: String, default: 'default-avatar.png' },
      uploadDate: { type: Date }
    },

    bio: { 
      type: String, 
      maxlength: [500, 'Bio cannot be more than 500 characters'],
      trim: true 
    },

    skills: [{
      type: String,
      trim: true
    }],

    location: {
      country: { type: String },
      city: { type: String },
      timezone: { type: String }
    },
    
    projects: [{
      project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      role: { type: String, enum: ['owner', 'member', 'contributor'] },
      joinedAt: { type: Date, default: Date.now }
    }],

    notifications: [NotificationSchema],

    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      resetPasswordToken: String,
      resetPasswordExpire: Date,
      lastPasswordChange: Date
    },

    activity: {
      lastLogin: { type: Date },
      totalProjects: { type: Number, default: 0 },
      loginHistory: [{
         date: { type: Date, default: Date.now },
         ip: { type: String },
         device: { type: String }
      }] // Add this array to store login history
   }
   ,

    socialLinks: {
      github: { type: String },
      linkedin: { type: String },
      website: { type: String }
    },

    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications:{
        email:{
          workspaceInvites:{type:Boolean,default:true},
          taskAssignments:{type:Boolean,default:true},
          mentions:{type:Boolean,default:true},
          updates:{type:Boolean,default:true}
        },
        push:{
          enabled:{type:Boolean,default:true},
          browser:{type:Boolean,default:true}
        }
      },
      taskView:{type:String,enum:['list','board'],default:'board'},
      timezone:{type:String,default:'UTC'}
    },

    workspaces:[{
      workspace:{type:mongoose.Schema.Types.ObjectId,ref:'Workspace'},
      role:{type:String,enum:['owner','admin','member']},
      favorite:{type:Boolean,default:false},
      lastAccessed:{type:Date}
    }],

    recentWorkspaces:[{
      workspace:{type:mongoose.Schema.Types.ObjectId,ref:'Workspace'},
      lastAccess:{type:Date}
    }].slice(0,5),

    email_verification:{
      verified:{type:Boolean,default:false},
      token:String,
      tokenExpires:Date
    }
  },

  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance

UserSchema.index({ 'skills': 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.name.first} ${this.name.last}`;
});

// Pre-save middleware for password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    if (this.isModified('password') && !this.isNew) {
      this.security.lastPasswordChange = Date.now();
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to update last login
UserSchema.methods.updateLoginInfo = async function(ip, device) {
  this.activity.lastLogin = Date.now();
  this.activity.loginHistory.push({ date: Date.now(), ip, device });
  await this.save();
};

UserSchema.methods.getActiveWorkspaces = async function() {
  return this.workspaces.filter(w => w.status!='inactive');
}

UserSchema.methods.addRecentWorkspace=function(workspaceId){
  const index=this.recentWorkspaces.findIndex(w=>w.workspace.toString()===workspaceId.toString());
  if(index>-1){
    this.recentWorkspaces.splice(index,1);
  }

  this.recentWorkspaces.unshift({
    workspace:workspaceId,
    lastAccess:new Date()
  })

  this.recentWorkspaces=this.recentWorkspaces.slice(0,5);
}

// Static method to get user stats
UserSchema.statics.getUserStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0] 
          }
        },
        averageProjects: { $avg: '$activity.totalProjects' }
      }
    }
  ]);
};

export default mongoose.model('User', UserSchema);