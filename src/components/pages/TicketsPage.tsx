"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Ticket, Clock, Calendar, MapPin, Trash2, Loader2, CheckCircle2, AlertCircle,
  Users, QrCode, ArrowRight, Building2, Star
} from "lucide-react";

const STADIUMS: Record<string, { capacity: string; city: string; country: string; rating: number }> = {
  "Anfield": { capacity: "61,276", city: "Liverpool", country: "England", rating: 4.8 },
  "Santiago Bernabeu": { capacity: "81,044", city: "Madrid", country: "Spain", rating: 4.9 },
  "San Siro": { capacity: "75,923", city: "Milan", country: "Italy", rating: 4.7 },
  "Stamford Bridge": { capacity: "40,341", city: "London", country: "England", rating: 4.6 },
  "Allianz Arena": { capacity: "75,024", city: "Munich", country: "Germany", rating: 4.8 },
  "Parc des Princes": { capacity: "47,929", city: "Paris", country: "France", rating: 4.5 },
  "Old Trafford": { capacity: "74,310", city: "Manchester", country: "England", rating: 4.6 },
  "Camp Nou": { capacity: "99,354", city: "Barcelona", country: "Spain", rating: 4.9 },
};

export default function TicketsPage() {
  const { token, setCurrentPage } = useAppStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [form, setForm] = useState({ match: "", homeTeam: "", awayTeam: "", date: "", time: "", venue: "", section: "Standard", price: "" });
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    try { const res = await fetch("/api/tickets", { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); setTickets(data.tickets || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const bookTicket = async (e: React.FormEvent) => {
    e.preventDefault(); setBookingLoading(true);
    try {
      const res = await fetch("/api/tickets", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.ticket) { toast.success("Ticket booked!", { description: `${form.homeTeam} vs ${form.awayTeam}` }); setForm({ match: "", homeTeam: "", awayTeam: "", date: "", time: "", venue: "", section: "Standard", price: "" }); setBookingOpen(false); fetchTickets(); }
      else { toast.error("Booking failed", { description: data.error }); }
    } catch { toast.error("Network error"); }
    finally { setBookingLoading(false); }
  };

  const cancelTicket = async (id: string) => {
    try { await fetch(`/api/tickets?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); setTickets(prev => prev.filter(t => t.id !== id)); toast.success("Ticket cancelled"); }
    catch { toast.error("Failed to cancel ticket"); }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl mb-4" />)}</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Match Tickets</h1>
            <p className="text-sm text-muted-foreground">Book and manage your match day experience</p>
          </div>
        </div>
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-md shadow-primary/20 h-10">
              <Ticket className="w-4 h-4" /> Book New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book a Match Ticket</DialogTitle>
              <DialogDescription>Fill in the details to book your match ticket</DialogDescription>
            </DialogHeader>
            <form onSubmit={bookTicket} className="space-y-4">
              <div className="space-y-2"><Label>Match</Label><Input placeholder="e.g. Premier League - Matchday 30" value={form.match} onChange={e => setForm({ ...form, match: e.target.value })} required className="h-11 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Home Team</Label><Input placeholder="e.g. Liverpool FC" value={form.homeTeam} onChange={e => setForm({ ...form, homeTeam: e.target.value })} required className="h-11 rounded-xl" /></div>
                <div className="space-y-2"><Label>Away Team</Label><Input placeholder="e.g. Arsenal FC" value={form.awayTeam} onChange={e => setForm({ ...form, awayTeam: e.target.value })} required className="h-11 rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className="h-11 rounded-xl" /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required className="h-11 rounded-xl" /></div>
              </div>
              <div className="space-y-2"><Label>Venue</Label><Input placeholder="e.g. Anfield, Liverpool" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required className="h-11 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Section</Label>
                  <Select value={form.section} onValueChange={v => setForm({ ...form, section: v })}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard - £45-75</SelectItem>
                      <SelectItem value="Premium">Premium - £90-130</SelectItem>
                      <SelectItem value="VIP">VIP - £180-300</SelectItem>
                      <SelectItem value="Club Level">Club Level - £250-400</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Price (£)</Label><Input type="number" placeholder="75.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className="h-11 rounded-xl" /></div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={bookingLoading} className="gap-2 rounded-xl">
                  {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />} Confirm Booking
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Matches with Stadium Info */}
      <Card className="mb-8 border-primary/10 hover:shadow-md transition-shadow overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" /> Upcoming Matches</CardTitle>
          <CardDescription>Click on any match to quickly book a ticket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { home: "Liverpool FC", away: "Everton FC", date: "2025-04-05", time: "15:00", venue: "Anfield", competition: "Premier League", price: 65 },
              { home: "Real Madrid", away: "Barcelona", date: "2025-04-12", time: "21:00", venue: "Santiago Bernabeu", competition: "La Liga", price: 180 },
              { home: "AC Milan", away: "Inter Milan", date: "2025-04-19", time: "20:45", venue: "San Siro", competition: "Serie A", price: 120 },
            ].map((match, i) => {
              const stadium = STADIUMS[match.venue];
              return (
                <Card key={i} className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 group" onClick={() => { setForm({ match: match.competition, homeTeam: match.home, awayTeam: match.away, date: match.date, time: match.time, venue: match.venue, section: "Standard", price: match.price.toString() }); setBookingOpen(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs rounded-lg">{match.competition}</Badge>
                      {stadium && (
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span className="font-medium">{stadium.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">{match.home}</span>
                      <div className="w-10 h-10 rounded-lg bg-muted/80 flex items-center justify-center border">
                        <span className="text-xs font-bold text-muted-foreground">VS</span>
                      </div>
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">{match.away}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{match.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{match.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />{match.venue}
                    </div>
                    {stadium && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/70 pt-2 border-t">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{stadium.capacity}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{stadium.city}, {stadium.country}</span>
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t">
                      <span className="font-bold text-primary text-lg">£{match.price}</span>
                      <span className="text-xs text-primary flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Book Now <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* My Tickets */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-primary" />
        My Tickets ({tickets.length})
      </h2>
      {tickets.length === 0 ? (
        <Card className="text-center p-12">
          <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No tickets yet</h2>
          <p className="text-muted-foreground mb-6">Book your first match ticket and experience the atmosphere live</p>
          <Button className="gap-2 rounded-xl" onClick={() => setBookingOpen(true)}>
            <Ticket className="w-4 h-4" /> Book Ticket
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const stadium = STADIUMS[ticket.venue];
            const isExpanded = expandedTicket === ticket.id;
            return (
              <Card key={ticket.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${isExpanded ? "shadow-lg border-primary/30" : "hover:shadow-md"}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Team Sidebar */}
                    <div className="md:w-52 bg-gradient-to-br from-primary/10 to-emerald-500/5 p-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r relative">
                      {ticket.status === "confirmed" && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="text-xs text-primary font-medium mb-1 uppercase tracking-wide">{ticket.match.split(" - ")[0]}</div>
                      <div className="text-2xl font-extrabold">{ticket.homeTeam.split(" ").pop()}</div>
                      <div className="text-xs text-muted-foreground my-1 font-medium">vs</div>
                      <div className="text-2xl font-extrabold">{ticket.awayTeam.split(" ").pop()}</div>
                    </div>

                    {/* Ticket Details */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="space-y-2">
                          <p className="font-semibold text-base">{ticket.match}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {ticket.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ticket.time}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ticket.venue}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <Badge variant="outline" className="rounded-lg">Section: {ticket.section}</Badge>
                            <Badge variant="outline" className="rounded-lg">Seat: {ticket.seat}</Badge>
                            <Badge variant={ticket.status === "confirmed" ? "default" : "secondary"} className="rounded-lg">
                              {ticket.status === "confirmed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                              {ticket.status}
                            </Badge>
                          </div>

                          {/* Expandable Stadium Info */}
                          {stadium && (
                            <button
                              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                              onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                            >
                              <Building2 className="w-3 h-3" />
                              {isExpanded ? "Hide venue details" : "Show venue details"}
                              <ArrowRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                          )}
                          {isExpanded && stadium && (
                            <div className="mt-2 p-3 rounded-xl bg-muted/30 border animate-fade-in">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Capacity</p>
                                  <p className="font-semibold flex items-center gap-1"><Users className="w-3 h-3 text-muted-foreground" />{stadium.capacity}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">City</p>
                                  <p className="font-semibold flex items-center gap-1"><MapPin className="w-3 h-3 text-muted-foreground" />{stadium.city}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Country</p>
                                  <p className="font-semibold">{stadium.country}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Venue Rating</p>
                                  <p className="font-semibold flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />{stadium.rating}/5
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-2xl font-extrabold text-primary">£{ticket.price.toFixed(2)}</div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">total</p>
                          </div>
                          <Button variant="destructive" size="icon" className="rounded-lg h-10 w-10" onClick={() => cancelTicket(ticket.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
