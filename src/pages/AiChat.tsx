import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { screenTicker, sendAiChatMessage } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { getStatusColor, getStatusLabel } from '@/types/screening';
import type { ChatMessage, TickerScreeningResponse } from '@/types/screening';
import { MessageSquare, Send, Loader2, Search, Building2, AlertTriangle } from 'lucide-react';
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
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
            AI Chat Explanation
          </h1>
          <p className="text-muted-foreground text-lg">
            Get AI-powered explanations for screening results
          </p>
        </div>

        {/* Ticker Selection */}
        {!ticker ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Select a Ticker to Chat About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoadTicker} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter ticker symbol (e.g., NVDA)"
                    value={tickerInput}
                    onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                    className="pl-10"
                    disabled={loadingTicker}
                  />
                </div>
                <Button type="submit" disabled={loadingTicker || !tickerInput.trim()}>
                  {loadingTicker ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Load'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
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
                        <h2 className="text-xl font-serif font-bold">{ticker}</h2>
                        <p className="text-muted-foreground">
                          {tickerInfo.security.company || 'Unknown Company'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <StatusBadge
                        status={getStatusColor(tickerInfo.invesense.classification, null, tickerInfo.invesense.available)}
                        label={`Invesense: ${getStatusLabel(tickerInfo.invesense.classification, null, tickerInfo.invesense.available)}`}
                        size="sm"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4"
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
            {tickerInfo && !tickerInfo.invesense.available && !tickerInfo.autoBanned.available && !tickerInfo.numeric.available && (
              <Card className="border-warning">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">No Screening Data Available</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        This ticker hasn't been screened yet. You can still chat, but the AI won't have screening results to explain.
                      </p>
                      <Button variant="link" className="px-0 mt-2" asChild>
                        <Link to={`/request?ticker=${ticker}`}>Request a Screening →</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chat Area */}
            <Card className="min-h-[500px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5" />
                  Chat with AI
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Ask a question about {ticker}'s Shariah compliance status</p>
                      <p className="text-sm mt-2">
                        Example: "Why does {ticker} require purification?"
                      </p>
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
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${ticker}...`}
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
