import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Terminal,
  User,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { api } from '../services/api';

interface AiCopilotViewProps {
  contextThreat?: any | null;
  onClearContext?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  model?: string;
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({
  contextThreat,
  onClearContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: `Hello, I am **SentinelShield Threat Copilot**, your Digital Risk Protection AI Analyst powered by **Gemini 3.8 Flash**.

I can assist you with:
- **Homoglyph & Typosquat Analysis**: Breaking down deceptive Unicode and brand permutations.
- **Rogue Mobile App Dissection**: Identifying banking trojans, SMS overlay attacks, and fake wallet signatures.
- **Takedown & Cease & Desist Generation**: Drafting formal DMCA and trademark infringement demands.
- **Brand Protection Playbooks**: Formulating proactive account exclusions and incident response plans.

How can I assist your SOC operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.8-flash',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // If a context threat is injected, trigger an automatic prompt suggestion
  useEffect(() => {
    if (contextThreat) {
      const threatLabel = contextThreat.handle || contextThreat.packageName || contextThreat.title;
      setInputMessage(`Analyze threat "${threatLabel}" targeting brand "${contextThreat.brandName}". Explain attack vector, calculated risk score (${contextThreat.riskScore}/100), and specific takedown steps.`);
    }
  }, [contextThreat]);

  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.askAiCopilot(textToSend, contextThreat);
      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: res.model,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Error connecting to AI Threat Copilot: ${err.message || 'Please check network connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'How do I spot homoglyph lookalikes on social media?',
    'Draft a DMCA takedown letter for a fake Instagram support account',
    'What Android permissions signal a rogue banking trojan APK?',
    'Explain the difference between typosquatting and combosquatting',
  ];

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span>AI Threat Copilot & Cyber Analyst</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time threat intelligence reasoning, attack vector analysis, and takedown drafting powered by Gemini 3.8 Flash.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-indigo-950/80 text-cyan-300 border border-indigo-500/30">
            Model: Gemini 3.8 Flash
          </span>
        </div>
      </div>

      {/* Active Threat Context Banner (if any) */}
      {contextThreat && (
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-slate-300">
              Active Context: <strong className="text-white">{contextThreat.brandName}</strong> •{' '}
              <span className="font-mono text-cyan-300">{contextThreat.handle || contextThreat.packageName}</span> (Risk:{' '}
              {contextThreat.riskScore}/100)
            </span>
          </div>

          {onClearContext && (
            <button
              onClick={onClearContext}
              className="text-xs text-indigo-300 hover:text-white underline"
            >
              Clear Context
            </button>
          )}
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-cyan-600 text-white'
                    : 'bg-indigo-950 text-cyan-300 border border-indigo-500/40'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600/20 text-cyan-50 border border-cyan-500/30'
                    : 'bg-slate-950/80 text-slate-200 border border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800/60 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isUser ? 'SOC Analyst' : 'SentinelShield Threat Copilot'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="text-slate-400 hover:text-cyan-300"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="whitespace-pre-wrap font-sans text-xs space-y-2">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-950 text-cyan-300 border border-indigo-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing digital risk vectors with Gemini 3.8 Flash...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-cyan-400" />
          Suggested:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask AI Cyber Analyst about a threat, request a takedown notice, or query attack vectors..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isSending}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-cyan-500/20"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
