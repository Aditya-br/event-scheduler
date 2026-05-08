"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Page = () => {
  const details = useSelector((state) => state.details.user);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/getevents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "user",
          name: details?.name || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error fetching events");
        setEvents([]);
        return;
      }

      setError("");
      setEvents(data.events || []);
    } catch (err) {
      setError("Unable to connect to backend");
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [details?.name]);

  const handleBook = async (eventId) => {
    if (!details?.name) {
      alert("Please login as user to book events");
      return;
    }

    setBookingId(eventId);
    try {
      const response = await fetch("http://localhost:5000/bookEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          name: details.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Booking failed");
        return;
      }

      await fetchEvents();
      alert("Event booked successfully");
    } catch (err) {
      alert("Unable to complete booking");
    } finally {
      setBookingId("");
    }
  };

  return (
    <div className="p-6">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {events.length === 0 ? (
        <p className="text-sm text-zinc-500">No events found.</p>
      ) : (
        events.map((event, index) => (
          <div
            key={event.eventId || index}
            className="mb-3 rounded-lg border border-zinc-800 p-4 flex items-start justify-between gap-4"
          >
            {typeof event === "string" ? (
              <p className="text-sm text-white">{event}</p>
            ) : (
              <div className="flex-1 flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-white">{event.eventName}</p>
                  <p className="text-xs text-violet-300 mt-1">
                    By {event.organisationname || "Unknown Organisation"}
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">{event.eventDescription || "No description"}</p>
                  <p className="text-xs text-zinc-500 mt-2">
                    {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    ₹{event.ticketPrice} • {event.ticketsAvailable} tickets left
                  </p>
                </div>

                <button
                  onClick={() => handleBook(event.eventId)}
                  disabled={bookingId === event.eventId || event.ticketsAvailable <= 0}
                  className="shrink-0 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {event.ticketsAvailable <= 0 ? "Sold Out" : bookingId === event.eventId ? "Booking..." : "Book"}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Page;
