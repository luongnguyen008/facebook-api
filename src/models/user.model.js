import mongoose from "mongoose";
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: false,
    },
    phonenumber: {
        type: Schema.Types.String,
        required: true,
    },
    password: {
        type: Schema.Types.String,
        required: true,
    },
    session:{
        deviceId: {
            type: Schema.Types.String,
        },
        token: {
            type: Schema.Types.String,
        }
    }
    
}, {timestamps: true})
const User = mongoose.model('User', userSchema);
export default User