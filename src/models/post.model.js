import mongoose from "mongoose";
const Schema = mongoose.Schema

const postSchema = new Schema({
    ownerId: {
        type: Schema.Types.String,
        required: true,
    },
    described: {
        type: Schema.Types.String,
        required: true,
    },
    status: {
        type: Schema.Types.String,
        required: false,
    },
    images: [
        {
            path: {
                type: Schema.Types.String 
            }, 
            index: {
                type: Schema.Types.Number
            }
        },
    ],
    videos: [
        {
            path: {
                type: Schema.Types.String 
            }, 
            index: {
                type: Schema.Types.Number
            }
        },
    ],
    comments: [
        {
            poster: {
                type: Schema.Types.String,
            },
            comment: {
                type: Schema.Types.String,
            },
            createAt: {
                type: Schema.Types.Date
            }
        }
    ],
    reports: [
        {
            subject: {
                type: Schema.Types.String,
            },
            details: {
                type: Schema.Types.String,
            },
        }
    ],
    react_user: [
       Schema.Types.String,
    ],

}, {timestamps: true})
const Post = mongoose.model('Post', postSchema);
export default Post