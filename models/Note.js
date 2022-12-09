const mongoose= require('mongoose')

const autoIncrement= require('mongoose-sequence')(mongoose)

const notesSchema= mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

notesSchema.plugin(
    autoIncrement,
    {
        inc_field: 'ticket',
        id: 'tiketNums',
        start_seq: 500
    }
)

module.exports= mongoose.model('Note', notesSchema)