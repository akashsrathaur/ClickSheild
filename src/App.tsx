import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Mail, Search, AlertTriangle, CheckCircle2, Info, Loader2, Chrome, Zap, Lock, Globe, Terminal, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "motion/react";
import { analyzeEmail, type EmailAnalysis } from "@/lib/gemini";
import { ExtensionCode } from "@/components/ExtensionCode";

export default function App() {
  const [emailContent, setEmailContent] = useState('');
  const [headers, setHeaders] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EmailAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setTerminalLogs(prev => [...prev.slice(-5), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleAnalyze = async () => {
    if (!emailContent.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setTerminalLogs([]);
    addLog("Initializing Deep Packet Inspection...");
    
    try {
      setTimeout(() => addLog("Analyzing SPF/DKIM/DMARC alignment..."), 500);
      setTimeout(() => addLog("Scanning payload for malicious artifacts..."), 1000);
      
      const analysis = await analyzeEmail(emailContent, headers);
      setResult(analysis);
      addLog(`Analysis complete. Phishing likelihood: ${(100 - analysis.score).toFixed(1)}%`);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze email. Please check your connection and try again.");
      addLog("ERROR: Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-safe border-safe/20 bg-safe/10';
      case 'verified': return 'text-info border-info/20 bg-info/10';
      case 'suspicious': return 'text-warning border-warning/20 bg-warning/10';
      case 'fraud': return 'text-danger border-danger/20 bg-danger/10';
      default: return 'text-muted-foreground border-border bg-muted/10';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-info/30">
      {/* Header */}
      <header className="border-b border-border bg-surface py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-info/10 border border-info/20 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-info" />
          </div>
          <span className="font-extrabold text-2xl tracking-[0.2em] uppercase">ClickSheild<span className="text-info">.AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-[10px] tracking-widest uppercase py-1.5 px-4 rounded-full border-info/30 text-info bg-info/5">
            Active Protection Enabled
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <Tabs defaultValue="analyze" className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Security Command Center</h2>
              <p className="text-muted-foreground text-sm">Analyze and neutralize email-based threats in real-time.</p>
            </div>
            <TabsList className="bg-card border border-border p-1 h-12">
              <TabsTrigger value="analyze" className="px-6 data-[state=active]:bg-surface">Manual Scan</TabsTrigger>
              <TabsTrigger value="extension" className="px-6 data-[state=active]:bg-surface">Chrome Extension</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analyze">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
              {/* Analysis Panel */}
              <div className="space-y-6">
                <Card className="border-border bg-card rounded-[20px] p-2 md:p-6 shadow-2xl">
                  <CardHeader className="pb-4 border-b border-border mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Input Stream</div>
                        <CardTitle className="text-xl">Email Payload Analysis</CardTitle>
                      </div>
                      <Zap className="w-5 h-5 text-warning" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target Email / Content</label>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <div className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
                          <span className="text-[10px] text-safe font-mono uppercase tracking-tighter">Live Scan Ready</span>
                        </div>
                      </div>
                      <div className="relative group">
                        <Input 
                          placeholder="Enter sender address or paste code snippet..." 
                          className="h-14 bg-surface/50 border-border group-hover:border-info/30 focus:ring-info/50 font-mono text-sm px-12 rounded-xl transition-all"
                          value={emailContent}
                          onChange={(e) => setEmailContent(e.target.value)}
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-info transition-colors" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 uppercase">
                            Enter
                          </kbd>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Headers (Optional)</label>
                        <Badge variant="outline" className="text-[8px] bg-black/40 border-white/5 font-mono text-muted-foreground uppercase">Advanced Decryption</Badge>
                      </div>
                      <Textarea 
                        placeholder="Paste SMTP raw headers..." 
                        className="min-h-[80px] bg-surface/50 border-border focus:ring-info/50 resize-none font-mono text-xs p-4 rounded-xl transition-all"
                        value={headers}
                        onChange={(e) => setHeaders(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                      <Terminal className="w-3 h-3 text-safe" />
                      Ready for inspection
                    </div>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing || !emailContent.trim()}
                      className="bg-info hover:bg-info/90 text-background font-bold uppercase tracking-widest text-xs px-10 h-12 rounded-xl transition-all active:scale-95"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Scan Payload
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Terminal Output */}
                <div className="bg-black rounded-xl p-4 font-mono text-[11px] text-safe/80 border border-border h-40 overflow-hidden shadow-inner">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground border-b border-white/5 pb-2">
                    <Terminal className="w-3 h-3" />
                    <span>SYSTEM_LOG_OUTPUT</span>
                  </div>
                  <div className="space-y-1">
                    {terminalLogs.length > 0 ? (
                      terminalLogs.map((log, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-muted-foreground shrink-0">{">"}</span>
                          <span>{log}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground italic">Awaiting input sequence...</div>
                    )}
                    {isAnalyzing && <motion.div animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-safe/50 inline-block ml-1" />}
                  </div>
                </div>
              </div>

              {/* Sidebar / Results */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <Card className="border-border bg-card rounded-[20px] overflow-hidden shadow-xl">
                        <CardHeader className="flex flex-col items-center justify-center py-10 border-b border-border bg-gradient-to-b from-surface/50 to-transparent">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Lock className="w-3 h-3 text-info" />
                            Security Index
                          </div>
                          <div className="relative">
                            <div className={`text-8xl font-black leading-none mb-4 tracking-tighter ${
                              result.score >= 80 ? 'text-safe shadow-[0_0_40px_rgba(0,255,148,0.2)]' : 
                              result.score >= 50 ? 'text-warning shadow-[0_0_40px_rgba(255,184,0,0.2)]' : 
                              'text-danger shadow-[0_0_40px_rgba(255,75,75,0.2)]'
                            }`}>
                              {result.score}
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(result.status)} uppercase tracking-widest px-6 py-2 rounded-full border shadow-lg font-bold text-[10px]`}>
                            {result.status}
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                          <div className="space-y-4">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Heuristic Analysis</div>
                            <div className="space-y-3">
                              {result.indicators.map((indicator, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${
                                      indicator.severity === 'high' ? 'bg-danger' : 
                                      indicator.severity === 'medium' ? 'bg-warning' : 'bg-info'
                                    }`} />
                                    <span className="text-xs font-medium">{indicator.label}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold uppercase ${
                                    indicator.severity === 'high' ? 'text-danger' : 
                                    indicator.severity === 'medium' ? 'text-warning' : 'text-info'
                                  }`}>{indicator.severity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-0">
                          <Button className="w-full bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest text-xs h-12 rounded-xl">
                            Quarantine Message
                          </Button>
                        </CardFooter>
                      </Card>

                      <Alert className="bg-info/5 border-info/20 text-info rounded-xl">
                        <Info className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold uppercase tracking-wider">Recommendation</AlertTitle>
                        <AlertDescription className="text-xs leading-relaxed opacity-90">
                          {result.recommendation}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 border border-border rounded-[20px] bg-card/50 min-h-[400px]">
                      <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6 border border-border">
                        <Shield className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Awaiting Sequence</h3>
                      <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                        Initialize analysis by providing an email payload for inspection.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
                
                <div className="pt-6 border-t border-border">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Database Version</div>
                  <div className="font-mono text-[11px] text-info/60">v4.0.12-ClickSheild-STABLE</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="extension">
            <div className="max-w-4xl mx-auto">
              <ExtensionCode />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-12 mt-20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-info" />
            <span className="font-bold tracking-widest uppercase text-sm">ClickSheild.AI</span>
          </div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest">
            Secure Communications Protocol © 2024
          </p>
          <div className="flex gap-6">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-info"><Globe className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-info"><Mail className="w-4 h-4" /></Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
