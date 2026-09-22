CREATE TABLE "public"."screenshots" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"      text                     NOT NULL,
  "url"          text                     NOT NULL,
  "status"       integer                  NOT NULL DEFAULT 200,
  "time_ms"      integer                  NOT NULL DEFAULT 0,
  "format"       text                     NOT NULL DEFAULT 'png'::text,
  "cached"       boolean                  NOT NULL DEFAULT false,
  "size_kb"      numeric,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "ai_requested" boolean                  NOT NULL DEFAULT false,
  "ai_succeeded" boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "screenshots_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."screenshots"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."users" (
  "id"                     uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "clerk_id"               text                     NOT NULL,
  "email"                  text                     NOT NULL,
  "plan"                   text                     NOT NULL DEFAULT 'Free'::text,
  "stripe_customer_id"     text,
  "stripe_subscription_id" text,
  "created_at"             timestamp with time zone NOT NULL DEFAULT now(),
  "unkey_key_id"           text,
  "unkey_api_key"          text,
  CONSTRAINT "users_clerk_id_key" UNIQUE (clerk_id),
  CONSTRAINT "users_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."users"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX screenshots_ai_succeeded_idx ON public.screenshots USING btree (user_id, created_at DESC)
  WHERE ai_succeeded;

CREATE INDEX screenshots_created_at_idx ON public.screenshots USING btree (created_at DESC);

CREATE INDEX screenshots_user_id_created_at_idx ON public.screenshots USING btree (user_id, created_at DESC);

CREATE INDEX users_clerk_id_idx ON public.users USING btree (clerk_id);

CREATE INDEX users_stripe_customer_id_idx ON public.users USING btree (stripe_customer_id)
  WHERE (stripe_customer_id IS NOT NULL);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."screenshots" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "anon", "authenticated", "postgres", "service_role";
