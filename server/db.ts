import mongoose, { Schema } from 'mongoose';

//connect to mongoDB - going to hide this
const myURI: string =
  'mongodb+srv://shandie231:peelerLambda@cluster0.nritsmb.mongodb.net/?retryWrites=true&w=majority';

//set uri to passed in value
const URI: string  = process.env.MONGO_URI || myURI;
console.log('ts');
const connectDB = (): void => {
  //attempt to connect to mongoDB using myURI string
//   mongoose.connect(myURI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
  mongoose.connect(myURI);

  //when connected display message to dev successful connection
  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB Atlas');
  });

  //if connection fails message dev failure message
  mongoose.connection.on('error', (error) => {
    console.log('Error connecting to MongoDB Atlas. Error: ', error);
  });
};

//run function to conncet to db

export default connectDB;
