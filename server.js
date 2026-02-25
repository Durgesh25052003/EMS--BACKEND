const env=require('dotenv');
const fs=require('fs');

if(process.env.NODE_ENV !== 'production' && fs.existsSync('./config.env')){
  env.config({ path: './config.env' });
} else {
  env.config();
}

const app=require('./app')
const mongoose=require('mongoose');

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('Connected to MongoDB')) .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process with a non-zero exit code
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
