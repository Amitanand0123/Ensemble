import mongoose from 'mongoose'; // Imports the mongoose library, which is an ODM (Object Data Modeling) tool for MongoDB.

const connectDB = async () =>{
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected')
  } catch(error){
    console.error(error.message);
    process.exit(1);
  }
}

export default connectDB; 