import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const schema = mongoose.Schema({
  email: String,
  username: String
});

schema.plugin(passportLocalMongoose, { usernameField: 'email' });

export default mongoose.model('User', schema);
