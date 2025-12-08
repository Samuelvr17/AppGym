const fs = require('fs');
const path = require('path');

// Read App.tsx
const appPath = path.join(__dirname, 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// Add ThemeProvider import after useLocalStorage import
appContent = appContent.replace(
    "import { useLocalStorage } from './hooks/useLocalStorage';",
    "import { useLocalStorage } from './hooks/useLocalStorage';\nimport { ThemeProvider } from './context/ThemeContext';"
);

// Wrap the return statement with ThemeProvider
appContent = appContent.replace(
    'return (\n    <div className="min-h-screen bg-gray-50">',
    'return (\n    <ThemeProvider>\n      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">'
);

// Close ThemeProvider before the closing brace
appContent = appContent.replace(
    '    </div>\n  );\n}',
    '      </div>\n    </ThemeProvider>\n  );\n}'
);

// Write back App.tsx
fs.writeFileSync(appPath, appContent, 'utf8');

// Read Header.tsx
const headerPath = path.join(__dirname, 'src', 'components', 'Header.tsx');
let headerContent = fs.readFileSync(headerPath, 'utf8');

// Add ThemeToggle import
headerContent = headerContent.replace(
    "import { ArrowLeft } from 'lucide-react';",
    "import { ArrowLeft } from 'lucide-react';\nimport { ThemeToggle } from './ThemeToggle';"
);

// Add flex-1 to h1 and add ThemeToggle
headerContent = headerContent.replace(
    '<h1 className="text-xl font-bold">{title}</h1>',
    '<h1 className="text-xl font-bold flex-1">{title}</h1>\n        <ThemeToggle />'
);

// Write back Header.tsx
fs.writeFileSync(headerPath, headerContent, 'utf8');

console.log('Dark mode integration completed successfully!');
