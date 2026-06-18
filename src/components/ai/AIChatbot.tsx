// src/components/ai/AIChatbot.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Minimize2,
  Maximize2,
  Loader2,
  Zap,
  History,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAIChat } from '@/hooks/useAIChat';
import { formatRelativeTime } from '@/lib/formatters';
import { useBusinessInsights, useRevenuePrediction } from '@/hooks/useAI';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: {
    label: string;
    action: () => void;
  }[];
  type?: 'insight' | 'alert' | 'suggestion' | 'general';
}

interface AIChatbotProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  initialOpen?: boolean;
  onAction?: (action: string) => void;
  onClose?: () => void;
  context?: any;
}

export function AIChatbot({ 
  position = 'bottom-right', 
  initialOpen = false,
  onAction,
  onClose,
  context
}: AIChatbotProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi! I'm your AI business assistant. I can help you with:\n\n• 📊 **Business Insights** - Get AI-powered insights about your business\n• 🔍 **Smart Search** - Find invoices, customers, or transactions\n• 💡 **Suggestions** - Get product recommendations and smart descriptions\n• ⚠️ **Alerts** - Know about anomalies and critical issues\n\n**Try asking:**\n\"Show me overdue invoices\"\n\"What are my top products?\"\n\"Any critical alerts?\"\n\"Revenue summary for this month\"",
      timestamp: new Date(),
      type: 'general'
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isLoading, error, clearHistory } = useAIChat();

  // Use existing AI hooks
  const { data: insights } = useBusinessInsights();
  const { data: prediction } = useRevenuePrediction(1);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await sendMessage(input, context);
      
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        type: response.type || 'general'
      };

      // Add actions if available
      if (response.actions && response.actions.length > 0) {
        assistantMessage.actions = response.actions.map(action => ({
          label: action.label,
          action: () => {
            if (onAction) onAction(action.id);
            if (action.navigate) {
              navigate(action.navigate);
            }
          }
        }));
      }

      setMessages(prev => [...prev, assistantMessage]);

      // Execute any actions if needed
      if (response.executeAction) {
        response.executeAction();
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Chat history cleared. How can I help you today? 👋",
      timestamp: new Date(),
      type: 'general'
    }]);
  };

  // Quick action suggestions based on existing AI components
  const quickActions = [
    { 
      label: "📊 Insights", 
      action: "Show me AI insights about my business",
      icon: Sparkles
    },
    { 
      label: "⚠️ Alerts", 
      action: "Any critical alerts or anomalies?",
      icon: Zap
    },
    { 
      label: "📈 Revenue", 
      action: "Revenue summary for this month",
      icon: Sparkles
    },
    { 
      label: "🔍 Search", 
      action: "Find overdue invoices",
      icon: Sparkles
    },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-show insights when first opened
  useEffect(() => {
    if (isOpen && messages.length === 1 && insights && insights.length > 0) {
      const criticalInsights = insights.filter(i => i.severity === 'critical');
      if (criticalInsights.length > 0) {
        setMessages(prev => [...prev, {
          id: 'auto-insight',
          role: 'assistant',
          content: `⚠️ I found ${criticalInsights.length} critical insight${criticalInsights.length > 1 ? 's' : ''} that need your attention:\n\n${criticalInsights.slice(0, 3).map(i => `• ${i.title}: ${i.description}`).join('\n')}`,
          timestamp: new Date(),
          type: 'alert',
          actions: [
            { label: 'View All Alerts', action: () => navigate('/reports') }
          ]
        }]);
      }
    }
  }, [isOpen, insights]);

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed z-50 h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600',
            positionClasses[position]
          )}
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 animate-pulse">
            <span className="text-[10px]">AI</span>
          </Badge>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          'fixed z-50 w-[400px] max-w-[calc(100vw-2rem)] shadow-2xl',
          'transition-all duration-300 ease-in-out',
          positionClasses[position],
          isMinimized ? 'h-16' : 'h-[600px] max-h-[80vh]',
          'border-2 border-indigo-200 dark:border-indigo-800'
        )}>
          <CardHeader className="p-4 border-b bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
                  <div className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <p className="text-[10px] text-muted-foreground">Online • Ready</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleClearHistory}
                  title="Clear chat history"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsOpen(false);
                    if (onClose) onClose();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-[calc(100%-4rem)]">
              <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-[85%] rounded-lg px-4 py-3',
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-muted',
                          message.type === 'alert' && 'border-l-4 border-red-500',
                          message.type === 'insight' && 'border-l-4 border-indigo-500',
                        )}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        {message.actions && message.actions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                variant={message.role === 'user' ? 'secondary' : 'default'}
                                size="sm"
                                className="text-xs h-8"
                                onClick={action.action}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {formatRelativeTime(message.timestamp)}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              {messages.length <= 3 && (
                <div className="px-4 py-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950"
                        onClick={() => {
                          setInput(action.action);
                          setTimeout(handleSendMessage, 100);
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t p-4 flex gap-2 bg-muted/30">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}