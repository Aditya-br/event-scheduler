"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
const stats = [
    {
        label: 'Total Events',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        accent: '#a78bfa',
        accentBg: 'rgba(167,139,250,0.1)',
        compute: (events) => events.length,
    },
    {
        label: 'Tickets Sold',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
        ),
        accent: '#34d399',
        accentBg: 'rgba(52,211,153,0.1)',
        compute: (events) => events.reduce((a, e) => a + (parseInt(e.ticketse.totalTickets) || 0), 0),
    },
    {
        label: 'Total Revenue',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        accent: '#f59e0b',
        accentBg: 'rgba(245,158,11,0.1)',
        compute: (events) => `₹${events.reduce((a, e) => a + (parseInt(e.price) || 0) * (parseInt(e.totalTickets) || 0), 0).toLocaleString()}`,
    },
    {
        label: 'Active Events',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        accent: '#38bdf8',
        accentBg: 'rgba(56,189,248,0.1)',
        compute: (events) => events.filter(e => e.status === 'Active').length,
    },
]

const EMPTY_FORM = {
    title: '', description: '', date: '', time: '',
    location: '', category: '', totalTickets: '', price: '',
}

const OrganisationDashboard = () => {
    const details = useSelector((state) => state.details.value)
    const [events, setEvents] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const mapBackendEvent = (event) => {
        const eventDate = event.eventDate ? new Date(event.eventDate) : null
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const status = eventDate && eventDate >= today ? 'Active' : 'Completed'

        return {
            id: event.eventId || event._id || Date.now(),
            title: event.eventName || '',
            description: event.eventDescription || '',
            date: eventDate ? eventDate.toISOString().split('T')[0] : '',
            time: event.eventTime || '',
            location: details.location || '',
            category: event.eventtype || '',
            totalTickets: event.totaltickets?.toString?.() || '',
            price: event.ticketPrice?.toString?.() || '',
            status,
        }
    }

    const fetchOrganisationEvents = useCallback(async () => {
        if (!details?.name) return
        try {
            const response = await fetch('http://localhost:5000/getevents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: details.name,
                    type: "organisation",
                }),
            })

            if (!response.ok) return
            const data = await response.json()
            const normalizedEvents = (data.events || []).map(mapBackendEvent)
            setEvents(normalizedEvents)
        } catch (error) {
            console.error("Error fetching organisation events", error)
        }
    }, [details?.name, details.location])

    useEffect(() => {
        fetchOrganisationEvents()
    }, [fetchOrganisationEvents])

    const openCreateModal = () => {
        setEditingEvent(null);
        setForm(EMPTY_FORM);
        setShowModal(true)
    }
    const openEditModal = (event) => { setEditingEvent(event); setForm({ ...event }); setShowModal(true) }
    const closeModal = () => { setShowModal(false); setEditingEvent(null); setForm(EMPTY_FORM) }
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async(e) => {
        e.preventDefault()
        const response = await fetch('http://localhost:5000/eventcreate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: form.title,
                description: form.description,
                price: form.price,
                date: form.date,
                time: form.time,
                tickets: form.totalTickets,
                type: form.category,
                organisationname: details.name,
                organisationlocation: details.location,
            })
        });
        if (response.status === 200) {
            if (editingEvent) {
                setEvents(events.map(ev => ev.id === editingEvent.id ? { ...form, id: editingEvent.id } : ev))
            } else {
                await fetchOrganisationEvents()
            }
        }
        else {
            alert("Error creating event. Please try again.")
        }
        closeModal()
    }

    const handleDelete = (id) => { setEvents(events.filter(ev => ev.id !== id)); setDeleteConfirm(null) }
    const toggleStatus = (id) => setEvents(events.map(ev => ev.id === id ? { ...ev, status: ev.status === 'Active' ? 'Cancelled' : 'Active' } : ev))

    const inputClass = "w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-colors"
    const labelClass = "block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5"

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
        .row-hover:hover { background: rgba(255,255,255,0.02); }
        .status-toggle { transition: all 0.15s; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
        select option { background: #1a1a1a; color: white; }
      `}</style>


            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="mb-10 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #8b5cf6, #6d28d9)' }} />
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{details.name}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-1.5" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
                        <p className="text-sm text-zinc-500">Create, manage and track your events</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="btn-primary cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white"
                        style={{ background: '#8b5cf6' }}
                    >
                        <svg className="w-4 h-4 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Event
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="card-hover rounded-2xl border p-5" style={{ background: '#111', borderColor: '#1e1e1e' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.accentBg, color: stat.accent }}>
                                    {stat.icon}
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em' }}>
                                {stat.compute(events)}
                            </p>
                            <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {[
                        {
                            iconPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />,
                            title: 'Create Event', desc: 'Set up a new event and start selling tickets',
                            linkText: 'Get started', accent: '#8b5cf6', onClick: openCreateModal,
                        },
                        {
                            iconPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                            title: 'Analytics', desc: 'Track ticket sales and event performance',
                            linkText: 'View analytics', accent: '#34d399', href: '/analytics',
                        },
                        {
                            iconPath: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
                            title: 'Settings', desc: 'Manage your organisation profile and preferences',
                            linkText: 'Go to settings', accent: '#38bdf8', href: '/settings',
                        },
                    ].map((card) => (
                        <div key={card.title} className="action-card card-hover rounded-2xl border p-5" style={{ background: '#111', borderColor: '#1e1e1e' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${card.accent}18`, color: card.accent }}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{card.iconPath}</svg>
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
                            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{card.desc}</p>
                            {card.onClick ? (
                                <button onClick={card.onClick} className="text-xs font-semibold flex items-center gap-1" style={{ color: card.accent }}>
                                    {card.linkText}
                                    <svg className="w-3.5 h-3.5 action-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ) : (
                                <a href={card.href} className="text-xs font-semibold flex items-center gap-1" style={{ color: card.accent }}>
                                    {card.linkText}
                                    <svg className="w-3.5 h-3.5 action-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                {/* Events Table */}
                <div className="rounded-2xl border overflow-hidden" style={{ background: '#111', borderColor: '#1e1e1e' }}>
                    <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#1a1a1a' }}>
                        <div>
                            <h2 className="text-base font-semibold text-white">Your Events</h2>
                            <p className="text-xs text-zinc-600 mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''} total</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors"
                            style={{ borderColor: '#2a2a2a', color: '#a78bfa', background: 'rgba(167,139,250,0.05)' }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Event
                        </button>
                    </div>

                    {events.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#1a1a1a' }}>
                                <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1.5">No events yet</h3>
                            <p className="text-xs text-zinc-600 mb-6">Create your first event to get started</p>
                            <button
                                onClick={openCreateModal}
                                className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white"
                                style={{ background: '#8b5cf6' }}
                            >
                                Create Event
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                                        {['Event', 'Date & Time', 'Location', 'Tickets', 'Price', 'Status', ''].map(h => (
                                            <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-widest" style={{ color: '#3f3f46' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event) => (
                                        <tr key={event.id} className="row-hover" style={{ borderBottom: '1px solid #161616' }}>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-white">{event.title}</p>
                                                {event.category && (
                                                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
                                                        {event.category}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-zinc-300">{event.date}</p>
                                                <p className="text-xs text-zinc-600 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{event.time}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-400 max-w-[140px] truncate">{event.location}</td>
                                            <td className="px-6 py-4 text-sm font-medium" style={{ fontFamily: "'DM Mono', monospace", color: '#a1a1aa' }}>{event.totalTickets || '—'}</td>
                                            <td className="px-6 py-4 text-sm font-medium" style={{ fontFamily: "'DM Mono', monospace", color: '#a1a1aa' }}>
                                                {event.price ? `₹${event.price}` : <span className="text-zinc-600">Free</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStatus(event.id)}
                                                    className="status-toggle inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                                                    style={event.status === 'Active'
                                                        ? { background: 'rgba(52,211,153,0.1)', color: '#34d399' }
                                                        : { background: 'rgba(239,68,68,0.1)', color: '#f87171' }
                                                    }
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: event.status === 'Active' ? '#34d399' : '#f87171' }} />
                                                    {event.status}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => openEditModal(event)}
                                                        className="p-2 rounded-lg transition-all"
                                                        style={{ color: '#52525b' }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.background = 'rgba(167,139,250,0.1)' }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.background = 'transparent' }}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(event.id)}
                                                        className="p-2 rounded-lg transition-all"
                                                        style={{ color: '#52525b' }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.background = 'transparent' }}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={closeModal} />
                    <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border" style={{ background: '#111', borderColor: '#222' }}>
                        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ background: '#111', borderColor: '#1e1e1e' }}>
                            <div>
                                <h2 className="text-base font-bold text-white">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
                                <p className="text-xs text-zinc-600 mt-0.5">{editingEvent ? 'Update event details' : 'Fill in the details below'}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 flex items-center justify-center rounded-lg"
                                style={{ color: '#52525b', background: '#1a1a1a' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#222' }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.background = '#1a1a1a' }}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            <div>
                                <label className={labelClass}>Event Title <span style={{ color: '#8b5cf6' }}>*</span></label>
                                <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Tech Summit 2025" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Tell attendees what this event is about..." className={inputClass} style={{ resize: 'none' }} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Date <span style={{ color: '#8b5cf6' }}>*</span></label>
                                    <input type="date" name="date" value={form.date} onChange={handleChange} required className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Time <span style={{ color: '#8b5cf6' }}>*</span></label>
                                    <input type="time" name="time" value={form.time} onChange={handleChange} required className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Location <span style={{ color: '#8b5cf6' }}>*</span></label>
                                <input name="location" value={form.location} onChange={handleChange} required placeholder="e.g. Chennai Trade Centre" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Category</label>
                                <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                                    <option value="">Select a category</option>
                                    {['Music', 'Technology', 'Business', 'Sports', 'Arts & Culture', 'Food & Drink', 'Education', 'Other'].map(c => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Total Tickets</label>
                                    <input type="number" name="totalTickets" value={form.totalTickets} onChange={handleChange} min="1" placeholder="e.g. 500" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Price (₹)</label>
                                    <input type="number" name="price" value={form.price} onChange={handleChange} min="0" placeholder="0 for Free" className={inputClass} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                                    style={{ borderColor: '#2a2a2a', color: '#71717a', background: 'transparent' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                                    style={{ background: '#8b5cf6' }}
                                >
                                    {editingEvent ? 'Save Changes' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setDeleteConfirm(null)} />
                    <div className="relative w-full max-w-sm rounded-2xl border p-6 text-center" style={{ background: '#111', borderColor: '#222' }}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(248,113,113,0.1)' }}>
                            <svg className="w-6 h-6" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-white mb-2">Delete Event?</h3>
                        <p className="text-xs text-zinc-500 mb-6 leading-relaxed">This action cannot be undone. The event and all its data will be permanently removed.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                                style={{ borderColor: '#2a2a2a', color: '#71717a' }}
                            >
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                                style={{ background: 'rgba(239,68,68,0.85)' }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrganisationDashboard
