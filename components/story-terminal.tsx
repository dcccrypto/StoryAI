'use client';

import React, { useState, useRef, useEffect } from 'react';
import MatrixRain from './matrix-rain';

interface TerminalLine {
  content: string;
  type: 'input' | 'output' | 'error';
  timestamp: string;
}

interface StoryTerminalProps {
  story: string[];
  onSubmitLine?: (line: string) => void;
  onViewHistory?: () => Promise<string[]>;
  isConnected: boolean;
}

type CommandResponse = {
  content: string[];
  type: 'output' | 'error';
};

export default function StoryTerminal({ 
  story, 
  onSubmitLine,
  onViewHistory,
  isConnected 
}: StoryTerminalProps) {
  const [bootSequenceComplete, setBootSequenceComplete] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Boot sequence messages
  const bootSequence = [
    { message: 'BIOS Version 1.0.2-StoryAI', delay: 200 },
    { message: 'Performing system initialization...', delay: 400 },
    { message: 'CPU: Quantum Storytelling Processor v2.0', delay: 800 },
    { message: 'Memory Test: ', delay: 1200 },
    { message: '[||||        ] 20%', delay: 1400 },
    { message: '[||||||||    ] 40%', delay: 1600 },
    { message: '[||||||||||||] 60%', delay: 1800 },
    { message: '[||||||||||||||||    ] 80%', delay: 2000 },
    { message: '[||||||||||||||||||||] 100%', delay: 2200 },
    { message: 'Memory Test Complete - 1024MB Available', delay: 2400 },
    { message: 'Initializing Hardware Components...', delay: 2800 },
    { message: '[INFO] Detecting system devices...', delay: 3000 },
    { message: '[OK] Primary Display Adapter', delay: 3200 },
    { message: '[OK] Quantum Storage Controller', delay: 3400 },
    { message: '[OK] Network Interface (WEB3)', delay: 3600 },
    { message: '[OK] Blockchain Verification Module', delay: 3800 },
    { message: 'Loading System Kernel...', delay: 4200 },
    { message: 'Mounting filesystems...', delay: 4600 },
    { message: '/dev/story    [OK]', delay: 4800 },
    { message: '/dev/ai      [OK]', delay: 5000 },
    { message: '/dev/wallet  [OK]', delay: 5200 },
    { message: 'Initializing StoryAI Services...', delay: 5600 },
    { message: 'Loading story database... [OK]', delay: 6000 },
    { message: 'Connecting to AI subsystem... [OK]', delay: 6400 },
    { message: 'Establishing secure blockchain connection... [OK]', delay: 6800 },
    { message: 'Running final diagnostics...', delay: 7200 },
    { message: '[✓] Memory integrity', delay: 7400 },
    { message: '[✓] Storage subsystems', delay: 7600 },
    { message: '[✓] Network connectivity', delay: 7800 },
    { message: '[✓] Security protocols', delay: 8000 },
    { message: 'System initialization complete.', delay: 8400 },
    { message: 'StoryAI Terminal v1.0.0 Ready', delay: 8600 },
    { message: 'Type "help" for available commands.', delay: 8800 },
  ];

  // Initialize boot sequence
  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    
    bootSequence.forEach(({ message, delay }, index) => {
      const timeout = setTimeout(() => {
        setTerminalHistory(prev => [...prev, {
          content: `> ${message}`,
          type: 'output',
          timestamp: new Date().toISOString()
        }]);
        
        if (index === bootSequence.length - 1) {
          setBootSequenceComplete(true);
        }
      }, delay);
      
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Available commands and their handlers
  const commands = {
    help: async (): Promise<CommandResponse> => ({
      content: [
        'Available commands:',
        '  view story    - Display the current story',
        '  submit line   - Submit a new line to the story',
        '  view history  - View story version history',
        '  status       - Display system status',
        '  about        - Show information about StoryAI',
        '  time         - Show current system time',
        '  clear        - Clear terminal',
        '  help         - Show this help message',
      ],
      type: 'output',
    }),
    'view story': async (): Promise<CommandResponse> => ({
      content: [
        'Current story:',
        '------------',
        ...story.map((line, i) => `${i + 1}. ${line}`),
        '------------',
      ],
      type: 'output',
    }),
    'submit line': async (args: string): Promise<CommandResponse> => {
      if (!isConnected) {
        return {
          content: ['Error: Please connect your wallet first'],
          type: 'error',
        };
      }
      if (!args.trim()) {
        return {
          content: ['Error: Please provide a line to submit'],
          type: 'error',
        };
      }
      if (onSubmitLine) {
        onSubmitLine(args);
        return {
          content: ['Line submitted successfully'],
          type: 'output',
        };
      }
      return {
        content: ['Error: Line submission is not available'],
        type: 'error',
      };
    },
    'view history': async (): Promise<CommandResponse> => {
      if (!onViewHistory) {
        return {
          content: ['Error: History viewing is not available'],
          type: 'error',
        };
      }
      const history = await onViewHistory();
      return {
        content: [
          'Story history:',
          '-------------',
          ...history,
          '-------------',
        ],
        type: 'output',
      };
    },
    clear: async (): Promise<CommandResponse> => {
      setTerminalHistory([]);
      return {
        content: [],
        type: 'output',
      };
    },
    status: async (): Promise<CommandResponse> => ({
      content: [
        'System Status:',
        '-------------',
        `Memory Usage: ${Math.floor(Math.random() * 20 + 60)}%`,
        `CPU Load: ${Math.floor(Math.random() * 30 + 40)}%`,
        `Network Latency: ${Math.floor(Math.random() * 50 + 20)}ms`,
        `Blockchain Connection: ${isConnected ? 'Active' : 'Inactive'}`,
        `Story Database: Online`,
        `AI Subsystem: Responsive`,
        '-------------',
      ],
      type: 'output',
    }),
    about: async (): Promise<CommandResponse> => ({
      content: [
        'StoryAI Terminal v1.0.0',
        '----------------------',
        'A collaborative storytelling platform powered by:',
        '- Quantum Storytelling Engine',
        '- Web3 Integration',
        '- Advanced AI Processing',
        '',
        'Created with ♥ by the StoryAI Team',
        '----------------------',
      ],
      type: 'output',
    }),
    time: async (): Promise<CommandResponse> => ({
      content: [
        `Current System Time: ${new Date().toLocaleString()}`,
      ],
      type: 'output',
    }),
  };

  // Handle command history navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !isProcessing) {
      handleCommand(inputValue);
      setCommandHistory(prev => [...prev, inputValue]);
      setHistoryIndex(-1);
      setInputValue('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple command completion
      const input = inputValue.toLowerCase();
      const availableCommands = Object.keys(commands);
      const matchingCommand = availableCommands.find(cmd => cmd.startsWith(input));
      if (matchingCommand) {
        setInputValue(matchingCommand);
      }
    }
  };

  // Auto-scroll to bottom when terminal content changes
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const handleCommand = async (input: string) => {
    const timestamp = new Date().toISOString();
    const [command, ...args] = input.trim().toLowerCase().split(/\s+/);
    const fullCommand = Object.keys(commands).find(cmd => 
      cmd.split(' ')[0] === command || cmd === command
    );

    setIsProcessing(true);

    // Add user input to history
    setTerminalHistory(prev => [...prev, {
      content: `> ${input}`,
      type: 'input',
      timestamp,
    }]);

    // Simulate processing delay for more authentic feel
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!fullCommand) {
      setTerminalHistory(prev => [...prev, {
        content: `Command not found: ${command}\nTip: Type 'help' to see available commands.`,
        type: 'error',
        timestamp,
      }]);
      setIsProcessing(false);
      return;
    }

    try {
      const response = await commands[fullCommand as keyof typeof commands](args.join(' '));
      setTerminalHistory(prev => [
        ...prev,
        ...response.content.map(line => ({
          content: line,
          type: response.type,
          timestamp,
        })),
      ]);
    } catch (error) {
      setTerminalHistory(prev => [...prev, {
        content: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}\nTip: Type 'help' to see available commands.`,
        type: 'error',
        timestamp,
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0a0a] text-[#3af23a] p-2 sm:p-3 md:p-4 font-mono rounded-lg overflow-hidden relative">
      {/* Matrix rain effect */}
      <MatrixRain opacity={0.03} />

      {/* Terminal output - takes remaining space */}
      <div className="flex-grow min-h-0 overflow-y-auto mb-2 sm:mb-3 md:mb-4 space-y-1 terminal-text relative z-10">
        {terminalHistory.map((line, index) => (
          <div
            key={`${line.timestamp}-${index}`}
            className={`
              ${line.type === 'error' ? 'text-red-500' : ''}
              ${line.type === 'input' ? 'opacity-90' : ''}
              text-xs sm:text-sm leading-relaxed
              ${index === terminalHistory.length - 1 ? 'animate-fadeIn' : ''}
              ${!bootSequenceComplete ? 'terminal-flicker' : ''}
            `}
          >
            {line.content}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Command input - fixed height */}
      {bootSequenceComplete && (
        <div className="flex-none border-t border-[#1a1a1a] pt-2 sm:pt-3 md:pt-4 group relative z-10">
          <div className="flex items-center">
            <span className="mr-2 text-[#3af23a] terminal-prompt"></span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm text-[#3af23a] font-mono
                focus:ring-0 focus:outline-none placeholder:text-[#3af23a]/30
                selection:bg-[#3af23a] selection:text-black
                caret-[#3af23a]"
              style={{
                WebkitAppearance: 'none',
                boxShadow: 'none',
                background: 'transparent'
              }}
              placeholder={isProcessing ? 'Processing...' : 'Type a command...'}
              spellCheck={false}
              autoComplete="off"
              disabled={isProcessing}
            />
          </div>
        </div>
      )}

      {/* Status bar - fixed height */}
      {bootSequenceComplete && (
        <div className="flex-none text-[10px] sm:text-xs text-[#3af23a]/50 mt-2 flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-2 ${isConnected ? 'bg-[#3af23a] terminal-flicker' : 'bg-red-500'}`} />
            {isConnected ? 'Connected' : 'Wallet not connected'}
          </div>
          <span className="text-[#3af23a]/30">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Scanline effect */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none terminal-scanline" />
    </div>
  );
} 