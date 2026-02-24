const app=require('./app')
const env=require('dotenv');
const mongoose=require('mongoose');

env.config({path:'./config.env'});

const rawString=process.env.MONGO_URI;

const connectionString=rawString.replace('<Password>',process.env.DB_PASSWORD)

mongoose.connect(connectionString)
.then(()=>console.log('Connected to MongoDB')) .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process with a non-zero exit code
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log('Server is running on port 3000');
})
