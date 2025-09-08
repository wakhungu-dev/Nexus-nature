import mongoose from 'mongoose'; 
const mongoDbConnection = async () => {
 const uri = process.env.NEXT_PUBLIC_MONGODB_URI !;  
 try { 
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000, socketTimeoutMS: 3000, }) 
  console.log('Connected to MongoDB') 
  } catch (error: unknown) { 
  console.error('Error connecting to MongoDB:', error) 
 } 
};

export default mongoDbConnection;