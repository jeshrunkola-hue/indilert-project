import os
import sys
import subprocess
import time
import platform

def print_step(msg):
    print(f"\n==================================================")
    print(f"🚀 {msg}")
    print(f"==================================================")

def print_success(msg):
    print(f"✅ {msg}")

def print_error(msg):
    print(f"❌ {msg}")
    sys.exit(1)

def is_windows():
    return platform.system().lower() == "windows"

def run_command(cmd, cwd=None, shell=False, check=True):
    try:
        subprocess.run(cmd, cwd=cwd, shell=shell, check=check)
    except subprocess.CalledProcessError as e:
        print_error(f"Command failed: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    except FileNotFoundError as e:
        print_error(f"Command not found. Make sure it is installed and in your PATH.\nDetails: {e}")

def main():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    backend_dir = os.path.join(root_dir, 'backend')
    citizen_dir = os.path.join(root_dir, 'indilert')
    admin_dir = os.path.join(root_dir, 'indilert-admin')

    # Determine commands based on OS
    python_cmd = sys.executable
    npm_cmd = "npm.cmd" if is_windows() else "npm"

    print_step("Checking prerequisites...")
    try:
        subprocess.run([npm_cmd, "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        print_success("NPM is installed.")
    except Exception:
        print_error("NPM is not installed or not in PATH. Please install Node.js (v20+).")

    print_success(f"Python is installed: {python_cmd}")

    # BACKEND SETUP
    print_step("Setting up Backend (Python)...")
    venv_dir = os.path.join(backend_dir, 'venv')
    
    if is_windows():
        venv_python = os.path.join(venv_dir, 'Scripts', 'python.exe')
        venv_pip = os.path.join(venv_dir, 'Scripts', 'pip.exe')
    else:
        venv_python = os.path.join(venv_dir, 'bin', 'python')
        venv_pip = os.path.join(venv_dir, 'bin', 'pip')

    if not os.path.exists(venv_dir):
        print("Creating virtual environment...")
        run_command([python_cmd, "-m", "venv", "venv"], cwd=backend_dir)
        print_success("Virtual environment created.")
    else:
        print_success("Virtual environment already exists.")

    print("Installing backend dependencies (this may take a minute on first run)...")
    run_command([venv_pip, "install", "-r", "requirements.txt"], cwd=backend_dir)
    print_success("Backend dependencies installed.")


    # CITIZEN APP SETUP
    print_step("Setting up Citizen App (Next.js)...")
    if not os.path.exists(os.path.join(citizen_dir, 'node_modules')):
        print("Installing Citizen App dependencies...")
        run_command([npm_cmd, "install"], cwd=citizen_dir)
        print_success("Citizen dependencies installed.")
    else:
        print_success("Citizen App node_modules already exists.")


    # ADMIN APP SETUP
    print_step("Setting up Admin Dashboard (React/Vite)...")
    if not os.path.exists(os.path.join(admin_dir, 'node_modules')):
        print("Installing Admin App dependencies...")
        run_command([npm_cmd, "install"], cwd=admin_dir)
        print_success("Admin dependencies installed.")
    else:
        print_success("Admin App node_modules already exists.")


    # START SERVICES
    print_step("Starting all services concurrently...")
    
    print("\n" + "🔥"*25)
    print("🌟 INDILERT SYSTEM IS ONLINE! 🌟")
    print("🔥"*25)
    print("\n👉 PLEASE OPEN THESE LINKS IN YOUR BROWSER:\n")
    print("🔗 Citizen Application (User):  http://localhost:3000")
    print("🔗 Admin Dashboard (Admin):     http://localhost:5173")
    print("🔗 Backend API (Internal):      http://127.0.0.1:8000")
    print("\n" + "="*50)
    print("Initializing servers now... Press Ctrl+C to shut down.")
    print("="*50 + "\n")
    
    # Give the user a moment to read the links before logs start streaming
    time.sleep(3)

    processes = []
    
    try:
        # Start Backend
        backend_process = subprocess.Popen([venv_python, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"], cwd=backend_dir)
        processes.append(backend_process)

        # Start Citizen App
        citizen_process = subprocess.Popen([npm_cmd, "run", "dev"], cwd=citizen_dir)
        processes.append(citizen_process)

        # Start Admin App
        admin_process = subprocess.Popen([npm_cmd, "run", "dev"], cwd=admin_dir)
        processes.append(admin_process)

        # Keep main thread alive
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n\nShutting down services...")
        for p in processes:
            p.terminate()
        for p in processes:
            p.wait()
        print("All services stopped. Goodbye!")

if __name__ == "__main__":
    main()
