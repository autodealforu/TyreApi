import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const MONGO_URI = 'mongodb+srv://light:light@cluster0.drlit.mongodb.net/multivendor_tyre?retryWrites=true&w=majority';

console.log('Attempting connection...');
mongoose.connect(MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})
.then(() => {
  console.log('SUCCESS: Connected to MongoDB!');
  process.exit(0);
})
.catch((err) => {
  console.error('FAILURE:', err);
  process.exit(1);
});
