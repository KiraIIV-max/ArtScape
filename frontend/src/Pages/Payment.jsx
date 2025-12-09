import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'

const API_BASE = 'http://127.0.0.1:8000/api'

const Payment = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const auctionId = searchParams.get('auctionId')

  const [auction, setAuction] = useState(null)
  const [winner, setWinner] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  // detect current user (from localStorage or /api/me)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('currentUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
    const tryFetchMe = async () => {
      if (currentUser) return
      if (!token) return
      try {
        const res = await fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const j = await res.json()
        if (mounted) setCurrentUser(j)
      } catch (e) {
        // ignore
      }
    }
    tryFetchMe()
    return () => { mounted = false }
  }, [currentUser])

  useEffect(() => {
    if (!auctionId) return
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const aRes = await fetch(`${API_BASE}/auctions/${auctionId}`)
        if (!aRes.ok) throw new Error('Failed to load auction')
        const a = await aRes.json()
        if (!mounted) return
        setAuction(a)

        // fetch winner info if available
        try {
          const wRes = await fetch(`${API_BASE}/auctions/${auctionId}/winner`)
          if (wRes.ok) {
            const w = await wRes.json()
            if (mounted) setWinner(w)
          }
        } catch {
          // ignore
        }
      } catch (err) {
        if (!mounted) return
        setError(String(err.message || err))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [auctionId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!auction || !auction.id) return setError('No auction selected')
    const userId = currentUser?.user_id ?? currentUser?.id
    if (!userId) return setError('You must be logged in to complete payment')

    setSubmitting(true)
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const payload = {
        payment_method: paymentMethod,
        user_id: Number(userId),
        auction_id: Number(auction.id),
      }

      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'Payment failed')
      }

      const data = await res.json()
      setSuccessMsg(data?.message || 'Payment successful')

      // Navigate back to artworkwon for this auction after short delay
      setTimeout(() => {
        navigate(`/artworkwon?auctionId=${auction.id}`)
      }, 1200)
    } catch (err) {
      setError(String(err.message || err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!auctionId) return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Payment</h2>
      <p className="text-gray-600">No auction selected. Return to <Link to="/" className="text-blue-600 underline">home</Link>.</p>
    </div>
  )

  if (loading) return (
    <div className="max-w-3xl mx-auto p-6">
      <p className="text-gray-600">Loading payment details...</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Complete Payment</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {successMsg && <div className="text-green-600 mb-4">{successMsg}</div>}

      <div className="border rounded-lg p-4 mb-6 flex gap-4 items-start">
        <img src={auction?.artwork?.image_url} alt={auction?.artwork?.title} className="w-28 h-20 object-cover rounded" />
        <div className="flex-1">
          <div className="font-semibold">{auction?.artwork?.title ?? 'Untitled'}</div>
          <div className="text-sm text-gray-600">{auction?.artwork?.artist?.name ?? auction?.artwork?.artist_name ?? 'Unknown artist'}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-medium">${Number(auction?.current_highest_bid ?? 0).toFixed(2)}</div>
            <div className="text-xs text-gray-500">Amount due</div>
            {winner && (
              <div className="text-xs text-gray-500">Winner: {winner?.user?.name ?? winner?.name ?? 'You'}</div>
            )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="border rounded px-3 py-2 w-full">
            <option value="card">Credit / Debit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        {paymentMethod === 'card' && (
          <div className="grid gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Card Number</label>
              <input className="border rounded px-3 py-2 w-full" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Expiry</label>
                <input className="border rounded px-3 py-2 w-full" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVV</label>
                <input className="border rounded px-3 py-2 w-full" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button disabled={submitting} type="submit" className="px-4 py-2 bg-black text-white rounded">{submitting ? 'Processing...' : `Pay $${Number(auction?.current_highest_bid ?? 0).toFixed(2)}`}</button>
          <Link to={`/artworkwon?auctionId=${auction?.id}`} className="px-4 py-2 border rounded">Back</Link>
        </div>
      </form>
    </div>
  )
}

export default Payment