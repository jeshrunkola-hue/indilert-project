import sys
sys.path.append('.')
from app.core.database import SessionLocal
from app.services.simulation import simulation_engine

db = SessionLocal()

try:
    print("Resetting simulation...")
    simulation_engine.reset_simulation(db)
    
    print("Advancing to step 1...")
    simulation_engine.advance_simulation_step(db, target_step=1)
    
    print("Advancing to step 2...")
    simulation_engine.advance_simulation_step(db, target_step=2)
    
    print("Advancing to step 3...")
    simulation_engine.advance_simulation_step(db, target_step=3)
    
    print("Success: Simulation completed without IntegrityError")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
