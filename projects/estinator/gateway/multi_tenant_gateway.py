#!/usr/bin/env python3
"""
Multi-Tenant Gateway Prototype for Estinator

Routes users to their isolated OpenClaw workspaces
"""

import os
import json
from pathlib import Path
from typing import Optional, Dict

class UserWorkspace:
    """Represents a user's isolated workspace"""
    
    BASE_PATH = "/Users/baibureh/clawd/projects/estinator/user-workspaces"
    
    def __init__(self, user_id: str, user_email: str):
        self.user_id = user_id
        self.user_email = user_email
        self.workspace_path = Path(self.BASE_PATH) / user_id
        
    def initialize(self):
        """Create user workspace if it doesn't exist"""
        # Create directory structure
        dirs = [
            self.workspace_path / "memory",
            self.workspace_path / "projects",
            self.workspace_path / "skills",
            self.workspace_path / "data",
        ]
        
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)
        
        # Create USER.md
        user_md = self.workspace_path / "memory" / "USER.md"
        if not user_md.exists():
            user_md.write_text(f"""# USER.md - {self.user_email}

## User Profile
- **Email:** {self.user_email}
- **Company:** 
- **Trade:** 
- **Location:** 

## Preferences
- **Unit System:** Imperial
- **Currency:** USD
- **Default Region:** NYC

## Custom Assemblies
(List user's saved assemblies)

## Notes
- Created: {self.workspace_path.stat().st_ctime if self.workspace_path.exists() else 'now'}
""")
        
        # Create OpenClaw config
        config_path = self.workspace_path / ".openclaw" / "openclaw.json"
        config_path.parent.mkdir(parents=True, exist_ok=True)
        
        if not config_path.exists():
            config = {
                "userId": self.user_id,
                "email": self.user_email,
                "workspace": str(self.workspace_path),
                "model": "anthropic/claude-sonnet-4",
                "skills": ["construction-expert", "pricing-engine"],
                "permissions": ["read", "write", "spawn"]
            }
            config_path.write_text(json.dumps(config, indent=2))
        
        return self.workspace_path
    
    def get_memory_path(self) -> Path:
        return self.workspace_path / "memory"
    
    def get_projects_path(self) -> Path:
        return self.workspace_path / "projects"
    
    def save_project(self, project_id: str, data: dict):
        """Save project data to user's workspace"""
        project_path = self.get_projects_path() / project_id
        project_path.mkdir(parents=True, exist_ok=True)
        
        with open(project_path / "project.json", 'w') as f:
            json.dump(data, f, indent=2)
        
        return project_path
    
    def get_pricing_db(self):
        """Get user's pricing database (personal overrides)"""
        pricing_path = self.workspace_path / "data" / "my_prices.json"
        if pricing_path.exists():
            with open(pricing_path) as f:
                return json.load(f)
        return {}
    
    def add_personal_price(self, item_code: str, price: float, unit: str, notes: str = ""):
        """Add a personal price override"""
        pricing = self.get_pricing_db()
        pricing[item_code] = {
            "price": price,
            "unit": unit,
            "notes": notes,
            "added_at": str(Path().stat().st_mtime)
        }
        
        pricing_path = self.workspace_path / "data" / "my_prices.json"
        with open(pricing_path, 'w') as f:
            json.dump(pricing, f, indent=2)


class MultiTenantGateway:
    """Routes requests to correct user workspace"""
    
    def __init__(self):
        self.users: Dict[str, UserWorkspace] = {}
        self.base_path = Path("/Users/baibureh/clawd/projects/estinator/user-workspaces")
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def get_or_create_user(self, user_id: str, email: str) -> UserWorkspace:
        """Get existing user or create new workspace"""
        if user_id not in self.users:
            workspace = UserWorkspace(user_id, email)
            workspace.initialize()
            self.users[user_id] = workspace
            print(f"✅ Initialized workspace for {email}")
        
        return self.users[user_id]
    
    def route_message(self, user_id: str, message: str) -> str:
        """Route a message to the correct user's agent"""
        if user_id not in self.users:
            return f"Error: User {user_id} not found"
        
        workspace = self.users[user_id]
        
        # In real implementation, this would:
        # 1. Set WORKSPACE env var to workspace.workspace_path
        # 2. Call OpenClaw with message
        # 3. Return response
        
        # Simulated response
        return f"""[Agent for {workspace.user_email}]

You asked: "{message}"

Workspace: {workspace.workspace_path}

(This would route to the user's isolated OpenClaw instance)
"""
    
    def list_users(self):
        """List all user workspaces"""
        users = []
        for user_dir in self.base_path.iterdir():
            if user_dir.is_dir():
                config_file = user_dir / ".openclaw" / "openclaw.json"
                if config_file.exists():
                    with open(config_file) as f:
                        config = json.load(f)
                        users.append({
                            "id": config.get("userId"),
                            "email": config.get("email"),
                            "workspace": str(user_dir)
                        })
        return users
    
    def get_shared_pricing(self, material: str):
        """Query shared pricing engine"""
        # In real implementation, query global pricing DB
        shared_pricing_path = Path("/Users/baibureh/clawd/projects/estinator/pricing-engine/data/pricing_index.json")
        
        if not shared_pricing_path.exists():
            return None
        
        with open(shared_pricing_path) as f:
            all_prices = json.load(f)
        
        # Filter for material
        results = [p for p in all_prices if material.lower() in p.get('description', '').lower()]
        return results[:5]  # Return top 5


def demo():
    """Demonstrate multi-tenant setup"""
    print("=" * 60)
    print("MULTI-TENANT GATEWAY DEMO")
    print("=" * 60)
    
    gateway = MultiTenantGateway()
    
    # Create users
    print("\n📝 Creating user workspaces...")
    bob = gateway.get_or_create_user("user-001", "bob@ premier-contracting.com")
    jane = gateway.get_or_create_user("user-002", "jane@citybuilders.net")
    mike = gateway.get_or_create_user("user-003", "mike@independent.estimator")
    
    # Add personal pricing for Bob
    print("\n💰 Adding personal pricing...")
    bob.add_personal_price("221116", 45.50, "LF", "My standard DWV pricing")
    bob.add_personal_price("260553", 125.00, "EA", "Panel pricing from last job")
    
    # Create projects
    print("\n📁 Creating projects...")
    bob.save_project("bellevue-hospital", {
        "name": "Bellevue Hospital JOC",
        "client": "NYC HHC",
        "status": "in_progress",
        "documents": ["specs.pdf", "drawings.pdf"]
    })
    
    jane.save_project("jacobi-medical", {
        "name": "Jacobi Medical Center",
        "client": "NYC HHC",
        "status": "bidding",
        "documents": ["addendum-1.pdf", "schedules.pdf"]
    })
    
    # Query shared pricing
    print("\n🔍 Querying shared pricing (asphalt)...")
    asphalt_prices = gateway.get_shared_pricing("asphalt")
    if asphalt_prices:
        print(f"  Found {len(asphalt_prices)} prices")
        for p in asphalt_prices[:2]:
            print(f"  • {p['item_code']}: ${p['low_price']:.2f}/{p['unit']}")
    
    # Show isolation
    print("\n🔒 Workspace Isolation Demo:")
    print("-" * 40)
    
    print(f"\nBob's workspace: {bob.workspace_path}")
    print(f"  Memory: {bob.get_memory_path()}")
    print(f"  Projects: {list(bob.get_projects_path().iterdir())}")
    print(f"  Personal prices: {len(bob.get_pricing_db())} items")
    
    print(f"\nJane's workspace: {jane.workspace_path}")
    print(f"  Memory: {jane.get_memory_path()}")
    print(f"  Projects: {list(jane.get_projects_path().iterdir())}")
    print(f"  Personal prices: {len(jane.get_pricing_db())} items")
    
    # Simulate routing
    print("\n🌐 Message Routing Demo:")
    print("-" * 40)
    
    msg1 = gateway.route_message("user-001", "What's the price of 6 inch PVC pipe?")
    print(msg1[:200] + "...")
    
    print()
    
    msg2 = gateway.route_message("user-002", "Analyze these drawings for conflicts")
    print(msg2[:200] + "...")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    users = gateway.list_users()
    print(f"\nTotal users: {len(users)}")
    for u in users:
        print(f"  • {u['email']}")
    
    print("\n✅ Multi-tenant architecture working!")
    print("Each user has isolated:")
    print("  - Memory files")
    print("  - Projects")  
    print("  - Personal pricing database")
    print("  - Custom skills/config")
    print("\nShared resources:")
    print("  - Global pricing engine")
    print("  - Document processing")
    print("  - Model inference")


if __name__ == "__main__":
    demo()
