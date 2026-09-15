import React, { useState, useMemo } from 'react';
import { 
  Itinerary, 
  ItineraryStatus 
} from '../../types/itinerary';
import { 
  Search, 
  Plus, 
  Calendar, 
  Users, 
  Copy, 
  Trash2, 
  Eye, 
  Plane, 
  Download
} from 'lucide-react';
import { 
  STATUS_LABELS, 
  PAYMENT_STATUS_LABELS 
} from '../../data/micorTravelsInfo';
import { 
  formatShortDate, 
  formatItineraryCurrency 
} from '../../utils/itineraryFormatters';
import { FlightRouteArrow } from './FlightRouteArrow';

interface ItineraryListProps {
  itineraries: Itinerary[];
  onSelectItinerary: (it: Itinerary) => void;
  onDuplicateItinerary: (it: Itinerary) => void;
  onDeleteItinerary: (id: string) => void;
  onNewItinerary: () => void;
}

export const ItineraryList: React.FC<ItineraryListProps> = ({
  itineraries,
  onSelectItinerary,
  onDuplicateItinerary,
  onDeleteItinerary,
  onNewItinerary
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ItineraryStatus>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filtered = useMemo(() => {
    return itineraries.filter((it) => {
      const q = searchTerm.toLowerCase();
      const matchQuery =
        it.title.toLowerCase().includes(q) ||
        it.destination.toLowerCase().includes(q) ||
        it.id.toLowerCase().includes(q) ||
        (it.pnr && it.pnr.toLowerCase().includes(q)) ||
        it.travelers.some(t => t.name.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || it.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [itineraries, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    let totalVolume = 0;
    let confirmedCount = 0;
    let totalTravelers = 0;

    itineraries.forEach(it => {
      totalVolume += it.totalPrice;
      if (it.status === 'confirmed') confirmedCount++;
      totalTravelers += it.travelers.length;
    });

    return {
      total: itineraries.length,
      confirmedCount,
      totalVolume,
      totalTravelers
    };
  }, [itineraries]);

  const handleExportCSV = () => {
    const headers = ['PNR', 'Route', 'Destination', 'Flight Date', 'Return Date', 'Flights Count', 'Passengers', 'Total Fare', 'Currency', 'Status', 'Agent'];
    const rows = itineraries.map(it => [
      it.pnr || it.id,
      `"${it.title.replace(/"/g, '""')}"`,
      `"${it.destination.replace(/"/g, '""')}"`,
      it.startDate,
      it.endDate,
      it.flights.length,
      `"${it.travelers.map(t => t.name).join('; ').replace(/"/g, '""')}"`,
      it.totalPrice,
      it.currency,
      it.status,
      `"${it.agentName.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `micor_flight_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-slate-800">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Bookings</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[13px] text-slate-500 mt-0.5">In archive</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Issued</div>
          <div className="text-2xl font-semibold text-emerald-600 mt-1">{stats.confirmedCount}</div>
          <div className="text-[13px] text-emerald-600 mt-0.5">Confirmed tickets</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Passengers</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{stats.totalTravelers}</div>
          <div className="text-[13px] text-slate-500 mt-0.5">On file</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Fare volume</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">{formatItineraryCurrency(stats.totalVolume, 'RUB')}</div>
          <div className="text-[13px] text-slate-500 mt-0.5">Total fares</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PNR, route, city, or passenger…"
            className="ui-field pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({itineraries.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${
                statusFilter === 'confirmed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Issued
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${
                statusFilter === 'draft' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Holds
            </button>
          </div>

          <div className="flex items-center rounded-full bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Cards
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-sm">
          <Plane className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
          <div className="text-lg font-semibold text-slate-900">
            No tickets found
          </div>
          <p className="text-[14px] text-slate-500 max-w-sm mx-auto">
            Nothing matches this search. Create a new ticket or change the filters.
          </p>
          <button
            type="button"
            onClick={onNewItinerary}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-slate-900 px-4 py-2 rounded-full"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            New ticket
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Archival Flight Table */
        <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">PNR</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Passengers</th>
                <th className="py-3 px-4">Fare</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((it) => {
                const status = STATUS_LABELS[it.status] || STATUS_LABELS.confirmed;
                const payment = PAYMENT_STATUS_LABELS[it.paymentStatus] || PAYMENT_STATUS_LABELS.paid;
                const pnrCode = it.pnr || it.id;

                return (
                  <tr 
                    key={it.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectItinerary(it)}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 tracking-wide text-[12px] bg-slate-50 border border-slate-200 rounded-full px-2.5 py-0.5">
                        {pnrCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {it.title}
                      </div>
                      {it.flights.length > 0 ? (
                        <div className="max-w-[240px] mt-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                          <FlightRouteArrow
                            variant="inline"
                            originAirport={it.flights[0].departureAirport || 'DEP'}
                            originCity={it.flights[0].departureCity}
                            destinationAirport={it.flights[0].arrivalAirport || 'ARR'}
                            destinationCity={it.flights[0].arrivalCity}
                            duration={it.flights[0].duration}
                          />
                        </div>
                      ) : (
                        <div className="text-[13px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Plane className="w-3 h-3 text-sky-600" />
                          <span>{it.destination}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-900">
                        {formatShortDate(it.startDate)} — {formatShortDate(it.endDate)}
                      </div>
                      <div className="text-[12px] text-slate-500">
                        {it.totalDays} days
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 max-w-[160px] truncate font-medium">
                        {it.travelers.map(t => t.name).join(', ') || 'No names'}
                      </div>
                      <div className="text-[12px] text-slate-500">
                        {it.travelers.length} passenger(s)
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 tabular-nums">
                        {formatItineraryCurrency(it.totalPrice, it.currency)}
                      </div>
                      <div className="text-[12px] text-emerald-600">
                        {payment.label}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 uppercase font-semibold text-slate-700">
                        {status.label}
                      </span>
                    </td>

                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectItinerary(it)}
                          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
                          title="Open"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateItinerary(it)}
                          className="w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItinerary(it.id)}
                          className="w-8 h-8 rounded-full text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it) => {
            const status = STATUS_LABELS[it.status] || STATUS_LABELS.confirmed;
            const pnrCode = it.pnr || it.id;

            return (
              <div
                key={it.id}
                onClick={() => onSelectItinerary(it)}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-300 shadow-sm transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-[12px] font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-0.5 tracking-wide">
                      {pnrCode}
                    </span>
                    <span className="text-[12px] text-emerald-600 font-semibold">
                      {status.label}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[15px] text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                    {it.title}
                  </h3>

                  {it.flights.length > 0 && (
                    <div className="mt-2.5 mb-1">
                      <FlightRouteArrow
                        variant="card"
                        originAirport={it.flights[0].departureAirport || 'DEP'}
                        originCity={it.flights[0].departureCity}
                        departureTime={it.flights[0].departureTime}
                        destinationAirport={it.flights[0].arrivalAirport || 'ARR'}
                        destinationCity={it.flights[0].arrivalCity}
                        arrivalTime={it.flights[0].arrivalTime}
                        duration={it.flights[0].duration}
                      />
                    </div>
                  )}

                  <div className="mt-2 space-y-1 text-[13px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Plane className="w-3 h-3 text-[#0284c7]" />
                      <span>{it.flights.length} полетных сегментов</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#78756c]" />
                      <span>{formatShortDate(it.startDate)} — {formatShortDate(it.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-[#78756c]" />
                      <span className="truncate">{it.travelers.map(t => t.name).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] text-slate-500 uppercase font-semibold">Total fare</div>
                    <div className="font-semibold text-[15px] text-slate-900 tabular-nums">
                      {formatItineraryCurrency(it.totalPrice, it.currency)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onSelectItinerary(it)}
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
                      title="Open"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItinerary(it.id)}
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
