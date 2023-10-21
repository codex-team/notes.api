--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3 (Debian 15.3-1.pgdg120+1)
-- Dumped by pg_dump version 15.3

-- Started on 2023-08-15 00:47:36 MSK

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

-- Create role "codex" if it does not exist
DO
$do$
BEGIN
    IF EXISTS (
        SELECT FROM pg_catalog.pg_roles
        WHERE  rolname = 'codex') THEN

        RAISE NOTICE 'Role "my_codexuser" already exists. Skipping.';
    ELSE
        CREATE ROLE codex LOGIN PASSWORD '';
   END IF;
END
$do$;

--
-- TOC entry 222 (class 1259 OID 16441)
-- Name: editor_tools; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.editor_tools (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    class character varying(255) NOT NULL,
    source json NOT NULL
);


ALTER TABLE public.editor_tools OWNER TO codex;

--
-- TOC entry 217 (class 1259 OID 16399)
-- Name: notes; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.notes (
    id integer NOT NULL,
    title character varying(255),
    content json,
    creator_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.notes OWNER TO codex;

--
-- TOC entry 216 (class 1259 OID 16398)
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: codex
--

CREATE SEQUENCE IF NOT EXISTS public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notes_id_seq OWNER TO codex;

--
-- TOC entry 3387 (class 0 OID 0)
-- Dependencies: 216
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codex
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- TOC entry 219 (class 1259 OID 16413)
-- Name: notes_settings; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.notes_settings (
    id integer NOT NULL,
    note_id integer NOT NULL,
    custom_hostname character varying(255),
    public_id character varying(255),
    enabled boolean DEFAULT true NOT NULL
);


ALTER TABLE public.notes_settings OWNER TO codex;

--
-- TOC entry 218 (class 1259 OID 16412)
-- Name: notes_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: codex
--

CREATE SEQUENCE IF NOT EXISTS public.notes_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notes_settings_id_seq OWNER TO codex;

--
-- TOC entry 3388 (class 0 OID 0)
-- Dependencies: 218
-- Name: notes_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codex
--

ALTER SEQUENCE public.notes_settings_id_seq OWNED BY public.notes_settings.id;


--
-- TOC entry 221 (class 1259 OID 16428)
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    refresh_token character varying(255) NOT NULL,
    refresh_token_expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO codex;

--
-- TOC entry 220 (class 1259 OID 16427)
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: codex
--

CREATE SEQUENCE IF NOT EXISTS public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_sessions_id_seq OWNER TO codex;

--
-- TOC entry 3389 (class 0 OID 0)
-- Dependencies: 220
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codex
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- TOC entry 215 (class 1259 OID 16388)
-- Name: users; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    photo character varying(255),
    extensions json
);


ALTER TABLE public.users OWNER TO codex;

--
-- TOC entry 214 (class 1259 OID 16387)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: codex
--

CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO codex;

--
-- TOC entry 3390 (class 0 OID 0)
-- Dependencies: 214
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codex
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3219 (class 2604 OID 16402)
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- TOC entry 3220 (class 2604 OID 16416)
-- Name: notes_settings id; Type: DEFAULT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.notes_settings ALTER COLUMN id SET DEFAULT nextval('public.notes_settings_id_seq'::regclass);


--
-- TOC entry 3222 (class 2604 OID 16431)
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- TOC entry 3218 (class 2604 OID 16391)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3236 (class 2606 OID 16447)
-- Name: editor_tools editor_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.editor_tools DROP CONSTRAINT IF EXISTS editor_tools_pkey;
ALTER TABLE ONLY public.editor_tools
    ADD CONSTRAINT editor_tools_pkey PRIMARY KEY (id);


--
-- TOC entry 3228 (class 2606 OID 16406)
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.notes DROP CONSTRAINT IF EXISTS notes_pkey cascade;
ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- TOC entry 3230 (class 2606 OID 16421)
-- Name: notes_settings notes_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.notes_settings DROP CONSTRAINT IF EXISTS notes_settings_pkey;
ALTER TABLE ONLY public.notes_settings
    ADD CONSTRAINT notes_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3232 (class 2606 OID 16433)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;
ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3234 (class 2606 OID 16435)
-- Name: user_sessions user_sessions_refresh_token_key; Type: CONSTRAINT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_refresh_token_key;
ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_refresh_token_key UNIQUE (refresh_token);


--
-- TOC entry 3224 (class 2606 OID 16397)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3226 (class 2606 OID 16395)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey cascade;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3237 (class 2606 OID 16407)
-- Name: notes notes_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.notes DROP CONSTRAINT IF EXISTS notes_creator_id_fkey;
ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- TOC entry 3238 (class 2606 OID 16422)
-- Name: notes_settings notes_settings_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.notes_settings DROP CONSTRAINT IF EXISTS notes_settings_note_id_fkey;
ALTER TABLE ONLY public.notes_settings
    ADD CONSTRAINT notes_settings_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3239 (class 2606 OID 16436)
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--

ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;
ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2023-08-15 00:47:36 MSK

--
-- PostgreSQL database dump complete
--

