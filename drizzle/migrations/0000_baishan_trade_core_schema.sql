-- =============== ENUMS ===============
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');
CREATE TYPE public.publication_status AS ENUM ('draft', 'published', 'hidden', 'archived');
CREATE TYPE public.evidence_level AS ENUM ('supplier_only', 'staff_demo', 'staff_unboxing', 'staff_tested');
CREATE TYPE public.campaign_state AS ENUM ('collecting', 'procurement_review', 'closed', 'paused', 'cancelled');
CREATE TYPE public.batch_state AS ENUM ('proposed', 'approved', 'purchased', 'international_transit', 'customs', 'receiving', 'available', 'completed', 'cancelled');
CREATE TYPE public.reservation_status AS ENUM ('active', 'withdrawn', 'expired', 'closed');
CREATE TYPE public.order_status AS ENUM ('pending_payment', 'confirmation_pending', 'confirmed', 'packing', 'shipped', 'delivered', 'cancellation_requested', 'cancelled', 'closed');
CREATE TYPE public.payment_status AS ENUM ('not_started', 'pending', 'paid', 'failed', 'expired', 'cod_due', 'cod_collected');
CREATE TYPE public.review_kind AS ENUM ('staff_demonstration', 'staff_unboxing', 'staff_tested', 'supplier_media');

-- =============== HELPERS ===============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============== PROFILES ===============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  phone text,
  district text,
  locale text NOT NULL DEFAULT 'bn',
  marketing_consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============== ROLES ===============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'));
$$;

CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============== SETTINGS (feature flags) ===============
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('interestEnabled', 'true'::jsonb),
  ('reservationsEnabled', 'true'::jsonb),
  ('ordersEnabled', 'false'::jsonb),
  ('paidPreordersEnabled', 'false'::jsonb),
  ('demoMode', 'true'::jsonb);

-- =============== CATEGORIES ===============
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  description_bn text,
  description_en text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories staff write" ON public.categories FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- =============== PRODUCTS ===============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title_bn text NOT NULL,
  title_en text NOT NULL,
  summary_bn text,
  summary_en text,
  description_bn text,
  description_en text,
  specs jsonb NOT NULL DEFAULT '[]'::jsonb,
  hero_image_url text,
  estimated_price_bdt numeric(12,2),
  final_price_bdt numeric(12,2),
  price_note_bn text,
  price_note_en text,
  status public.publication_status NOT NULL DEFAULT 'draft',
  evidence public.evidence_level NOT NULL DEFAULT 'supplier_only',
  is_staff_pick boolean NOT NULL DEFAULT false,
  local_stock integer NOT NULL DEFAULT 0,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_status_idx ON public.products(status);
CREATE INDEX products_category_idx ON public.products(category_id);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published products public read" ON public.products FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "staff read all products" ON public.products FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff write products" ON public.products FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_bn text,
  alt_en text,
  is_supplier_media boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);
CREATE INDEX product_images_product_idx ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images public read" ON public.product_images FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'published'));
CREATE POLICY "images staff read" ON public.product_images FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "images staff write" ON public.product_images FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku text NOT NULL,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  detail_bn text,
  detail_en text,
  price_bdt numeric(12,2),
  local_stock integer NOT NULL DEFAULT 0,
  unavailable_reason_bn text,
  unavailable_reason_en text,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (product_id, sku)
);
CREATE INDEX product_variants_product_idx ON public.product_variants(product_id);
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants public read" ON public.product_variants FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'published'));
CREATE POLICY "variants staff read" ON public.product_variants FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "variants staff write" ON public.product_variants FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- =============== CAMPAIGNS ===============
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  state public.campaign_state NOT NULL DEFAULT 'collecting',
  feature_vote_target integer NOT NULL DEFAULT 100,
  reservation_account_target integer NOT NULL DEFAULT 30,
  reservation_unit_target integer NOT NULL DEFAULT 40,
  publish_vote_target boolean NOT NULL DEFAULT true,
  community_featured boolean NOT NULL DEFAULT false,
  feature_goal_reached_at timestamptz,
  vote_count integer NOT NULL DEFAULT 0,
  reserving_accounts integer NOT NULL DEFAULT 0,
  reserved_units integer NOT NULL DEFAULT 0,
  paused_reason_bn text,
  paused_reason_en text,
  state_changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaigns TO anon, authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns public read" ON public.campaigns FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'published'));
CREATE POLICY "campaigns staff read" ON public.campaigns FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "campaigns staff write" ON public.campaigns FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== VOTES ===============
CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);
CREATE INDEX votes_campaign_idx ON public.votes(campaign_id);
GRANT SELECT, INSERT, UPDATE ON public.votes TO authenticated;
GRANT ALL ON public.votes TO service_role;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own votes select" ON public.votes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "staff votes select" ON public.votes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER votes_updated_at BEFORE UPDATE ON public.votes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== RESERVATIONS ===============
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  status public.reservation_status NOT NULL DEFAULT 'active',
  acknowledged boolean NOT NULL DEFAULT false,
  district text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, variant_id, user_id)
);
CREATE INDEX reservations_campaign_idx ON public.reservations(campaign_id);
GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reservations select" ON public.reservations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "staff reservations select" ON public.reservations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== DEMAND COUNTER TRIGGERS ===============
CREATE OR REPLACE FUNCTION public.recount_campaign_votes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cid uuid := COALESCE(NEW.campaign_id, OLD.campaign_id);
  total integer;
  target integer;
BEGIN
  SELECT count(*) INTO total FROM public.votes WHERE campaign_id = cid AND active;
  SELECT feature_vote_target INTO target FROM public.campaigns WHERE id = cid;
  UPDATE public.campaigns
     SET vote_count = total,
         community_featured = (total >= target AND state = 'collecting'),
         feature_goal_reached_at = CASE
           WHEN total >= target AND feature_goal_reached_at IS NULL THEN now()
           ELSE feature_goal_reached_at END
   WHERE id = cid;
  RETURN NULL;
END;
$$;
CREATE TRIGGER votes_recount AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW EXECUTE FUNCTION public.recount_campaign_votes();

CREATE OR REPLACE FUNCTION public.recount_campaign_reservations()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cid uuid := COALESCE(NEW.campaign_id, OLD.campaign_id);
  accounts integer;
  units integer;
BEGIN
  SELECT count(DISTINCT user_id), COALESCE(sum(quantity), 0)
    INTO accounts, units
    FROM public.reservations WHERE campaign_id = cid AND status = 'active';
  UPDATE public.campaigns SET reserving_accounts = accounts, reserved_units = units WHERE id = cid;
  RETURN NULL;
END;
$$;
CREATE TRIGGER reservations_recount AFTER INSERT OR UPDATE OR DELETE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.recount_campaign_reservations();

-- =============== SAVED / SUBSCRIPTIONS ===============
CREATE TABLE public.saved_products (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_products TO authenticated;
GRANT ALL ON public.saved_products TO service_role;
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved all" ON public.saved_products FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.campaign_subscriptions (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, campaign_id)
);
GRANT SELECT, INSERT, DELETE ON public.campaign_subscriptions TO authenticated;
GRANT ALL ON public.campaign_subscriptions TO service_role;
ALTER TABLE public.campaign_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subs all" ON public.campaign_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "staff subs read" ON public.campaign_subscriptions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- =============== IMPORT BATCHES ===============
CREATE TABLE public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  state public.batch_state NOT NULL DEFAULT 'proposed',
  quantity integer,
  expected_arrival_from date,
  expected_arrival_to date,
  arrival_confidence text,
  delayed boolean NOT NULL DEFAULT false,
  delay_note_bn text,
  delay_note_en text,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.import_batches TO anon, authenticated;
GRANT ALL ON public.import_batches TO service_role;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "batches public read" ON public.import_batches FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'published'));
CREATE POLICY "batches staff read" ON public.import_batches FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "batches staff write" ON public.import_batches FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER batches_updated_at BEFORE UPDATE ON public.import_batches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.batch_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  event_date date NOT NULL DEFAULT current_date,
  title_bn text NOT NULL,
  title_en text NOT NULL,
  body_bn text,
  body_en text,
  source_note text,
  is_planned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX batch_updates_batch_idx ON public.batch_updates(batch_id);
GRANT SELECT ON public.batch_updates TO anon, authenticated;
GRANT ALL ON public.batch_updates TO service_role;
ALTER TABLE public.batch_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "batch updates public read" ON public.batch_updates FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.import_batches b JOIN public.products p ON p.id = b.product_id
    WHERE b.id = batch_id AND p.status = 'published'));
CREATE POLICY "batch updates staff write" ON public.batch_updates FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- =============== STAFF REVIEWS / EVIDENCE ===============
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  kind public.review_kind NOT NULL,
  reviewer_name text,
  reviewer_role text,
  reviewed_on date,
  sample_variant text,
  source_note text,
  conditions_bn text,
  conditions_en text,
  strengths_bn text,
  strengths_en text,
  limitations_bn text,
  limitations_en text,
  media_url text,
  poster_url text,
  duration_seconds integer,
  transcript_url text,
  sponsored boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reviews_product_idx ON public.reviews(product_id);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'published'));
CREATE POLICY "reviews staff write" ON public.reviews FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- =============== ORDERS (phase 2, ordersEnabled off) ===============
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  payment_status public.payment_status NOT NULL DEFAULT 'not_started',
  payment_method text,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  district text NOT NULL,
  thana text NOT NULL,
  street text NOT NULL,
  landmark text,
  instructions text,
  items_total_bdt numeric(12,2) NOT NULL DEFAULT 0,
  delivery_fee_bdt numeric(12,2) NOT NULL DEFAULT 0,
  total_bdt numeric(12,2) NOT NULL DEFAULT 0,
  delivery_from date,
  delivery_to date,
  terms_version text,
  order_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders select" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "staff orders select" ON public.orders FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff orders write" ON public.orders FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  variant_id uuid NOT NULL REFERENCES public.product_variants(id),
  title_snapshot text NOT NULL,
  variant_snapshot text NOT NULL,
  unit_price_bdt numeric(12,2) NOT NULL,
  quantity integer NOT NULL
);
CREATE INDEX order_items_order_idx ON public.order_items(order_id);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own order items select" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "staff order items select" ON public.order_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- =============== AUDIT LOG ===============
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_idx ON public.audit_log(created_at DESC);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit staff read" ON public.audit_log FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- =============== NOTIFICATION OUTBOX ===============
CREATE TABLE public.notification_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  kind text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.notification_outbox TO service_role;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outbox staff read" ON public.notification_outbox FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
GRANT SELECT ON public.notification_outbox TO authenticated;