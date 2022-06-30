const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getBoards, getBoardById, addBoard, updateBoard, removeBoard, addGroup, updateGroup,
    addTask, updateTask } = require('./board.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getBoards)
router.get('/:boardId', getBoardById)
router.post('/', addBoard)
router.put('/', updateBoard)
router.delete('/:boardId', requireAuth, removeBoard)
router.post('/:boardId/group/:groupId', addGroup)
router.put('/:boardId/group', updateGroup)
router.post('/:boardId/group/:groupId/task/:taskId', addTask)
router.put('/:boardId/group/:groupId/task', updateTask)


module.exports = router

