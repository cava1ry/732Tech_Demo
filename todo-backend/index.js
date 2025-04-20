const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()  // ✅ 引入 .env 文件
const todosRouter = require('./routes/todos')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// MongoDB 连接
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err))

// 使用 todos 路由模块
app.use('/todos', todosRouter)

const PORT = 3000
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})

// app.patch('/todos/test', (req, res) => {
//   console.log('✅ /todos/test 收到 PATCH 请求', req.body)
//   res.json({ message: 'ok' })
// })

