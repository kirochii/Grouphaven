

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_email_confirmation"("p_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  email_confirmed boolean;
begin
  -- Check if the email_confirmed_at exists (not null)
  select into email_confirmed
  case
    when email_confirmed_at is not null then true
    else false
  end
  from auth.users
  where email = p_email
  limit 1;

  -- Return the confirmation status (true/false)
  return email_confirmed;
end;
$$;


ALTER FUNCTION "public"."check_email_confirmation"("p_email" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin" (
    "admin_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL
);


ALTER TABLE "public"."admin" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."confirmed_view" WITH ("security_invoker"='on') AS
 SELECT "u"."id",
    "u"."email_confirmed_at"
   FROM "auth"."users" "u";


ALTER TABLE "public"."confirmed_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group" (
    "group_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "date_created" "date" NOT NULL,
    "interests" character varying[]
);


ALTER TABLE "public"."group" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_preference" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_age" smallint NOT NULL,
    "user_gender" character varying NOT NULL,
    "user_is_trusted" boolean NOT NULL,
    "user_city" character varying NOT NULL,
    "user_is_host" boolean NOT NULL,
    "min_age_pref" smallint NOT NULL,
    "max_age_pref" smallint NOT NULL,
    "same_gender" boolean NOT NULL,
    "min_group_size" smallint NOT NULL,
    "max_group_size" smallint NOT NULL,
    "interests" character varying[]
);


ALTER TABLE "public"."match_preference" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_group" (
    "id" "uuid" NOT NULL,
    "group_id" "uuid" NOT NULL,
    "is_host" boolean NOT NULL
);


ALTER TABLE "public"."user_group" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "name" character varying NOT NULL,
    "id" "uuid" NOT NULL,
    "avatar_url" character varying,
    "bio" "text",
    "dob" "date" NOT NULL,
    "gender" character varying NOT NULL,
    "city" character varying NOT NULL,
    "photo_1" character varying,
    "photo_2" character varying,
    "photo_3" character varying,
    "photo_4" character varying,
    "photo_5" character varying,
    "photo_6" character varying,
    "is_verified" boolean DEFAULT false NOT NULL,
    "tagline" character varying,
    "is_trusted" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verification_request" (
    "request_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_status" character varying DEFAULT 'pending'::character varying NOT NULL,
    "request_date" "date" NOT NULL,
    "verification_date" "date",
    "id" "uuid" NOT NULL,
    "admin_id" "uuid",
    "photo_url" character varying NOT NULL
);


ALTER TABLE "public"."verification_request" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin"
    ADD CONSTRAINT "admin_pkey" PRIMARY KEY ("admin_id");



ALTER TABLE ONLY "public"."group"
    ADD CONSTRAINT "group_pkey" PRIMARY KEY ("group_id");



ALTER TABLE ONLY "public"."match_preference"
    ADD CONSTRAINT "match_preference_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_group"
    ADD CONSTRAINT "user_group_pkey" PRIMARY KEY ("id", "group_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verification_request"
    ADD CONSTRAINT "verification_request_pkey" PRIMARY KEY ("request_id");



ALTER TABLE ONLY "public"."match_preference"
    ADD CONSTRAINT "match_preference_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_group"
    ADD CONSTRAINT "user_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("group_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_group"
    ADD CONSTRAINT "user_group_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."verification_request"
    ADD CONSTRAINT "verification_request_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("admin_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."verification_request"
    ADD CONSTRAINT "verification_request_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can delete" ON "public"."match_preference" FOR DELETE USING (true);



CREATE POLICY "Anyone can insert" ON "public"."group" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can insert" ON "public"."user_group" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can select" ON "public"."group" FOR SELECT USING (true);



CREATE POLICY "Anyone can select" ON "public"."match_preference" FOR SELECT USING (true);



CREATE POLICY "Anyone can select" ON "public"."user_group" FOR SELECT USING (true);



CREATE POLICY "Enable delete for users based on user_id" ON "public"."users" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."match_preference" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."users" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."verification_request" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable read access for all users" ON "public"."verification_request" FOR SELECT USING (true);



CREATE POLICY "Enable update for all users" ON "public"."verification_request" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable update for users" ON "public"."users" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."admin" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."admin" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_preference" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_group" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."verification_request" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."group";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."match_preference";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."user_group";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."verification_request";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."check_email_confirmation"("p_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_email_confirmation"("p_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_email_confirmation"("p_email" "text") TO "service_role";



























GRANT ALL ON TABLE "public"."admin" TO "anon";
GRANT ALL ON TABLE "public"."admin" TO "authenticated";
GRANT ALL ON TABLE "public"."admin" TO "service_role";



GRANT ALL ON TABLE "public"."confirmed_view" TO "anon";
GRANT ALL ON TABLE "public"."confirmed_view" TO "authenticated";
GRANT ALL ON TABLE "public"."confirmed_view" TO "service_role";



GRANT ALL ON TABLE "public"."group" TO "anon";
GRANT ALL ON TABLE "public"."group" TO "authenticated";
GRANT ALL ON TABLE "public"."group" TO "service_role";



GRANT ALL ON TABLE "public"."match_preference" TO "anon";
GRANT ALL ON TABLE "public"."match_preference" TO "authenticated";
GRANT ALL ON TABLE "public"."match_preference" TO "service_role";



GRANT ALL ON TABLE "public"."user_group" TO "anon";
GRANT ALL ON TABLE "public"."user_group" TO "authenticated";
GRANT ALL ON TABLE "public"."user_group" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."verification_request" TO "anon";
GRANT ALL ON TABLE "public"."verification_request" TO "authenticated";
GRANT ALL ON TABLE "public"."verification_request" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
