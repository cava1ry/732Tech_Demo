# Todo List Web App

A visually appealing and fully functional **Todo List** web app with the following features:
- Add / delete / search tasks
- Mark tasks as complete with animations
- Edit notes and optional due dates
- Filter by All / Incomplete / Completed
- Light / Dark mode
- Local confetti celebration when a task is completed
- Deadline warning and themed background

---

## Preview

> A Notion-style UI with colorful themes, bounce effects, and interactions.

---

## Setup Instructions

### 1. Clone the Repository


#### Use Git to clone the project
$ git clone <your-github-repo-url>

#### Navigate to the project directory
---

$ cd <project-folder>

---

### 2. Required Tools

Make sure you have the following installed:
- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)

---

### 3. Folder Structure Overview

```
project-root/
├── todo-frontend/     # Vue.js front-end
├── todo-backend/      # Express + MongoDB backend
├── .gitignore
├── README.md
```

---

### 4. Backend Setup

#### Step 1: Navigate to backend folder

cd todo-backend
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Create `.env` file

In `todo-backend/`, create a `.env` file with your MongoDB URI:

```bash
MONGODB_URI=your_mongodb_connection_string
```

> If using MongoDB Atlas, the connection string looks like:
> `mongodb+srv://<user>:<password>@cluster0.mongodb.net/todoapp?retryWrites=true&w=majority`

#### Step 4: Start the backend
```bash
node index.js
```

You should see:
```
✅ Server running on http://localhost:3000
✅ MongoDB connected
```

---

### 5. Frontend Setup

#### Step 1: Navigate to frontend folder
```bash
cd ../todo-frontend
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Start frontend development server
```bash
npm run dev
```

You will see:
```
VITE v4.x.x  ready in ...
Local: http://localhost:5173/
```

Visit [http://localhost:5173](http://localhost:5173) to see the app in action.

---

## Features

- **Add task**: Type in task title, click **"Add to List"**
- **Deadline**: Optionally edit deadline in the note section
- **Edit notes**: Click a task to edit note and deadline
- **Delete**: Remove a task
- **Filter**: View all / completed / incomplete
- **Celebration**: Completing a task launches confetti
- **Due soon warning**: Red highlight if due in 3 days
- **Dark mode**: Toggle light/dark theme

---

## Notes

- All animations and confetti are **purely local** and do not require internet
- Font used: [Poppins](https://fonts.google.com/specimen/Poppins)
- Background images are loaded from local `/assets/`

---

## Troubleshooting

- **MongoDB error**: Ensure `.env` is correctly created and cluster is accessible
- **Port in use**: Make sure port 3000 (backend) and 5173 (frontend) are free
- **CORS error**: If testing from non-localhost, update backend CORS settings

---

## License

This project is submitted as a course assignment. You may reuse the code for educational purposes. Credit appreciated :)

---

## That's it!
Now you can see a colorful, animated task list.


