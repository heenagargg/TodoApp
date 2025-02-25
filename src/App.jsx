import React, { useEffect, useState } from "react";
import "./App.css";
import "./index.css";
import { ToastContainer, toast } from 'react-toastify';
import { handleSuccess } from "./Toast";
const App = () => {
  const categories = ["Work", "Personal", "Urgent"];
  const [tasks, setTasks] = useState(() => {
    try {
      const storedTasks = localStorage.getItem("tasks");
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error("Error while loading tasks from localStorage:", error);
      return [];
    }
  });
  const [newTask, setNewTask] = useState({
    id: "",
    title: "",
    category: "Personal",
    dueDate: "",
    completed: false,
  });
  const [filter, setFilter] = useState("All");
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);
  const [draggedOverTask, setDraggedOverTask] = useState(null);
  const [errors, setErrors] = useState({});

  const validateTask = () => {
    let validationErrors = {};
    if (!newTask.title.trim()) {
      validationErrors.title = "Title is required";
    } else if (newTask.title.length > 100) {
      validationErrors.title = "Title cannot exceed 100 characters";
    }

    if (!newTask.dueDate) {
      // validationErrors.dueDate = "Due date is required";
    } else {
      const selectedDate = new Date(newTask.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        validationErrors.dueDate = "Due date cannot be in the past.";
      }
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value,
    });
  };

  const addnewTask = (e) => {
    e.preventDefault();
    if (!validateTask()) return;
    const taskToAdd = {
      ...newTask,
      id: Date.now().toString(),
      dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
    };

    setTasks([...tasks, taskToAdd]);
    const toastId='add-task'
    handleSuccess("Task Added Successfully",toastId)
    setNewTask({
      id: "",
      title: "",
      category: "Personal",
      dueDate: "",
      completed: false,
    });
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
    const toastId="delete-task"
    handleSuccess("Task Deleted Successfully",toastId)
    // toast.success("Task Deleted Successfully")
  };

  const editTask = (task) => {
    setEditingTask(task);
    setNewTask({ ...task });

  };
  const saveEditedtask = (e) => {
    e.preventDefault();
    if (!validateTask()) return;
    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id ? { ...newTask } : task
    );
    setTasks(updatedTasks);
    setEditingTask(null);
    setNewTask({
      id: "",
      title: "",
      category: "Personal",
      dueDate: "",
      completed: false,
    });
    const toastId="edit-task"
    handleSuccess("Task Edited Successfully",toastId)
  };
  const cancelEdit = () => {
    setEditingTask(null);
    setNewTask({
      id: "",
      title: "",
      category: "Personal",
      dueDate: "",
      completed: false,
    });
  };
  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };
  const handleDragOver = (e, category) => {
    e.preventDefault();
    setDragOverCategory(category);
  };
  const handleDragOverTask = (e, category) => {
    e.preventDefault();
    setDraggedOverTask(category);
  };

  const handleDrop = (e, targetCategory, targetTask = null) => {
    e.preventDefault();
    if (!draggedTask) return;

    setTasks((prevTasks) => {
      let updatedTasks = [...prevTasks];

      if (draggedTask.category !== targetCategory) {
        updatedTasks = updatedTasks.map((task) =>
          task.id === draggedTask.id
            ? { ...task, category: targetCategory }
            : task
        );
      } else if (targetTask) {
        const categoryTasks = updatedTasks.filter(
          (task) => task.category === targetCategory
        );
        const draggedIndex = categoryTasks.findIndex(
          (t) => t.id === draggedTask.id
        );
        const targetIndex = categoryTasks.findIndex(
          (t) => t.id === targetTask.id
        );

        categoryTasks.splice(draggedIndex, 1);
        categoryTasks.splice(targetIndex, 0, draggedTask);

        updatedTasks = updatedTasks.filter(
          (task) => task.category !== targetCategory
        );
        updatedTasks.push(...categoryTasks);
      }

      return updatedTasks;
    });

    setDraggedTask(null);
    setDraggedOverTask(null);
    setDragOverCategory(null);
  };

  const isOverdue = (dueDate) =>
    new Date(dueDate) < new Date().setHours(0, 0, 0, 0);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Completed") return task.completed;
    if (filter === "Pending") return !task.completed;
    return true;
  });

  const tasksByCategory = Object.fromEntries(
    categories.map((category) => [
      category,
      filteredTasks.filter((task) => task.category === category),
    ])
  );

  useEffect(() => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Error while saving tasks to localStorage:", error);
    }
  }, [tasks]);

  return (
    <div className="app-container">
      <h1>Todo App</h1>
      <div className="form-container">
      <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={editingTask ? saveEditedtask : addnewTask}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              maxLength={100}
              type="text"
              placeholder="Enter title"
              id="title"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
            />
            {errors.title && <p className="error-text">{errors.title}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              name="category"
              id="category"
              value={newTask.category}
              onChange={handleInputChange}
            >
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleInputChange}
            />
            {errors.dueDate && <p className="error-text">{errors.dueDate}</p>}
          </div>

          <div className="form-buttons">
            <button type="submit" className="add-btn">
              {editingTask ? "Save Changes" : "Add Task"}
            </button>
            {editingTask && (
              <button className="cancel-btn" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="filters">
        <span>Filter:</span>
        <div className="filter-buttons">
          <button
            className={filter === "All" ? "active" : ""}
            onClick={() => setFilter("All")}
          >
            All
          </button>
          <button
            className={filter === "Pending" ? "active" : ""}
            onClick={() => {
              setFilter("Pending");
            }}
          >
            Pending
          </button>
          <button
            className={filter === "Completed" ? "active" : ""}
            onClick={() => setFilter("Completed")}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="task-categories">
        {categories.map((category) => (
          <div
            key={category}
            className={`category-section ${
              dragOverCategory === category ? "drag-over" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, category)}
            onDrop={(e) => handleDrop(e, category)}
          >
            <h3>
              {category} ({tasksByCategory[category]?.length || 0})
            </h3>
            <ul className="task-list">
              {tasksByCategory[category]?.map((task) => (
                <li
                  key={task.id}
                  className={`task-item ${task.completed ? "completed" : ""} ${
                    isOverdue(task.dueDate) ? "overdue" : ""
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onDragOver={(e) => handleDragOverTask(e, task)}
                  onDrop={(e) => handleDrop(e, category, task)}
                >
                  <div className="task-header">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task.id)}
                    />
                    <h4>{task.title}</h4>
                  </div>
                  <div className="task-details">
                    <p className="due-date">
                      Due:{"  "}
                      {/* {new Date(task.dueDate).toLocaleDateString()} */}
                      {new Date(task.dueDate).toISOString().split('T')[0]}
                      {isOverdue(task.dueDate) && (
                        <span className="overdue-text"> (Overdue)</span>
                      )}
                    </p>
                    <div className="task-actions">
                      <button
                        className="edit-btn"
                        onClick={() => editTask(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {(!tasksByCategory[category] ||
                tasksByCategory[category].length === 0) && (
                <li className="empty-list">No tasks in this category</li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;
