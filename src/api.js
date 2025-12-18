const API_BASE = '/api'

export const recordsApi = {
  async getAll() {
    try {
      const res = await fetch(`${API_BASE}/records`)
      if (!res.ok) throw new Error('Failed to fetch records')
      return await res.json()
    } catch {
      const saved = localStorage.getItem('bp_records')
      return saved ? JSON.parse(saved) : []
    }
  },

  async add(record) {
    try {
      const res = await fetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      })
      if (!res.ok) throw new Error('Failed to add record')
      return await res.json()
    } catch {
      const saved = localStorage.getItem('bp_records')
      const records = saved ? JSON.parse(saved) : []
      const newRecord = { ...record, id: Date.now() }
      records.unshift(newRecord)
      localStorage.setItem('bp_records', JSON.stringify(records))
      return newRecord
    }
  },

  async delete(id) {
    try {
      const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete record')
      return true
    } catch {
      const saved = localStorage.getItem('bp_records')
      const records = saved ? JSON.parse(saved) : []
      const filtered = records.filter(r => r.id !== id)
      localStorage.setItem('bp_records', JSON.stringify(filtered))
      return true
    }
  }
}

export const pushApi = {
  async sendRemind() {
    try {
      const res = await fetch(`${API_BASE}/push/remind`, { method: 'POST' })
      return await res.json()
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  async sendCustom(content, summary) {
    try {
      const res = await fetch(`${API_BASE}/push/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, summary })
      })
      return await res.json()
    } catch (err) {
      return { success: false, error: err.message }
    }
  }
}

export const reportsApi = {
  async getAll() {
    try {
      const res = await fetch(`${API_BASE}/reports`)
      if (!res.ok) throw new Error('Failed to fetch reports')
      return await res.json()
    } catch {
      const saved = localStorage.getItem('bp_reports')
      return saved ? JSON.parse(saved) : []
    }
  },

  async add(content, recordIds = []) {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, record_ids: recordIds })
      })
      if (!res.ok) throw new Error('Failed to save report')
      return await res.json()
    } catch {
      const saved = localStorage.getItem('bp_reports')
      const reports = saved ? JSON.parse(saved) : []
      const newReport = { id: Date.now(), content, record_ids: recordIds, created_at: new Date().toISOString() }
      reports.unshift(newReport)
      localStorage.setItem('bp_reports', JSON.stringify(reports))
      return newReport
    }
  },

  async delete(id) {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete report')
      return true
    } catch {
      const saved = localStorage.getItem('bp_reports')
      const reports = saved ? JSON.parse(saved) : []
      const filtered = reports.filter(r => r.id !== id)
      localStorage.setItem('bp_reports', JSON.stringify(filtered))
      return true
    }
  }
}
