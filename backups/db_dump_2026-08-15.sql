--
-- PostgreSQL database dump
--

\restrict gMjlAhktJc069w7J3ta6nOJOms7qmoOpnxgNUeTrOc5aQYBt0abujfjiR6YIwTC

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

ALTER TABLE IF EXISTS ONLY public.telegram_settings DROP CONSTRAINT IF EXISTS telegram_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.applications DROP CONSTRAINT IF EXISTS applications_pkey;
ALTER TABLE IF EXISTS ONLY public.applications DROP CONSTRAINT IF EXISTS applications_phone_unique;
ALTER TABLE IF EXISTS public.telegram_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.site_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.applications ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.telegram_settings_id_seq;
DROP TABLE IF EXISTS public.telegram_settings;
DROP SEQUENCE IF EXISTS public.site_settings_id_seq;
DROP TABLE IF EXISTS public.site_settings;
DROP SEQUENCE IF EXISTS public.applications_id_seq;
DROP TABLE IF EXISTS public.applications;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    job_type character varying(50) NOT NULL,
    loan_amount character varying(50),
    loan_purpose character varying(100),
    residence_type character varying(50),
    annual_income character varying(50),
    credit_score character varying(50),
    message text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    kakao_link text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: telegram_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telegram_settings (
    id integer NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    bot_token text,
    chat_id text,
    chat_name text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: telegram_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.telegram_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: telegram_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.telegram_settings_id_seq OWNED BY public.telegram_settings.id;


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: telegram_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_settings ALTER COLUMN id SET DEFAULT nextval('public.telegram_settings_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.applications (id, name, phone, job_type, loan_amount, loan_purpose, residence_type, annual_income, credit_score, message, status, created_at) FROM stdin;
3	김서하	01099439212	개인사업자	3천~5천만원	운영자금	경기도	430219218	현재연체:아니오, 1년이내:아니오	{"성별":"여성","연령대":"50대","사업기간":"3년 이상","업종":"제조업","업태":"전자부품","2024년매출":"375686277","월평균매출":"7000만원","기존대출건수":"4건 이상","기존대출총잔액":"5,000만~1억원","대출종류":"담보대출","현재연체":"아니오","1년이내연체":"아니오","자금용도기타":""}	pending	2026-07-30 04:55:08.540533
4	지옥녀	01095382781	법인사업자	5천만원~1억원	여유자금 확보, 신규 사업 및 사업 확장, 차량 구입 (사업용)	인천광역시	0	현재연체:아니오, 1년이내:아니오	{"성별":"여성","연령대":"50대","사업기간":"3년 이상","업종":"일반사무","업태":"기장. 조정","2024년매출":"0","월평균매출":"0","기존대출건수":"1건","기존대출총잔액":"1,000만원 미만","대출종류":"개인신용대출","현재연체":"아니오","1년이내연체":"아니오","자금용도기타":""}	pending	2026-07-30 04:59:57.66229
5	권혜숙	01092459066	개인사업자	3천~5천만원	기존 대출 대환	경기도	5900	현재연체:아니오, 1년이내:아니오	{"성별":"여성","연령대":"40대","사업기간":"2~3년","업종":"도소매","업태":"의류","2024년매출":"5천","월평균매출":"15","기존대출건수":"3건","기존대출총잔액":"3,000~5,000만원","대출종류":"개인신용대출, 사업자대출","현재연체":"아니오","1년이내연체":"아니오","자금용도기타":""}	pending	2026-07-30 06:19:13.202538
6	신현봉	01053618393	개인사업자	1천~3천만원	운영자금, 시설자금 (장비·기계 구입)	강원특별자치도	1억	현재연체:아니오, 1년이내:아니오	{"성별":"남성","연령대":"50대","사업기간":"6개월~1년","업종":"소매업","업태":"휴게음식점 ","2024년매출":"7천","월평균매출":"1500만눤","기존대출건수":"2건","기존대출총잔액":"1,000~3,000만원","대출종류":"사업자대출","현재연체":"아니오","1년이내연체":"아니오","자금용도기타":""}	pending	2026-07-30 06:31:25.353259
7	김종대	01053836817	개인사업자	1천~3천만원	기존 대출 대환	대구광역시	모름	현재연체:예, 1년이내:예	{"성별":"남성","연령대":"60대 이상","사업기간":"3년 이상","업종":"택배","업태":"서비스업","2024년매출":"모름","월평균매출":"300","기존대출건수":"3건","기존대출총잔액":"1억원 이상","대출종류":"담보대출","현재연체":"예","1년이내연체":"예","자금용도기타":""}	pending	2026-07-30 08:07:36.921606
8	김택선	01054966798	개인사업자	1천~3천만원	운영자금	경기도	약8천만	현재연체:아니오, 1년이내:아니오	{"성별":"남성","연령대":"60대 이상","사업기간":"3년 이상","업종":"건설 창호","업태":"하도급","2024년매출":"약8천만","월평균매출":"","기존대출건수":"없음","기존대출총잔액":"","대출종류":"","현재연체":"아니오","1년이내연체":"아니오","자금용도기타":""}	pending	2026-07-30 10:00:58.383831
9	김소희	01097837047	개인사업자	1천~3천만원	운영자금	인천광역시	\N	현재연체:예, 1년이내:예	{"성별":"여성","연령대":"50대","사업기간":"2~3년","업종":"제조업","업태":"천막","2024년매출":"","월평균매출":"","기존대출건수":"없음","기존대출총잔액":"","대출종류":"","현재연체":"예","1년이내연체":"예","자금용도기타":""}	pending	2026-07-31 01:50:31.434859
10	이동찬	01062282791	개인사업자	1천~3천만원	운영자금	인천광역시	1억8천5백	현재연체:아니오, 1년이내:아니오	{"성별":"남성","연령대":"60대 이상","사업기간":"3년 이상","업종":"건설업","업태":"건설 ,철강재설치,판넬","2024년매출":"2억5천7백","월평균매출":"2,000만원","기존대출건수":"4건 이상","기존대출총잔액":"1억원 이상","대출종류":"사업자대출, 담보대출, 현금서비스, 개인신용대출","현재연체":"아니오","1년이내연체":"아니오","자금용도기타":""}	pending	2026-07-31 05:10:41.259717
11	손성율	01030520025	개인사업자	1천~3천만원	운영자금	부산광역시	\N	현재연체:아니오, 1년이내:아니오	{"성별":"남성","연령대":"60대 이상","사업기간":"6개월~1년","업종":"건설업","업태":"철거","2024년매출":"","월평균매출":"","기존대출건수":"","기존대출총잔액":"1,000~3,000만원","대출종류":"사업자대출","현재연체":"아니오","1년이내연체":"아니오","자금용도기타":""}	pending	2026-08-03 07:31:28.135423
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, kakao_link, updated_at) FROM stdin;
1	\N	2026-06-11 03:26:25.526
\.


--
-- Data for Name: telegram_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.telegram_settings (id, enabled, bot_token, chat_id, chat_name, updated_at) FROM stdin;
\.


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.applications_id_seq', 11, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1, true);


--
-- Name: telegram_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.telegram_settings_id_seq', 1, false);


--
-- Name: applications applications_phone_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_phone_unique UNIQUE (phone);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: telegram_settings telegram_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_settings
    ADD CONSTRAINT telegram_settings_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict gMjlAhktJc069w7J3ta6nOJOms7qmoOpnxgNUeTrOc5aQYBt0abujfjiR6YIwTC

