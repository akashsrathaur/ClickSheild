import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, FileJson, FileCode, ExternalLink, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const MANIFEST_JSON = `{
  "manifest_version": 3,
  "name": "SENTINEL Email Shield",
  "version": "1.0",
  "description": "AI-powered phishing protection for Gmail",
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": ["https://mail.google.com/*"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  },
  "content_scripts": [
    {
      "matches": ["https://mail.google.com/*"],
      "js": ["content.js"]
    }
  ]
}`;

const CONTENT_JS = `// content.js - Scrapes email data from Gmail
function getEmailData() {
  const body = document.querySelector('.ii.gt')?.innerText || "";
  const sender = document.querySelector('.gD')?.innerText || "";
  return { body, sender };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getEmailData") {
    sendResponse(getEmailData());
  }
});`;

const POPUP_JS = `// popup.js - Calls the analysis API
async function analyze() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.tabs.sendMessage(tab.id, { action: "getEmailData" });
  
  document.getElementById('status').innerText = "Analyzing...";
  
  const result = await fetch('https://your-api.com/analyze', {
    method: 'POST',
    body: JSON.stringify(response)
  }).then(r => r.json());
  
  document.getElementById('score').innerText = result.score;
  document.getElementById('verdict').innerText = result.verdict;
}`;

export function ExtensionCode() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-4">
        <Terminal className="w-5 h-5 text-info" />
        <h3 className="text-xl font-bold uppercase tracking-widest">Extension Source Protocol</h3>
      </div>

      <Card className="border-border bg-card rounded-[20px] shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-border bg-surface/30">
          <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest">
            <FileJson className="w-4 h-4 text-info" />
            manifest.json
          </CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Core configuration for the SENTINEL browser node.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative group">
            <pre className="p-6 overflow-x-auto text-[11px] font-mono text-info/80 bg-black/50 leading-relaxed">
              {MANIFEST_JSON}
            </pre>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-muted-foreground hover:text-info transition-colors"
              onClick={() => copyToClipboard(MANIFEST_JSON)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card rounded-[20px] shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-border bg-surface/30">
          <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest">
            <FileCode className="w-4 h-4 text-warning" />
            content.js
          </CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Data extraction script for Gmail DOM inspection.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative group">
            <pre className="p-6 overflow-x-auto text-[11px] font-mono text-warning/80 bg-black/50 leading-relaxed">
              {CONTENT_JS}
            </pre>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-muted-foreground hover:text-warning transition-colors"
              onClick={() => copyToClipboard(CONTENT_JS)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card rounded-[20px] shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-border bg-surface/30">
          <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest">
            <FileCode className="w-4 h-4 text-safe" />
            popup.js
          </CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-widest text-muted-foreground">
            UI interaction logic for the extension popup.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative group">
            <pre className="p-6 overflow-x-auto text-[11px] font-mono text-safe/80 bg-black/50 leading-relaxed">
              {POPUP_JS}
            </pre>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-muted-foreground hover:text-safe transition-colors"
              onClick={() => copyToClipboard(POPUP_JS)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4 pt-6">
        <Button className="bg-info text-background hover:bg-info/90 font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-xl transition-all active:scale-95 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Deployment Documentation
        </Button>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Load unpacked extension in chrome://extensions
        </p>
      </div>
    </div>
  );
}
