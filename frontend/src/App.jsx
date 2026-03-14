import { useState, useEffect } from 'react'

const API = '/api'

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '0 20px' },
  header:    { background: '#326CE5', color: 'white', padding: '20px',
               borderRadius: '12px 12px 0 0', textAlign: 'center' },
  title:     { fontSize: '28px', fontWeight: 'bold' },
  subtitle:  { fontSize: '13px', opacity: 0.8, marginTop: '4px' },
  body:      { background: 'white', padding: '20px',
               borderRadius: '0 0 12px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  inputRow:  { display: 'flex', gap: '10px', marginBottom: '20px' },
  input:     { flex: 1, padding: '10px 14px', border: '2px solid #e0e0e0',
               borderRadius: '8px', fontSize: '14px', outline: 'none' },
  addBtn:    { padding: '10px 20px', background: '#326CE5', color: 'white',
               border: 'none', borderRadius: '8px', cursor: 'pointer',
               fontWeight: 'bold', fontSize: '14px' },
  taskItem:  { display: 'flex', alignItems: 'center', gap: '12px',
               padding: '12px', borderRadius: '8px', marginBottom: '8px',
               background: '#f8f9fa', border: '1px solid #e9ecef' },
  taskDone:  { background: '#e8f8f0', border: '1px solid #b7e4c7' },
  checkbox:  { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#326CE5' },
  taskTitle: { flex: 1, fontSize: '14px' },
  taskDoneText: { textDecoration: 'line-through', color: '#999' },
  deleteBtn: { background: '#ff4757', color: 'white', border: 'none',
               borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
               fontSize: '12px' },
  empty:     { textAlign: 'center', color: '#999', padding: '30px', fontSize: '14px' },
  stats:     { display: 'flex', justifyContent: 'space-between',
               padding: '12px 16px', background: '#f8f9fa',
               borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#666' },
}

export default function App() {
  const [tasks,    setTasks]    = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  // Fetch tasks
  useEffect(() => {
    fetch(`${API}/tasks`)
      .then(r => r.json())
      .then(data => { setTasks(data); setLoading(false) })
      .catch(() => { setError('Cannot connect to backend'); setLoading(false) })
  }, [])

  // Add task
  const addTask = async () => {
    if (!newTitle.trim()) return
    const res = await fetch(`${API}/tasks`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title: newTitle }),
    })
    const task = await res.json()
    setTasks(prev => [task, ...prev])
    setNewTitle('')
  }

  // Toggle done
  const toggleTask = async (id, done) => {
    const res = await fetch(`${API}/tasks/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ done: !done }),
    })
    const updated = await res.json()
    setTasks(prev => prev.map(t => t.id === id ? updated : t))
  }

  // Delete task
  const deleteTask = async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') addTask() }

  const done  = tasks.filter(t => t.done).length
  const total = tasks.length

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>☸️ TaskFlow</div>
        <div style={styles.subtitle}>Running on Docker Compose</div>
      </div>

      <div style={styles.body}>
        {/* Stats */}
        <div style={styles.stats}>
          <span>Total: <strong>{total}</strong></span>
          <span>Done: <strong style={{color:'#27AE60'}}>{done}</strong></span>
          <span>Pending: <strong style={{color:'#E67E22'}}>{total - done}</strong></span>
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
          />
          <button style={styles.addBtn} onClick={addTask}>+ Add</button>
        </div>

        {/* Tasks */}
        {loading && <div style={styles.empty}>Loading tasks...</div>}
        {error   && <div style={{...styles.empty, color:'#ff4757'}}>{error}</div>}
        {!loading && !error && tasks.length === 0 &&
          <div style={styles.empty}>No tasks yet. Add your first task!</div>
        }
        {tasks.map(task => (
          <div key={task.id}
               style={{...styles.taskItem, ...(task.done ? styles.taskDone : {})}}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={task.done}
              onChange={() => toggleTask(task.id, task.done)}
            />
            <span style={{...styles.taskTitle,
                          ...(task.done ? styles.taskDoneText : {})}}>
              {task.title}
            </span>
            <button style={styles.deleteBtn}
                    onClick={() => deleteTask(task.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}