const express = require("express");
require("dotenv").config();
require('./db/mongoose.js')();
// the above order matter - don't change the line 2


// routes
const userRouter = require('./routes/users');
const taskRouter = require('./routes/tasks')


const app = express();

const port = process.env.PORT;


app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
