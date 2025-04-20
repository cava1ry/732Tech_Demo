const express = require('express')
const router = express.Router()
const Todo = require('../models/Todo')

// 获取所有 todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 })
    res.json(todos)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
})


// 添加todo
router.post('/', async (req, res) => {
  console.log('✅ 收到 POST /todos 请求，内容为：', req.body)  // ✅ 加日志
  const { title } = req.body
  if (!title) return res.status(400).json({ error: 'Title is required' })

  try {
    const newTodo = new Todo({ title })
    await newTodo.save()
    res.status(201).json(newTodo)
  } catch (err) {
    console.error('❌ 创建任务失败:', err)
    res.status(500).json({ error: 'Failed to create todo' })
  }
})



// 根据标题关键词查找任务（模糊匹配）
router.get('/search/title', async (req, res) => {
  const { keyword } = req.query
  if (!keyword) return res.status(400).json({ error: '缺少搜索关键词' })

  try {
    const todos = await Todo.find({ title: { $regex: keyword, $options: 'i' } })
    res.json(todos)
  } catch (err) {
    res.status(500).json({ error: '搜索失败' })
  }
})



// 删除todo
router.delete('/:id', async (req, res) => {
    const { id } = req.params
  
    try {
      const deleted = await Todo.findByIdAndDelete(id)
      if (!deleted) return res.status(404).json({ error: 'Todo not found' })
      res.json({ message: 'Todo deleted successfully' })
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete todo' })
    }
  })
  

// 切换任务完成状态
// 切换任务完成状态 + 更新描述 + 截止日期
router.patch('/:id', async (req, res) => {
  console.log('✅ PATCH 收到请求:', req.params.id, req.body)

  const { id } = req.params
  const updateFields = {}

  if ('done' in req.body) updateFields.done = req.body.done
  if ('description' in req.body) updateFields.description = req.body.description
  if ('dueDate' in req.body) updateFields.dueDate = req.body.dueDate  // ✅ 加这一行

  updateFields.updatedAt = new Date()

  try {
    const todo = await Todo.findByIdAndUpdate(id, updateFields, { new: true })
    if (!todo) return res.status(404).json({ error: 'Todo not found' })
    res.json(todo)
  } catch (err) {
    console.error('❌ PATCH 错误:', err)
    res.status(500).json({ error: '更新失败' })
  }
})







// 导出路由模块
module.exports = router
