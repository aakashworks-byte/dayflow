import ItemList from './components/ItemList'

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="px-6 py-8 text-center">
        <h1 className="text-2xl font-bold">My App</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Frontend scaffold — wired to talk to a backend via <code>src/api/client.js</code>
        </p>
      </header>
      <main>
        <ItemList />
      </main>
    </div>
  )
}
