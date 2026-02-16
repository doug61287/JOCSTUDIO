# Multi-Tenant OpenClaw Architecture for Estinator

## The Big Idea

Each Estinator user gets their own isolated OpenClaw agent/workspace.

```
Traditional:          Proposed:
┌─────────────┐      ┌─────────────┐
│  Estinator  │      │  Estinator  │
│    App      │      │    App      │
└──────┬──────┘      └──────┬──────┘
       │                    │
┌──────▼──────┐      ┌──────▼──────┐
│  Shared     │      │  Gateway    │
│  OpenClaw   │      │  Router     │
└──────┬──────┘      └──────┬──────┘
       │              ┌─────┼─────┐
       │              │     │     │
┌──────▼──────┐      ▼     ▼     ▼
│  Shared     │   ┌────┐ ┌────┐ ┌────┐
│  Memory     │   │OC-1│ │OC-2│ │OC-3│
└─────────────┘   │Bob │ │Jane│ │Mike│
                  └────┘ └────┘ └────┘
                  (Isolated workspaces)
```

## ✅ Pros

### 1. True Data Isolation
- Each user's documents stay in THEIR workspace
- No risk of cross-contamination between competitors
- SOC 2 compliance becomes easier
- "Your data is never mixed with others"

### 2. Personalized Learning
- Agent learns THAT user's estimating style
- Remembers their preferred assemblies
- Learns their shortcuts and patterns
- "Your agent gets smarter about YOUR work"

### 3. Customization Freedom
- User picks their model (Claude, GPT-4, local)
- Custom skills just for them
- Their own pricing database
- Personal tool preferences

### 4. Scale Benefits
- Horizontal scaling (add users = add agents)
- No single point of contention
- Can use cheaper compute per user
- Geographic distribution (user in EU = agent in EU)

### 5. Enterprise Ready
- "Your own dedicated AI"
- White-label ready
- Department-level isolation
- Audit trail per user

## ❌ Cons

### 1. Infrastructure Complexity
- Need gateway/routing layer
- Session management across agents
- Health monitoring × N agents
- Update deployment complexity

### 2. Cost Multiplication
- 1000 users = 1000 agents running
- Even idle agents consume resources
- Database connections multiply
- Storage per user adds up

### 3. Sharing Becomes Harder
- "Share this project with team" = cross-workspace sync
- Company-wide knowledge fragmentation
- Master pricing database needs replication
- Templates/assemblies need distribution

### 4. Cold Start Problem
- New user = blank agent
- No collective learning benefit
- Each agent starts from scratch
- Slower initial experience

### 5. Management Overhead
- Debugging means checking N workspaces
- Support complexity increases
- Version management across agents
- Backup/recovery per user

## 🏗️ Implementation Approaches

### Option A: Full Isolation ("Hard Multi-Tenancy")

```
/users/
  /bob@contractor.com/
    .openclaw/
      openclaw.json
      agents/
    workspace/
      memory/
      projects/
      pricing-engine/
  /jane@builder.com/
    .openclaw/
    workspace/
```

**Best for:** High-security enterprises, government
**Cost:** $$$$

### Option B: Shared Core + Isolated Memory ("Soft Multi-Tenancy")

```
Shared:
- Gateway
- Pricing engine
- Document processing
- Model inference

Isolated per user:
- Memory files (user preferences, history)
- Project data
- Custom skills
```

**Best for:** Most SaaS scenarios
**Cost:** $$

### Option C: Hybrid ("Pod Model")

```
Company/team level isolation:
- Small company (1-5 users) → Shared agent
- Medium company (5-50) → Dedicated agent pod
- Enterprise (50+) → Multiple pods per department
```

**Best for:** B2B SaaS with varied customer sizes
**Cost:** $-$$$$

## 💡 Recommended Architecture

```yaml
# Estinator Multi-Tenant Design

Gateway Layer:
  - User authentication
  - Request routing to correct agent
  - Rate limiting per user
  - Billing/metering

Shared Services:
  pricing-engine:
    - Global bid tab database
    - Regional pricing indices
    - Read-only for all users
  
  document-processing:
    - PDF OCR pipeline
    - Vision analysis
    - Shared compute pool
  
  model-inference:
    - Anthropic/OpenAI APIs
    - Shared rate limits
    - Caching layer

User Workspaces (Isolated):
  memory/:
    - USER.md (preferences)
    - 2026-02-16.md (session history)
    - project-context.md
  
  projects/:
    - Project A/
      - documents/
      - takeoffs/
      - conflicts.json
    - Project B/
  
  custom-skills/:
    - Their own assemblies
    - Company-specific templates
  
  vector-store/:
    - Their document embeddings
    - Isolated from other users
```

## 🎯 Key Technical Decisions

### 1. Workspace Path Strategy
```python
# User workspace path
WORKSPACE_ROOT = "/var/estinator/users/{user_id}/workspace"
AGENT_CONFIG = "/var/estinator/users/{user_id}/.openclaw"
```

### 2. Session Routing
```javascript
// Gateway routes requests to correct agent
function routeRequest(userId, message) {
  const agentSocket = getAgentSocket(userId);
  return agentSocket.send(message);
}
```

### 3. Shared Data Access
```python
# Read-only access to global pricing
class UserPricingEngine:
    def query(self, material):
        # Queries global pricing index
        return global_pricing_db.search(material)
    
    def save_private_price(self, item, price):
        # Saves to user's private pricing
        return user_db.insert(item, price)
```

### 4. Cross-User Sharing
```python
# When user shares project
def share_project(from_user, to_user, project_id):
    # Copy project to recipient's workspace
    source = f"/users/{from_user}/projects/{project_id}"
    dest = f"/users/{to_user}/projects/{project_id}"
    copy_with_permissions(source, dest)
```

## 💰 Cost Analysis

### Per-User Costs (Estimates)

| Component | Shared | Isolated |
|-----------|--------|----------|
| Compute | $10/mo | $50-100/mo |
| Storage | $5/mo | $20-50/mo |
| API Calls | Shared pool | Per user |
| **Total** | **~$15/mo** | **~$70-150/mo** |

### Break-Even Analysis

- **Shared model:** Cost scales sub-linearly (good for volume)
- **Isolated model:** Cost scales linearly (predictable but high)

**When to use isolated:**
- User pays >$200/mo
- Compliance requirements
- Enterprise contracts
- Heavy power users

## 🚀 Implementation Roadmap

### Phase 1: Shared Core (Current)
- Single OpenClaw instance
- User isolation via memory namespace
- Shared pricing/tools

### Phase 2: Soft Multi-Tenancy
- User workspaces on disk
- Gateway routing
- Still shared compute

### Phase 3: Hard Multi-Tenancy (Optional)
- Docker containers per user
- True process isolation
- Kubernetes orchestration

## 🤔 My Recommendation

**Start with Option B (Soft Multi-Tenancy)**

```
Reasons:
1. Faster to implement
2. Cost-effective at scale
3. Can upgrade users to isolation later
4. Most of the benefit, less complexity

Upgrade path:
Free users → Shared namespace
Pro users → Isolated memory
Enterprise → Dedicated agent pod
```

## 🎁 Bonus: User Benefits Messaging

**Shared Agent:**
> "Estinator learns from millions of projects to help you"

**Isolated Agent:**
> "Your own personal AI estimator that learns YOUR style"

**Hybrid:**
> "Estimator-wide intelligence + your personal experience"

---

## Questions to Answer

1. What's the average project value? (justifies cost?)
2. Do users share projects often?
3. Any compliance requirements per customer?
4. What's the target price point per user?
5. Enterprise vs SMB mix?

These answers determine the right architecture.
