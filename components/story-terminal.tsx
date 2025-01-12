'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import MatrixRain from './matrix-rain';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import MatrixWalletPopup from './matrix-wallet-popup';
import { getTokenBalance, createTokenAccount } from '../src/utils/token';
import { config } from '../src/utils/config';
import { Transaction } from '@solana/web3.js';

interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: () => void) => void;
  publicKey?: string;
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
  }
}

interface TerminalLine {
  content: string;
  type: 'input' | 'output' | 'error' | 'success' | 'warning' | 'info';
  timestamp: string;
  animate?: boolean;
}

interface StoryTerminalProps {
  story: string[];
  onSubmitLine?: (line: string) => void;
  onViewHistory?: () => Promise<string[]>;
  isConnected: boolean;
}

// Terminal colors
const COLORS = {
  default: 'text-[#3af23a]',
  error: 'text-red-500',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
  muted: 'text-[#3af23a]/50',
  highlight: 'text-purple-400',
  command: 'text-cyan-400',
} as const;

type CommandResponse = {
  content: string[];
  type: 'output' | 'error' | 'success' | 'warning' | 'info';
  animate?: boolean;
};

export default function StoryTerminal({ 
  story, 
  isConnected 
}: StoryTerminalProps) {
  const { publicKey, wallet, disconnect } = useWallet();
  const { connection } = useConnection();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [bootSequenceComplete, setBootSequenceComplete] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [isWalletPopupOpen, setIsWalletPopupOpen] = useState(false);

  // Boot sequence messages
  const bootSequence = useMemo(() => [
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
  ], []);

  // Initialize boot sequence
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
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
  }, [bootSequence]);

  // Available commands and their handlers
  const commands = {
    help: async (): Promise<CommandResponse> => ({
      content: [
        '🌟 Available Commands:',
        '',
        '📖 Story Commands:',
        '  view story              - Display the current story',
        '  submit line <text>      - Submit a new line to the story',
        '  view history            - View story version history',
        '',
        '🔧 System Commands:',
        '  status                  - Display system status',
        '  clear                   - Clear terminal',
        '  theme <light|dark>      - Change terminal theme',
        '',
        '👤 User Commands:',
        '  balance                 - Check your token balance',
        '  stats                   - View your contribution statistics',
        '  connect                 - Connect your wallet',
        '',
        '⚙️ Advanced Commands:',
        '  export story            - Export story to text file',
        '  search <term>           - Search within the story',
        '  contributors            - List top contributors',
        '  version                - Show system version',
        '',
        '💡 Tips:',
        '  - Use arrow keys to navigate command history',
        '  - Press Tab for command completion',
        '  - Type "help <command>" for detailed help'
      ],
      type: 'output',
      animate: true
    }),

    'export story': async (): Promise<CommandResponse> => {
      const content = story.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'story.txt';
      a.click();
      URL.revokeObjectURL(url);

      return {
        content: ['Story exported successfully to story.txt'],
        type: 'success'
      };
    },

    search: async (args: string): Promise<CommandResponse> => {
      if (!args.trim()) {
        return {
          content: ['Error: Please provide a search term'],
          type: 'error'
        };
      }

      const term = args.toLowerCase();
      const results = story
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => line.toLowerCase().includes(term));

      if (results.length === 0) {
        return {
          content: ['No matches found'],
          type: 'warning'
        };
      }

      return {
        content: [
          `Found ${results.length} matches:`,
          '',
          ...results.map(({ line, index }) => `[${index + 1}] ${line}`)
        ],
        type: 'output'
      };
    },

    contributors: async (): Promise<CommandResponse> => ({
      content: [
        'Top Contributors:',
        '---------------',
        '1. 0x1234...5678 - 15 lines',
        '2. 0x8765...4321 - 12 lines',
        '3. 0x9876...1234 - 8 lines',
        '',
        'Total Contributors: 25'
      ],
      type: 'output'
    }),

    theme: async (args: string): Promise<CommandResponse> => {
      const theme = args.trim().toLowerCase();
      if (!['light', 'dark'].includes(theme)) {
        return {
          content: ['Error: Invalid theme. Use "light" or "dark"'],
          type: 'error'
        };
      }
      // Theme switching logic would go here
      return {
        content: [`Theme switched to ${theme} mode`],
        type: 'success'
      };
    },

    version: async (): Promise<CommandResponse> => ({
      content: [
        'StoryAI Terminal v1.0.0',
        '----------------------',
        'Build: 2024.03.14',
        'Runtime: Next.js 14.0.0',
        'Protocol: v2.1',
        'Blockchain: Solana'
      ],
      type: 'output'
    }),

    stats: async (): Promise<CommandResponse> => ({
      content: [
        '📊 Your Statistics',
        '----------------',
        'Lines Contributed: 8',
        'Last Contribution: 2 days ago',
        'Token Balance: 150,000',
        '',
        '🏆 Achievements:',
        '- First Line Writer',
        '- Regular Contributor',
        '- Creative Spark'
      ],
      type: 'output',
      animate: true
    }),

    balance: async (): Promise<CommandResponse> => {
      if (!isConnected) {
        return {
          content: ['Error: Please connect your wallet first'],
          type: 'error'
        };
      }
      return {
        content: [
          '💰 Wallet Balance',
          '---------------',
          'Tokens: 150,000 STORY',
          'Last Updated: Just now'
        ],
        type: 'success'
      };
    },

    connect: async (): Promise<CommandResponse> => {
      if (publicKey) {
        return {
          content: [
            '> WALLET ALREADY CONNECTED',
            `> ADDRESS: ${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`,
            '> Use "status" command for more details'
          ],
          type: 'warning'
        };
      }

      setIsWalletPopupOpen(true);
      return {
        content: [
          '> INITIATING SECURE WALLET CONNECTION',
          '> ESTABLISHING QUANTUM ENCRYPTION TUNNEL...',
          '> OPENING SECURE CONNECTION PORTAL...',
          '',
          'Please select your wallet in the connection interface.',
          'Type "status" after connecting to verify your connection.'
        ],
        type: 'info',
        animate: true
      };
    },

    logout: async (): Promise<CommandResponse> => {
      try {
        await disconnect();
        setSessionToken(null);
        // Clear session cookie
        document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        return {
          content: ['Successfully logged out'],
          type: 'success'
        };
      } catch (err) {
        console.error('Error during logout:', err);
        return {
          content: ['Error logging out'],
          type: 'error'
        };
      }
    },

    status: async (): Promise<CommandResponse> => {
      if (!publicKey) {
        return {
          content: [
            '> CONNECTION STATUS: OFFLINE',
            '> SECURE TUNNEL: NOT ESTABLISHED',
            '> ACTION REQUIRED: Type "connect" to initialize wallet connection'
          ],
          type: 'warning'
        };
      }

      try {
        let tokenBalance = 0;
        try {
          const { instruction, associatedTokenAddress } = await createTokenAccount(connection, publicKey);
          
          if (instruction) {
            if (!wallet?.adapter) {
              throw new Error('No wallet adapter found');
            }

            const transaction = new Transaction().add(instruction);
            transaction.feePayer = publicKey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            try {
              // Check if the adapter supports signing
              if (!('signTransaction' in wallet.adapter)) {
                throw new Error('Wallet does not support transaction signing');
              }

              const signedTx = await wallet.adapter.signTransaction(transaction);
              const signature = await connection.sendRawTransaction(signedTx.serialize());
              await connection.confirmTransaction(signature, 'confirmed');
              console.log('Created token account:', associatedTokenAddress.toBase58());
            } catch (signErr) {
              console.error('Error signing transaction:', signErr);
              // Continue even if creation fails - user might have rejected
            }
          }

          tokenBalance = await getTokenBalance(connection, publicKey);
        } catch (tokenErr) {
          console.error('Token balance error:', tokenErr);
          return {
            content: [
              '> CONNECTION STATUS: ACTIVE',
              '> SECURE TUNNEL: ESTABLISHED',
              '> ENCRYPTION: ENABLED',
              `> WALLET ID: ${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`,
              '> BALANCE: Error fetching balance',
              `> NETWORK: ${config.network.toUpperCase()}`,
              '> ERROR: Unable to fetch token balance',
              '> QUANTUM ENCRYPTION: ENABLED'
            ],
            type: 'error'
          };
        }

        return {
          content: [
            '> CONNECTION STATUS: ACTIVE',
            '> SECURE TUNNEL: ESTABLISHED',
            '> ENCRYPTION: ENABLED',
            `> WALLET ID: ${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`,
            `> BALANCE: ${tokenBalance.toLocaleString()} $STORY`,
            `> NETWORK: ${config.network.toUpperCase()}`,
            `> SESSION: ${sessionToken ? 'AUTHENTICATED' : 'GUEST'}`,
            '> QUANTUM ENCRYPTION: ENABLED'
          ],
          type: 'success'
        };
      } catch (err) {
        console.error('Status error:', err);
        return {
          content: ['> ERROR: Unable to fetch wallet status'],
          type: 'error'
        };
      }
    },

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

  const handleCommand = async (commandInput: string): Promise<void> => {
    try {
      setIsProcessing(true);
      const [command, ...args] = commandInput.trim().toLowerCase().split(/\s+/);
      const fullCommand = Object.keys(commands).find(cmd => 
        cmd.split(' ')[0] === command || cmd === command
      );

      // Add user input to history
      setTerminalHistory(prev => [...prev, {
        content: `> ${commandInput}`,
        type: 'input',
        timestamp: new Date().toISOString()
      }]);

      // Simulate processing delay for more authentic feel
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!fullCommand) {
        setTerminalHistory(prev => [...prev, {
          content: `Command not found: ${command}\nTip: Type 'help' to see available commands.`,
          type: 'error',
          timestamp: new Date().toISOString()
        }]);
        return;
      }

      const response = await commands[fullCommand as keyof typeof commands](args.join(' '));
      setTerminalHistory(prev => [
        ...prev,
        ...response.content.map(line => ({
          content: line,
          type: response.type,
          timestamp: new Date().toISOString()
        }))
      ]);
    } catch (err) {
      console.error('Error executing command:', err);
      setTerminalHistory(prev => [...prev, {
        content: `Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`,
        type: 'error',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a useEffect to handle wallet connection
  useEffect(() => {
    if (publicKey) {
      setTerminalHistory(prev => [...prev, {
        content: [
          '> WALLET CONNECTED SUCCESSFULLY',
          `> ADDRESS: ${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`,
          '> Type "status" for more details'
        ].join('\n'),
        type: 'success',
        timestamp: new Date().toISOString(),
        animate: true
      }]);
    }
  }, [publicKey]);

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
              ${line.type === 'error' ? COLORS.error : ''}
              ${line.type === 'success' ? COLORS.success : ''}
              ${line.type === 'warning' ? COLORS.warning : ''}
              ${line.type === 'output' ? COLORS.default : ''}
              ${line.type === 'input' ? COLORS.command : ''}
              text-xs sm:text-sm leading-relaxed
              ${index === terminalHistory.length - 1 ? 'animate-fadeIn' : ''}
              ${!bootSequenceComplete ? 'terminal-flicker' : ''}
              ${line.animate ? 'animate-typewriter' : ''}
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
        <div className="flex-none text-[10px] sm:text-xs text-[#3af23a]/50 mt-2 flex items-center justify-between relative z-10 bg-[#0a0a0a]">
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

      <MatrixWalletPopup 
        isOpen={isWalletPopupOpen} 
        onClose={() => setIsWalletPopupOpen(false)} 
      />
    </div>
  );
} 