const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1/challenges");

const Challenge = mongoose.model("bask", {
    description: {
        type: String,
        trim: true,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
});

// const task = new Task({ // mistake here
const task = new Challenge({
    description:
        "hellow this is the description of the task and as you know you can many things that we can do in much faster way.",
});

task.save()
    .then(() => {
        // console.log(res);  // made mistake
        console.log(task);
    })
    .catch((err) => {
        console.log(err);
    });
