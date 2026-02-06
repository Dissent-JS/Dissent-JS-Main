const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 500,
    },
    done: {
        type: Boolean,
        default: false,
    },
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
