"use client";

import React, { useState, useEffect } from 'react';

export default function TurfDashboard() {
  const [telemetry, setTelemetry] = useState({
    moisture: 50,
    temperature: 50,
    wear: 20,
    health_score: 95.0,
    status: "OPEN"
  });

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"
  ];

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/telemetry');
        if (response.ok) {
          const data = await response.json();
          setTelemetry(data);
          
          if (data.status === "MAINTENANCE_LOCKED") {
            setSelectedSlot(null);
          }
        }
      } catch (error) {
        console.error("Waiting for Edge AI Backend...");
      }
    };

    const intervalId = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const isLocked = telemetry.status === "MAINTENANCE_LOCKED";

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-end border-b pb-4 border-slate-200">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sector 7 Turf</h1>
            <p className="text-slate-500 mt-1">Autonomous Facility Management Gateway</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide 
            ${isLocked ? 'bg-red-100 text-red-700' : 
              telemetry.status === 'WARNING_HIGH_WEAR' ? 'bg-amber-100 text-amber-700' : 
              'bg-emerald-100 text-emerald-700'}`}>
            SYSTEM STATUS: {telemetry.status}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Live Edge AI Telemetry</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Turf Health Score</span>
                    <span className="font-bold">{telemetry.health_score.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ease-out 
                        ${telemetry.health_score > 65 ? 'bg-emerald-500' : telemetry.health_score > 45 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${telemetry.health_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Moisture</p>
                    <p className="text-lg font-bold">{telemetry.moisture}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Temp</p>
                    <p className="text-lg font-bold">{telemetry.temperature}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Physical Wear</p>
                    <p className="text-lg font-bold">{telemetry.wear}%</p>
                  </div>
                </div>
              </div>
            </div>

            {isLocked && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-sm">
                <strong>Autonomous Override:</strong> The local Edge AI has detected critical structural fatigue. Booking is temporarily disabled until maintenance protocols are completed.
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Select a Time Slot</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  disabled={isLocked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`
                    py-3 px-4 rounded-lg font-medium border transition-all
                    ${isLocked 
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                      : selectedSlot === slot
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                    }
                  `}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                disabled={isLocked || !selectedSlot}
                className={`
                  px-8 py-3 rounded-lg font-bold text-white transition-all
                  ${isLocked || !selectedSlot 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-slate-900 hover:bg-slate-800 shadow-lg'
                  }
                `}
              >
                {isLocked ? 'Booking Locked by AI' : selectedSlot ? `Reserve ${selectedSlot}` : 'Select a Slot'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
