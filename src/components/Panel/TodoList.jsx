import { useState } from 'react'
import useStore from '../../store/useStore'

export default function TodoList() {
  const [input, setInput] = useState('')
  const todos = useStore(s => s.todos)
  const addTodo = useStore(s => s.addTodo)
  const completeTodo = useStore(s => s.completeTodo)
  const deleteTodo = useStore(s => s.deleteTodo)

  const handleAdd = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    addTodo(text)
    setInput('')
  }

  const pending = todos.filter(t => !t.completed)
  const completed = todos.filter(t => t.completed)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>✅ 할일 목록</span>
        <span style={styles.badge}>{pending.length}</span>
      </div>

      <form onSubmit={handleAdd} style={styles.form}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="새 할일 추가... (+30pt)"
          style={styles.input}
        />
        <button type="submit" style={styles.addBtn}>+</button>
      </form>

      <div style={styles.list}>
        {pending.map(todo => (
          <div key={todo.id} style={styles.todoItem}>
            <button
              onClick={() => completeTodo(todo.id)}
              style={styles.checkBtn}
              title="완료"
            >
              ○
            </button>
            <span style={styles.todoText}>{todo.text}</span>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={styles.deleteBtn}
              title="삭제"
            >
              ×
            </button>
          </div>
        ))}

        {completed.length > 0 && (
          <>
            <div style={styles.divider}>완료됨 ({completed.length})</div>
            {completed.map(todo => (
              <div key={todo.id} style={{ ...styles.todoItem, opacity: 0.5 }}>
                <span style={styles.doneIcon}>✓</span>
                <span style={{ ...styles.todoText, textDecoration: 'line-through' }}>{todo.text}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={styles.deleteBtn}
                >
                  ×
                </button>
              </div>
            ))}
          </>
        )}

        {todos.length === 0 && (
          <div style={styles.empty}>할일을 추가해보세요!</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  badge: {
    background: '#FF6B9D',
    color: '#FFF',
    borderRadius: '10px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  input: {
    flex: 1,
    background: '#2a2a3e',
    border: '1px solid #3a3a5e',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#FFFFFF',
    fontSize: '13px',
    outline: 'none',
  },
  addBtn: {
    width: '36px',
    height: '36px',
    background: '#FF6B9D',
    border: 'none',
    borderRadius: '8px',
    color: '#FFF',
    fontSize: '20px',
    cursor: 'pointer',
    lineHeight: '1',
  },
  list: {
    maxHeight: '200px',
    overflowY: 'auto',
  },
  todoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 4px',
    borderBottom: '1px solid #2a2a3e',
  },
  checkBtn: {
    background: 'none',
    border: '1.5px solid #4CAF50',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    color: '#4CAF50',
    fontSize: '12px',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneIcon: {
    color: '#4CAF50',
    fontSize: '14px',
    width: '22px',
    textAlign: 'center',
    flexShrink: 0,
  },
  todoText: {
    flex: 1,
    color: '#CCCCCC',
    fontSize: '13px',
    wordBreak: 'break-word',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#555',
    fontSize: '18px',
    cursor: 'pointer',
    flexShrink: 0,
    lineHeight: '1',
    padding: '0 2px',
  },
  divider: {
    fontSize: '11px',
    color: '#555',
    padding: '8px 0 4px',
    borderTop: '1px solid #2a2a3e',
    marginTop: '4px',
  },
  empty: {
    textAlign: 'center',
    color: '#555',
    fontSize: '13px',
    padding: '20px 0',
  },
}
