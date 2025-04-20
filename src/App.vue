


<template>
  <div class="container">


    

    <button @click="toggleDarkMode" style="float: right; margin-bottom: 10px;">
    🌗 {{ isDark ? 'Day Mode' : 'Night Mode' }}
    </button>
    <div class="notebook">
      
      <h1 class = "main-title">📝 Todo List</h1>
      <div class="main">
        <!-- 左侧任务列表 -->
        <div class="task-list">
          <div class="input-row">
            <input v-model="newTodo" placeholder="Please input the title: " />
            <button @click="addTodo">Add to List</button>
            <button @click="searchLocal">Search From List</button>
          </div>
          <div class="filter-row">
            <button :class="{ active: filterStatus === 'all' }" @click="filterStatus = 'all'">All</button>
            <button :class="{ active: filterStatus === 'incomplete' }" @click="filterStatus = 'incomplete'">Incomplete</button>
            <button :class="{ active: filterStatus === 'completed' }" @click="filterStatus = 'completed'">Completed</button>
          </div>



          <transition-group name="bounce" tag="ul">
            <li
              v-for="todo in filteredTodos"
              :key="todo._id"
              @click="selectTodo(todo)"
              class="task-item"
              :class="{ 'due-soon': isDueSoon(todo), 'done': todo.done }"
            >
              <input
                type="checkbox"
                :checked="todo.done"
                @change.stop="toggleDone(todo)"
                class="checkbox"
              />
              <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
                <span v-if="!todo.done && todo.dueDate && isDueSoon(todo.dueDate)">⚠️</span>
                {{ todo.title }}
              </span>
              <button @click.stop="deleteTodo(todo._id)">❌</button>
            </li>
          </transition-group>



        </div>
        <transition name="slide">
          <!-- 右侧详情编辑框 -->
          <div class="detail-panel" v-if="selectedTodo">
            <h2>📝 Edit Note</h2>
            <p><strong>Title of the task: </strong>{{ selectedTodo.title }}</p>

            <textarea v-model="editedDescription" placeholder="Input Note..."></textarea>

            <label style="display: block; margin-top: 10px;">
              Deadline(Optional):
              <input type="date" v-model="editedDueDate" />
            </label>

            <button @click="saveDescription">Save the edit</button>
            <button @click="selectedTodo = null" style="margin-top: 10px;">Close</button>
          </div>
      </transition>

        
    

      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import confetti from 'canvas-confetti'

const todos = ref([])
const newTodo = ref('')
const selectedTodo = ref(null)
const editedDescription = ref('')
// 新增DDL
const editedDueDate = ref('')

const searchKeyword = ref('')
const isDark = ref(false)



// 切换夜间模式
const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark', isDark.value)
}

// 获取任务
const fetchTodos = async () => {
  try {
    const res = await axios.get('http://localhost:3000/todos')
    todos.value = res.data
  } catch (err) {
    console.error('获取任务失败', err)
  }
}

// 添加任务
const addTodo = async () => {
  const title = newTodo.value.trim()
  if (!title) return

  try {
    const res = await axios.post('http://localhost:3000/todos', { title })
    todos.value.push(res.data)
    newTodo.value = ''
    searchKeyword.value = '' // 添加后重置查找关键词
  } catch (err) {
    console.error('添加失败', err)
  }
}

// 本地查找任务
const searchLocal = () => {
  const keyword = newTodo.value.trim()
  searchKeyword.value = keyword
}

// // computed：筛选显示的任务列表
// const filteredTodos = computed(() =>
//   searchKeyword.value
//     ? todos.value.filter(todo =>
//         todo.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
//       )
//     : todos.value
// )




const filterStatus = ref('all') // 可选值：'all', 'completed', 'incomplete'

// 任务筛选逻辑，结合关键词 + 状态
const filteredTodos = computed(() => {
  return todos.value.filter(todo => {
    const matchKeyword = searchKeyword.value
      ? todo.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
      : true

    const matchStatus =
      filterStatus.value === 'all' ||
      (filterStatus.value === 'completed' && todo.done) ||
      (filterStatus.value === 'incomplete' && !todo.done)

    return matchKeyword && matchStatus
  })
})



// 删除任务
const deleteTodo = async (id) => {
  try {
    await axios.delete(`http://localhost:3000/todos/${id}`)
    todos.value = todos.value.filter(todo => todo._id !== id)
    if (selectedTodo.value?._id === id) selectedTodo.value = null
  } catch (err) {
    console.error('删除失败:', err)
  }
}

// 点击任务显示详情
const selectTodo = (todo) => {
  selectedTodo.value = todo
  editedDescription.value = todo.description || ''
  editedDueDate.value = todo.dueDate ? todo.dueDate.slice(0, 10) : '' // 格式为 yyyy-mm-dd
}


// 保存备注 + DDL（可选）
const saveDescription = async () => {
  try {
    const res = await axios.patch(`http://localhost:3000/todos/${selectedTodo.value._id}`, {
      description: editedDescription.value,
      dueDate: editedDueDate.value || null
    })

    const updated = res.data
    const index = todos.value.findIndex(t => t._id === updated._id)
    if (index !== -1) todos.value[index] = updated
    selectedTodo.value = null
  } catch (err) {
    console.error('保存备注失败', err)
  }
}

// 判断DDL是否临近
const isDueSoon = (todo) => {
  if (!todo.dueDate) return false
  const now = new Date()
  const due = new Date(todo.dueDate)
  const diff = (due - now) / (1000 * 60 * 60 * 24) // 天数差
  return diff >= 0 && diff <= 3
}





// 切换状态
const toggleDone = async (todo) => {
  try {
    const res = await axios.patch(`http://localhost:3000/todos/${todo._id}`, {
      done: !todo.done
    })
    todo.done = res.data.done

    // ✅ 完成任务后撒彩花！
    if (todo.done) {
      launchConfetti()
    }

  } catch (err) {
    console.error('切换状态失败', err)
  }
}


const launchConfetti = () => {
  // 连续几次彩花效果
  const duration = 2 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)

    // 左右两侧同时放彩花
    confetti(Object.assign({}, defaults, {
      particleCount,
      origin: { x: Math.random() * 0.2, y: Math.random() * 0.6 }
    }))
    confetti(Object.assign({}, defaults, {
      particleCount,
      origin: { x: 1 - Math.random() * 0.2, y: Math.random() * 0.6 }
    }))
  }, 250)
}


onMounted(fetchTodos)
</script>



<style scoped>
ul {
  list-style: none;
  padding: 0;
}

/* 主标题样式 */
.main-title {
  text-align: center;
  font-size: 48px;
  margin-bottom: 30px;
  font-weight: 800;
  color: transparent;
  background: linear-gradient(90deg, #007acc, #00c3ff);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  letter-spacing: 1px;
  font-family: 'Poppins', sans-serif;
}



/* 外层 notebook 大框 */
.notebook {
  background-color: #fefcf3;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, box-shadow 0.3s;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%; /* 让背景充满内容高度 */
}


.task-item {
  background-color: #fff8dc;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
  color: #333;
}

.task-item:hover {
  transform: scale(1.02);
  background-color: #f0f9ff;
}

/* ✅ 对钩手势、变色 */
.task-item input[type='checkbox'] {
  margin-right: 10px;
  transform: scale(1.3);
  cursor: pointer;
  accent-color: #007acc;
}

.task-item input[type='checkbox']:checked {
  accent-color: green;
}

/* 删除按钮 */
.task-item button {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #e74c3c;
  transition: color 0.2s;
}

.task-item button:hover {
  color: #c0392b;
}

.task-item span {
  flex: 1;
  font-size: 18px;
  color: #007acc;
}

.container {
  max-width: 1100px; /* 原本是 800px，现在更宽 */
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
  padding: 20px;
  transition: background-color 0.3s, color 0.3s;
  color: #333;
}


.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

input[type="text"],
textarea {
  font-size: 16px;
  padding: 8px;
  color: #333;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: background-color 0.3s, color 0.3s;
  box-sizing: border-box;
}

button {
  padding: 8px 12px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #005f99;
}


/* ✅ 主区域横向排布：任务列表 + 编辑框 */
.main {
  display: flex;
  width: 100%;
  gap: 24px;
  flex-wrap: wrap; /* 小屏幕下也能换行 */
  justify-content: space-between;
  margin-top: 16px;
}



/* ✅ 修复任务栏高度和内容溢出遮挡问题 */
.task-list {
  flex: 1;
  min-width: 400px;
  max-height: 600px;
  overflow-y: auto;
  background-color: #fef6e4;
  padding: 16px;
  border-radius: 8px;
  box-sizing: border-box;
}


/* ✅ 编辑框加宽并让其不压缩 */
.detail-panel {
  flex-shrink: 0;
  width: 380px;
  padding: 16px;
  background-color: #fff8dc;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

textarea {
  width: 100%;
  height: 100px;
  margin-top: 10px;
  font-size: 14px;
  resize: none;
}

/* ✅ 筛选器样式 */
.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-row button {
  padding: 6px 12px;
  border-radius: 6px;
  background-color: #ddd;
  color: #333;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.filter-row button.active {
  background-color: #007acc;
  color: white;
}

/* ✅ DDL 临近未完成任务才红标 */
.task-item.due-soon:not(.done) {
  border-left: 6px solid red;
  background-color: #ffeaea;
  position: relative;
}

.task-item.due-soon:not(.done)::before {
  content: '⚠️';
  font-size: 22px;
  margin-right: 6px;
  color: red;
}



/* ✅ 任务滑入滑出动画 */
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-enter-active {
  transition: all 0.4s ease;
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.list-leave-active {
  transition: all 0.3s ease;
}




.bounce-enter-active {
  animation: bounce-in 0.4s;
}
.bounce-leave-active {
  animation: fade-out 0.3s forwards;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.9);
    opacity: 0.5;
  }
  60% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translateY(10px);
  }
}


/* 备注框滑入动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}




</style>







<!-- 夜间模式和全局style -->
<style>


body.dark {
  background-image: url('./assets/2.png'); /* 夜间模式背景 */
  background-size: cover;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-position: center;
}


/* 夜间模式下更亮字体 */
body.dark .main-title {
  background: linear-gradient(90deg, #66bfff, #bbddff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 2px 2px 4px rgba(255,255,255,0.1);
}


body.dark .task-item,
body.dark .task-list,
body.dark .detail-panel {
  background-color: #2a2a2a;
  color: #eee;
}


/* 夜间模式的 notebook 外观 */
body.dark .notebook {
  background-color: #2a2a2a;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

body.dark .task-item span {
  color: #66bfff;
}

body.dark input[type="text"],
body.dark textarea {
  background-color: #3a3a3a;
  color: #eee;
  border: 1px solid #555;
}

body.dark button {
  background-color: #3399ff;
  color: white;
}

body.dark button:hover {
  background-color: #1976d2;
}

body.dark .filter-row button {
  background-color: #444;
  color: #eee;
}

body.dark .filter-row button.active {
  background-color: #3399ff;
}

/* ✅ 夜间 DDL 警告样式 */
body.dark .task-item.due-soon:not(.done) {
  background-color: #4b2f2f;
  border-left: 6px solid #ff6b6b;
}

body.dark .task-item.due-soon:not(.done)::before {
  color: #ff9999;
}


body {
  background-image: url('./assets/1.png');
  background-size: cover;
  font-family: 'Poppins', sans-serif;
  background-position: center;
  background-attachment: fixed;
}



</style>
