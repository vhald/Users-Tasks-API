const express = require('express')
const router = new express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task')


router.post("/task", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    })
    try {

        await task.save()
        res.status(201).send(task);
    }
    catch (e) {
        res.status(400).send(e);
    };
});


// GET /tasks - complete task list
//////////////////////////////////////////////////////////////
// FILTERING
////////////////////// GET /tasks?limit=10&skip=10 - pagination
// PAGINATION
//////////////////////////////////////////////////////////////
// SORT - sort the tasks by createdAt, updatedAt, completedAt
router.get("/tasks", auth, async (req, res) => {
    // const task = Task.find({}) // this line is wrong no 'const task' is required

    const match = {}


    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {

                limit: parseInt(req.query.limit), // ignored if not a number
                skip: parseInt(req.query.skip), // skip the first N tasks
                sort // sort the tasks by createdAt, updatedAt, completedAt
            }
        })
        res.send(req.user.tasks)
    }
    catch (e) {
        res.status(500).send(e);
    };
});

router.get("/task/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {

        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            res.status(404).send("Task not found");
            return  // i have added this to stop the code from running further
        }
        res.send(task);
    }
    catch (e) {
        res.status(400).send(e);
    };
});


router.patch('/task/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["completed", "description"];
    const isValidOperation = updates.every((update => allowedUpdates.includes(update)));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })


        if (!task) {
            res.status(404).send("Task not found");
            return
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})


router.delete('/task/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        // made a mistake of id: instead of _id:  - leads to deletion of todo of 1 user.
        if (!task) {
            res.status(404).send('Task Not Found!')
            return
        }
        res.send('user data deleted')
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router;
