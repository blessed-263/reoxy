import React from 'react';
import { Plane } from 'lucide-react';

export interface FlightRouteArrowProps {
  /** IATA or Airport code of origin (where you are coming from) */
  originAirport?: string;
  /** City or name of origin (where you are coming from) */
  originCity?: string;
  /** Departure time */
  departureTime?: string;
  /** IATA or Airport code of destination (where you are going) */
  destinationAirport?: string;
  /** City or name of destination (where you are going) */
  destinationCity?: string;
  /** Arrival time */
  arrivalTime?: string;
  /** Flight duration (e.g. "3ч 45м") */
  duration?: string;
  /** Number of stops or "Прямой рейс / Non-stop" */
  stopsLabel?: string;
  /** Visual presentation layout */
  variant?: 'inline' | 'card' | 'detailed';
  /** Custom plane color (default: vivid sky-blue) */
  planeColor?: string;
  className?: string;
}

/**
 * Directional Flight Route Arrow component.
 * Points from origin (where you are coming from) to destination (where you are going).
 * Features a distinct, vivid coloured small plane centered along the flight path arrow.
 */
export const FlightRouteArrow: React.FC<FlightRouteArrowProps> = ({
  originAirport,
  originCity,
  departureTime,
  destinationAirport,
  destinationCity,
  arrivalTime,
  duration,
  stopsLabel,
  variant = 'inline',
  planeColor = '#0284c7', // Vivid sky-blue by default
  className = ''
}) => {
  // 1. INLINE VARIANT: Perfect for table columns and compact rows
  if (variant === 'inline') {
    return (
      <div className={`flex flex-col items-center justify-center w-full px-1 ${className}`}>
        <div className="w-full flex items-center relative py-1">
          {/* Origin start point dot */}
          <div 
            className="w-2 h-2 rounded-full border-2 border-[#0284c7] bg-white shrink-0 shadow-2xs z-10"
            title={originCity ? `Вылет: ${originCity}` : 'Точка вылета'}
          />

          {/* Directional arrow shaft pointing from origin to destination */}
          <div className="flex-1 h-[2px] bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#64748b] relative mx-1 flex items-center justify-center">
            {/* Small Coloured Plane in the center of the path */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-full p-1 shadow-xs flex items-center justify-center z-20 transition-transform"
              title="Направление полета"
            >
              <Plane 
                className="w-3.5 h-3.5 transform rotate-90"
                style={{ 
                  color: planeColor, 
                  fill: planeColor 
                }} 
              />
            </div>
          </div>

          {/* Directional arrow head pointing to destination */}
          <div 
            className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-[#64748b] shrink-0" 
            title={destinationCity ? `Прилет: ${destinationCity}` : 'Точка назначения'}
          />
        </div>

        {/* Duration / Stops info underneath */}
        {(duration || stopsLabel) && (
          <div className="flex items-center gap-1 font-mono text-[8px] text-[#64748b] mt-0.5 tracking-tight">
            {duration && <span className="font-semibold text-[#0f172a]">{duration}</span>}
            {duration && stopsLabel && <span>&bull;</span>}
            {stopsLabel && <span>{stopsLabel}</span>}
          </div>
        )}
      </div>
    );
  }

  // 2. DETAILED / CARD VARIANT: Full flight overview banner with Origin and Destination headers
  return (
    <div className={`bg-gradient-to-r from-[#f8fafc] via-[#f0f9ff] to-[#f8fafc] border border-[#e2e8f0] p-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Origin: Where you are coming from */}
        <div className="text-left flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-base sm:text-lg font-extrabold text-[#0f172a] tracking-tight">
              {originAirport || 'ORIGIN'}
            </span>
            {departureTime && (
              <span className="font-mono text-xs font-bold text-[#0284c7]">
                {departureTime}
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#475569] font-medium truncate max-w-[140px] sm:max-w-[180px]">
            {originCity || 'Откуда'}
          </div>
          <div className="font-mono text-[8px] uppercase tracking-wider text-[#94a3b8]">
            ОТПРАВЛЕНИЕ
          </div>
        </div>

        {/* Center: The Arrow pointing from departure to arrival with the small coloured plane */}
        <div className="flex-1 max-w-[200px] flex flex-col items-center justify-center px-2">
          {duration && (
            <span className="font-mono text-[9px] font-semibold text-[#0284c7] mb-1">
              {duration}
            </span>
          )}

          <div className="w-full flex items-center relative py-1">
            {/* Origin node */}
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[#0284c7] bg-white shrink-0 shadow-2xs z-10" />

            {/* Path line from origin to destination */}
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#0284c7] via-[#0284c7] to-[#0284c7] relative mx-1 flex items-center justify-center">
              {/* Distinct Coloured Plane in the middle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sky-100 border border-sky-400 rounded-full p-1.5 shadow-sm flex items-center justify-center z-20">
                <Plane 
                  className="w-4 h-4 transform rotate-90 drop-shadow-xs"
                  style={{ 
                    color: planeColor, 
                    fill: planeColor 
                  }} 
                />
              </div>
            </div>

            {/* Destination arrow head */}
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-[#0284c7] shrink-0" />
          </div>

          <span className="font-mono text-[8px] uppercase tracking-wider text-[#64748b] mt-1">
            {stopsLabel || 'ПРЯМОЙ ПЕРЕЛЕТ'}
          </span>
        </div>

        {/* Destination: Where you are going */}
        <div className="text-right flex-1">
          <div className="flex items-baseline justify-end gap-1.5">
            {arrivalTime && (
              <span className="font-mono text-xs font-bold text-[#0284c7]">
                {arrivalTime}
              </span>
            )}
            <span className="font-mono text-base sm:text-lg font-extrabold text-[#0f172a] tracking-tight">
              {destinationAirport || 'DEST'}
            </span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium truncate max-w-[140px] sm:max-w-[180px]">
            {destinationCity || 'Куда'}
          </div>
          <div className="font-mono text-[8px] uppercase tracking-wider text-[#94a3b8]">
            НАЗНАЧЕНИЕ
          </div>
        </div>
      </div>
    </div>
  );
};
