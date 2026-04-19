import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ===== Match State =====
interface MatchState {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: number
  isLive: boolean
  events: MatchEvent[]
  intervalId: ReturnType<typeof setInterval> | null
}

interface MatchEvent {
  id: string
  matchId: string
  type: 'goal' | 'shot' | 'foul' | 'corner' | 'yellow_card' | 'red_card' | 'possession'
  minute: number
  team: string
  player: string
  description: string
  createdAt: string
}

// AC Milan players
const milanPlayers = [
  'Maignan', 'Calabria', 'Tomori', 'Thiaw', 'Hernandez',
  'Bennacer', 'Reijnders', 'Loftus-Cheek', 'Pulisic', 'Leão', 'Giroud'
]

// Juventus players
const juvePlayers = [
  'Di Gregorio', 'Bremer', 'Gatti', 'Alex Sandro', 'Cambiaso',
  'Locatelli', 'Rabiot', 'Chiesa', 'Kostic', 'Vlahovic', 'Yildiz'
]

function randomPlayer(team: string): string {
  if (team === 'AC Milan') return milanPlayers[Math.floor(Math.random() * milanPlayers.length)]
  return juvePlayers[Math.floor(Math.random() * juvePlayers.length)]
}

function randomTeam(): string {
  return Math.random() > 0.5 ? 'AC Milan' : 'Juventus'
}

// Weighted event types — goals are rarer, possession is more common
function randomEventType(): MatchEvent['type'] {
  const r = Math.random()
  if (r < 0.08) return 'goal'        // 8%
  if (r < 0.22) return 'shot'        // 14%
  if (r < 0.40) return 'foul'        // 18%
  if (r < 0.55) return 'corner'      // 15%
  if (r < 0.68) return 'yellow_card' // 13%
  if (r < 0.72) return 'red_card'    // 4%
  return 'possession'                 // 28%
}

function generateDescription(type: MatchEvent['type'], player: string, team: string): string {
  switch (type) {
    case 'goal':
      return `⚽ GOAL! ${player} scores for ${team}! What a brilliant finish!`
    case 'shot':
      const shotOutcome = Math.random() > 0.4 ? 'on target' : 'saved by the goalkeeper'
      return `${player} takes a shot ${shotOutcome}.`
    case 'foul':
      return `${player} commits a foul. Free kick awarded.`
    case 'corner':
      return `Corner kick for ${team}. ${player} to deliver.`
    case 'yellow_card':
      return `🟨 Yellow card shown to ${player} (${team}) for a reckless challenge.`
    case 'red_card':
      return `🟥 RED CARD! ${player} (${team}) is sent off!`
    case 'possession':
      return `${team} dominate possession in the midfield.`
  }
}

function createEvent(minute: number): MatchEvent {
  const team = randomTeam()
  const type = randomEventType()
  const player = randomPlayer(team)
  const id = Math.random().toString(36).substr(2, 9)
  return {
    id,
    matchId: 'milan-juve-2025',
    type,
    minute,
    team,
    player,
    description: generateDescription(type, player, team),
    createdAt: new Date().toISOString()
  }
}

// ===== Match Simulation =====
let match: MatchState = {
  homeTeam: 'AC Milan',
  awayTeam: 'Juventus',
  homeScore: 1,
  awayScore: 0,
  minute: 78,
  isLive: false,
  events: [],
  intervalId: null
}

function resetMatch() {
  if (match.intervalId) {
    clearInterval(match.intervalId)
  }
  match = {
    homeTeam: 'AC Milan',
    awayTeam: 'Juventus',
    homeScore: 1,
    awayScore: 0,
    minute: 78,
    isLive: false,
    events: [],
    intervalId: null
  }
}

function startSimulation() {
  if (match.isLive) return
  match.isLive = true

  // Broadcast initial state
  io.emit('match-state', {
    type: 'match-start',
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    minute: match.minute,
    isLive: true
  })

  match.intervalId = setInterval(() => {
    if (match.minute >= 90) {
      // Full Time
      clearInterval(match.intervalId!)
      match.intervalId = null
      match.isLive = false

      const fullTimeEvent: MatchEvent = {
        id: Math.random().toString(36).substr(2, 9),
        matchId: 'milan-juve-2025',
        type: 'goal' as any,
        minute: 90,
        team: '',
        player: '',
        description: '🏁 FULL TIME! The referee blows the final whistle.',
        createdAt: new Date().toISOString()
      }

      io.emit('match-event', fullTimeEvent)
      io.emit('match-state', {
        type: 'full-time',
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        minute: 90,
        isLive: false
      })

      console.log(`Full Time: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`)
      return
    }

    match.minute++

    // Generate 1-2 events per minute
    const eventCount = Math.random() > 0.6 ? 2 : 1
    for (let i = 0; i < eventCount; i++) {
      const event = createEvent(match.minute)
      match.events.push(event)

      // If it's a goal, update the score
      if (event.type === 'goal') {
        if (event.team === match.homeTeam) {
          match.homeScore++
        } else {
          match.awayScore++
        }
      }

      // Emit event to all connected clients
      io.emit('match-event', event)
    }

    // Emit updated state
    io.emit('match-state', {
      type: 'minute-update',
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      minute: match.minute,
      isLive: true
    })

    console.log(`[${match.minute}'] ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`)
  }, 5000)
}

// ===== Socket.io Handlers =====
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Send current match state to newly connected client
  socket.emit('match-state', {
    type: 'state-sync',
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    minute: match.minute,
    isLive: match.isLive
  })

  // Send existing events to catch up
  socket.emit('match-events-history', match.events)

  // Start match simulation
  socket.on('start-match', () => {
    console.log('Match start requested')
    startSimulation()
  })

  // Restart match
  socket.on('restart', () => {
    console.log('Match restart requested')
    resetMatch()
    startSimulation()
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3004
httpServer.listen(PORT, () => {
  console.log(`⚽ Match Service running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...')
  if (match.intervalId) clearInterval(match.intervalId)
  httpServer.close(() => {
    console.log('Match service closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...')
  if (match.intervalId) clearInterval(match.intervalId)
  httpServer.close(() => {
    console.log('Match service closed')
    process.exit(0)
  })
})
