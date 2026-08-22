import { useState } from 'react'
import { itemsApi } from '../api/client'
import { useApi } from '../hooks/useApi'

export default function ItemList() {
  const { data: items, loading, error, refetch } = useApi(itemsApi.list, [])
  const [newItem, setNewItem] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    if (!newItem.trim()) return
    setSubmitting(true)
    try {
      await itemsApi.create({ name: newItem.trim() })
      setNewItem('')
      await refetch()
    } catch (err) {
      alert(`Could not add item: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      await itemsApi.remove(id)
      await refetch()
    } catch (err) {
      alert(`Could not delete item: ${err.message}`)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
      <h2 className="text-xl font-semibold mb-4">Items</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add a new item"
          className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 text-sm font-medium transition"
        >
          Add
        </button>
      </form>

      {loading && <p className="text-zinc-400 text-sm">Loading…</p>}
      {error && (
        <p className="text-red-400 text-sm">
          {error} — is your backend running and is VITE_API_BASE_URL set correctly?
        </p>
      )}

      <ul className="space-y-2">
        {items?.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm"
          >
            <span>{item.name}</span>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-zinc-500 hover:text-red-400 text-xs"
            >
              remove
            </button>
          </li>
        ))}
      </ul>

      {!loading && !error && items?.length === 0 && (
        <p className="text-zinc-500 text-sm">No items yet — add one above.</p>
      )}
    </div>
  )
}
