const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    }
});

userSchema.statics.findAndValidate = async function (username, password) { // can't use arrow function here! THIS
    const foundUser = await this.findOne({username});
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid ? foundUser : false;
};

userSchema.pre('save', async function(next) { // hashing middleware before .save() is called
    if(!this.isModified('password')) return next(); // if there is no modification in the user, just move along
    this.password = await bcrypt.hash(this.password, 12);
    next(); 
})

module.exports = mongoose.model('User', userSchema);