import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { screenTicker, sendAiChatMessage } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { AppSidebar } from '@/components/AppSidebar';
import { getStatusColor, getStatusLabel } from '@/types/screening';
import type { ChatMessage, TickerScreeningResponse } from '@/types/screening';
import { MessageSquare, Send, Loader2, Search, Building2, AlertTriangle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AiChat() {
  const [searchParams] = useSearchParams();
  const [ticker, setTicker] = useState(searchParams.get('ticker') || '');
  const [tickerInput, setTickerInput] = useState('');
  const [tickerInfo, setTickerInfo] = useState<TickerScreeningResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTicker, setLoadingTicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLoadTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerInput.trim()) return;

    const normalizedTicker = tickerInput.trim().toUpperCase();
    setLoadingTicker(true);

    try {
      const info = await screenTicker(normalizedTicker);
      setTickerInfo(info);
      setTicker(normalizedTicker);
      setMessages([]);
    } catch (error) {
      console.error('Failed to load ticker:', error);
      toast({
        title: 'Failed to Load Ticker',
        description: error instanceof Error ? error.message : 'Could not load ticker information',
        variant: 'destructive',
      });
    } finally {
      setLoadingTicker(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !ticker) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendAiChatMessage(ticker, updatedMessages);
      setMessages([...updatedMessages, response.reply]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSidebar>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
            AI Chat
          </h1>
          <p className="text-muted-foreground">
            Get AI-powered explanations for screening results and compliance details.
          </p>
        </div>

        <div className="space-y-4">
          {/* Ticker Selection */}
          {!ticker ? (
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Select a Ticker</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoadTicker} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter ticker (e.g., NVDA)"
                      value={tickerInput}
                      onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                      className="pl-10"
                      disabled={loadingTicker}
                    />
                  </div>
                  <Button type="submit" disabled={loadingTicker || !tickerInput.trim()} className="btn-dalil">
                    {loadingTicker ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Ticker Info Banner */}
              {tickerInfo && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold">{ticker}</h2>
                          <p className="text-sm text-muted-foreground">
                            {tickerInfo.security.company || 'Unknown Company'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge
                        status={getStatusColor(tickerInfo.invesense.classification, null, tickerInfo.invesense.available)}
                        label={getStatusLabel(tickerInfo.invesense.classification, null, tickerInfo.invesense.available)}
                        size="sm"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-muted-foreground"
                      onClick={() => {
                        setTicker('');
                        setTickerInfo(null);
                        setMessages([]);
                      }}
                    >
                      Change Ticker
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* No Data Warning */}
              {tickerInfo && !tickerInfo.invesense.available && (
                <Card className="border-warning/50 bg-warning/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <h3 className="font-medium">No Screening Data</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          This ticker hasn't been screened yet.
                        </p>
                        <Button variant="link" className="px-0 mt-2 text-primary" asChild>
                          <Link to={`/request?ticker=${ticker}`}>Request Screening →</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chat Area */}
              <Card className="min-h-[500px] flex flex-col">
                <CardHeader className="border-b border-border py-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Chat with AI
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                          <MessageSquare className="w-7 h-7 text-primary/50" />
                        </div>
                        <p className="mb-2">Ask about {ticker}'s Shariah compliance</p>
                        <p className="text-sm">Example: "Why does {ticker} require purification?"</p>
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted border border-border rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-muted border border-border rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${ticker}...`}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading || !input.trim()} className="btn-dalil">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppSidebar>
  );
}
