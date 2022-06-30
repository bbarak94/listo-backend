const utilService = require('../../services/util.service')

const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId


async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('board')
        var boards = await collection.find(criteria).toArray()
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const board = collection.findOne({ _id: ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.deleteOne({ _id: ObjectId(boardId) })
        return boardId
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function add(board) {
    try {
        const collection = await dbService.getCollection('board')
        const res = await collection.insertOne(board)
        return res.ops[0]
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board) {
    try {
        var id = ObjectId(board._id)
        delete board._id
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: id }, { $set: { ...board } })
        board._id = id
        return board
    } catch (err) {
        logger.error(`cannot update board ${boardId}`, err)
        throw err
    }
}

async function addGroup(newGroup, boardId, loggedinUser) {
    const board = await getById(boardId)
    board.groups.push(newGroup)
    const boardToUpdate = _addActivityToBoard('added a group to', newGroup, loggedinUser, board, 'group')
    return await update(boardToUpdate)
}

async function updateGroup(groupToUpdate, boardId, loggedinUser) {
    const board = await getById(boardId)
    const groupIdx = board.groups.findIndex(currGroup => currGroup.id === groupToUpdate.id)
    board.groups.splice(groupIdx, 1, groupToUpdate)
    const boardToUpdate = _addActivityToBoard('updated a group from', groupToUpdate, loggedinUser, board, 'group')
    return await update(boardToUpdate)
}

async function addTask(newTask, boardId, groupId, loggedinUser) {
    const board = await getById(boardId)
    const group = board.groups.find(group => group.id === groupId)
    group.tasks.push(newTask)
    const boardToUpdate = _addActivityToBoard('added a task', newTask, loggedinUser, board)
    return await update(boardToUpdate)
}

async function updateTask(taskToUpdate, boardId, groupId, loggedinUser) {
    const board = await getById(boardId)
    const group = board.groups.find(group => group.id === groupId)
    const taskIdx = group.tasks.findIndex(task => task.id === taskToUpdate.id)
    group.tasks.splice(taskIdx, 1, taskToUpdate)
    const boardToUpdate = _addActivityToBoard('updated a task', taskToUpdate, loggedinUser, board)
    return await update(boardToUpdate)
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.userId) {
        criteria["createdBy._id"] = ObjectId(filterBy.userId)
    }
    return criteria
}

function _addActivityToBoard(txt, entity, loggedinUser, board, type) {
    const boardToUpdate = { ...board }
    if (!loggedinUser) loggedinUser = {
        "_id": "62953c7742e472253897fe9e",
        "fullname": "Guest",
        "imgUrl": "https://res.cloudinary.com/bbarak94/image/upload/v1653409951/guest_he90su.jpg"
    }
    const newActivity = _createActivity(txt, entity, loggedinUser, type)
    boardToUpdate.activities.unshift(newActivity)
    return boardToUpdate
}

function _createActivity(txt, entity, loggedinUser, type = 'task') {
    return {
        byMember: loggedinUser,
        id: utilService.makeId(),
        createdAt: Date.now(),
        txt,
        [type]: {
            id: entity.id,
            title: entity.title,
            txt
        },
    }
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addGroup,
    updateGroup,
    addTask,
    updateTask
}