import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [trades, setTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    if (selectedTrade) {
      fetchMessages(selectedTrade);
      const interval = setInterval(() => fetchMessages(selectedTrade), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTrade]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTrades = async () => {
    try {
      const response = await api.get('/trades/');
      setTrades(response.data);
      if (response.data.length > 0 && !selectedTrade) {
        setSelectedTrade(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchMessages = async (tradeId) => {
    try {
      const response = await api.get(`/chat/trade/${tradeId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTrade) return;

    try {
      // For demo, we'll use a mock receiver ID
      const trade = trades.find(t => t.id === selectedTrade);
      const receiverId = trade?.buyer_id === user.id ? trade?.seller_id : trade?.buyer_id;

      await api.post('/chat/', {
        trade_id: selectedTrade,
        receiver_id: receiverId || 'demo-receiver',
        message: newMessage
      });

      setNewMessage('');
      fetchMessages(selectedTrade);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <Layout>
      <div data-testid="chat-page" className="space-y-6">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Trade Chat</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Communicate with counterparties about trades
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Trade List */}
          <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm lg:col-span-1">
            <div className="border-b border-border p-4">
              <h3 className="font-heading text-lg font-semibold">Trades</h3>
            </div>
            <div className="divide-y divide-border">
              {trades.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No trades available
                </div>
              ) : (
                trades.slice(0, 10).map((trade) => (
                  <button
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade.id)}
                    className={`w-full p-4 text-left transition-colors hover:bg-muted/30 ${
                      selectedTrade === trade.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">
                        {trade.symbol}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        ${trade.amount}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {trade.id.substring(0, 8)}...
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm lg:col-span-3">
            {selectedTrade ? (
              <div className="flex h-[600px] flex-col">
                {/* Chat Header */}
                <div className="border-b border-border p-4">
                  <h3 className="font-heading text-lg font-semibold">
                    Trade #{selectedTrade.substring(0, 8)}
                  </h3>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwnMessage = msg.sender_id === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-sm p-3 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3 w-3" />
                              <span className="font-mono text-xs opacity-70">
                                {isOwnMessage ? 'You' : 'Counterparty'}
                              </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                            <p className="mt-1 text-xs opacity-60">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <input
                      data-testid="message-input"
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-sm border border-input bg-slate-950/50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      data-testid="send-message-btn"
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex h-[600px] items-center justify-center text-muted-foreground">
                Select a trade to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
