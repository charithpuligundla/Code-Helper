import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
});

const user = mongoose.model('user', userSchema);
export default user;