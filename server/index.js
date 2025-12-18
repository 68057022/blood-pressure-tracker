import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'blood_pressure.db')
const SERVER_CHAN_KEY = process.env.SERVER_CHAN_KEY || ''

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const distPath = path.join(__dirname, '../dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
}

let db

async function initDB() {
  const SQL = await initSqlJs()
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datetime TEXT NOT NULL,
      systolic INTEGER NOT NULL,
      diastolic INTEGER NOT NULL,
      pulse INTEGER NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  db.run(`
    CREATE TABLE IF NOT EXISTS ai_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      record_ids TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  saveDB()
}

function saveDB() {
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buffer)
}

app.get('/api/records', (req, res) => {
  try {
    const results = db.exec('SELECT * FROM records ORDER BY datetime DESC')
    const records = results.length > 0 ? results[0].values.map(row => ({
      id: row[0],
      datetime: row[1],
      systolic: row[2],
      diastolic: row[3],
      pulse: row[4],
      note: row[5],
      created_at: row[6]
    })) : []
    res.json(records)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/records', (req, res) => {
  try {
    const { datetime, systolic, diastolic, pulse, note } = req.body
    db.run('INSERT INTO records (datetime, systolic, diastolic, pulse, note) VALUES (?, ?, ?, ?, ?)',
      [datetime, systolic, diastolic, pulse, note || ''])
    saveDB()
    
    const result = db.exec('SELECT last_insert_rowid()')
    const id = result[0].values[0][0]
    res.json({ id, datetime, systolic, diastolic, pulse, note })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/records/:id', (req, res) => {
  try {
    db.run('DELETE FROM records WHERE id = ?', [req.params.id])
    saveDB()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/reports', (req, res) => {
  try {
    const results = db.exec('SELECT * FROM ai_reports ORDER BY created_at DESC')
    const reports = results.length > 0 ? results[0].values.map(row => ({
      id: row[0],
      content: row[1],
      record_ids: row[2],
      created_at: row[3]
    })) : []
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/reports', (req, res) => {
  try {
    const { content, record_ids } = req.body
    db.run('INSERT INTO ai_reports (content, record_ids) VALUES (?, ?)',
      [content, JSON.stringify(record_ids || [])])
    saveDB()
    
    const result = db.exec('SELECT last_insert_rowid()')
    const id = result[0].values[0][0]
    res.json({ id, content, record_ids, created_at: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/reports/:id', (req, res) => {
  try {
    db.run('DELETE FROM ai_reports WHERE id = ?', [req.params.id])
    saveDB()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

async function sendPush(title, desp = '') {
  if (!SERVER_CHAN_KEY) return { code: -1, message: 'SERVER_CHAN_KEY not configured' }
  
  try {
    const response = await fetch(`https://sctapi.ftqq.com/${SERVER_CHAN_KEY}.send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, desp, noip: 1 })
    })
    return await response.json()
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

function hasTodayRecord() {
  const today = new Date().toISOString().slice(0, 10)
  const results = db.exec(`SELECT COUNT(*) FROM records WHERE datetime LIKE '${today}%'`)
  return results.length > 0 && results[0].values[0][0] > 0
}

app.post('/api/push/remind', async (_req, res) => {
  try {
    const title = '⏰ 血压记录提醒'
    const desp = `## 今天需要记录血压哦！\n\n如果还没量就**抓紧量**，别不要命了！\n\n---\n\n📅 ${new Date().toLocaleDateString('zh-CN')}`
    const result = await sendPush(title, desp)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/push/custom', async (req, res) => {
  try {
    const { title, desp } = req.body
    const result = await sendPush(title, desp)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

function scheduleReminder() {
  setInterval(async () => {
    const hour = new Date().getHours()
    if ((hour === 8 || hour === 20) && !hasTodayRecord()) {
      const timeStr = hour === 8 ? '早上' : '晚上'
      await sendPush(
        `⏰ ${timeStr}血压提醒`,
        `## 今天还没有记录血压哦！\n\n如果还没量就**抓紧量**，别不要命了！`
      )
    }
  }, 60 * 60 * 1000)
}

app.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Please build frontend first: npm run build')
  }
})

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`)
    scheduleReminder()
  })
})
