-- Phase 10: launch operations and support workflow.
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT,
  name TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web','whatsapp','email','merchant')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS launch_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','blocked','waived')),
  notes TEXT,
  checked_at TIMESTAMPTZ,
  checked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO launch_checks(key,label,category,required) VALUES
('affiliate-approvals','Affiliate network approvals','commercial',true),
('merchant-partnerships','Initial merchant partnerships','commercial',true),
('initial-catalog','Initial production catalog','catalog',true),
('initial-countries','Initial active countries','catalog',true),
('domain-dns-ssl','Production domain, DNS and SSL','infrastructure',true),
('production-deployment','Production deployment','infrastructure',true),
('acceptance-testing','Final acceptance testing','quality',true),
('launch-monitoring','Launch monitoring and alerting','operations',true),
('support-workflow','Support workflow and escalation','operations',true)
ON CONFLICT(key) DO NOTHING;
