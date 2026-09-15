#!/usr/bin/env python3
"""
INDILERT - Startup Script
This script initializes and runs the INDILERT local development server.
It ensures dependencies are installed before launching the Next.js app.
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_prerequisites():
    """Verify Node.js and npm are installed on the system."""
    try:
        subprocess.run(['node', '--version'], capture_output=True, check=True)
        subprocess.run(['npm', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: Node.js and npm must be installed to run INDILERT.")
        print("Please install them from https://nodejs.org/")
        sys.exit(1)

def install_dependencies():
    """Install node_modules if they don't exist."""
    print("Checking project dependencies...")
    if not Path("node_modules").exists():
        print("Installing npm dependencies. This might take a minute...")
        try:
            subprocess.run(['npm', 'install'], check=True)
            print("Dependencies installed successfully.")
        except subprocess.CalledProcessError:
            print("Error: Failed to install dependencies.")
            sys.exit(1)
    else:
        print("Dependencies already installed.")

def start_server():
    """Launch the Next.js development server."""
    print("\nStarting INDILERT development server...")
    try:
        # Start the Next.js server
        process = subprocess.Popen(['npm', 'run', 'dev'])
        
        # Give the server a moment to spin up before printing instructions
        time.sleep(3)
        
        print("\n" + "="*55)
        print(" 🚨  INDILERT CIVILIAN INTERFACE IS RUNNING  🚨 ")
        print("="*55)
        print(" Access the application in your browser at:")
        print(" http://localhost:3000")
        print("\n Press Ctrl+C to stop the server.")
        print("="*55 + "\n")
        
        process.wait()
    except KeyboardInterrupt:
        print("\n\nShutting down INDILERT server. Goodbye!")
        process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    # Ensure we are in the project root containing package.json
    if not Path("package.json").exists():
        print("Error: Please run this script from the INDILERT project root directory.")
        sys.exit(1)
        
    check_prerequisites()
    install_dependencies()
    start_server()
