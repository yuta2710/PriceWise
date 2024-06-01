import mongoose from 'mongoose';

let isConneted: boolean = false // Track connection status 

export const connectToDb = async() => {
  mongoose.set('strictQuery', true)

  if(!process.env.MONGODB_URI) return console.log('MONGODB_URI is not defined');

  if(isConneted) return console.log('=> using existing database connection')

  try {
    await mongoose.connect(process.env.MONGODB_URI)
    isConneted = true 
    console.log('MongoDB Connected');
  } catch (error) {
    console.log(error)
  }
}