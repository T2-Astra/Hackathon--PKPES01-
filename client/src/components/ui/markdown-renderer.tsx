import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';
import { Copy, Check, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Judge0 Language ID mapping
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  'javascript': 63,
  'js': 63,
  'python': 71,
  'py': 71,
  'java': 62,
  'c': 50,
  'cpp': 54,
  'c++': 54,
  'csharp': 51,
  'c#': 51,
  'ruby': 72,
  'go': 60,
  'rust': 73,
  'php': 68,
  'swift': 83,
  'kotlin': 78,
  'typescript': 74,
  'ts': 74,
  'r': 80,
  'bash': 46,
  'shell': 46,
  'sql': 82,
};

// CodeBlock component with copy and preview functionality
function CodeBlock({ language, children }: { language: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Convert children to string for copying - handle React elements properly
  const extractTextFromChildren = (node: React.ReactNode): string => {
    if (typeof node === 'string') {
      return node;
    }
    if (typeof node === 'number') {
      return String(node);
    }
    if (Array.isArray(node)) {
      return node.map(extractTextFromChildren).join('');
    }
    if (React.isValidElement(node) && node.props.children) {
      return extractTextFromChildren(node.props.children);
    }
    return '';
  };

  const codeString = extractTextFromChildren(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if language is previewable (HTML/CSS client-side or Judge0 supported)
  const langLower = language.toLowerCase();
  const isHtmlCss = ['html', 'css'].includes(langLower);
  const isJudge0Supported = JUDGE0_LANGUAGE_IDS.hasOwnProperty(langLower);
  
  // Exclude languages that require npm/build tools or can't run standalone
  const requiresNodeModules = [
    'jsx', 'tsx', 'typescript', 'ts',  // React/TS need transpilation
    'vue', 'svelte', 'angular',        // Framework components
    'scss', 'sass', 'less',            // CSS preprocessors need compilation
    'markdown', 'md', 'mdx',           // Documentation formats
    'json', 'yaml', 'yml', 'xml',      // Data formats
    'dockerfile', 'docker',             // Docker files
    'nginx', 'apache',                  // Config files
  ].includes(langLower);
  
  // Check code content for npm commands or React/framework imports
  const hasNpmCommands = /\b(npm|npx|yarn|pnpm)\s+(install|start|run|build|init|create)/i.test(codeString);
  const hasReactImports = /\b(import|require)\s+.*\s+(from\s+)?['"]react['"]|import.*['"]@\/(components|hooks|lib)/i.test(codeString);
  const hasJSX = /<[A-Z][a-zA-Z0-9]*[\s>\/]|<\/[A-Z][a-zA-Z0-9]*>/.test(codeString);
  const hasFrameworkImports = /\b(import|require).*['"](@vue|svelte|@angular|next|gatsby|vite)/i.test(codeString);
  const hasModuleImports = /\b(import|require).*['"]\.\//i.test(codeString) && (hasReactImports || hasJSX);
  
  const containsUnexecutableCode = hasNpmCommands || hasReactImports || hasJSX || hasFrameworkImports || hasModuleImports;
  
  const isPreviewable = !requiresNodeModules && !containsUnexecutableCode && (isHtmlCss || isJudge0Supported);

  // Auto-execute when preview opens for Judge0 languages
  useEffect(() => {
    if (showPreview && isJudge0Supported && !output && !error && !executing) {
      executeCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview]);

  // Execute code using Judge0 API (Free public instance)
  const executeCode = async () => {
    setExecuting(true);
    setOutput('');
    setError('');

    try {
      const languageId = JUDGE0_LANGUAGE_IDS[langLower];
      
      // Preprocess Java code to fix class name issues
      let processedCode = codeString;
      if (langLower === 'java') {
        // Find public class declarations and rename them to Main
        processedCode = processedCode.replace(
          /public\s+class\s+(\w+)/g, 
          'public class Main'
        );
        
        // Also replace any constructor calls that match the old class name
        const classNameMatch = codeString.match(/public\s+class\s+(\w+)/);
        if (classNameMatch && classNameMatch[1] !== 'Main') {
          const oldClassName = classNameMatch[1];
          // Replace constructor calls: new ClassName() -> new Main()
          processedCode = processedCode.replace(
            new RegExp(`new\\s+${oldClassName}\\s*\\(`, 'g'),
            'new Main('
          );
          // Replace constructor definitions: ClassName() -> Main()
          processedCode = processedCode.replace(
            new RegExp(`\\b${oldClassName}\\s*\\(`, 'g'),
            'Main('
          );
        }
      }
      
      // Step 1: Create submission
      const createResponse = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': '4f38e50ac5msh5be238230a32e10p19af10jsn298710f7c489',
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        },
        body: JSON.stringify({
          source_code: processedCode,
          language_id: languageId,
          stdin: '',
        })
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        let errorMessage = 'Failed to execute code';
        
        if (createResponse.status === 403) {
          errorMessage = '⚠️ API Access Error: The code execution service has exceeded its rate limit or has been restricted.\n\nPlease try again later or contact PolyLearnHub support.';
        } else if (createResponse.status === 429) {
          errorMessage = '⚠️ Rate Limit Exceeded: Too many requests. Please wait a moment and try again.';
        } else {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            errorMessage = `Error ${createResponse.status}: ${errorText || 'Failed to submit code'}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const submission = await createResponse.json();
      const token = submission.token;

      // Step 2: Poll for result
      let result;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        const getResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '4f38e50ac5msh5be238230a32e10p19af10jsn298710f7c489',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
          }
        });

        if (!getResponse.ok) {
          throw new Error('Failed to get submission result');
        }

        result = await getResponse.json();

        // Check if processing is complete
        if (result.status.id > 2) {
          break;
        }

        attempts++;
      }

      if (!result || attempts >= maxAttempts) {
        throw new Error('Code execution timeout');
      }

      // Helper function to check if error is module/import related
      const isModuleError = (errorText: string) => {
        const moduleErrorPatterns = [
          'ModuleNotFoundError',
          'No module named',
          'ImportError',
          'cannot import name',
          'import',
          'from',
          'package',
          'library'
        ];
        return moduleErrorPatterns.some(pattern => 
          errorText.toLowerCase().includes(pattern.toLowerCase())
        );
      };

      // Helper function to check if error is Java-specific
      const isJavaError = (errorText: string) => {
        const javaErrorPatterns = [
          'class .* is public, should be declared in a file named',
          'cannot find symbol',
          'package .* does not exist',
          'unreported exception'
        ];
        return javaErrorPatterns.some(pattern => 
          new RegExp(pattern, 'i').test(errorText)
        );
      };

      // Helper function to create friendly error message
      const getFriendlyErrorMessage = (errorText: string) => {
        if (isModuleError(errorText)) {
          return `📦 External Libraries Not Available

This code requires external libraries (like numpy, pandas, etc.) that cannot be run in the browser.

💡 To run this code:
1. Copy the code using the copy button above
2. Open VS Code or your preferred Python IDE
3. Install required libraries: pip install <library-name>
4. Run the code in your local environment

Note: The PolyLearnHub code sandbox has limited library support for security reasons.`;
        }
        
        if (isJavaError(errorText) && langLower === 'java') {
          return `☕ Java Code Execution Issue

${errorText}

💡 Common Java issues in online execution:
1. Make sure your main method is: public static void main(String[] args)
2. Avoid using external packages not available in the sandbox
3. Keep class names simple (the system automatically renames public classes to 'Main')

Note: The code has been automatically processed to fix common class naming issues.`;
        }
        
        return errorText;
      };

      // Check for compilation or runtime errors
      if (result.status.id === 6) {
        // Compilation Error
        const compileError = result.compile_output || 'Compilation failed';
        setError(getFriendlyErrorMessage(compileError));
      } else if (result.status.id === 11 || result.status.id === 12 || result.status.id === 13) {
        // Runtime Error, Time Limit Exceeded, or other errors
        const runtimeError = result.stderr || result.message || 'Runtime error occurred';
        setError(getFriendlyErrorMessage(runtimeError));
      } else if (result.stdout) {
        // Success
        setOutput(result.stdout);
      } else if (result.stderr) {
        const stderrError = result.stderr;
        setError(getFriendlyErrorMessage(stderrError));
      } else {
        setOutput('Code executed successfully (no output)');
      }
    } catch (err) {
      console.error('Execution error:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute code');
    } finally {
      setExecuting(false);
    }
  };

  // Generate preview content based on language
  const generatePreview = () => {
    const lang = language.toLowerCase();
    
    // HTML preview - Render as-is for complete HTML or show message for external files
    if (lang === 'html') {
      // Check if HTML has external CSS/JS references
      const hasExternalCSS = /<link\s+[^>]*href=["']styles\.css["']/.test(codeString);
      const hasExternalJS = /<script\s+[^>]*src=["']script\.js["']/.test(codeString);
      
      let enhancedHTML = codeString;
      
      // If it references external files, show a message
      if (hasExternalCSS || hasExternalJS) {
        const infoMessage = `
          <div style="position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #d1ecf1; border: 1px solid #bee5eb; padding: 12px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: system-ui, sans-serif; font-size: 13px; color: #0c5460; max-width: 90%; text-align: center;">
            💡 <strong>Tip:</strong> This HTML references external CSS/JS files. Click Preview on the CSS and JavaScript code blocks below to see them styled and functional!
          </div>
        `;
        enhancedHTML = codeString.replace('</body>', `${infoMessage}</body>`);
      }
      
      return (
        <iframe
          srcDoc={enhancedHTML}
          className="w-full h-[500px] bg-white rounded border border-zinc-700"
          title="HTML Preview"
          sandbox="allow-scripts"
        />
      );
    }
    
    // CSS preview - Apply styles to generic HTML structure
    if (lang === 'css') {
      // Detect what kind of structure the CSS is targeting
      const hasCalculator = /\.calculator|#display|\.buttons/.test(codeString);
      const hasForm = /\.form|input\[type|textarea|select/.test(codeString);
      const hasCard = /\.card|\.container|\.box/.test(codeString);
      
      let htmlStructure = '';
      
      if (hasCalculator) {
        // Calculator structure
        htmlStructure = `
          <div class="calculator">
            <input type="text" id="display" value="123" disabled>
            <div class="buttons">
              <button>C</button>
              <button>/</button>
              <button>*</button>
              <button>-</button>
              <button>7</button>
              <button>8</button>
              <button>9</button>
              <button>+</button>
              <button>4</button>
              <button>5</button>
              <button>6</button>
              <button>=</button>
              <button>1</button>
              <button>2</button>
              <button>3</button>
              <button>0</button>
            </div>
          </div>
        `;
      } else if (hasForm) {
        // Form structure
        htmlStructure = `
          <form class="form">
            <input type="text" placeholder="Name">
            <input type="email" placeholder="Email">
            <textarea placeholder="Message"></textarea>
            <button type="submit">Submit</button>
          </form>
        `;
      } else if (hasCard) {
        // Card structure
        htmlStructure = `
          <div class="container">
            <div class="card">
              <h2>Card Title</h2>
              <p>Card content goes here</p>
              <button>Action</button>
            </div>
          </div>
        `;
      } else {
        // Generic structure
        htmlStructure = `
          <div>
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
            <button>Button</button>
            <div class="box">Box element</div>
          </div>
        `;
      }
      
      const htmlWithCSS = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              ${codeString}
            </style>
          </head>
          <body>
            ${htmlStructure}
          </body>
        </html>
      `;
      return (
        <iframe
          srcDoc={htmlWithCSS}
          className="w-full h-[500px] bg-white rounded border border-zinc-700"
          title="CSS Preview"
          sandbox="allow-scripts"
        />
      );
    }
    
    // JavaScript preview - Execute with appropriate HTML/CSS structure
    if (lang === 'javascript' || lang === 'js') {
      // Detect what kind of functions are in the JS
      const hasCalculatorFunctions = /appendToDisplay|clearDisplay|calculateResult/.test(codeString);
      const hasConsoleOutput = /console\.(log|info|warn|error)/.test(codeString);
      
      let htmlStructure = '';
      let cssStyles = '';
      
      if (hasCalculatorFunctions) {
        // Calculator UI with matching CSS
        cssStyles = `
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f0f0f0;
            font-family: Arial, sans-serif;
            margin: 0;
          }
          .calculator {
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            padding: 20px;
          }
          #display {
            width: 100%;
            height: 40px;
            font-size: 24px;
            text-align: right;
            margin-bottom: 10px;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
          .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
          button {
            height: 60px;
            font-size: 20px;
            border: none;
            border-radius: 5px;
            background-color: #007bff;
            color: white;
            cursor: pointer;
            transition: background 0.3s;
          }
          button:hover {
            background-color: #0056b3;
          }
        `;
        htmlStructure = `
          <div class="calculator">
            <input type="text" id="display" disabled>
            <div class="buttons">
              <button onclick="clearDisplay()">C</button>
              <button onclick="appendToDisplay('/')">/</button>
              <button onclick="appendToDisplay('*')">*</button>
              <button onclick="appendToDisplay('-')">-</button>
              <button onclick="appendToDisplay('7')">7</button>
              <button onclick="appendToDisplay('8')">8</button>
              <button onclick="appendToDisplay('9')">9</button>
              <button onclick="appendToDisplay('+')">+</button>
              <button onclick="appendToDisplay('4')">4</button>
              <button onclick="appendToDisplay('5')">5</button>
              <button onclick="appendToDisplay('6')">6</button>
              <button onclick="calculateResult()">=</button>
              <button onclick="appendToDisplay('1')">1</button>
              <button onclick="appendToDisplay('2')">2</button>
              <button onclick="appendToDisplay('3')">3</button>
              <button onclick="appendToDisplay('0')">0</button>
            </div>
          </div>
        `;
      } else if (hasConsoleOutput) {
        // Console output display
        cssStyles = `
          body {
            font-family: system-ui, sans-serif;
            padding: 20px;
            background: #1e1e1e;
            color: #e0e0e0;
          }
          #output {
            background: #2d2d2d;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            min-height: 200px;
          }
          .log-item { margin: 5px 0; color: #4caf50; }
        `;
        htmlStructure = `
          <h3>Console Output:</h3>
          <div id="output"></div>
          <script>
            const output = document.getElementById('output');
            const originalLog = console.log;
            console.log = function(...args) {
              const div = document.createElement('div');
              div.className = 'log-item';
              div.textContent = args.map(a => 
                typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
              ).join(' ');
              output.appendChild(div);
              originalLog.apply(console, args);
            };
          </script>
        `;
      } else {
        // Generic interactive page
        cssStyles = `
          body {
            font-family: system-ui, sans-serif;
            padding: 40px;
            background: #f5f5f5;
          }
          button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover {
            background: #0056b3;
          }
        `;
        htmlStructure = `
          <h1>JavaScript Preview</h1>
          <p>Your JavaScript code is running. Check the console or interact with the page.</p>
          <div id="app"></div>
        `;
      }
      
      const htmlWithJS = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>${cssStyles}</style>
          </head>
          <body>
            ${htmlStructure}
            <script>
              try {
                ${codeString}
              } catch (error) {
                document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: ' + error.message + '</div>';
              }
            </script>
          </body>
        </html>
      `;
      return (
        <iframe
          srcDoc={htmlWithJS}
          className="w-full h-[500px] bg-white rounded border border-zinc-700"
          title="JavaScript Preview"
          sandbox="allow-scripts"
        />
      );
    }

    // For Judge0 supported languages
    if (isJudge0Supported) {
      return (
        <div className="w-full min-h-[500px] bg-zinc-900 rounded border border-zinc-700 p-6">
          {/* Executing State */}
          {executing && (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-zinc-300 text-lg font-medium">Executing your code...</p>
              <p className="text-zinc-500 text-sm mt-2">This may take a few seconds</p>
            </div>
          )}

          {/* Output Section */}
          {!executing && (output || error) && (
            <div className="space-y-4">
              {/* Header with status badge and re-run button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    error 
                      ? (error.includes('📦') || error.includes('External Libraries'))
                        ? 'bg-blue-500/10 border border-blue-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                      : 'bg-green-500/10 border border-green-500/30'
                  }`}>
                    {error ? (
                      <>
                        {(error.includes('📦') || error.includes('External Libraries')) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="12" x2="12" y2="16"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                        )}
                        <span className={`text-sm font-medium ${
                          (error.includes('📦') || error.includes('External Libraries'))
                            ? 'text-blue-400'
                            : 'text-red-400'
                        }`}>
                          {(error.includes('📦') || error.includes('External Libraries'))
                            ? 'Info'
                            : 'Execution Failed'}
                        </span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span className="text-sm font-medium text-green-400">Success</span>
                      </>
                    )}
                  </div>
                  <span className="text-zinc-500 text-sm">Executed by PolyLearnHub</span>
                </div>
                <button
                  onClick={executeCode}
                  className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all flex items-center gap-2 border border-zinc-700 hover:border-zinc-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                  <span>Re-run</span>
                </button>
              </div>

              {/* Output Display */}
              <div className="relative">
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${
                  error 
                    ? (error.includes('📦') || error.includes('External Libraries'))
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}></div>
                <div className={`bg-gradient-to-br ${
                  error 
                    ? (error.includes('📦') || error.includes('External Libraries'))
                      ? 'from-zinc-950 to-blue-950/20'
                      : 'from-zinc-950 to-red-950/20'
                    : 'from-zinc-950 to-green-950/20'
                } rounded-lg border ${
                  error 
                    ? (error.includes('📦') || error.includes('External Libraries'))
                      ? 'border-blue-500/20'
                      : 'border-red-500/20'
                    : 'border-green-500/20'
                } overflow-hidden`}>
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="text-xs text-zinc-500 ml-2 font-mono">
                      {error 
                        ? (error.includes('📦') || error.includes('External Libraries'))
                          ? 'info'
                          : 'stderr'
                        : 'stdout'}
                    </span>
                  </div>
                  
                  {/* Output content */}
                  <div className="p-5 overflow-auto max-h-[400px] min-h-[100px]">
                    <pre className={`text-sm font-mono leading-relaxed ${
                      error 
                        ? (error.includes('📦') || error.includes('External Libraries'))
                          ? 'text-blue-300'
                          : 'text-red-300'
                        : 'text-green-300'
                    } whitespace-pre-wrap`}>
                      {error || output}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Info footer */}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Code executed in a sandboxed environment</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full h-[500px] bg-zinc-900 rounded border border-zinc-700 p-4 flex items-center justify-center">
        <p className="text-zinc-400">Preview not available for {language}</p>
      </div>
    );
  };

  return (
    <>
      <div className="contain-inline-size rounded-2xl relative bg-[#2f2f2f]">
        {/* Header with language label and action buttons */}
        <div className="flex items-center text-[#8e8ea0] px-4 py-2 text-xs font-sans justify-between h-9 bg-[#2f2f2f] select-none rounded-t-2xl">
          <span>{language}</span>
          <div className="sticky top-9">
            <div className="absolute end-0 bottom-0 flex h-9 items-center pe-2">
              <div className="text-[#8e8ea0] flex items-center gap-4 px-2 font-sans text-xs">
                {/* Preview Button */}
                {isPreviewable && (
                  <button 
                    onClick={() => setShowPreview(true)}
                    className="flex gap-1 items-center select-none py-1" 
                    aria-label="Preview"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon-sm">
                      <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
                    </svg>
                    Preview
                  </button>
                )}
                {/* Copy Button */}
                <button 
                  onClick={handleCopy}
                  className="flex gap-1 items-center select-none py-1" 
                  aria-label="Copy"
                >
                  {copied ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon-sm">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon-sm">
                        <path d="M12.668 10.667C12.668 9.95614 12.668 9.46258 12.6367 9.0791C12.6137 8.79732 12.5758 8.60761 12.5244 8.46387L12.4688 8.33399C12.3148 8.03193 12.0803 7.77885 11.793 7.60254L11.666 7.53125C11.508 7.45087 11.2963 7.39395 10.9209 7.36328C10.5374 7.33197 10.0439 7.33203 9.33301 7.33203H6.5C5.78896 7.33203 5.29563 7.33195 4.91211 7.36328C4.63016 7.38632 4.44065 7.42413 4.29688 7.47559L4.16699 7.53125C3.86488 7.68518 3.61186 7.9196 3.43555 8.20703L3.36524 8.33399C3.28478 8.49198 3.22795 8.70352 3.19727 9.0791C3.16595 9.46259 3.16504 9.95611 3.16504 10.667V13.5C3.16504 14.211 3.16593 14.7044 3.19727 15.0879C3.22797 15.4636 3.28473 15.675 3.36524 15.833L3.43555 15.959C3.61186 16.2466 3.86474 16.4807 4.16699 16.6348L4.29688 16.6914C4.44063 16.7428 4.63025 16.7797 4.91211 16.8027C5.29563 16.8341 5.78896 16.835 6.5 16.835H9.33301C10.0439 16.835 10.5374 16.8341 10.9209 16.8027C11.2965 16.772 11.508 16.7152 11.666 16.6348L11.793 16.5645C12.0804 16.3881 12.3148 16.1351 12.4688 15.833L12.5244 15.7031C12.5759 15.5594 12.6137 15.3698 12.6367 15.0879C12.6681 14.7044 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.4528 12.6634 14.8011 12.6602 15.0879 12.6367C15.4635 12.606 15.675 12.5492 15.833 12.4688L15.959 12.3975C16.2466 12.2211 16.4808 11.9682 16.6348 11.666L16.6914 11.5361C16.7428 11.3924 16.7797 11.2026 16.8027 10.9209C16.8341 10.5374 16.835 10.0439 16.835 9.33301V6.5C16.835 5.78896 16.8341 5.29563 16.8027 4.91211C16.7797 4.63025 16.7428 4.44063 16.6914 4.29688L16.6348 4.16699C16.4807 3.86474 16.2466 3.61186 15.959 3.43555L15.833 3.36524C15.675 3.28473 15.4636 3.22797 15.0879 3.19727C14.7044 3.16593 14.211 3.16504 13.5 3.16504H10.667C9.9561 3.16504 9.46259 3.16595 9.0791 3.19727C8.79739 3.22028 8.6076 3.2572 8.46387 3.30859L8.33399 3.36524C8.03176 3.51923 7.77886 3.75343 7.60254 4.04102L7.53125 4.16699C7.4508 4.32498 7.39397 4.53655 7.36328 4.91211C7.33985 5.19893 7.33562 5.54719 7.33399 6.00195H9.33301C10.022 6.00195 10.5791 6.00131 11.0293 6.03809C11.4873 6.07551 11.8937 6.15471 12.2705 6.34668L12.4883 6.46875C12.984 6.7728 13.3878 7.20854 13.6533 7.72949L13.7197 7.87207C13.8642 8.20859 13.9292 8.56974 13.9619 8.9707C13.9987 9.42092 13.998 9.97799 13.998 10.667V12.665ZM18.165 9.33301C18.165 10.022 18.1657 10.5791 18.1289 11.0293C18.0961 11.4302 18.0311 11.7914 17.8867 12.1279L17.8203 12.2705C17.5549 12.7914 17.1509 13.2272 16.6553 13.5313L16.4365 13.6533C16.0599 13.8452 15.6541 13.9245 15.1963 13.9619C14.8593 13.9895 14.4624 13.9935 13.9951 13.9951C13.9935 14.4624 13.9895 14.8593 13.9619 15.1963C13.9292 15.597 13.864 15.9576 13.7197 16.2939L13.6533 16.4365C13.3878 16.9576 12.9841 17.3941 12.4883 17.6982L12.2705 17.8203C11.8937 18.0123 11.4873 18.0915 11.0293 18.1289C10.5791 18.1657 10.022 18.165 9.33301 18.165H6.5C5.81091 18.165 5.25395 18.1657 4.80371 18.1289C4.40306 18.0962 4.04235 18.031 3.70606 17.8867L3.56348 17.8203C3.04244 17.5548 2.60585 17.151 2.30176 16.6553L2.17969 16.4365C1.98788 16.0599 1.90851 15.6541 1.87109 15.1963C1.83431 14.746 1.83496 14.1891 1.83496 13.5V10.667C1.83496 9.978 1.83432 9.42091 1.87109 8.9707C1.90851 8.5127 1.98772 8.10625 2.17969 7.72949L2.30176 7.51172C2.60586 7.0159 3.04236 6.6122 3.56348 6.34668L3.70606 6.28027C4.04237 6.136 4.40303 6.07083 4.80371 6.03809C5.14051 6.01057 5.53708 6.00551 6.00391 6.00391C6.00551 5.53708 6.01057 5.14051 6.03809 4.80371C6.0755 4.34588 6.15483 3.94012 6.34668 3.56348L6.46875 3.34473C6.77282 2.84912 7.20856 2.44514 7.72949 2.17969L7.87207 2.11328C8.20855 1.96886 8.56979 1.90385 8.9707 1.87109C9.42091 1.83432 9.978 1.83496 10.667 1.83496H13.5C14.1891 1.83496 14.746 1.83431 15.1963 1.87109C15.6541 1.90851 16.0599 1.98788 16.4365 2.17969L16.6553 2.30176C17.151 2.60585 17.5548 3.04244 17.8203 3.56348L17.8867 3.70606C18.031 4.04235 18.0962 4.40306 18.1289 4.80371C18.1657 5.25395 18.165 5.81091 18.165 6.5V9.33301Z"></path>
                      </svg>
                      Copy code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Code content */}
        <div className="overflow-y-auto p-4" dir="ltr">
          <pre className="m-0">
            <code className={`whitespace-pre hljs language-${language} text-sm font-sans leading-relaxed block !bg-transparent`}>
              {children}
            </code>
          </pre>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Code Preview - {language.toUpperCase()} 
            </DialogTitle>
            <DialogDescription>
              {isHtmlCss 
                ? 'Live preview of your code rendered in the browser'
                : 'Code execution powered by PolyLearnHub'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {generatePreview()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom code block styling with copy button
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const isInline = !className?.includes('language-');
            
            if (!isInline && language) {
              return <CodeBlock language={language}>{children}</CodeBlock>;
            }
            
            // Inline code
            return (
              <code className="bg-primary/10 text-foreground px-1.5 py-0.5 rounded text-sm font-mono border border-primary/20">
                {children}
              </code>
            );
          },
          
          // Custom heading styling
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-foreground mt-6 mb-4 border-b border-border pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-foreground mt-5 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
              {children}
            </h3>
          ),
          
          // Custom list styling
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 text-foreground ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground">
              {children}
            </li>
          ),
          
          // Custom paragraph styling
          p: ({ children }) => (
            <p className="text-foreground leading-relaxed mb-3">
              {children}
            </p>
          ),
          
          // Custom blockquote styling
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 bg-primary/5 text-foreground italic">
              {children}
            </blockquote>
          ),
          
          // Custom table styling
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted px-4 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2 text-foreground">
              {children}
            </td>
          ),
          
          // Custom link styling
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          
          // Custom strong/bold styling
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          
          // Custom emphasis/italic styling
          em: ({ children }) => (
            <em className="italic text-foreground">
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
