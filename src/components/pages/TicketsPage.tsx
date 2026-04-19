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
  Ticket, Clock, Calendar, MapPin, Trash2, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";

export default function TicketsPage() {
  const { token, setCurrentPage } = useAppStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div><h1 className="text-3xl font-bold">Match Tickets</h1><p className="text-muted-foreground">Book and manage your match day experience</p></div>
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogTrigger asChild><Button className="gap-2 rounded-xl shadow-md shadow-primary/20"><Ticket className="w-4 h-4" /> Book New Ticket</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Book a Match Ticket</DialogTitle><DialogDescription>Fill in the details to book your match ticket</DialogDescription></DialogHeader>
            <form onSubmit={bookTicket} className="space-y-4">
              <div className="space-y-2"><Label>Match</Label><Input placeholder="e.g. Premier League - Matchday 30" value={form.match} onChange={e => setForm({ ...form, match: e.target.value })} required className="h-11" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Home Team</Label><Input placeholder="e.g. Liverpool FC" value={form.homeTeam} onChange={e => setForm({ ...form, homeTeam: e.target.value })} required className="h-11" /></div>
                <div className="space-y-2"><Label>Away Team</Label><Input placeholder="e.g. Arsenal FC" value={form.awayTeam} onChange={e => setForm({ ...form, awayTeam: e.target.value })} required className="h-11" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className="h-11" /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required className="h-11" /></div>
              </div>
              <div className="space-y-2"><Label>Venue</Label><Input placeholder="e.g. Anfield, Liverpool" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required className="h-11" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Section</Label><Select value={form.section} onValueChange={v => setForm({ ...form, section: v })}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Premium">Premium</SelectItem><SelectItem value="VIP">VIP</SelectItem><SelectItem value="Club Level">Club Level</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Price (£)</Label><Input type="number" placeholder="75.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className="h-11" /></div>
              </div>
              <DialogFooter><Button type="submit" disabled={bookingLoading} className="gap-2 rounded-xl">{bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />} Confirm Booking</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-8 border-primary/10 hover:shadow-md transition-shadow">
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Upcoming Matches</CardTitle><CardDescription>Click on any match to quickly book a ticket</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { home: "Liverpool FC", away: "Everton FC", date: "2025-04-05", time: "15:00", venue: "Anfield", competition: "Premier League", price: 65 },
              { home: "Real Madrid", away: "Barcelona", date: "2025-04-12", time: "21:00", venue: "Santiago Bernabeu", competition: "La Liga", price: 180 },
              { home: "AC Milan", away: "Inter Milan", date: "2025-04-19", time: "20:45", venue: "San Siro", competition: "Serie A", price: 120 },
            ].map((match, i) => (
              <Card key={i} className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer" onClick={() => { setForm({ match: match.competition, homeTeam: match.home, awayTeam: match.away, date: match.date, time: match.time, venue: match.venue, section: "Standard", price: match.price.toString() }); setBookingOpen(true); }}>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs rounded-lg">{match.competition}</Badge>
                  <div className="flex items-center justify-between mb-2"><span className="font-semibold text-sm">{match.home}</span><span className="text-xs text-muted-foreground font-bold">VS</span><span className="font-semibold text-sm">{match.away}</span></div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{match.date}</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{match.time}</span></div>
                  <div className="mt-2 flex items-center justify-between"><span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{match.venue}</span><span className="font-bold text-primary text-sm">£{match.price}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">My Tickets ({tickets.length})</h2>
      {tickets.length === 0 ? (
        <Card className="text-center p-12"><Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" /><h2 className="text-xl font-semibold mb-2">No tickets yet</h2><p className="text-muted-foreground mb-6">Book your first match ticket</p><Button className="gap-2 rounded-xl" onClick={() => setBookingOpen(true)}><Ticket className="w-4 h-4" /> Book Ticket</Button></Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0"><div className="flex flex-col md:flex-row">
                <div className="md:w-48 bg-gradient-to-br from-primary/10 to-emerald-500/5 p-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r">
                  <div className="text-xs text-primary font-medium mb-1">{ticket.match.split(" - ")[0]}</div>
                  <div className="text-2xl font-bold">{ticket.homeTeam.split(" ").pop()}</div><div className="text-xs text-muted-foreground my-1">vs</div><div className="text-2xl font-bold">{ticket.awayTeam.split(" ").pop()}</div>
                </div>
                <div className="flex-1 p-4"><div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold">{ticket.match}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {ticket.date}</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ticket.time}</span><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ticket.venue}</span></div>
                    <div className="flex items-center gap-3 text-sm mt-1"><Badge variant="outline" className="rounded-lg">Section: {ticket.section}</Badge><Badge variant="outline" className="rounded-lg">Seat: {ticket.seat}</Badge><Badge variant={ticket.status === "confirmed" ? "default" : "secondary"} className="rounded-lg">{ticket.status === "confirmed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}{ticket.status}</Badge></div>
                  </div>
                  <div className="flex items-center gap-3"><div className="text-right"><div className="text-2xl font-bold text-primary">£{ticket.price.toFixed(2)}</div></div><Button variant="destructive" size="icon" className="rounded-lg" onClick={() => cancelTicket(ticket.id)}><Trash2 className="w-4 h-4" /></Button></div>
                </div></div>
              </div></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
