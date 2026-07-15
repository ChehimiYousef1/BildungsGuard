const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Add useMemo to imports
c = c.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useMemo } from 'react';"
);

// Replace bootcampNames with useMemo
c = c.replace(
  "  const bootcampNames = [...new Set(alumni.map((a: any) => a.measure).filter(Boolean))];",
  "  const bootcampNames = useMemo(() => [...new Set(alumni.map((a: any) => a.measure).filter(Boolean))], [alumni]);"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');
