"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, LayoutList } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage"; 

interface Block {
  category: string;
  messages: string[];
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [blocks, setBlocks] = useLocalStorage<Block[]>("chat-blocks", []);

  // hydration fix: Track if the component has mounted on the client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleOrganize = async () => {
    if (!inputText.trim()) {
      setError("Please paste a conversation first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: inputText }),
      });

      if (!response.ok) {
        throw new Error("Failed to organize conversation.");
      }

      const data = await response.json();
      setBlocks(data.blocks);
      setInputText(""); 
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlocks = blocks.filter((block) => {
    const query = searchQuery.toLowerCase();
    const matchesCategory = block.category.toLowerCase().includes(query);
    const matchesMessages = block.messages.some((msg) =>
      msg.toLowerCase().includes(query)
    );
    return matchesCategory || matchesMessages;
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <LayoutList className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Chat Organizer</h1>
          <p className="mt-2 text-gray-600">Paste your raw conversation below to instantly categorize it by topic.</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-black"
            placeholder="Paste your conversation here...&#10;&#10;User: How do I price my SaaS product?&#10;Assistant: Consider these pricing strategies..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            onClick={handleOrganize}
            disabled={isLoading || !inputText.trim()}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Ingesting & Organizing...
              </>
            ) : (
              "Ingest & Organize"
            )}
          </button>
        </div>

        
        {isMounted && blocks.length > 0 && (
          <div className="space-y-6">
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                placeholder="Search across all categories and messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBlocks.length === 0 ? (
                <p className="text-gray-500 text-center col-span-full py-8">No results found for "{searchQuery}"</p>
              ) : (
                filteredBlocks.map((block, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-blue-50 border-b border-gray-200 px-4 py-3">
                      <h3 className="text-lg font-semibold text-blue-900">{block.category}</h3>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto max-h-96 space-y-3">
                      {block.messages.map((msg, msgIndex) => {
                        const isUser = msg.trim().toLowerCase().startsWith("user:");
                        return (
                          <div 
                            key={msgIndex} 
                            className={`p-3 rounded-lg text-sm ${isUser ? 'bg-gray-100 text-black ml-4' : 'bg-blue-50/50 text-black mr-4'}`}
                          >
                            {msg}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}