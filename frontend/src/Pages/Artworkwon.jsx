import React, { useEffect, useState } from 'react'
import { useLocation, Link, useSearchParams } from 'react-router-dom'

const API_BASE = 'http://127.0.0.1:8000/api'

const Artworkwon = () => {
  const { state } = useLocation()
  const [searchParams] = useSearchParams()

  const [wins, setWins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const tryUserFromLocal = () => {
      const tryUserKeys = ['user', 'auth_user', 'current_user', 'currentUser', 'userData', 'me']
      for (const k of tryUserKeys) {
        const raw = localStorage.getItem(k)
        if (!raw) continue
        try {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object') return parsed
        } catch (e) {
          // ignore
          return raw
        }
      }
      return null
    }

    const tryFetchUserFromApi = async (token) => {
      const endpoints = ['/api/me', '/api/user', '/api/auth/user']
      for (const ep of endpoints) {
        try {
          if (token) {
            const res = await fetch(`http://127.0.0.1:8000${ep}`, { headers: { Authorization: `Bearer ${token}` } })
            if (!res.ok) continue
            return await res.json()
          } else {
            const res = await fetch(`http://127.0.0.1:8000${ep}`, { credentials: 'include' })
            if (!res.ok) continue
            return await res.json()
          }
        } catch (e) {
          // ignore
        }
      }
      return null
    }

    const loadWins = async () => {
      setLoading(true)
      setError(null)
      try {
        let currentUser = tryUserFromLocal()
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
        let currentUserId = currentUser?.user_id ?? currentUser?.id ?? null

        if (!currentUserId && token) {
          const fetched = await tryFetchUserFromApi(token)
          if (fetched) currentUser = fetched
          currentUserId = currentUser?.user_id ?? currentUser?.id ?? null
        }

        if (!currentUser && !currentUserId) {
          setError('No auction information provided. Please make sure you are logged in.')
          return
        }

        // fetch all auctions and compute wins
        const res = await fetch(`${API_BASE}/auctions`)
        if (!res.ok) throw new Error('Failed to fetch auctions')
        let data = await res.json()
        if (data && data.value) data = data.value
        if (data && data.data) data = data.data
        if (!Array.isArray(data)) throw new Error('Unexpected auctions response')

        const curId = Number(currentUserId)
        const candidates = []
        for (const auc of data) {
          if (!['ended', 'closed'].includes(auc.status)) continue
          const bids = auc.bids || []
          if (bids.length === 0) continue
          let highest = bids[0]
          for (const b of bids) if (Number(b.amount) > Number(highest.amount)) highest = b
          const highestId = Number(highest.user_id ?? highest.user?.user_id ?? highest.user?.id)
          if (!isNaN(highestId) && !isNaN(curId) && highestId === curId) {
            candidates.push({ auction: auc, winner: highest })
          }
        }

        // If an auctionId is provided in the query, ensure it's included (fetch authoritative data)
        const auctionId = searchParams.get('auctionId')
        if (auctionId) {
          try {
            const wRes = await fetch(`${API_BASE}/auctions/${auctionId}/winner`)
            if (wRes.ok) {
              const winnerData = await wRes.json()
              const aRes = await fetch(`${API_BASE}/auctions/${auctionId}`)
              if (aRes.ok) {
                const auctionData = await aRes.json()
                const exists = candidates.some((c) => Number(c.auction.id) === Number(auctionData.id))
                if (!exists) candidates.unshift({ auction: auctionData, winner: winnerData })
              }
            }
          } catch {
            // ignore per-auction fetch errors
          }
        }

        // sort by end_date desc
        candidates.sort((a, b) => new Date(b.auction.end_date) - new Date(a.auction.end_date))

        if (!mounted) return
        setWins(candidates)
      } catch (err) {
        if (!mounted) return
        setError(String(err.message || err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadWins()
    return () => { mounted = false }
  }, [searchParams])

  if (loading) return (
    <div className="max-w-3xl mx-auto p-6">
      <p className="text-gray-600">Loading...</p>
    </div>
  )

  if (error) return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">You won an artwork</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <Link to="/" className="text-blue-600 underline">Return home</Link>
    </div>
  )

  if (!wins || wins.length === 0) return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">You won an artwork</h2>
      <p className="text-gray-600 mb-4">No won auctions found.</p>
      <Link to="/" className="text-blue-600 underline">Return home</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Won Auctions</h2>
      <p className="text-sm text-gray-600 mb-4">Listed below are the auctions you've won. Click Continue to payment to proceed.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {wins.map(({ auction, winner }) => {
          const artwork = auction.artwork || {}
          return (
            <div key={auction.id} className="border rounded-lg p-4 flex gap-4 items-start">
              <img src={artwork.image_url} alt={artwork.title} className="w-28 h-20 object-cover rounded" />

              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{artwork.title || 'Untitled'}</div>
                    <div className="text-xs text-gray-500">{artwork.artist?.name ?? artwork.artist_name ?? 'Unknown artist'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${Number(winner.amount ?? winner.bid_amount ?? 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Winning bid</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link to={`/payment?auctionId=${auction.id}`} className="inline-block px-3 py-2 bg-blue-600 text-white rounded text-sm">Continue to payment</Link>
                  <Link to={`/artworkwon?auctionId=${auction.id}`} className="inline-block px-3 py-2 border rounded text-sm">View details</Link>
                </div>

                <div className="mt-3 text-xs text-gray-600">
                  Winner: {winner.user?.name ?? winner.name ?? 'You'} • Contact: {winner.user?.email ?? winner.email ?? '—'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      
    </div>
  )
}

  function DebugPanel() {
  const [raw, setRaw] = useState(null)
  const [candidates, setCandidates] = useState(null)
  const [detectedUser, setDetectedUser] = useState(null)
  const [token, setToken] = useState(null)

  const run = async () => {
    // detect common keys
    const keys = ['user','auth_user','current_user','currentUser','userData','me']
    let found = null
    for (const k of keys) {
      const v = localStorage.getItem(k)
      if (v) {
        try { found = JSON.parse(v); setDetectedUser({ key: k, value: found }); break } catch { setDetectedUser({ key: k, value: v }); break }
      }
    }
    setToken(localStorage.getItem('auth_token') || localStorage.getItem('token'))

    try {
      const res = await fetch(`${API_BASE}/auctions`)
      const data = await res.json()
      let arr = data
      if (arr && arr.value) arr = arr.value
      if (arr && arr.data) arr = arr.data
      setRaw(arr)

      // compute candidates using same logic as page
      const curId = found?.user_id ?? found?.id ?? null
      const cand = []
      if (Array.isArray(arr) && curId) {
        for (const auc of arr) {
          if (!['ended','closed'].includes(auc.status)) continue
          const bids = auc.bids || []
          if (!bids.length) continue
          let highest = bids[0]
          for (const b of bids) if (Number(b.amount) > Number(highest.amount)) highest = b
          const highestId = Number(highest.user_id ?? highest.user?.user_id ?? highest.user?.id)
          if (highestId === Number(curId)) cand.push({ auction: auc, winner: highest })
        }
      }
      setCandidates(cand)
    } catch (err) {
      setRaw({ error: String(err) })
    }
  }

  return (
    <div className="mt-2 text-sm">
      <div className="flex gap-2 mb-2">
        <button onClick={run} className="px-3 py-1 bg-gray-800 text-white rounded">Run detection</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="font-medium">Detected user</div>
          <pre className="text-xs bg-white p-2 rounded h-36 overflow-auto">{detectedUser ? JSON.stringify(detectedUser, null, 2) : 'none'}</pre>
        </div>
        <div>
          <div className="font-medium">Token</div>
          <pre className="text-xs bg-white p-2 rounded h-36 overflow-auto">{token ?? 'none'}</pre>
        </div>
        <div className="col-span-2">
          <div className="font-medium">Raw /api/auctions (first 6)</div>
          <pre className="text-xs bg-white p-2 rounded h-56 overflow-auto">{raw ? JSON.stringify(Array.isArray(raw) ? raw.slice(0,6) : raw, null, 2) : 'not fetched'}</pre>
        </div>
        <div className="col-span-2">
          <div className="font-medium">Candidates</div>
          <pre className="text-xs bg-white p-2 rounded h-36 overflow-auto">{candidates ? JSON.stringify(candidates.map(c=>({id:c.auction.id,end_date:c.auction.end_date,winner:c.winner.user_id,amount:c.winner.amount})), null, 2) : 'none'}</pre>
        </div>
      </div>
    </div>
  )
}

export default Artworkwon