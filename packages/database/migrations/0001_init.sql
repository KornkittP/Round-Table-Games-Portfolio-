CREATE TYPE "public"."game_status" AS ENUM('published', 'in_development', 'print_and_play');--> statement-breakpoint
CREATE TYPE "public"."preorder_status" AS ENUM('NEW', 'CONFIRMED', 'PAID', 'SHIPPED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
CREATE TABLE "games" (
	"slug" varchar PRIMARY KEY NOT NULL,
	"status" "game_status" DEFAULT 'in_development' NOT NULL,
	"title_en" varchar NOT NULL,
	"title_th" varchar,
	"tagline_en" varchar,
	"tagline_th" varchar,
	"description_en" text,
	"description_th" text,
	"year" integer,
	"price_thb" integer,
	"preorder_open" boolean DEFAULT false NOT NULL,
	"preorder_closes" timestamp with time zone,
	"cover_image" varchar,
	"bgg_url" varchar,
	"shop_url" varchar,
	"rulebook_url" varchar,
	"pnp_url" varchar,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "games" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "preorders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_slug" varchar NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"address" text NOT NULL,
	"quantity" integer NOT NULL,
	"notes" text,
	"status" "preorder_status" DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar,
	"updated_at" timestamp with time zone,
	CONSTRAINT "preorders_quantity_range" CHECK ("preorders"."quantity" between 1 and 10)
);
--> statement-breakpoint
ALTER TABLE "preorders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "preorders" ADD CONSTRAINT "preorders_game_slug_games_slug_fk" FOREIGN KEY ("game_slug") REFERENCES "public"."games"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preorders" ADD CONSTRAINT "preorders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "preorders_user_idx" ON "preorders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "preorders_game_idx" ON "preorders" USING btree ("game_slug");--> statement-breakpoint
CREATE POLICY "anyone can view games" ON "games" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "only admin can create games" ON "games" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.is_admin()));--> statement-breakpoint
CREATE POLICY "only admin can update games" ON "games" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));--> statement-breakpoint
CREATE POLICY "only admin can delete games" ON "games" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.is_admin()));--> statement-breakpoint
CREATE POLICY "user can view own preorders" ON "preorders" AS PERMISSIVE FOR SELECT TO "authenticated" USING (user_id = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "admin can view all preorders" ON "preorders" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_admin()));--> statement-breakpoint
CREATE POLICY "user can create own preorder for an open game" ON "preorders" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (user_id = (select auth.uid()) and exists (
        select 1 from public.games g
        where g.slug = game_slug
          and g.preorder_open
          and (g.preorder_closes is null or g.preorder_closes > now())
      ));--> statement-breakpoint
CREATE POLICY "only admin can update preorders" ON "preorders" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));--> statement-breakpoint
CREATE POLICY "user can view own profile" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING (id = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "admin can view all users" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_admin()));