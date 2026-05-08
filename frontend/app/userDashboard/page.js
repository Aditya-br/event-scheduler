"use client"
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
const UserDashboard = () => {
  const details = useSelector((state) => {
    const user = state?.details?.user
    const legacy = state?.details?.value
    return user || legacy || { name: "", location: "", type: "user" }
  })
  const [events, setEvents] = useState([])
  const [bookingId, setBookingId] = useState("")
  const [bookings, setBookings] = useState([])
  const [fullscreenImage, setFullscreenImage] = useState("")

  const fetchBookings = async () => {
    if (!details?.name) {
      setBookings([])
      return
    }

    try {
      const response = await fetch("http://localhost:5000/userBookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: details.name }),
      })

      const data = await response.json()
      if (!response.ok) {
        setBookings([])
        return
      }
      setBookings(data.bookings || [])
    } catch {
      setBookings([])
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/getevents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "user",
          name: details?.name || "",
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setEvents([])
        return
      }

      setEvents(data.events || [])
    } catch {
      setEvents([])
    }
  }

  useEffect(() => {
    fetchEvents()
    fetchBookings()
  }, [details?.name])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setFullscreenImage("")
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  const handleBook = async (eventId) => {
    if (!details?.name) {
      alert("Please login as user to book events")
      return
    }

    try {
      setBookingId(eventId)
      const response = await fetch("http://localhost:5000/bookEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          name: details.name,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.message || "Booking failed")
        return
      }

      await fetchEvents()
      await fetchBookings()
      alert("Event booked successfully")
    } catch {
      alert("Unable to complete booking")
    } finally {
      setBookingId("")
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .card-hover { transition: border-color 0.2s, box-shadow 0.2s; }
        .card-hover:hover { border-color: #2e2e2e !important; box-shadow: 0 0 0 1px #1e1e1e, 0 8px 32px rgba(0,0,0,0.5); }
        .btn-primary { transition: background 0.15s, box-shadow 0.15s; }
        .btn-primary:hover { background: #7c3aed !important; box-shadow: 0 0 20px rgba(139,92,246,0.3); }
        .action-card:hover .action-arrow { transform: translateX(3px); }
        .action-arrow { transition: transform 0.2s; }
      `}</style>


      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #8b5cf6, #6d28d9)' }} />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{details.name}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-1.5" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p className="text-sm text-zinc-500">Manage your tickets and discover new events</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            {
              iconPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
              title: 'Browse Events',
              desc: 'Discover amazing events happening near you',
              linkText: 'Explore now',
              accent: '#8b5cf6',
              href: '#upcoming-events',
            },
            {
              iconPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />,
              title: 'My Tickets',
              desc: 'View and manage your purchased tickets',
              linkText: 'View tickets',
              accent: '#a78bfa',
              href: '/my-tickets',
            },
            {
              iconPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
              title: 'Get Help',
              desc: 'Chat with our AI assistant for recommendations',
              linkText: 'Start chat',
              accent: '#38bdf8',
              href: '/chat',
            },
          ].map((card) => (
            <div key={card.title} className="action-card card-hover rounded-2xl border p-5" style={{ background: '#111', borderColor: '#1e1e1e' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${card.accent}18`, color: card.accent }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{card.iconPath}</svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{card.desc}</p>
              <a href={card.href} className="text-xs font-semibold flex items-center gap-1" style={{ color: card.accent }}>
                {card.linkText}
                <svg className="w-3.5 h-3.5 action-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="rounded-2xl border overflow-hidden mb-6" style={{ background: '#111', borderColor: '#1e1e1e' }}>
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#1a1a1a' }}>
            <div>
              <h2 className="text-base font-semibold text-white">Upcoming Events</h2>
              <p className="text-xs text-zinc-600 mt-0.5">All events currently available</p>
            </div>
            <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>
              {events.length} total
            </span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#1a1a1a' }}>
                <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">No upcoming events</h3>
              <p className="text-xs text-zinc-600 mb-6">Events will appear here once organizations create them</p>
            </div>
          ) : (
            <div id="upcoming-events" className="divide-y" style={{ borderColor: '#1a1a1a' }}>
              {events.map((event, index) => (
                <div key={event.eventId || index} className="px-6 py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{event.eventName}</p>
                    <p className="text-xs text-violet-300 mt-1">By {event.organisationname || "Unknown Organisation"}</p>
                    <p className="text-xs text-zinc-500 mt-1">{event.eventDescription || "No description"}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      <span>{event.eventTime}</span>
                      <span>₹{event.ticketPrice}</span>
                      <span>{event.ticketsAvailable} left</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBook(event.eventId)}
                    disabled={bookingId === event.eventId || event.ticketsAvailable <= 0}
                    className="shrink-0 rounded-md bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {event.ticketsAvailable <= 0 ? "Sold Out" : bookingId === event.eventId ? "Booking..." : "Book"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#111', borderColor: '#1e1e1e' }}>
          <div className="px-6 py-5 border-b" style={{ borderColor: '#1a1a1a' }}>
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <p className="text-xs text-zinc-600 mt-0.5">Your latest ticket purchases and interactions</p>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#1a1a1a' }}>
                <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-zinc-600">No recent activity</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#1a1a1a' }}>
              {bookings.map((booking) => (
                <div key={booking.ticketId} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{booking.eventName}</p>
                    <p className="text-xs text-zinc-500 mt-1">By {booking.organisationname}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "-"} {booking.eventTime ? `at ${booking.eventTime}` : ""}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Ticket #{booking.ticketId.slice(0, 10)}
                    </p>
                  </div>
                  {booking.qrCodeImage && (
                    <img
                      src={booking.qrCodeImage}
                      alt="Ticket QR"
                      className="w-20 h-20 rounded-md bg-white p-1 cursor-zoom-in"
                      onClick={() => setFullscreenImage(booking.qrCodeImage)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setFullscreenImage("")}
        >
          <img
            src={fullscreenImage}
            alt="QR Fullscreen"
            className="max-w-[95vw] max-h-[95vh] rounded-lg bg-white p-2"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default UserDashboard
