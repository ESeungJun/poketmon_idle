#!/bin/bash
pkill -f "poketmon-idle" 2>/dev/null
pkill -f "electron \." 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1
npm run dev
