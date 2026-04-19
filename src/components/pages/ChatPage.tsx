"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send, Bot, User, Trash2, Sparkles, MessageCircle,
  RotateCcw, Zap, BookOpen, Target, Trophy, ArrowLeft
} from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  { icon: <Trophy className="w-4 h-4" />, text: "Who won the last Champions League?", category: "History" },
  { icon: <Target className="w-4 h-4" />, text: "Explain the 4-3-3 formation", category: "Tactics" },
  { icon: <Sparkles className="w-4 h-4" />, text: "Top 5 players in Premier League 2024/25", category: "Players" },
  { icon: <Zap className="w-4 h-4" />, text: "How does VAR technology work?", category: "Rules" },
  { icon: <BookOpen className="w-4 h-4" />, text: "Greatest football rivalries of all time", category: "Culture" },
  { icon: <MessageCircle className="w-4 h-4" />, text: "Predict the next World Cup winner", category: "Prediction" },
];

export default function ChatPage() {
  const { user } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `chat-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        const aiMessage: Message = { role: 'assistant', content: data.response, timestamp: new Date() };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        toast.error('Failed to get response');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`/api/chat?sessionId=${sessionId}`, { method: 'DELETE' });
      setMessages([]);
      setSessionId(`chat-${Date.now()}`);
      toast.success('Chat history cleared');
    } catch {
      toast.error('Failed to clear chat');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Football Expert</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Powered by AI &bull; Ask anything about football
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={clearChat}>
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <Card className="mb-4 border-2 overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[500px] overflow-y-auto p-4 space-y-4" id="chat-messages">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-600/10 flex items-center justify-center mb-6 animate-float">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Ask Me Anything About Football!</h2>
                <p className="text-muted-foreground text-sm mb-8 max-w-md">
                  I&apos;m your AI football expert. Ask about tactics, players, history, predictions, or anything football-related.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt.text)}
                      className="flex items-start gap-2.5 p-3 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        {prompt.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{prompt.text}</p>
                        <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">{prompt.category}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
                  >
                    <Avatar className={`w-8 h-8 flex-shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-primary to-emerald-600' : 'bg-muted'}`}>
                      <AvatarFallback className={`text-xs font-bold ${msg.role === 'assistant' ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 animate-fade-in">
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-600">
                      <AvatarFallback className="text-primary-foreground"><Bot className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-3 bg-muted/30">
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about football tactics, players, history..."
                  className="rounded-xl h-11 pr-12 bg-background border-2 focus:border-primary/50 transition-colors"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl flex-shrink-0"
                  onClick={() => {
                    setSessionId(`chat-${Date.now()}`);
                    setMessages([]);
                    toast.success('New conversation started');
                  }}
                  title="New chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
