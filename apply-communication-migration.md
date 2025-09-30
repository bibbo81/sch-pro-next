# Apply Communication & Support Migration

⚠️ **IMPORTANTE**: Applica questi statement UNO ALLA VOLTA nel Supabase SQL Editor.

Verifica dopo ogni blocco con: `SELECT * FROM table_name LIMIT 1;`

## 1. Email Templates Table

```sql
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  template_style JSONB DEFAULT '{}',
  available_variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX idx_email_templates_type ON email_templates(template_type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;

GRANT ALL ON TABLE email_templates TO service_role;
GRANT ALL ON TABLE email_templates TO authenticated;
```

✅ Verifica: `SELECT * FROM email_templates LIMIT 1;`

## 2. Broadcast Messages Table

```sql
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  target_type VARCHAR(50) NOT NULL,
  target_filter JSONB DEFAULT '{}',
  target_organizations UUID[],
  target_users UUID[],
  scheduled_at TIMESTAMP WITH TIME ZONE,
  send_immediately BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'draft',
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_broadcast_messages_status ON broadcast_messages(status);
CREATE INDEX idx_broadcast_messages_scheduled ON broadcast_messages(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_broadcast_messages_creator ON broadcast_messages(created_by);

GRANT ALL ON TABLE broadcast_messages TO service_role;
GRANT ALL ON TABLE broadcast_messages TO authenticated;
```

✅ Verifica: `SELECT * FROM broadcast_messages LIMIT 1;`

## 3. Message Deliveries Table

```sql
CREATE TABLE IF NOT EXISTS message_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_message_id UUID NOT NULL REFERENCES broadcast_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_message_deliveries_broadcast ON message_deliveries(broadcast_message_id);
CREATE INDEX idx_message_deliveries_user ON message_deliveries(user_id);
CREATE INDEX idx_message_deliveries_status ON message_deliveries(status);
CREATE INDEX idx_message_deliveries_org ON message_deliveries(organization_id);

GRANT ALL ON TABLE message_deliveries TO service_role;
GRANT ALL ON TABLE message_deliveries TO authenticated;
```

✅ Verifica: `SELECT * FROM message_deliveries LIMIT 1;`

## 4. Support Tickets Table

```sql
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) NOT NULL UNIQUE,
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_org ON support_tickets(organization_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_by ON support_tickets(created_by);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);

GRANT ALL ON TABLE support_tickets TO service_role;
GRANT ALL ON TABLE support_tickets TO authenticated;
```

✅ Verifica: `SELECT * FROM support_tickets LIMIT 1;`

## 5. Ticket Messages Table

```sql
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_type VARCHAR(20) NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
CREATE INDEX idx_ticket_messages_sender ON ticket_messages(sender_id);

GRANT ALL ON TABLE ticket_messages TO service_role;
GRANT ALL ON TABLE ticket_messages TO authenticated;
```

✅ Verifica: `SELECT * FROM ticket_messages LIMIT 1;`

## 6. Knowledge Base Articles Table

```sql
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category VARCHAR(100) NOT NULL,
  tags TEXT[],
  meta_description TEXT,
  meta_keywords TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  visibility VARCHAR(20) DEFAULT 'public',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  search_vector tsvector,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kb_articles_slug ON kb_articles(slug);
CREATE INDEX idx_kb_articles_category ON kb_articles(category);
CREATE INDEX idx_kb_articles_published ON kb_articles(is_published) WHERE is_published = true;
CREATE INDEX idx_kb_articles_featured ON kb_articles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_kb_articles_org ON kb_articles(organization_id);
CREATE INDEX idx_kb_articles_search ON kb_articles USING GIN(search_vector);

GRANT ALL ON TABLE kb_articles TO service_role;
GRANT ALL ON TABLE kb_articles TO authenticated;
```

✅ Verifica: `SELECT * FROM kb_articles LIMIT 1;`

## 7. PostgreSQL Functions

```sql
CREATE OR REPLACE FUNCTION kb_articles_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kb_articles_search_update
  BEFORE INSERT OR UPDATE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION kb_articles_search_trigger();
```

```sql
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 8) AS INTEGER)), 0) + 1
  INTO counter
  FROM support_tickets;

  new_number := 'TICKET-' || LPAD(counter::TEXT, 6, '0');

  RETURN new_number;
END;
$$;
```

```sql
CREATE OR REPLACE FUNCTION update_ticket_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.sender_type = 'agent' AND OLD.sender_type IS NULL THEN
    UPDATE support_tickets
    SET first_response_at = NOW()
    WHERE id = NEW.ticket_id
      AND first_response_at IS NULL;
  END IF;

  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = NEW.ticket_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER ticket_messages_stats_trigger
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_stats();
```

✅ Verifica funzioni: `SELECT generate_ticket_number();`

---

## ✅ Verifica Finale

Controlla che tutte le tabelle siano state create:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'email_templates',
    'broadcast_messages',
    'message_deliveries',
    'support_tickets',
    'ticket_messages',
    'kb_articles'
  );
```

Dovresti vedere 6 tabelle.
