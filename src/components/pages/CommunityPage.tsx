"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Plus,
  Flame,
  Clock,
  ArrowLeft,
  Heart,
  Eye,
  Reply,
  Pin,
  TrendingUp,
  Users,
  CircleDot,
  Search,
  ChevronDown,
  Send,
  User,
} from "lucide-react";

// ==================== TYPES ====================

type Category = "Tactics" | "Transfers" | "Match Day" | "General" | "Predictions" | "Off Topic";

interface ForumReply {
  id: number;
  author: string;
  initials: string;
  content: string;
  timestamp: string;
  likes: number;
  gradientFrom: string;
  gradientTo: string;
}

interface ForumTopic {
  id: number;
  title: string;
  preview: string;
  content: string;
  category: Category;
  author: string;
  initials: string;
  timestamp: string;
  replies: number;
  likes: number;
  views: number;
  pinned: boolean;
  hot: boolean;
  gradientFrom: string;
  gradientTo: string;
  repliesList: ForumReply[];
}

// ==================== CATEGORY CONFIG ====================

const categoryConfig: Record<Category, { bg: string; text: string; dot: string }> = {
  Tactics: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  Transfers: { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
  "Match Day": { bg: "bg-red-500/15", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  General: { bg: "bg-slate-500/15", text: "text-slate-700 dark:text-slate-400", dot: "bg-slate-500" },
  Predictions: { bg: "bg-violet-500/15", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500" },
  "Off Topic": { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
};

// ==================== MOCK DATA ====================

const mockTopics: ForumTopic[] = [
  {
    id: 1,
    title: "Is the 3-4-3 becoming the dominant formation in the Premier League?",
    preview: "With Arteta's Arsenal, Postecoglou's Spurs, and even Ten Hag experimenting with three at the back, it seems like the 3-4-3 is making a massive comeback...",
    content: "With Arteta's Arsenal, Postecoglou's Spurs, and even Ten Hag experimenting with three at the back, it seems like the 3-4-3 is making a massive comeback in English football.\n\nArsenal have been particularly impressive with their fluid back three, allowing White to step into midfield while Tomiyasu provides width. The wing-backs are absolutely crucial - without quality in those positions, the system falls apart.\n\nTottenham under Ange have taken a more aggressive approach, pushing their wing-backs extremely high and using the double pivot to cover the spaces left behind.\n\nWhat do you all think? Is this a temporary trend or are we seeing a permanent shift in how Premier League teams approach their defensive structure?",
    category: "Tactics",
    author: "TacticalNerd42",
    initials: "TN",
    timestamp: "2h ago",
    replies: 67,
    likes: 142,
    views: 2340,
    pinned: true,
    hot: true,
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-600",
    repliesList: [
      { id: 1, author: "FormationFan", initials: "FF", content: "I think it's cyclical. Every few years a formation comes back into fashion. Remember when 4-2-3-1 was everywhere? The key is having the right personnel.", timestamp: "1h ago", likes: 34, gradientFrom: "from-blue-500", gradientTo: "to-cyan-500" },
      { id: 2, author: "ArsenalFaithful", initials: "AF", content: "Arsenal's version is unique because White inverts so well. It's almost a back three that becomes a back four in possession. Arteta is a tactical genius for this.", timestamp: "45m ago", likes: 28, gradientFrom: "from-red-500", gradientTo: "to-rose-500" },
      { id: 3, author: "ThreeLions", initials: "TL", content: "The problem is at international level. England play 4-3-3 and it confuses players who play 3-4-3 for their clubs. Southgate struggled with this.", timestamp: "30m ago", likes: 15, gradientFrom: "from-amber-500", gradientTo: "to-orange-500" },
      { id: 4, author: "CoachMike", initials: "CM", content: "As a grassroots coach, I can tell you the 3-4-3 is becoming very popular at youth level too. Kids are watching the Premier League and want to emulate what they see.", timestamp: "15m ago", likes: 9, gradientFrom: "from-violet-500", gradientTo: "to-purple-500" },
    ],
  },
  {
    id: 2,
    title: "Salah contract situation - Will he stay or go to Saudi Arabia?",
    preview: "Reports suggest Salah could leave Liverpool for a record deal in Saudi Arabia this summer. His current contract expires in 2026 and negotiations seem to have stalled...",
    content: "Reports suggest Salah could leave Liverpool for a record deal in Saudi Arabia this summer. His current contract expires in 2026 and negotiations seem to have stalled over wage demands.\n\nOn one hand, Liverpool would be losing their talisman - a player who has consistently delivered 20+ goals and assists every season. On the other hand, the Saudi money could fund a complete rebuild of the squad.\n\nAl-Ittihad are reportedly willing to pay £150M for the transfer and offer Salah £1M per week in wages. That's an astronomical figure that would be impossible to turn down from a financial perspective.\n\nWhat should Liverpool do? Try to extend his contract or cash in while they can?",
    category: "Transfers",
    author: "TransferGuru",
    initials: "TG",
    timestamp: "4h ago",
    replies: 89,
    likes: 203,
    views: 4520,
    pinned: true,
    hot: true,
    gradientFrom: "from-orange-500",
    gradientTo: "to-amber-600",
    repliesList: [
      { id: 1, author: "RedKopite", initials: "RK", content: "He's irreplaceable. Simple as that. We can talk about rebuilding all we want, but finding someone who delivers like Mo does season after season is nearly impossible.", timestamp: "3h ago", likes: 67, gradientFrom: "from-red-600", gradientTo: "to-red-500" },
      { id: 2, author: "MoneyballAnalyst", initials: "MA", content: "From a purely financial standpoint, £150M plus the saved wages could buy 2-3 excellent players. Smart clubs know when to sell. Liverpool should be smart here.", timestamp: "2h ago", likes: 45, gradientFrom: "from-emerald-500", gradientTo: "to-teal-500" },
      { id: 3, author: "EgyptianKing", initials: "EK", content: "Salah has earned the right to choose his own future. If he wants one last big payday, who are we to judge? He's given everything to Liverpool.", timestamp: "1h ago", likes: 38, gradientFrom: "from-amber-500", gradientTo: "to-yellow-500" },
    ],
  },
  {
    id: 3,
    title: "Matchday Thread: Liverpool vs Arsenal - Title Decider",
    preview: "The biggest match of the season is here! Liverpool host Arsenal at Anfield in what could define the title race. Both teams are separated by just 2 points...",
    content: "The biggest match of the season is here! Liverpool host Arsenal at Anfield in what could define the title race. Both teams are separated by just 2 points.\n\nTeam news:\n- Liverpool: Van Dijk returns from suspension. Gravenberch starts in midfield.\n- Arsenal: Saliba passed fit. Ødegaard starts after recovering from ankle injury.\n\nKey battles to watch:\n1. Rice vs Gravenberch in midfield\n2. Saka vs Alexander-Arnold\n3. Haaland... wait, wrong team. Salah vs White.\n\nKickoff is at 16:30 BST. What are your predictions?",
    category: "Match Day",
    author: "MatchDayHero",
    initials: "MH",
    timestamp: "6h ago",
    replies: 234,
    likes: 312,
    views: 8900,
    pinned: false,
    hot: true,
    gradientFrom: "from-red-500",
    gradientTo: "to-rose-600",
    repliesList: [
      { id: 1, author: "AnfieldRoar", initials: "AR", content: "Going 3-1 to the Reds! Salah brace, Nunez with a screamer. Arsenal pull one back through Saka but it's not enough!", timestamp: "5h ago", likes: 89, gradientFrom: "from-red-500", gradientTo: "to-orange-500" },
      { id: 2, author: "Gooner4Life", initials: "GL", content: "2-2 draw. Both teams cancel each other out. Rice scores a worldie and Saka gets an equalizer late on. Liverpool score through Salah and Jota.", timestamp: "4h ago", likes: 56, gradientFrom: "from-red-600", gradientTo: "to-red-400" },
    ],
  },
  {
    id: 4,
    title: "Who is the most overrated player in the Premier League right now?",
    preview: "I know this is controversial, but I genuinely believe some players get way more credit than they deserve. Let me explain my thoughts...",
    content: "I know this is controversial, but I genuinely believe some players get way more credit than they deserve.\n\nMy picks:\n1. Antony (Man Utd) - £85M for a player who has 8 goals in 2 seasons is insane\n2. Mudryk (Chelsea) - Showing flashes but nowhere near the £89M price tag\n3. Sancho (on loan) - Once hailed as the next big thing, now struggling at Dortmund again\n\nI'm not saying these players are bad, but the hype and price tags far exceed their actual contributions. What do you think?",
    category: "General",
    author: "HotTakeHarry",
    initials: "HH",
    timestamp: "8h ago",
    replies: 156,
    likes: 89,
    views: 5670,
    pinned: false,
    hot: true,
    gradientFrom: "from-slate-500",
    gradientTo: "to-gray-600",
    repliesList: [
      { id: 1, author: "DefenderOfPlayers", initials: "DP", content: "Antony had a terrible start but he's been improving under Ten Hag. Give him time. Not everyone is Haaland.", timestamp: "7h ago", likes: 12, gradientFrom: "from-indigo-500", gradientTo: "to-blue-500" },
      { id: 2, author: "StatsDontLie", initials: "SD", content: "The xG data actually shows Mudryk is underperforming significantly. His shot conversion rate is one of the worst in the league. That's not opinion, that's fact.", timestamp: "6h ago", likes: 34, gradientFrom: "from-teal-500", gradientTo: "to-emerald-500" },
    ],
  },
  {
    id: 5,
    title: "Premier League Predictions: Top 4, Bottom 3, Golden Boot",
    preview: "Making my bold predictions for the remainder of the season. I've analyzed the fixtures, form, and injury situations for all 20 clubs...",
    content: "Making my bold predictions for the remainder of the season. I've analyzed the fixtures, form, and injury situations for all 20 clubs.\n\n**Top 4:**\n1. Liverpool (89 pts) - Strength in depth is incredible\n2. Arsenal (87 pts) - Will push them all the way\n3. Man City (78 pts) - Rodri injury hurt them badly\n4. Chelsea (72 pts) - Palmer carries them to CL\n\n**Bottom 3:**\n18. Everton (38 pts) - Survive on goal difference\n19. Wolves (35 pts) - Just not enough quality\n20. Ipswich (28 pts) - Good effort but not enough\n\n**Golden Boot:** Haaland (27 goals) - Just too clinical\n\nBold prediction: Aston Villa finish 5th and win the Europa League.",
    category: "Predictions",
    author: "PredictorPro",
    initials: "PP",
    timestamp: "12h ago",
    replies: 45,
    likes: 67,
    views: 1890,
    pinned: false,
    hot: false,
    gradientFrom: "from-violet-500",
    gradientTo: "to-purple-600",
    repliesList: [
      { id: 1, author: "VillaParkRegular", initials: "VR", content: "Villa 5th AND Europa League? I wish! But realistically we'll be fighting Newcastle for that spot. Emery is a wizard though, so who knows.", timestamp: "11h ago", likes: 23, gradientFrom: "from-purple-600", gradientTo: "to-violet-400" },
    ],
  },
  {
    id: 6,
    title: "Best football documentaries to watch right now",
    preview: "Just finished 'All or Nothing: Arsenal' and it was incredible. What other football documentaries would you recommend? Looking for something that goes beyond the surface...",
    content: "Just finished 'All or Nothing: Arsenal' and it was incredible. What other football documentaries would you recommend? Looking for something that goes beyond the surface-level stuff.\n\nSo far I've watched:\n- All or Nothing: Arsenal (9/10)\n- All or Nothing: Man City (7/10)\n- The Last Dance (not football but amazing) (10/10)\n- Sunderland 'Til I Die (8/10)\n- Take Us Home: Leeds United (7/10)\n\nLooking for recommendations about:\n- Lower league clubs\n- Historical football moments\n- Manager profiles\n- International football stories",
    category: "Off Topic",
    author: "CouchFanatic",
    initials: "CF",
    timestamp: "1d ago",
    replies: 38,
    likes: 91,
    views: 1230,
    pinned: false,
    hot: false,
    gradientFrom: "from-amber-500",
    gradientTo: "to-yellow-600",
    repliesList: [],
  },
  {
    id: 7,
    title: "The inverted full-back trend - tactical masterstroke or overcomplication?",
    preview: "Every top team now seems to have a full-back who plays as a midfielder. But is it actually effective or just a trendy tactic that will be figured out...",
    content: "Every top team now seems to have a full-back who plays as a midfielder. But is it actually effective or just a trendy tactic that will be figured out?\n\nThe pioneers:\n- Guardiola's use of Walker and Zinchenko inverting\n- Arteta perfecting it with White and Zinchenko\n- Alonso at Leverkusen using Frimpong similarly\n\nThe problem I see is that against top opposition who press well, the inverted full-back gets caught in no-man's land. You need a forward willing to track back to cover the space.\n\nWhat are your thoughts on this evolution of the full-back role?",
    category: "Tactics",
    author: "BackFourAnalysis",
    initials: "BA",
    timestamp: "1d ago",
    replies: 52,
    likes: 78,
    views: 2100,
    pinned: false,
    hot: false,
    gradientFrom: "from-emerald-500",
    gradientTo: "to-green-600",
    repliesList: [],
  },
  {
    id: 8,
    title: "Wirtz to Real Madrid - Deal almost done according to Fabrizio Romano",
    preview: "Florian Wirtz is reportedly close to joining Real Madrid in a deal worth €130M. The German midfielder has been sensational for Leverkusen this season...",
    content: "Florian Wirtz is reportedly close to joining Real Madrid in a deal worth €130M. The German midfielder has been sensational for Leverkusen this season with 18 goals and 12 assists in all competitions.\n\nHere We Go could be imminent according to Fabrizio Romano. Personal terms are reportedly already agreed, and Madrid have been in contact with Leverkusen for weeks.\n\nThis would be a massive blow for Leverkusen and the Bundesliga. Losing Wirtz AND Xhaka in the same summer would severely weaken Alonso's side.\n\nIs €130M a fair price in today's market? I think he's worth every penny.",
    category: "Transfers",
    author: "InsiderDealings",
    initials: "ID",
    timestamp: "2d ago",
    replies: 73,
    likes: 134,
    views: 4560,
    pinned: false,
    hot: true,
    gradientFrom: "from-orange-500",
    gradientTo: "to-red-600",
    repliesList: [],
  },
  {
    id: 9,
    title: "Mbappe at Real Madrid - Is the experiment working?",
    preview: "Six months into his Real Madrid career and the results have been mixed. While Mbappe has scored goals, he hasn't quite hit the heights many expected...",
    content: "Six months into his Real Madrid career and the results have been mixed. While Mbappe has scored goals, he hasn't quite hit the heights many expected.\n\nStats so far:\n- 14 goals in 22 appearances\n- 4 assists\n- 3 big chances missed in Clasico\n- Average rating: 7.2/10\n\nThe issue seems to be tactical fit. Ancelotti is trying to play him as a left winger in a 4-3-3, but Mbappe clearly prefers playing through the middle.\n\nWith Vinicius also wanting central freedom, there's a logjam. Something has to give. Should Real switch to a 4-4-2 diamond? Or should Mbappe adapt?",
    category: "Match Day",
    author: "LaLigaExpert",
    initials: "LE",
    timestamp: "2d ago",
    replies: 98,
    likes: 156,
    views: 6780,
    pinned: false,
    hot: true,
    gradientFrom: "from-red-500",
    gradientTo: "to-pink-600",
    repliesList: [],
  },
  {
    id: 10,
    title: "Should VAR be scrapped? The ongoing controversy explained",
    preview: "After another weekend of VAR controversies, the debate rages on. From disallowed goals to questionable red card decisions, is technology actually helping or hurting football...",
    content: "After another weekend of VAR controversies, the debate rages on. From disallowed goals to questionable red card decisions, is technology actually helping or hurting football?\n\nThis season's biggest VAR moments:\n1. Diaz goal disallowed for Liverpool (human error)\n2. Pedro Porro red card rescinded after appeal\n3. Hojlund offside by literally centimeters\n4. Wolves penalty not given in 97th minute\n\nThe fundamental problem is that VAR was supposed to eliminate clear errors, but instead it's created new controversies around subjective decisions. Offside by a toe nail? Is that really what we want?\n\nI propose: Semi-automated offside only, no VAR for subjective decisions like fouls and handball.",
    category: "General",
    author: "RefereeWatcher",
    initials: "RW",
    timestamp: "3d ago",
    replies: 187,
    likes: 245,
    views: 9200,
    pinned: false,
    hot: true,
    gradientFrom: "from-slate-500",
    gradientTo: "to-zinc-600",
    repliesList: [],
  },
  {
    id: 11,
    title: "Champions League dark horses - Who can shock Europe this season?",
    preview: "With Real Madrid and Man City as clear favorites, who are the real dark horses capable of going deep in this season's Champions League...",
    content: "With Real Madrid and Man City as clear favorites, who are the real dark horses capable of going deep in this season's Champions League?\n\nMy dark horse picks:\n1. Aston Villa - Emery's European pedigree is incredible\n2. Brest - Unbeaten run in group stage was stunning\n3. Stuttgart - Young, hungry, and play beautiful football\n4. Atalanta - defending Europa League champions\n\nBrest in particular have been the story of the tournament. Nobody expected a small French club to navigate the new Swiss format so well.\n\nWho are your picks? Any team you think could go all the way?",
    category: "Predictions",
    author: "EuroVisionary",
    initials: "EV",
    timestamp: "3d ago",
    replies: 41,
    likes: 55,
    views: 1450,
    pinned: false,
    hot: false,
    gradientFrom: "from-violet-500",
    gradientTo: "to-indigo-600",
    repliesList: [],
  },
  {
    id: 12,
    title: "What's your pre-match ritual? Share your matchday traditions",
    preview: "We all have them - those weird little routines we do before every match. Walking the same route to the stadium, wearing the lucky shirt, or eating the same pie...",
    content: "We all have them - those weird little routines we do before every match. Walking the same route to the stadium, wearing the lucky shirt, or eating the same pie.\n\nMy rituals:\n- Always wear my 2005 Istanbul shirt (even though it's falling apart)\n- Meet at the same pub at 2pm regardless of kickoff\n- Listen to 'You'll Never Walk Alone' on the way to Anfield\n- Get a steak pie from the same vendor outside the ground\n- Never leave my seat until the final whistle\n\nMy mate has a ridiculous one where he won't wash his Liverpool scarf during a winning streak. The smell is... something else.\n\nWhat are yours? Let's hear the weirdest ones!",
    category: "Off Topic",
    author: "MatchdayRituals",
    initials: "MR",
    timestamp: "5d ago",
    replies: 63,
    likes: 112,
    views: 2100,
    pinned: false,
    hot: false,
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-600",
    repliesList: [],
  },
];

const avatarGradients = [
  { from: "from-emerald-500", to: "to-teal-500" },
  { from: "from-rose-500", to: "to-pink-500" },
  { from: "from-amber-500", to: "to-orange-500" },
  { from: "from-violet-500", to: "to-purple-500" },
  { from: "from-cyan-500", to: "to-blue-500" },
  { from: "from-red-500", to: "to-rose-500" },
];

// ==================== COMPONENT ====================

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("hot");
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("General");
  const [newContent, setNewContent] = useState("");
  const [replyText, setReplyText] = useState("");
  const [likedReplies, setLikedReplies] = useState<Set<number>>(new Set());
  const [likedTopics, setLikedTopics] = useState<Set<number>>(new Set());
  const [topics, setTopics] = useState<ForumTopic[]>(mockTopics);
  const [visibleCount, setVisibleCount] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort topics based on active tab
  const filteredTopics = useMemo(() => {
    let result = [...topics];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.preview.toLowerCase().includes(q) ||
          t.author.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Tab filter
    switch (activeTab) {
      case "hot":
        result.sort((a, b) => b.likes + b.replies - (a.likes + a.replies));
        break;
      case "latest":
        result.sort((a, b) => b.id - a.id);
        break;
      case "top":
        result.sort((a, b) => b.views - a.views);
        break;
      case "my-posts":
        return []; // Empty state
    }

    // Always put pinned topics first
    result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    return result;
  }, [topics, activeTab, searchQuery]);

  const visibleTopics = filteredTopics.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTopics.length;

  const handlePostTopic = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please fill in all fields", { description: "Title and content are required." });
      return;
    }

    const newTopic: ForumTopic = {
      id: topics.length + 1,
      title: newTitle,
      preview: newContent.substring(0, 120) + "...",
      content: newContent,
      category: newCategory,
      author: "You",
      initials: "YO",
      timestamp: "Just now",
      replies: 0,
      likes: 0,
      views: 1,
      pinned: false,
      hot: false,
      gradientFrom: "from-emerald-500",
      gradientTo: "to-teal-500",
      repliesList: [],
    };

    setTopics([newTopic, ...topics]);
    setNewTitle("");
    setNewContent("");
    setNewCategory("General");
    setDialogOpen(false);
    toast.success("Topic posted!", { description: "Your discussion has been shared with the community." });
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedTopic) return;

    const newReply: ForumReply = {
      id: selectedTopic.repliesList.length + 1,
      author: "You",
      initials: "YO",
      content: replyText,
      timestamp: "Just now",
      likes: 0,
      gradientFrom: "from-emerald-500",
      gradientTo: "to-teal-500",
    };

    const updatedTopics = topics.map((t) => {
      if (t.id === selectedTopic.id) {
        return { ...t, replies: t.replies + 1, repliesList: [...t.repliesList, newReply] };
      }
      return t;
    });

    setTopics(updatedTopics);
    setSelectedTopic({ ...selectedTopic, replies: selectedTopic.replies + 1, repliesList: [...selectedTopic.repliesList, newReply] });
    setReplyText("");
    toast.success("Reply posted!");
  };

  const toggleLikeReply = (topicId: number, replyId: number) => {
    const key = `${topicId}-${replyId}`;
    setLikedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleLikeTopic = (topicId: number) => {
    setLikedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  // ==================== TOPIC DETAIL VIEW ====================

  if (selectedTopic) {
    const catStyle = categoryConfig[selectedTopic.category];
    const isLiked = likedTopics.has(selectedTopic.id);

    return (
      <div className="min-h-screen animate-fade-in">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back button */}
          <Button
            variant="ghost"
            className="gap-2 mb-6 hover-scale text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedTopic(null)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </Button>

          {/* Topic card */}
          <Card className="card-glass mb-6">
            <CardContent className="p-6 md:p-8">
              {/* Author & meta */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className={`bg-gradient-to-br ${selectedTopic.gradientFrom} ${selectedTopic.gradientTo} text-white text-sm font-bold`}>
                    {selectedTopic.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{selectedTopic.author}</span>
                    <span className="text-xs text-muted-foreground">{selectedTopic.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTopic.pinned && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </Badge>
                  )}
                  <Badge className={`${catStyle.bg} ${catStyle.text} border-0 gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                    {selectedTopic.category}
                  </Badge>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{selectedTopic.title}</h1>

              {/* Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                {selectedTopic.content.split("\n").map((paragraph, i) => (
                  <p key={i} className={paragraph.startsWith("**") ? "font-semibold mt-3 mb-1" : "text-muted-foreground leading-relaxed"}>
                    {paragraph.replace(/\*\*/g, "")}
                  </p>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1.5 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
                  onClick={() => toggleLikeTopic(selectedTopic.id)}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
                  <span className="text-sm">{selectedTopic.likes + (isLiked ? 1 : 0)}</span>
                </Button>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">{selectedTopic.replies} replies</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{selectedTopic.views.toLocaleString()} views</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-1 mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              {selectedTopic.replies} {selectedTopic.replies === 1 ? "Reply" : "Replies"}
            </h2>
          </div>

          <div className="space-y-3 mb-6 stagger-fade">
            {selectedTopic.repliesList.map((reply) => {
              const replyKey = `${selectedTopic.id}-${reply.id}`;
              const replyLiked = likedReplies.has(replyKey);
              return (
                <Card key={reply.id} className="card-glass">
                  <CardContent className="p-5">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9 border border-border/50 flex-shrink-0">
                        <AvatarFallback className={`bg-gradient-to-br ${reply.gradientFrom} ${reply.gradientTo} text-white text-xs font-bold`}>
                          {reply.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-semibold text-sm">{reply.author}</span>
                          <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{reply.content}</p>
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-1 h-7 text-xs ${replyLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
                            onClick={() => toggleLikeReply(selectedTopic.id, reply.id)}
                          >
                            <Heart className={`w-3.5 h-3.5 ${replyLiked ? "fill-red-500" : ""}`} />
                            {reply.likes + (replyLiked ? 1 : 0)}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Reply input */}
          <Card className="card-glass">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-9 w-9 border-2 border-primary/20 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold">
                    YO
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[80px] resize-none text-sm"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="gap-2 rounded-lg"
                      disabled={!replyText.trim()}
                      onClick={handleReply}
                    >
                      <Send className="w-4 h-4" />
                      Post Reply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== TOPIC LIST VIEW ====================

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Page Header */}
      <section className="page-header-gradient relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-pattern opacity-20" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
                <MessageSquare className="w-6 h-6 text-primary-foreground" />
              </div>
              <Badge variant="outline" className="px-3 py-1 rounded-full border-primary/30 text-primary">
                <Users className="w-3 h-3 mr-1.5" /> Community
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 heading-gradient">
              Community Forum
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Join the conversation. Discuss tactics, debate transfers, share your match day experiences, and connect with football fans worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6 md:gap-10 overflow-x-auto pb-1">
            {[
              { icon: <MessageSquare className="w-4 h-4" />, value: "128", label: "Topics" },
              { icon: <Reply className="w-4 h-4" />, value: "1.2K", label: "Replies" },
              { icon: <Users className="w-4 h-4" />, value: "856", label: "Members" },
              { icon: <CircleDot className="w-4 h-4 text-primary animate-pulse" />, value: "24", label: "Online" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm whitespace-nowrap">
                <span className="text-muted-foreground">{stat.icon}</span>
                <span className="font-bold stat-number">{stat.value}</span>
                <span className="text-muted-foreground hidden sm:inline">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl">
          {/* Toolbar: Search + New Topic */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search topics, authors, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-lg"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-lg shadow-md shadow-primary/20 h-10">
                  <Plus className="w-4 h-4" />
                  New Topic
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary-foreground" />
                    </div>
                    Create New Topic
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="What's on your mind?"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newCategory} onValueChange={(v) => setNewCategory(v as Category)}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(categoryConfig).map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      placeholder="Share your thoughts with the community..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="min-h-[120px] resize-none rounded-lg"
                    />
                  </div>
                  <Button
                    className="w-full gap-2 rounded-lg shadow-md shadow-primary/20"
                    onClick={handlePostTopic}
                  >
                    <Send className="w-4 h-4" />
                    Post Topic
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex h-auto bg-muted/50 p-1 rounded-xl mb-6">
              {[
                { value: "hot", label: "Hot", icon: <Flame className="w-3.5 h-3.5" /> },
                { value: "latest", label: "Latest", icon: <Clock className="w-3.5 h-3.5" /> },
                { value: "top", label: "Top", icon: <TrendingUp className="w-3.5 h-3.5" /> },
                { value: "my-posts", label: "My Posts", icon: <User className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`gap-1.5 rounded-lg text-sm data-[state=active]:tab-active-indicator data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="hot" className="mt-0">
              {renderTopicList(visibleTopics, visibleCount)}
            </TabsContent>
            <TabsContent value="latest" className="mt-0">
              {renderTopicList(visibleTopics, visibleCount)}
            </TabsContent>
            <TabsContent value="top" className="mt-0">
              {renderTopicList(visibleTopics, visibleCount)}
            </TabsContent>
            <TabsContent value="my-posts" className="mt-0">
              <Card className="card-glass">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                    You haven&apos;t posted any topics yet. Start a discussion and share your football thoughts with the community!
                  </p>
                  <Button
                    className="gap-2 rounded-lg shadow-md shadow-primary/20"
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Topic
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Load More */}
          {activeTab !== "my-posts" && hasMore && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={() => setVisibleCount((prev) => prev + 8)}
              >
                <ChevronDown className="w-4 h-4" />
                Load More Topics
              </Button>
            </div>
          )}

          {/* Search empty state */}
          {searchQuery.trim() && filteredTopics.length === 0 && activeTab !== "my-posts" && (
            <Card className="card-glass mt-6">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  No topics matching &ldquo;{searchQuery}&rdquo;. Try different keywords or browse all topics.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-lg"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );

  // ==================== TOPIC LIST RENDERER ====================

  function renderTopicList(topicsList: ForumTopic[], _count: number) {
    return (
      <div className="space-y-3 stagger-fade">
        {topicsList.map((topic) => {
          const catStyle = categoryConfig[topic.category];
          const isLiked = likedTopics.has(topic.id);

          return (
            <Card
              key={topic.id}
              className={`card-glass card-hover-lift cursor-pointer group ${topic.pinned ? "ring-1 ring-primary/10" : ""}`}
              onClick={() => {
                setSelectedTopic(topic);
                window.scrollTo(0, 0);
              }}
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex gap-3">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 border border-border/50 flex-shrink-0 hidden sm:block">
                    <AvatarFallback className={`bg-gradient-to-br ${topic.gradientFrom} ${topic.gradientTo} text-white text-xs font-bold`}>
                      {topic.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* Top row: badges */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {topic.pinned && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-1.5 py-0 gap-1">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </Badge>
                      )}
                      {topic.hot && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-[10px] px-1.5 py-0 gap-1">
                          <Flame className="w-2.5 h-2.5" /> Hot
                        </Badge>
                      )}
                      <Badge className={`${catStyle.bg} ${catStyle.text} border-0 text-[10px] px-1.5 py-0 gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                        {topic.category}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm md:text-base mb-1 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {topic.title}
                    </h3>

                    {/* Preview */}
                    <p className="text-xs md:text-sm text-muted-foreground mb-2.5 line-clamp-1 leading-relaxed">
                      {topic.preview}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium sm:hidden">
                        <span className={`inline-flex w-4 h-4 rounded-full bg-gradient-to-br ${topic.gradientFrom} ${topic.gradientTo} text-white text-[8px] items-center justify-center font-bold`}>
                          {topic.initials}
                        </span>
                        {topic.author}
                      </span>
                      <span className="hidden sm:inline items-center gap-1 font-medium">
                        {topic.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {topic.timestamp}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {topic.replies}
                      </span>
                      <span className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}>
                        <Heart className={`w-3 h-3 ${isLiked ? "fill-red-500" : ""}`} />
                        {topic.likes + (isLiked ? 1 : 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {topic.views >= 1000 ? `${(topic.views / 1000).toFixed(1)}K` : topic.views}
                      </span>
                    </div>
                  </div>

                  {/* Like button (desktop) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-lg flex-shrink-0 hidden md:flex ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeTopic(topic.id);
                    }}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
}


