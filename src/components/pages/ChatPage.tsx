"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send, Bot, User, Trash2, Sparkles, MessageCircle,
  RotateCcw, Zap, BookOpen, Target, Trophy,
  AlertCircle, RefreshCw, StopCircle, Clock, Loader2
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  error?: string; // Error message for error type
  originalPrompt?: string; // Original user prompt for retry
}

const SUGGESTED_PROMPTS = [
  { icon: <Trophy className="w-4 h-4" />, text: "Who won the last Champions League?", category: "History" },
  { icon: <Target className="w-4 h-4" />, text: "Explain the 4-3-3 formation", category: "Tactics" },
  { icon: <Sparkles className="w-4 h-4" />, text: "Top 5 players in Premier League 2024/25", category: "Players" },
  { icon: <Zap className="w-4 h-4" />, text: "How does VAR technology work?", category: "Rules" },
  { icon: <BookOpen className="w-4 h-4" />, text: "Greatest football rivalries of all time", category: "Culture" },
  { icon: <MessageCircle className="w-4 h-4" />, text: "Predict the next World Cup winner", category: "Prediction" },
];

function LoadingTimer() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tips = [
    "Analyzing football data...",
    "Consulting the tactics board...",
    "Reviewing match history...",
    "Processing football knowledge...",
    "Thinking like a manager...",
  ];
  const tipIndex = Math.min(Math.floor(elapsed / 5), tips.length - 1);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
      <Clock className="w-3.5 h-3.5" />
      <span>{elapsed}s</span>
      <span className="text-muted-foreground/60">•</span>
      <span className="italic text-muted-foreground/80">{tips[tipIndex]}</span>
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `chat-${Date.now()}`);
  const [loadingKey, setLoadingKey] = useState(0); // Reset loading timer
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string, isRetry = false) => {
    if (!text.trim() || isLoading) return;

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const userMessage: Message = { id: msgId, role: 'user', content: text.trim(), timestamp: new Date() };

    if (!isRetry) {
      setMessages(prev => [...prev, userMessage]);
    }

    setInput("");
    setIsLoading(true);
    setLoadingKey(prev => prev + 1);

    // Create abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), sessionId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (controller.signal.aborted) return; // Don't update state if aborted

      if (data.success && data.response) {
        const aiMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Show error inline in chat
        const errorMsg: Message = {
          id: `msg-${Date.now()}-err`,
          role: 'error',
          content: data.error || 'Failed to get a response from the AI.',
          timestamp: new Date(),
          originalPrompt: text.trim(),
          error: data.error
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled the request
        const cancelMsg: Message = {
          id: `msg-${Date.now()}-cancel`,
          role: 'error',
          content: 'Request was cancelled. The AI was taking too long to respond.',
          timestamp: new Date(),
          originalPrompt: text.trim(),
          error: 'cancelled'
        };
        setMessages(prev => [...prev, cancelMsg]);
        toast.info('Request cancelled');
        return;
      }

      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: 'error',
        content: error.message || 'Network error. Please check your connection and try again.',
        timestamp: new Date(),
        originalPrompt: text.trim(),
        error: error.message
      };
      setMessages(prev => [...prev, errorMsg]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      inputRef.current?.focus();
    }
  }, [isLoading, sessionId]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const retryMessage = useCallback((prompt: string) => {
    // Remove the error message from the list
    setMessages(prev => prev.filter(m => !(m.role === 'error' && m.originalPrompt === prompt)));
    // Re-send the message
    sendMessage(prompt, true);
  }, [sendMessage]);

  const clearChat = useCallback(async () => {
    // Cancel any ongoing request
    cancelRequest();
    try {
      await fetch(`/api/chat?sessionId=${sessionId}`, { method: 'DELETE' });
      setMessages([]);
      setSessionId(`chat-${Date.now()}`);
      toast.success('Chat history cleared');
    } catch {
      toast.error('Failed to clear chat');
    }
  }, [sessionId, cancelRequest]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNewChat = useCallback(() => {
    cancelRequest();
    setSessionId(`chat-${Date.now()}`);
    setMessages([]);
    toast.success('New conversation started');
  }, [cancelRequest]);

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
              Powered by GLM AI &bull; Ask anything about football
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={clearChat}>
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="mb-4 border-2 overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div ref={chatContainerRef} className="h-[500px] overflow-y-auto p-4 space-y-4 scrollbar-thin" id="chat-messages">
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
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.role === 'user' && (
                      <div className="flex gap-3 flex-row-reverse animate-fade-in">
                        <Avatar className="w-8 h-8 flex-shrink-0 bg-muted">
                          <AvatarFallback className="text-xs font-bold text-foreground">
                            {user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="max-w-[80%] items-end">
                          <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed bg-primary text-primary-foreground rounded-br-md">
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 px-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )}

                    {msg.role === 'assistant' && (
                      <div className="flex gap-3 flex-row animate-fade-in">
                        <Avatar className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-primary to-emerald-600">
                          <AvatarFallback className="text-primary-foreground"><Bot className="w-4 h-4" /></AvatarFallback>
                        </Avatar>
                        <div className="max-w-[80%] items-start">
                          <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed bg-muted rounded-bl-md">
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 px-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )}

                    {msg.role === 'error' && (
                      <div className="flex gap-3 flex-row animate-fade-in">
                        <Avatar className="w-8 h-8 flex-shrink-0 bg-destructive/10">
                          <AvatarFallback className="text-destructive"><AlertCircle className="w-4 h-4" /></AvatarFallback>
                        </Avatar>
                        <div className="max-w-[80%] items-start">
                          <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed bg-destructive/10 border border-destructive/20 rounded-bl-md">
                            <div className="flex items-center gap-2 text-destructive font-medium mb-1">
                              <AlertCircle className="w-4 h-4" />
                              <span>Failed to respond</span>
                            </div>
                            <p className="text-muted-foreground text-xs">{msg.content}</p>
                            {msg.error !== 'cancelled' && msg.originalPrompt && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 gap-1.5 h-7 text-xs rounded-lg border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => retryMessage(msg.originalPrompt!)}
                              >
                                <RefreshCw className="w-3 h-3" /> Retry
                              </Button>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 px-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 flex-row animate-fade-in">
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-600">
                      <AvatarFallback className="text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="items-start space-y-2">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        </div>
                        <div className="mt-2">
                          <LoadingTimer key={loadingKey} />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 h-7 text-xs text-muted-foreground hover:text-destructive"
                        onClick={cancelRequest}
                      >
                        <StopCircle className="w-3 h-3" /> Cancel
                      </Button>
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
                  onClick={handleNewChat}
                  title="New chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
            {isLoading && (
              <p className="text-[10px] text-muted-foreground/60 mt-2 px-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                AI responses may take 10-30 seconds on the free tier. You can cancel anytime.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
