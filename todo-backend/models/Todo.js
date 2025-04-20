const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  description: { type: String, default: '' },   // ✅ 描述字段
  
  dueDate: Date, // ✅ DDL字段
  done: { type: Boolean, default: false }, 
}, { timestamps: true }
)

module.exports = mongoose.model('Todo', TodoSchema)
