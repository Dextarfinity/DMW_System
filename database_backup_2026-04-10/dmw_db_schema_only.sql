--
-- PostgreSQL database dump
--

\restrict 9y85ff5Gz2LUV0zxk5XKleR9Heny3oKrzPMgDHqz19jLGmuftuqrRTyKQnOcrUD

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: abstract_quotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.abstract_quotations (
    id integer NOT NULL,
    abstract_id integer,
    supplier_id integer,
    bid_amount numeric(12,2) DEFAULT 0,
    is_compliant boolean DEFAULT false,
    remarks text,
    rank_no integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    supplier_name text
);


--
-- Name: abstract_quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.abstract_quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: abstract_quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.abstract_quotations_id_seq OWNED BY public.abstract_quotations.id;


--
-- Name: abstract_quote_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.abstract_quote_items (
    id integer NOT NULL,
    abstract_quotation_id integer,
    item_description text NOT NULL,
    quantity numeric(14,2) DEFAULT 1,
    unit character varying(50),
    unit_price numeric(12,2) DEFAULT 0,
    total_price numeric(12,2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: abstract_quote_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.abstract_quote_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: abstract_quote_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.abstract_quote_items_id_seq OWNED BY public.abstract_quote_items.id;


--
-- Name: abstracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.abstracts (
    id integer NOT NULL,
    abstract_number character varying(50) NOT NULL,
    rfq_id integer,
    date_prepared date,
    purpose text,
    status character varying(30) DEFAULT 'on_going'::character varying,
    recommended_supplier_id integer,
    recommended_amount numeric(12,2) DEFAULT 0,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    item_specifications text,
    recommended_supplier_name text,
    vice_chairperson_id integer,
    bac_member1_id integer,
    bac_member2_id integer,
    bac_member3_id integer,
    bac_secretariat_id integer,
    bac_chairperson_id integer,
    regional_director_id integer,
    bac_secretariat2_id integer,
    CONSTRAINT abstracts_status_check CHECK (((status)::text = ANY (ARRAY[('on_going'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


--
-- Name: abstracts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.abstracts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: abstracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.abstracts_id_seq OWNED BY public.abstracts.id;


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    username character varying(50),
    action character varying(20) NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id integer,
    reference character varying(255),
    description text,
    old_data jsonb,
    new_data jsonb,
    ip_address character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT activity_logs_action_check CHECK (((action)::text = ANY ((ARRAY['CREATE'::character varying, 'READ'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying, 'POST'::character varying, 'UNPOST'::character varying, 'LOGIN'::character varying, 'LOGOUT'::character varying])::text[])))
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(10) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100),
    email character varying(100),
    role character varying(30) NOT NULL,
    dept_id integer,
    employee_id integer,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    secondary_role character varying(30),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'hope'::character varying, 'bac_chair'::character varying, 'bac_secretariat'::character varying, 'twg_member'::character varying, 'division_head'::character varying, 'end_user'::character varying, 'supply_officer'::character varying, 'inspector'::character varying, 'auditor'::character varying, 'manager'::character varying, 'officer'::character varying, 'viewer'::character varying, 'requester'::character varying, 'ppmp_encoder'::character varying, 'ord_manager'::character varying, 'chief_fad'::character varying, 'chief_wrsd'::character varying, 'chief_mwpsd'::character varying, 'chief_mwptd'::character varying, 'budget_consultant'::character varying])::text[])))
);


--
-- Name: activity_logs_view; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.activity_logs_view AS
 SELECT al.id,
    al.user_id,
    al.username,
    COALESCE(u.full_name, al.username) AS full_name,
    COALESCE(u.role, 'unknown'::character varying) AS user_role,
    u.secondary_role AS user_secondary_role,
    COALESCE(d.name, ''::character varying) AS department,
    al.action,
    al.table_name,
    al.record_id,
    al.reference,
    al.description,
    al.old_data,
    al.new_data,
    al.ip_address,
    al.created_at
   FROM ((public.activity_logs al
     LEFT JOIN public.users u ON ((al.user_id = u.id)))
     LEFT JOIN public.departments d ON ((u.dept_id = d.id)))
  ORDER BY al.created_at DESC
  WITH NO DATA;


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    id integer NOT NULL,
    fiscal_year integer NOT NULL,
    app_type character varying(20) DEFAULT 'indicative'::character varying,
    update_count integer DEFAULT 0,
    set_by integer,
    set_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    remarks text,
    consolidated_at timestamp without time zone,
    consolidated_count integer DEFAULT 0,
    CONSTRAINT app_settings_app_type_check CHECK (((app_type)::text = ANY (ARRAY[('indicative'::character varying)::text, ('final'::character varying)::text, ('updated'::character varying)::text])))
);


--
-- Name: app_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.app_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: app_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.app_settings_id_seq OWNED BY public.app_settings.id;


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachments (
    id integer NOT NULL,
    original_name character varying(255) NOT NULL,
    stored_name character varying(255),
    mime_type character varying(120),
    file_size_bytes bigint DEFAULT 0,
    storage_path text,
    checksum_sha256 character varying(64),
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attachments_id_seq OWNED BY public.attachments.id;


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    table_name character varying(50) NOT NULL,
    record_id integer NOT NULL,
    action character varying(20) NOT NULL,
    old_data jsonb,
    new_data jsonb,
    user_id integer,
    ip_address character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT audit_log_action_check CHECK (((action)::text = ANY (ARRAY[('INSERT'::character varying)::text, ('UPDATE'::character varying)::text, ('DELETE'::character varying)::text])))
);


--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: bac_resolutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bac_resolutions (
    id integer NOT NULL,
    resolution_number character varying(50) NOT NULL,
    abstract_id integer,
    resolution_date date,
    procurement_mode character varying(30) DEFAULT 'SVP'::character varying,
    abc_amount numeric(12,2) DEFAULT 0,
    recommended_supplier_id integer,
    recommended_awardee_name character varying(255),
    bid_amount numeric(12,2) DEFAULT 0,
    philgeps_required boolean DEFAULT false,
    philgeps_posted_from date,
    philgeps_posted_until date,
    status character varying(30) DEFAULT 'on_going'::character varying,
    created_by integer,
    approved_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_at timestamp without time zone,
    bac_chairperson_id integer,
    bac_vice_chairperson_id integer,
    bac_member1_id integer,
    bac_member2_id integer,
    bac_member3_id integer,
    hope_id integer,
    bac_resolution_type character varying(50) DEFAULT 'WINNER_DETERMINATION'::character varying,
    bidder_type character varying(100) DEFAULT 'LOWEST CALCULATED AND RESPONSIVE (LCRB)'::character varying,
    subject text,
    description text,
    bidders jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT bac_resolutions_bac_resolution_type_check CHECK (((bac_resolution_type)::text = ANY ((ARRAY['MODE_DETERMINATION'::character varying, 'WINNER_DETERMINATION'::character varying])::text[]))),
    CONSTRAINT bac_resolutions_procurement_mode_check CHECK (((procurement_mode)::text = ANY (ARRAY[('SVP'::character varying)::text, ('SVPDC'::character varying)::text, ('DC_SHOPPING'::character varying)::text, ('OTHERS'::character varying)::text]))),
    CONSTRAINT bac_resolutions_status_check CHECK (((status)::text = ANY (ARRAY[('on_going'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


--
-- Name: bac_resolutions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bac_resolutions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bac_resolutions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bac_resolutions_id_seq OWNED BY public.bac_resolutions.id;


--
-- Name: coa_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coa_submissions (
    id integer NOT NULL,
    submission_number character varying(50) NOT NULL,
    po_id integer,
    iar_id integer,
    po_packet_id integer,
    submission_date date,
    received_by_coa character varying(120),
    coa_receipt_date date,
    status character varying(20) DEFAULT 'submitted'::character varying,
    documents_included jsonb DEFAULT '{}'::jsonb,
    coa_packet_attachment_id integer,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT coa_submissions_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('submitted'::character varying)::text, ('received'::character varying)::text, ('returned'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


--
-- Name: coa_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coa_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coa_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coa_submissions_id_seq OWNED BY public.coa_submissions.id;


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: designations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.designations (
    id integer NOT NULL,
    code character varying(50),
    name character varying(200) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: designations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.designations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: designations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.designations_id_seq OWNED BY public.designations.id;


--
-- Name: divisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisions (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    abbreviation character varying(20)
);


--
-- Name: divisions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.divisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: divisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.divisions_id_seq OWNED BY public.divisions.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    employee_code character varying(50),
    full_name character varying(200) NOT NULL,
    designation_id integer,
    dept_id integer,
    email character varying(100),
    phone character varying(50),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT employees_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: entity_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_attachments (
    id integer NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer NOT NULL,
    attachment_id integer,
    description text,
    is_required boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: entity_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entity_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entity_attachments_id_seq OWNED BY public.entity_attachments.id;


--
-- Name: fund_clusters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fund_clusters (
    id integer NOT NULL,
    code character varying(50),
    name character varying(200) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: fund_clusters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fund_clusters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fund_clusters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fund_clusters_id_seq OWNED BY public.fund_clusters.id;


--
-- Name: iar_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.iar_items (
    id integer NOT NULL,
    iar_id integer,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200),
    quantity integer DEFAULT 1 NOT NULL,
    unit_cost numeric(12,2) DEFAULT 0,
    category character varying(100),
    brand character varying(100),
    model character varying(100),
    serial_no character varying(100),
    ppe_no character varying(100),
    inventory_no character varying(100),
    generated_item_id character varying(50),
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    item_description text,
    procurement_source character varying(20)
);


--
-- Name: iar_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.iar_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: iar_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.iar_items_id_seq OWNED BY public.iar_items.id;


--
-- Name: iars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.iars (
    id integer NOT NULL,
    iar_number character varying(50) NOT NULL,
    po_id integer,
    inspection_date date,
    delivery_date date,
    invoice_number character varying(80),
    invoice_date date,
    delivery_receipt_number character varying(80),
    inspection_result character varying(30) DEFAULT 'on_going'::character varying,
    findings text,
    purpose text,
    inspected_by integer,
    date_inspected date,
    received_by integer,
    date_received date,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    acceptance character varying(30) DEFAULT 'to_be_checked'::character varying,
    item_specifications text,
    CONSTRAINT iars_acceptance_check CHECK (((acceptance)::text = ANY (ARRAY[('to_be_checked'::character varying)::text, ('complete'::character varying)::text, ('partial'::character varying)::text]))),
    CONSTRAINT iars_inspection_result_check CHECK (((inspection_result)::text = ANY (ARRAY[('to_be_checked'::character varying)::text, ('on_going'::character varying)::text, ('verified'::character varying)::text])))
);


--
-- Name: iars_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.iars_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: iars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.iars_id_seq OWNED BY public.iars.id;


--
-- Name: inventory_custodian_slips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_custodian_slips (
    id integer NOT NULL,
    ics_no character varying(100),
    date_of_issue date,
    property_number character varying(100),
    description text,
    inventory_no character varying(100),
    ppe_no character varying(100),
    issued_to character varying(255),
    issued_to_employee_id integer,
    received_by_employee_id integer,
    received_by_position character varying(255),
    other_info text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: inventory_custodian_slips_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_custodian_slips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_custodian_slips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_custodian_slips_id_seq OWNED BY public.inventory_custodian_slips.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    stock_no character varying(50),
    name character varying(200) NOT NULL,
    description text,
    unit character varying(50) NOT NULL,
    unit_price numeric(12,2) DEFAULT 0,
    category character varying(100),
    uacs_code character varying(50),
    quantity integer DEFAULT 0,
    reorder_point integer DEFAULT 0,
    gam_classification character varying(100),
    semi_expendable_classification character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    procurement_source character varying(20) DEFAULT 'NON PS-DBM'::character varying
);


--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: notices_of_award; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notices_of_award (
    id integer NOT NULL,
    noa_number character varying(50) NOT NULL,
    bac_resolution_id integer,
    supplier_id integer,
    contract_amount numeric(12,2) DEFAULT 0,
    date_issued date,
    bidder_receipt_date date,
    status character varying(30) DEFAULT 'awaiting_noa'::character varying,
    created_by integer,
    approved_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rfq_id integer,
    supplier_name text,
    CONSTRAINT notices_of_award_status_check CHECK (((status)::text = ANY ((ARRAY['awaiting_noa'::character varying, 'with_noa'::character varying, 'issued'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: notices_of_award_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notices_of_award_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notices_of_award_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notices_of_award_id_seq OWNED BY public.notices_of_award.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(30) DEFAULT 'info'::character varying NOT NULL,
    icon character varying(50) DEFAULT 'fas fa-bell'::character varying,
    title character varying(200) NOT NULL,
    message text,
    reference_type character varying(50),
    reference_id integer,
    reference_code character varying(50),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: offices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offices (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: offices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: offices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offices_id_seq OWNED BY public.offices.id;


--
-- Name: pap_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pap_items (
    id integer NOT NULL,
    pap_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    product_category character varying(100),
    account_code character varying(50),
    product_description text,
    available_at character varying(100),
    quantity numeric(12,2) DEFAULT 0,
    uom character varying(50),
    unit_price numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) DEFAULT 0,
    procurement_source character varying(20) DEFAULT 'NON PS-DBM'::character varying,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: pap_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pap_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pap_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pap_items_id_seq OWNED BY public.pap_items.id;


--
-- Name: paps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paps (
    id integer NOT NULL,
    pap_code character varying(50),
    pap_name character varying(255) NOT NULL,
    description text,
    dept_id integer,
    fiscal_year integer DEFAULT EXTRACT(year FROM CURRENT_DATE),
    estimated_budget numeric(12,2) DEFAULT 0,
    account_code character varying(50),
    quarter integer DEFAULT 0,
    mop character varying(100),
    centralize boolean DEFAULT false,
    period_jan boolean DEFAULT false,
    period_feb boolean DEFAULT false,
    period_mar boolean DEFAULT false,
    period_apr boolean DEFAULT false,
    period_may boolean DEFAULT false,
    period_jun boolean DEFAULT false,
    period_jul boolean DEFAULT false,
    period_aug boolean DEFAULT false,
    period_sep boolean DEFAULT false,
    period_oct boolean DEFAULT false,
    period_nov boolean DEFAULT false,
    period_dec boolean DEFAULT false,
    status character varying(20) DEFAULT 'active'::character varying,
    created_by integer,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT paps_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: paps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paps_id_seq OWNED BY public.paps.id;


--
-- Name: plan_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_items (
    id integer NOT NULL,
    plan_id integer,
    item_code character varying(50) NOT NULL,
    item_name character varying(200) NOT NULL,
    item_description text,
    unit character varying(50) NOT NULL,
    unit_price numeric(12,2) DEFAULT 0,
    category character varying(100),
    q1_qty integer DEFAULT 0,
    q1_status character varying(20) DEFAULT 'pending'::character varying,
    q2_qty integer DEFAULT 0,
    q2_status character varying(20) DEFAULT 'pending'::character varying,
    q3_qty integer DEFAULT 0,
    q3_status character varying(20) DEFAULT 'pending'::character varying,
    q4_qty integer DEFAULT 0,
    q4_status character varying(20) DEFAULT 'pending'::character varying,
    total_qty integer GENERATED ALWAYS AS ((((COALESCE(q1_qty, 0) + COALESCE(q2_qty, 0)) + COALESCE(q3_qty, 0)) + COALESCE(q4_qty, 0))) STORED,
    total_price numeric(12,2) GENERATED ALWAYS AS ((((((COALESCE(q1_qty, 0) + COALESCE(q2_qty, 0)) + COALESCE(q3_qty, 0)) + COALESCE(q4_qty, 0)))::numeric * unit_price)) STORED,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: plan_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plan_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plan_items_id_seq OWNED BY public.plan_items.id;


--
-- Name: po_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_items (
    id integer NOT NULL,
    po_id integer,
    item_id integer,
    item_code character varying(50) NOT NULL,
    item_name character varying(200) NOT NULL,
    item_description text,
    unit character varying(50) NOT NULL,
    uom character varying(50),
    category character varying(100),
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) DEFAULT 0 NOT NULL,
    total_price numeric(12,2) GENERATED ALWAYS AS (((quantity)::numeric * unit_price)) STORED,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    procurement_source character varying(20)
);


--
-- Name: po_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.po_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: po_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.po_items_id_seq OWNED BY public.po_items.id;


--
-- Name: po_packets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_packets (
    id integer NOT NULL,
    po_id integer,
    status character varying(20) DEFAULT 'draft'::character varying,
    compiled_at timestamp without time zone,
    compiled_by integer,
    chief_signed_at timestamp without time zone,
    chief_signed_by integer,
    director_signed_at timestamp without time zone,
    director_signed_by integer,
    packet_attachment_id integer,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT po_packets_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('for_signing'::character varying)::text, ('signed'::character varying)::text, ('submitted_to_coa'::character varying)::text, ('cancelled'::character varying)::text])))
);


--
-- Name: po_packets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.po_packets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: po_packets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.po_packets_id_seq OWNED BY public.po_packets.id;


--
-- Name: post_qualifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_qualifications (
    id integer NOT NULL,
    postqual_number character varying(50) NOT NULL,
    abstract_id integer,
    bidder_name character varying(200),
    documents_verified jsonb DEFAULT '{}'::jsonb,
    technical_compliance text,
    financial_validation text,
    twg_result text,
    findings text,
    status character varying(30) DEFAULT 'on_going'::character varying,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    twg_head_id integer,
    twg_member1_id integer,
    twg_member2_id integer,
    twg_member3_id integer,
    twg_member4_id integer,
    bidder1_supplier_id integer,
    bidder2_supplier_id integer,
    bidder3_supplier_id integer,
    bidder1_name text,
    bidder2_name text,
    bidder3_name text,
    CONSTRAINT post_qualifications_status_check CHECK (((status)::text = ANY (ARRAY[('on_going'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


--
-- Name: post_qualifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.post_qualifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: post_qualifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.post_qualifications_id_seq OWNED BY public.post_qualifications.id;


--
-- Name: ppmp_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ppmp_categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    section_id integer NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ppmp_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ppmp_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppmp_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ppmp_categories_id_seq OWNED BY public.ppmp_categories.id;


--
-- Name: ppmp_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ppmp_sections (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ppmp_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ppmp_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppmp_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ppmp_sections_id_seq OWNED BY public.ppmp_sections.id;


--
-- Name: pr_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pr_items (
    id integer NOT NULL,
    pr_id integer,
    item_code character varying(50) NOT NULL,
    item_name character varying(200) NOT NULL,
    item_description text,
    unit character varying(50) NOT NULL,
    category character varying(100),
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) DEFAULT 0 NOT NULL,
    total_price numeric(12,2) GENERATED ALWAYS AS (((quantity)::numeric * unit_price)) STORED,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: pr_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pr_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pr_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pr_items_id_seq OWNED BY public.pr_items.id;


--
-- Name: procurement_modes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procurement_modes (
    id integer NOT NULL,
    code character varying(50),
    name character varying(200) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: procurement_modes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.procurement_modes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: procurement_modes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.procurement_modes_id_seq OWNED BY public.procurement_modes.id;


--
-- Name: procurementplans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procurementplans (
    id integer NOT NULL,
    dept_id integer,
    fiscal_year integer DEFAULT EXTRACT(year FROM CURRENT_DATE),
    status character varying(20) DEFAULT 'draft'::character varying,
    remarks text,
    total_amount numeric(12,2) DEFAULT 0,
    created_by integer,
    approved_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_at timestamp without time zone,
    ppmp_no character varying(50),
    description text,
    project_type character varying(50) DEFAULT 'Goods'::character varying,
    quantity_size character varying(200),
    procurement_mode character varying(100) DEFAULT 'Small Value Procurement'::character varying,
    pre_procurement character varying(10) DEFAULT 'NO'::character varying,
    start_date character varying(50),
    end_date character varying(50),
    delivery_period character varying(100),
    fund_source character varying(100) DEFAULT 'GAA'::character varying,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    deleted_reason text,
    approved_by_chief integer,
    approved_by_hope integer,
    chief_approved_at timestamp without time zone,
    hope_approved_at timestamp without time zone,
    category character varying(200),
    item_id integer,
    section character varying(200),
    item_description text,
    pap_id integer,
    procurement_source character varying(20) DEFAULT 'NON PS-DBM'::character varying,
    approved_by_budget integer,
    budget_approved_at timestamp without time zone,
    declined_by integer,
    declined_at timestamp without time zone,
    decline_reason text,
    CONSTRAINT procurementplans_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('pending'::character varying)::text, ('submitted'::character varying)::text, ('approved'::character varying)::text, ('rejected'::character varying)::text, ('completed'::character varying)::text])))
);


--
-- Name: procurementplans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.procurementplans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: procurementplans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.procurementplans_id_seq OWNED BY public.procurementplans.id;


--
-- Name: property_acknowledgement_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_acknowledgement_receipts (
    id integer NOT NULL,
    par_no character varying(100) NOT NULL,
    ppe_no character varying(100),
    description text,
    issued_to character varying(255),
    issued_to_employee_id integer,
    date_of_issue date NOT NULL,
    received_from_id integer,
    received_from_position character varying(255),
    received_by_id integer,
    received_by_position character varying(255),
    other_info text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: property_acknowledgement_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.property_acknowledgement_receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: property_acknowledgement_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.property_acknowledgement_receipts_id_seq OWNED BY public.property_acknowledgement_receipts.id;


--
-- Name: property_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_cards (
    id integer NOT NULL,
    property_number character varying(100),
    item_id integer,
    description text,
    acquisition_cost numeric(15,2) DEFAULT 0,
    acquisition_date date,
    issued_to character varying(255),
    issued_to_employee_id integer,
    issued_date date,
    received_date date,
    ics_no character varying(100),
    status character varying(50) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: property_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.property_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: property_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.property_cards_id_seq OWNED BY public.property_cards.id;


--
-- Name: property_ledger_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_ledger_cards (
    id integer NOT NULL,
    property_number character varying(100),
    description text,
    acquisition_date date,
    acquisition_cost numeric(15,2) DEFAULT 0,
    transaction_no integer NOT NULL,
    date date NOT NULL,
    reference character varying(255),
    receipt_qty integer DEFAULT 0,
    receipt_unit_cost numeric(15,2) DEFAULT 0,
    receipt_total_cost numeric(15,2) DEFAULT 0,
    issue_qty integer DEFAULT 0,
    issue_unit_cost numeric(15,2) DEFAULT 0,
    issue_total_cost numeric(15,2) DEFAULT 0,
    balance_qty integer DEFAULT 0,
    balance_unit_cost numeric(15,2) DEFAULT 0,
    balance_total_cost numeric(15,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: property_ledger_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.property_ledger_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: property_ledger_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.property_ledger_cards_id_seq OWNED BY public.property_ledger_cards.id;


--
-- Name: property_transfer_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_transfer_reports (
    id integer NOT NULL,
    ptr_no character varying(100) NOT NULL,
    date date NOT NULL,
    from_accountable_officer_id integer,
    from_accountable_officer_name character varying(255),
    to_accountable_officer_id integer,
    to_accountable_officer_name character varying(255),
    description text,
    property_number character varying(100),
    acquisition_cost numeric(15,2),
    status character varying(50) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT property_transfer_reports_status_check CHECK (((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Completed'::character varying)::text, ('Cancelled'::character varying)::text])))
);


--
-- Name: property_transfer_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.property_transfer_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: property_transfer_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.property_transfer_reports_id_seq OWNED BY public.property_transfer_reports.id;


--
-- Name: purchaseorders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchaseorders (
    id integer NOT NULL,
    po_number character varying(50) NOT NULL,
    pr_id integer,
    noa_id integer,
    supplier_id integer,
    total_amount numeric(12,2) DEFAULT 0,
    status character varying(30) DEFAULT 'for_signing'::character varying,
    workflow_status character varying(30) DEFAULT 'pending'::character varying,
    expected_delivery_date date,
    delivery_date date,
    delivery_address text,
    payment_terms character varying(100),
    po_date date,
    purpose text,
    mode_of_procurement character varying(100),
    place_of_delivery text,
    accepted_at timestamp without time zone,
    accepted_by integer,
    supplier_conforme_attachment_id integer,
    delivered_at timestamp without time zone,
    delivered_by integer,
    payment_status character varying(20) DEFAULT 'unpaid'::character varying,
    payment_date date,
    ada_reference_no character varying(100),
    created_by integer,
    approved_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_at timestamp without time zone,
    item_specifications text,
    CONSTRAINT purchaseorders_payment_status_check CHECK (((payment_status)::text = ANY (ARRAY[('unpaid'::character varying)::text, ('for_payment'::character varying)::text, ('paid_ada'::character varying)::text]))),
    CONSTRAINT purchaseorders_status_check CHECK (((status)::text = ANY (ARRAY[('for_signing'::character varying)::text, ('signed'::character varying)::text, ('cancelled'::character varying)::text]))),
    CONSTRAINT purchaseorders_workflow_status_check CHECK (((workflow_status)::text = ANY (ARRAY[('pending'::character varying)::text, ('on_process'::character varying)::text, ('awaiting_delivery'::character varying)::text, ('for_payment'::character varying)::text, ('paid_ada'::character varying)::text, ('for_signing'::character varying)::text, ('signed'::character varying)::text, ('submitted_to_coa'::character varying)::text, ('cancelled'::character varying)::text])))
);


--
-- Name: purchaseorders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchaseorders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchaseorders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchaseorders_id_seq OWNED BY public.purchaseorders.id;


--
-- Name: purchaserequests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchaserequests (
    id integer NOT NULL,
    pr_number character varying(50) NOT NULL,
    dept_id integer,
    purpose text,
    total_amount numeric(12,2) DEFAULT 0,
    status character varying(30) DEFAULT 'pending_approval'::character varying,
    requested_by integer,
    approved_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_at timestamp without time zone,
    item_specifications text,
    procurement_source character varying(20),
    CONSTRAINT purchaserequests_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'pending_approval'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: purchaserequests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchaserequests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchaserequests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchaserequests_id_seq OWNED BY public.purchaserequests.id;


--
-- Name: received_capital_outlay_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.received_capital_outlay_items (
    id integer NOT NULL,
    item_id integer,
    generated_item_id character varying(50),
    item_description text,
    ppe_no character varying(100),
    serial_no character varying(100),
    issued_to character varying(255),
    issued_to_employee_id integer,
    brand character varying(100),
    model character varying(100),
    status character varying(50) DEFAULT 'Available'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT received_capital_outlay_items_status_check CHECK (((status)::text = ANY (ARRAY[('Available'::character varying)::text, ('Issued'::character varying)::text, ('For Repair'::character varying)::text, ('Unserviceable'::character varying)::text, ('Disposed'::character varying)::text])))
);


--
-- Name: received_capital_outlay_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.received_capital_outlay_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: received_capital_outlay_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.received_capital_outlay_items_id_seq OWNED BY public.received_capital_outlay_items.id;


--
-- Name: received_semi_expendable_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.received_semi_expendable_items (
    id integer NOT NULL,
    item_id integer,
    generated_item_id character varying(50),
    item_description text,
    inventory_no character varying(100),
    ics_no character varying(100),
    ppe_no character varying(100),
    serial_no character varying(100),
    issued_to character varying(255),
    issued_to_employee_id integer,
    brand character varying(100),
    model character varying(100),
    status character varying(50) DEFAULT 'Available'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT received_semi_expendable_items_status_check CHECK (((status)::text = ANY (ARRAY[('Available'::character varying)::text, ('Issued'::character varying)::text, ('For Repair'::character varying)::text, ('Unserviceable'::character varying)::text, ('Disposed'::character varying)::text])))
);


--
-- Name: received_semi_expendable_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.received_semi_expendable_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: received_semi_expendable_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.received_semi_expendable_items_id_seq OWNED BY public.received_semi_expendable_items.id;


--
-- Name: requisition_issue_slips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requisition_issue_slips (
    id integer NOT NULL,
    ris_no character varying(100) NOT NULL,
    division character varying(255),
    ris_date date NOT NULL,
    purpose text,
    requested_by_id integer,
    requested_by_name character varying(255),
    requested_by_designation character varying(255),
    approved_by_id integer,
    approved_by_name character varying(255),
    approved_by_designation character varying(255),
    issued_by_id integer,
    issued_by_name character varying(255),
    issued_by_designation character varying(255),
    received_by_id integer,
    received_by_name character varying(255),
    received_by_designation character varying(255),
    status character varying(20) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    category character varying(255),
    ris_type character varying(50) DEFAULT 'NORMAL'::character varying,
    approved_by_supply_id integer,
    is_priority boolean DEFAULT false,
    remarks text,
    CONSTRAINT requisition_issue_slips_ris_type_check CHECK (((ris_type)::text = ANY ((ARRAY['NORMAL'::character varying, 'EMERGENCY'::character varying, 'REPLACEMENT'::character varying])::text[]))),
    CONSTRAINT requisition_issue_slips_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('POSTED'::character varying)::text, ('CANCELLED'::character varying)::text])))
);


--
-- Name: COLUMN requisition_issue_slips.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.requisition_issue_slips.category IS 'Item category (from ppmp_categories)';


--
-- Name: COLUMN requisition_issue_slips.ris_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.requisition_issue_slips.ris_type IS 'Type of requisition (NORMAL, EMERGENCY, REPLACEMENT)';


--
-- Name: COLUMN requisition_issue_slips.approved_by_supply_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.requisition_issue_slips.approved_by_supply_id IS 'Supply officer who approved the RIS';


--
-- Name: COLUMN requisition_issue_slips.is_priority; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.requisition_issue_slips.is_priority IS 'Whether this is a priority requisition';


--
-- Name: COLUMN requisition_issue_slips.remarks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.requisition_issue_slips.remarks IS 'Additional remarks or notes';


--
-- Name: requisition_issue_slips_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.requisition_issue_slips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: requisition_issue_slips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.requisition_issue_slips_id_seq OWNED BY public.requisition_issue_slips.id;


--
-- Name: rfq_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rfq_items (
    id integer NOT NULL,
    rfq_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    item_description text,
    unit character varying(50),
    category character varying(100),
    quantity integer DEFAULT 1 NOT NULL,
    abc_unit_cost numeric(12,2) DEFAULT 0 NOT NULL,
    abc_total_cost numeric(12,2) GENERATED ALWAYS AS (((quantity)::numeric * abc_unit_cost)) STORED,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: rfq_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rfq_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rfq_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rfq_items_id_seq OWNED BY public.rfq_items.id;


--
-- Name: rfq_suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rfq_suppliers (
    id integer NOT NULL,
    rfq_id integer,
    supplier_id integer,
    invited_at date,
    responded boolean DEFAULT false,
    response_received_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: rfq_suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rfq_suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rfq_suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rfq_suppliers_id_seq OWNED BY public.rfq_suppliers.id;


--
-- Name: rfqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rfqs (
    id integer NOT NULL,
    rfq_number character varying(50) NOT NULL,
    pr_id integer,
    date_prepared date,
    submission_deadline date,
    abc_amount numeric(12,2) DEFAULT 0,
    philgeps_required boolean DEFAULT false,
    philgeps_posted_from date,
    philgeps_posted_until date,
    status character varying(30) DEFAULT 'on_going'::character varying,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    item_specifications text,
    manual_supplier_name text,
    manual_supplier_address text,
    manual_supplier_tin text,
    CONSTRAINT rfqs_status_check CHECK (((status)::text = ANY (ARRAY[('on_going'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


--
-- Name: rfqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rfqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rfqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rfqs_id_seq OWNED BY public.rfqs.id;


--
-- Name: ris_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ris_items (
    id integer NOT NULL,
    ris_id integer,
    item_id integer,
    description character varying(255),
    uom character varying(50),
    quantity integer DEFAULT 0 NOT NULL,
    unit_cost numeric(12,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    specification character varying(500),
    available_qty integer DEFAULT 0,
    issue_type character varying(50) DEFAULT 'REMOVAL'::character varying,
    CONSTRAINT ris_items_issue_type_check CHECK (((issue_type)::text = ANY ((ARRAY['REMOVAL'::character varying, 'RETURN'::character varying, 'TRANSFER'::character varying, 'ADJUSTMENT'::character varying])::text[])))
);


--
-- Name: COLUMN ris_items.specification; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ris_items.specification IS 'Item specifications from catalog';


--
-- Name: COLUMN ris_items.available_qty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ris_items.available_qty IS 'Current available stock';


--
-- Name: COLUMN ris_items.issue_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ris_items.issue_type IS 'Type of issue (REMOVAL, RETURN, TRANSFER, ADJUSTMENT)';


--
-- Name: ris_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ris_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ris_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ris_items_id_seq OWNED BY public.ris_items.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id character varying(100) NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: stock_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_cards (
    id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(255),
    transaction_no integer NOT NULL,
    date date NOT NULL,
    reference character varying(255),
    receipt_qty integer DEFAULT 0,
    receipt_unit_cost numeric(15,2) DEFAULT 0,
    receipt_total_cost numeric(15,2) DEFAULT 0,
    issue_qty integer DEFAULT 0,
    issue_unit_cost numeric(15,2) DEFAULT 0,
    issue_total_cost numeric(15,2) DEFAULT 0,
    balance_qty integer DEFAULT 0,
    balance_unit_cost numeric(15,2) DEFAULT 0,
    balance_total_cost numeric(15,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    issue_office character varying(255),
    no_of_days_to_consume integer
);


--
-- Name: stock_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_cards_id_seq OWNED BY public.stock_cards.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    contact_person character varying(100),
    phone character varying(50),
    email character varying(100),
    address text,
    tin character varying(50),
    org_type character varying(50),
    tax_type character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    supplier_name character varying(200) GENERATED ALWAYS AS (name) STORED,
    CONSTRAINT suppliers_org_type_check CHECK (((org_type)::text = ANY (ARRAY[('Government'::character varying)::text, ('Non-Government'::character varying)::text]))),
    CONSTRAINT suppliers_tax_type_check CHECK (((tax_type)::text = ANY (ARRAY[('VAT'::character varying)::text, ('Non-VAT'::character varying)::text])))
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: supplies_ledger_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplies_ledger_cards (
    id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(255),
    transaction_no integer NOT NULL,
    date date NOT NULL,
    reference character varying(255),
    receipt_qty integer DEFAULT 0,
    receipt_unit_cost numeric(15,2) DEFAULT 0,
    receipt_total_cost numeric(15,2) DEFAULT 0,
    issue_qty integer DEFAULT 0,
    issue_unit_cost numeric(15,2) DEFAULT 0,
    issue_total_cost numeric(15,2) DEFAULT 0,
    balance_qty integer DEFAULT 0,
    balance_unit_cost numeric(15,2) DEFAULT 0,
    balance_total_cost numeric(15,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    issue_office character varying(255),
    no_of_days_to_consume integer
);


--
-- Name: supplies_ledger_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supplies_ledger_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supplies_ledger_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supplies_ledger_cards_id_seq OWNED BY public.supplies_ledger_cards.id;


--
-- Name: trip_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trip_tickets (
    id integer NOT NULL,
    trip_ticket_no character varying(100) NOT NULL,
    requesting_party character varying(255),
    date_of_request date,
    date_of_travel date,
    return_date date,
    contact_no character varying(50),
    time_of_departure character varying(20),
    purpose text,
    destination text,
    passengers jsonb DEFAULT '[]'::jsonb,
    requested_by_employee character varying(255),
    requested_by_designation character varying(255),
    approved_by_employee character varying(255),
    approved_by_designation character varying(255),
    status character varying(20) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT trip_tickets_status_check CHECK (((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Completed'::character varying)::text, ('Cancelled'::character varying)::text])))
);


--
-- Name: trip_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trip_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trip_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trip_tickets_id_seq OWNED BY public.trip_tickets.id;


--
-- Name: uacs_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uacs_codes (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    category character varying(100),
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: uacs_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.uacs_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: uacs_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.uacs_codes_id_seq OWNED BY public.uacs_codes.id;


--
-- Name: uoms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uoms (
    id integer NOT NULL,
    abbreviation character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: uoms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.uoms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: uoms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.uoms_id_seq OWNED BY public.uoms.id;


--
-- Name: user_department_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_department_access (
    id integer NOT NULL,
    user_id integer NOT NULL,
    dept_id integer NOT NULL,
    access_type character varying(30) DEFAULT 'ppmp_manage'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_department_access_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_department_access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_department_access_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_department_access_id_seq OWNED BY public.user_department_access.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vw_bac_resolutions_by_phase; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_bac_resolutions_by_phase AS
 SELECT br.id,
    br.resolution_number,
    br.bac_resolution_type AS phase,
        CASE
            WHEN ((br.bac_resolution_type)::text = 'MODE_DETERMINATION'::text) THEN 'Determines Procurement Mode'::text
            WHEN ((br.bac_resolution_type)::text = 'WINNER_DETERMINATION'::text) THEN 'Determines Winning Bidder'::text
            ELSE 'Unknown'::text
        END AS phase_description,
    br.abstract_id,
    ab.abstract_number,
    br.procurement_mode,
    br.recommended_supplier_id,
    br.recommended_awardee_name,
    br.bid_amount,
    br.abc_amount,
    br.status,
    br.resolution_date,
    br.created_by,
    br.created_at,
    br.updated_at
   FROM (public.bac_resolutions br
     LEFT JOIN public.abstracts ab ON ((br.abstract_id = ab.id)))
  ORDER BY br.abstract_id,
        CASE
            WHEN ((br.bac_resolution_type)::text = 'MODE_DETERMINATION'::text) THEN 1
            ELSE 2
        END, br.created_at;


--
-- Name: vw_bac_resolutions_detailed; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_bac_resolutions_detailed AS
 SELECT br.id,
    br.resolution_number,
    br.bac_resolution_type,
    br.abstract_id,
    ab.abstract_number,
    rf.pr_id,
    pr.pr_number,
    br.procurement_mode,
    s.name AS supplier_name,
    s.tin AS supplier_tin,
    s.address AS supplier_address,
    br.recommended_awardee_name,
    br.bid_amount,
    br.abc_amount,
    br.philgeps_required,
    br.status,
    br.resolution_date,
    u.full_name AS created_by_name,
    br.created_at,
    br.updated_at,
    br.approved_at
   FROM (((((public.bac_resolutions br
     LEFT JOIN public.abstracts ab ON ((br.abstract_id = ab.id)))
     LEFT JOIN public.rfqs rf ON ((ab.rfq_id = rf.id)))
     LEFT JOIN public.purchaserequests pr ON ((rf.pr_id = pr.id)))
     LEFT JOIN public.suppliers s ON ((br.recommended_supplier_id = s.id)))
     LEFT JOIN public.users u ON ((br.created_by = u.id)));


--
-- Name: vw_capital_outlay_items; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_capital_outlay_items AS
 SELECT rcoi.id,
    rcoi.item_id,
    rcoi.generated_item_id,
    rcoi.item_description,
    rcoi.ppe_no,
    rcoi.serial_no,
    rcoi.issued_to,
    rcoi.issued_to_employee_id,
    rcoi.brand,
    rcoi.model,
    rcoi.status,
    rcoi.created_at,
    rcoi.updated_at,
    i.name AS item_name,
    i.unit,
    i.unit_price,
    i.uacs_code,
    e.full_name AS issued_to_name
   FROM ((public.received_capital_outlay_items rcoi
     LEFT JOIN public.items i ON ((rcoi.item_id = i.id)))
     LEFT JOIN public.employees e ON ((rcoi.issued_to_employee_id = e.id)));


--
-- Name: vw_ris_items_detail; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_ris_items_detail AS
 SELECT ri.id,
    ri.ris_id,
    ri.item_id,
    ri.description,
    ri.specification,
    ri.uom,
    ri.quantity,
    ri.unit_cost,
    ri.available_qty,
    ri.issue_type,
    i.name AS item_name,
    i.category AS item_category,
    i.quantity AS total_stock,
    (i.quantity - COALESCE(ri.available_qty, 0)) AS issued_qty,
    ri.created_at
   FROM (public.ris_items ri
     LEFT JOIN public.items i ON ((ri.item_id = i.id)))
  ORDER BY ri.created_at DESC;


--
-- Name: vw_ris_with_category; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_ris_with_category AS
 SELECT r.id,
    r.ris_no,
    r.division,
    r.ris_date,
    r.purpose,
    r.status,
    r.ris_type,
    r.is_priority,
    c.name AS category_name,
    s.name AS section_name,
    e1.full_name AS requested_by_name,
    e2.full_name AS approved_by_name,
    e3.full_name AS issued_by_name,
    e4.full_name AS received_by_name,
    r.created_at,
    r.updated_at
   FROM ((((((public.requisition_issue_slips r
     LEFT JOIN public.ppmp_categories c ON (((r.category)::text = (c.name)::text)))
     LEFT JOIN public.ppmp_sections s ON ((c.section_id = s.id)))
     LEFT JOIN public.employees e1 ON ((r.requested_by_id = e1.id)))
     LEFT JOIN public.employees e2 ON ((r.approved_by_id = e2.id)))
     LEFT JOIN public.employees e3 ON ((r.issued_by_id = e3.id)))
     LEFT JOIN public.employees e4 ON ((r.received_by_id = e4.id)))
  ORDER BY r.ris_date DESC;


--
-- Name: vw_running_inventory; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_running_inventory AS
 SELECT i.id,
    i.code,
    i.stock_no,
    i.name,
    i.description,
    i.unit,
    i.unit_price,
    i.category,
    i.quantity,
    i.reorder_point,
    i.uacs_code,
    uc.name AS uacs_name,
        CASE
            WHEN ((i.quantity <= i.reorder_point) AND (i.quantity > 0)) THEN 'Low Stock'::text
            WHEN (i.quantity = 0) THEN 'Out of Stock'::text
            ELSE 'In Stock'::text
        END AS stock_status
   FROM (public.items i
     LEFT JOIN public.uacs_codes uc ON (((i.uacs_code)::text = (uc.code)::text)))
  WHERE (i.is_active = true)
  ORDER BY i.name;


--
-- Name: vw_semi_expendable_items; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_semi_expendable_items AS
 SELECT rsei.id,
    rsei.item_id,
    rsei.generated_item_id,
    rsei.item_description,
    rsei.inventory_no,
    rsei.ics_no,
    rsei.ppe_no,
    rsei.serial_no,
    rsei.issued_to,
    rsei.issued_to_employee_id,
    rsei.brand,
    rsei.model,
    rsei.status,
    rsei.created_at,
    rsei.updated_at,
    i.name AS item_name,
    i.unit,
    i.unit_price,
    i.uacs_code,
    e.full_name AS issued_to_name
   FROM ((public.received_semi_expendable_items rsei
     LEFT JOIN public.items i ON ((rsei.item_id = i.id)))
     LEFT JOIN public.employees e ON ((rsei.issued_to_employee_id = e.id)));


--
-- Name: abstract_quotations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstract_quotations ALTER COLUMN id SET DEFAULT nextval('public.abstract_quotations_id_seq'::regclass);


--
-- Name: abstract_quote_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstract_quote_items ALTER COLUMN id SET DEFAULT nextval('public.abstract_quote_items_id_seq'::regclass);


--
-- Name: abstracts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts ALTER COLUMN id SET DEFAULT nextval('public.abstracts_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: app_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings ALTER COLUMN id SET DEFAULT nextval('public.app_settings_id_seq'::regclass);


--
-- Name: attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments ALTER COLUMN id SET DEFAULT nextval('public.attachments_id_seq'::regclass);


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: bac_resolutions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions ALTER COLUMN id SET DEFAULT nextval('public.bac_resolutions_id_seq'::regclass);


--
-- Name: coa_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_submissions ALTER COLUMN id SET DEFAULT nextval('public.coa_submissions_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: designations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations ALTER COLUMN id SET DEFAULT nextval('public.designations_id_seq'::regclass);


--
-- Name: divisions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions ALTER COLUMN id SET DEFAULT nextval('public.divisions_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: entity_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_attachments ALTER COLUMN id SET DEFAULT nextval('public.entity_attachments_id_seq'::regclass);


--
-- Name: fund_clusters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_clusters ALTER COLUMN id SET DEFAULT nextval('public.fund_clusters_id_seq'::regclass);


--
-- Name: iar_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iar_items ALTER COLUMN id SET DEFAULT nextval('public.iar_items_id_seq'::regclass);


--
-- Name: iars id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iars ALTER COLUMN id SET DEFAULT nextval('public.iars_id_seq'::regclass);


--
-- Name: inventory_custodian_slips id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_custodian_slips ALTER COLUMN id SET DEFAULT nextval('public.inventory_custodian_slips_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: notices_of_award id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices_of_award ALTER COLUMN id SET DEFAULT nextval('public.notices_of_award_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: offices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offices ALTER COLUMN id SET DEFAULT nextval('public.offices_id_seq'::regclass);


--
-- Name: pap_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pap_items ALTER COLUMN id SET DEFAULT nextval('public.pap_items_id_seq'::regclass);


--
-- Name: paps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paps ALTER COLUMN id SET DEFAULT nextval('public.paps_id_seq'::regclass);


--
-- Name: plan_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_items ALTER COLUMN id SET DEFAULT nextval('public.plan_items_id_seq'::regclass);


--
-- Name: po_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_items ALTER COLUMN id SET DEFAULT nextval('public.po_items_id_seq'::regclass);


--
-- Name: po_packets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_packets ALTER COLUMN id SET DEFAULT nextval('public.po_packets_id_seq'::regclass);


--
-- Name: post_qualifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications ALTER COLUMN id SET DEFAULT nextval('public.post_qualifications_id_seq'::regclass);


--
-- Name: ppmp_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppmp_categories ALTER COLUMN id SET DEFAULT nextval('public.ppmp_categories_id_seq'::regclass);


--
-- Name: ppmp_sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppmp_sections ALTER COLUMN id SET DEFAULT nextval('public.ppmp_sections_id_seq'::regclass);


--
-- Name: pr_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_items ALTER COLUMN id SET DEFAULT nextval('public.pr_items_id_seq'::regclass);


--
-- Name: procurement_modes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurement_modes ALTER COLUMN id SET DEFAULT nextval('public.procurement_modes_id_seq'::regclass);


--
-- Name: procurementplans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans ALTER COLUMN id SET DEFAULT nextval('public.procurementplans_id_seq'::regclass);


--
-- Name: property_acknowledgement_receipts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_acknowledgement_receipts ALTER COLUMN id SET DEFAULT nextval('public.property_acknowledgement_receipts_id_seq'::regclass);


--
-- Name: property_cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_cards ALTER COLUMN id SET DEFAULT nextval('public.property_cards_id_seq'::regclass);


--
-- Name: property_ledger_cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_ledger_cards ALTER COLUMN id SET DEFAULT nextval('public.property_ledger_cards_id_seq'::regclass);


--
-- Name: property_transfer_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_transfer_reports ALTER COLUMN id SET DEFAULT nextval('public.property_transfer_reports_id_seq'::regclass);


--
-- Name: purchaseorders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders ALTER COLUMN id SET DEFAULT nextval('public.purchaseorders_id_seq'::regclass);


--
-- Name: purchaserequests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaserequests ALTER COLUMN id SET DEFAULT nextval('public.purchaserequests_id_seq'::regclass);


--
-- Name: received_capital_outlay_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.received_capital_outlay_items ALTER COLUMN id SET DEFAULT nextval('public.received_capital_outlay_items_id_seq'::regclass);


--
-- Name: received_semi_expendable_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.received_semi_expendable_items ALTER COLUMN id SET DEFAULT nextval('public.received_semi_expendable_items_id_seq'::regclass);


--
-- Name: requisition_issue_slips id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_issue_slips ALTER COLUMN id SET DEFAULT nextval('public.requisition_issue_slips_id_seq'::regclass);


--
-- Name: rfq_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_items ALTER COLUMN id SET DEFAULT nextval('public.rfq_items_id_seq'::regclass);


--
-- Name: rfq_suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_suppliers ALTER COLUMN id SET DEFAULT nextval('public.rfq_suppliers_id_seq'::regclass);


--
-- Name: rfqs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfqs ALTER COLUMN id SET DEFAULT nextval('public.rfqs_id_seq'::regclass);


--
-- Name: ris_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ris_items ALTER COLUMN id SET DEFAULT nextval('public.ris_items_id_seq'::regclass);


--
-- Name: stock_cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_cards ALTER COLUMN id SET DEFAULT nextval('public.stock_cards_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: supplies_ledger_cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplies_ledger_cards ALTER COLUMN id SET DEFAULT nextval('public.supplies_ledger_cards_id_seq'::regclass);


--
-- Name: trip_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_tickets ALTER COLUMN id SET DEFAULT nextval('public.trip_tickets_id_seq'::regclass);


--
-- Name: uacs_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uacs_codes ALTER COLUMN id SET DEFAULT nextval('public.uacs_codes_id_seq'::regclass);


--
-- Name: uoms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uoms ALTER COLUMN id SET DEFAULT nextval('public.uoms_id_seq'::regclass);


--
-- Name: user_department_access id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_department_access ALTER COLUMN id SET DEFAULT nextval('public.user_department_access_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: abstract_quotations abstract_quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstract_quotations
    ADD CONSTRAINT abstract_quotations_pkey PRIMARY KEY (id);


--
-- Name: abstract_quote_items abstract_quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstract_quote_items
    ADD CONSTRAINT abstract_quote_items_pkey PRIMARY KEY (id);


--
-- Name: abstracts abstracts_abstract_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_abstract_number_key UNIQUE (abstract_number);


--
-- Name: abstracts abstracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_fiscal_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_fiscal_year_key UNIQUE (fiscal_year);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: bac_resolutions bac_resolutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_pkey PRIMARY KEY (id);


--
-- Name: bac_resolutions bac_resolutions_resolution_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_resolution_number_key UNIQUE (resolution_number);


--
-- Name: coa_submissions coa_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_submissions
    ADD CONSTRAINT coa_submissions_pkey PRIMARY KEY (id);


--
-- Name: coa_submissions coa_submissions_submission_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_submissions
    ADD CONSTRAINT coa_submissions_submission_number_key UNIQUE (submission_number);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: entity_attachments entity_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_attachments
    ADD CONSTRAINT entity_attachments_pkey PRIMARY KEY (id);


--
-- Name: fund_clusters fund_clusters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_clusters
    ADD CONSTRAINT fund_clusters_pkey PRIMARY KEY (id);


--
-- Name: iar_items iar_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iar_items
    ADD CONSTRAINT iar_items_pkey PRIMARY KEY (id);


--
-- Name: iars iars_iar_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iars
    ADD CONSTRAINT iars_iar_number_key UNIQUE (iar_number);


--
-- Name: iars iars_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iars
    ADD CONSTRAINT iars_pkey PRIMARY KEY (id);


--
-- Name: inventory_custodian_slips inventory_custodian_slips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_custodian_slips
    ADD CONSTRAINT inventory_custodian_slips_pkey PRIMARY KEY (id);


--
-- Name: items items_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_code_key UNIQUE (code);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: notices_of_award notices_of_award_noa_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices_of_award
    ADD CONSTRAINT notices_of_award_noa_number_key UNIQUE (noa_number);


--
-- Name: notices_of_award notices_of_award_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices_of_award
    ADD CONSTRAINT notices_of_award_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: offices offices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offices
    ADD CONSTRAINT offices_pkey PRIMARY KEY (id);


--
-- Name: pap_items pap_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pap_items
    ADD CONSTRAINT pap_items_pkey PRIMARY KEY (id);


--
-- Name: paps paps_pap_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paps
    ADD CONSTRAINT paps_pap_code_key UNIQUE (pap_code);


--
-- Name: paps paps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paps
    ADD CONSTRAINT paps_pkey PRIMARY KEY (id);


--
-- Name: plan_items plan_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_items
    ADD CONSTRAINT plan_items_pkey PRIMARY KEY (id);


--
-- Name: po_items po_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_items
    ADD CONSTRAINT po_items_pkey PRIMARY KEY (id);


--
-- Name: po_packets po_packets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_packets
    ADD CONSTRAINT po_packets_pkey PRIMARY KEY (id);


--
-- Name: po_packets po_packets_po_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_packets
    ADD CONSTRAINT po_packets_po_id_key UNIQUE (po_id);


--
-- Name: post_qualifications post_qualifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_pkey PRIMARY KEY (id);


--
-- Name: post_qualifications post_qualifications_postqual_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_postqual_number_key UNIQUE (postqual_number);


--
-- Name: ppmp_categories ppmp_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppmp_categories
    ADD CONSTRAINT ppmp_categories_name_key UNIQUE (name);


--
-- Name: ppmp_categories ppmp_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppmp_categories
    ADD CONSTRAINT ppmp_categories_pkey PRIMARY KEY (id);


--
-- Name: ppmp_sections ppmp_sections_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppmp_sections
    ADD CONSTRAINT ppmp_sections_name_key UNIQUE (name);


--
-- Name: ppmp_sections ppmp_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppmp_sections
    ADD CONSTRAINT ppmp_sections_pkey PRIMARY KEY (id);


--
-- Name: pr_items pr_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_items
    ADD CONSTRAINT pr_items_pkey PRIMARY KEY (id);


--
-- Name: procurement_modes procurement_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurement_modes
    ADD CONSTRAINT procurement_modes_pkey PRIMARY KEY (id);


--
-- Name: procurementplans procurementplans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans
    ADD CONSTRAINT procurementplans_pkey PRIMARY KEY (id);


--
-- Name: property_acknowledgement_receipts property_acknowledgement_receipts_par_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_acknowledgement_receipts
    ADD CONSTRAINT property_acknowledgement_receipts_par_no_key UNIQUE (par_no);


--
-- Name: property_acknowledgement_receipts property_acknowledgement_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_acknowledgement_receipts
    ADD CONSTRAINT property_acknowledgement_receipts_pkey PRIMARY KEY (id);


--
-- Name: property_cards property_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_cards
    ADD CONSTRAINT property_cards_pkey PRIMARY KEY (id);


--
-- Name: property_ledger_cards property_ledger_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_ledger_cards
    ADD CONSTRAINT property_ledger_cards_pkey PRIMARY KEY (id);


--
-- Name: property_transfer_reports property_transfer_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_transfer_reports
    ADD CONSTRAINT property_transfer_reports_pkey PRIMARY KEY (id);


--
-- Name: property_transfer_reports property_transfer_reports_ptr_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_transfer_reports
    ADD CONSTRAINT property_transfer_reports_ptr_no_key UNIQUE (ptr_no);


--
-- Name: purchaseorders purchaseorders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders
    ADD CONSTRAINT purchaseorders_pkey PRIMARY KEY (id);


--
-- Name: purchaseorders purchaseorders_po_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders
    ADD CONSTRAINT purchaseorders_po_number_key UNIQUE (po_number);


--
-- Name: purchaserequests purchaserequests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaserequests
    ADD CONSTRAINT purchaserequests_pkey PRIMARY KEY (id);


--
-- Name: purchaserequests purchaserequests_pr_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaserequests
    ADD CONSTRAINT purchaserequests_pr_number_key UNIQUE (pr_number);


--
-- Name: received_capital_outlay_items received_capital_outlay_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.received_capital_outlay_items
    ADD CONSTRAINT received_capital_outlay_items_pkey PRIMARY KEY (id);


--
-- Name: received_semi_expendable_items received_semi_expendable_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.received_semi_expendable_items
    ADD CONSTRAINT received_semi_expendable_items_pkey PRIMARY KEY (id);


--
-- Name: requisition_issue_slips requisition_issue_slips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_issue_slips
    ADD CONSTRAINT requisition_issue_slips_pkey PRIMARY KEY (id);


--
-- Name: requisition_issue_slips requisition_issue_slips_ris_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_issue_slips
    ADD CONSTRAINT requisition_issue_slips_ris_no_key UNIQUE (ris_no);


--
-- Name: rfq_items rfq_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_items
    ADD CONSTRAINT rfq_items_pkey PRIMARY KEY (id);


--
-- Name: rfq_suppliers rfq_suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_suppliers
    ADD CONSTRAINT rfq_suppliers_pkey PRIMARY KEY (id);


--
-- Name: rfqs rfqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_pkey PRIMARY KEY (id);


--
-- Name: rfqs rfqs_rfq_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_rfq_number_key UNIQUE (rfq_number);


--
-- Name: ris_items ris_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ris_items
    ADD CONSTRAINT ris_items_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: stock_cards stock_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_cards
    ADD CONSTRAINT stock_cards_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: supplies_ledger_cards supplies_ledger_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplies_ledger_cards
    ADD CONSTRAINT supplies_ledger_cards_pkey PRIMARY KEY (id);


--
-- Name: trip_tickets trip_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_tickets
    ADD CONSTRAINT trip_tickets_pkey PRIMARY KEY (id);


--
-- Name: trip_tickets trip_tickets_trip_ticket_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_tickets
    ADD CONSTRAINT trip_tickets_trip_ticket_no_key UNIQUE (trip_ticket_no);


--
-- Name: uacs_codes uacs_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uacs_codes
    ADD CONSTRAINT uacs_codes_pkey PRIMARY KEY (id);


--
-- Name: uoms uoms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uoms
    ADD CONSTRAINT uoms_pkey PRIMARY KEY (id);


--
-- Name: user_department_access user_department_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_department_access
    ADD CONSTRAINT user_department_access_pkey PRIMARY KEY (id);


--
-- Name: user_department_access user_department_access_user_id_dept_id_access_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_department_access
    ADD CONSTRAINT user_department_access_user_id_dept_id_access_type_key UNIQUE (user_id, dept_id, access_type);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_abstract_quote_items_quote; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abstract_quote_items_quote ON public.abstract_quote_items USING btree (abstract_quotation_id);


--
-- Name: idx_abstract_quotes_abstract; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abstract_quotes_abstract ON public.abstract_quotations USING btree (abstract_id);


--
-- Name: idx_abstract_quotes_supplier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abstract_quotes_supplier ON public.abstract_quotations USING btree (supplier_id);


--
-- Name: idx_abstracts_rfq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abstracts_rfq ON public.abstracts USING btree (rfq_id);


--
-- Name: idx_abstracts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abstracts_status ON public.abstracts USING btree (status);


--
-- Name: idx_activity_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_action ON public.activity_logs USING btree (action);


--
-- Name: idx_activity_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_created ON public.activity_logs USING btree (created_at);


--
-- Name: idx_activity_logs_table; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_table ON public.activity_logs USING btree (table_name);


--
-- Name: idx_activity_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_user ON public.activity_logs USING btree (user_id);


--
-- Name: idx_activity_logs_view_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_activity_logs_view_id ON public.activity_logs_view USING btree (id);


--
-- Name: idx_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachments_uploaded_by ON public.attachments USING btree (uploaded_by);


--
-- Name: idx_audit_table; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_table ON public.audit_log USING btree (table_name);


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_user ON public.audit_log USING btree (user_id);


--
-- Name: idx_bacres_abstract; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bacres_abstract ON public.bac_resolutions USING btree (abstract_id);


--
-- Name: idx_bacres_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bacres_status ON public.bac_resolutions USING btree (status);


--
-- Name: idx_bacres_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bacres_type ON public.bac_resolutions USING btree (bac_resolution_type);


--
-- Name: idx_coa_po; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coa_po ON public.coa_submissions USING btree (po_id);


--
-- Name: idx_coa_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coa_status ON public.coa_submissions USING btree (status);


--
-- Name: idx_employees_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_dept ON public.employees USING btree (dept_id);


--
-- Name: idx_employees_designation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_designation ON public.employees USING btree (designation_id);


--
-- Name: idx_employees_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_status ON public.employees USING btree (status);


--
-- Name: idx_entity_attachments_attachment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_entity_attachments_attachment ON public.entity_attachments USING btree (attachment_id);


--
-- Name: idx_entity_attachments_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_entity_attachments_entity ON public.entity_attachments USING btree (entity_type, entity_id);


--
-- Name: idx_iar_items_iar; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_iar_items_iar ON public.iar_items USING btree (iar_id);


--
-- Name: idx_iar_items_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_iar_items_item ON public.iar_items USING btree (item_id);


--
-- Name: idx_iars_acceptance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_iars_acceptance ON public.iars USING btree (acceptance);


--
-- Name: idx_iars_po; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_iars_po ON public.iars USING btree (po_id);


--
-- Name: idx_ics_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ics_employee ON public.inventory_custodian_slips USING btree (issued_to_employee_id);


--
-- Name: idx_ics_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ics_no ON public.inventory_custodian_slips USING btree (ics_no);


--
-- Name: idx_items_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_category ON public.items USING btree (category);


--
-- Name: idx_items_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_code ON public.items USING btree (code);


--
-- Name: idx_items_procurement_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_procurement_source ON public.items USING btree (procurement_source);


--
-- Name: idx_items_stock_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_stock_no ON public.items USING btree (stock_no);


--
-- Name: idx_items_uacs; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_uacs ON public.items USING btree (uacs_code);


--
-- Name: idx_noa_bacres; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noa_bacres ON public.notices_of_award USING btree (bac_resolution_id);


--
-- Name: idx_noa_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noa_status ON public.notices_of_award USING btree (status);


--
-- Name: idx_notifications_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_pap_items_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pap_items_item ON public.pap_items USING btree (item_id);


--
-- Name: idx_pap_items_pap; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pap_items_pap ON public.pap_items USING btree (pap_id);


--
-- Name: idx_paps_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paps_code ON public.paps USING btree (pap_code);


--
-- Name: idx_paps_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paps_dept ON public.paps USING btree (dept_id);


--
-- Name: idx_paps_fiscal_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paps_fiscal_year ON public.paps USING btree (fiscal_year);


--
-- Name: idx_paps_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paps_status ON public.paps USING btree (status);


--
-- Name: idx_par_issued; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_par_issued ON public.property_acknowledgement_receipts USING btree (issued_to_employee_id);


--
-- Name: idx_par_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_par_no ON public.property_acknowledgement_receipts USING btree (par_no);


--
-- Name: idx_pc_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pc_employee ON public.property_cards USING btree (issued_to_employee_id);


--
-- Name: idx_pc_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pc_item ON public.property_cards USING btree (item_id);


--
-- Name: idx_pc_property; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pc_property ON public.property_cards USING btree (property_number);


--
-- Name: idx_plan_items_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_items_code ON public.plan_items USING btree (item_code);


--
-- Name: idx_plan_items_plan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_items_plan ON public.plan_items USING btree (plan_id);


--
-- Name: idx_plans_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plans_dept ON public.procurementplans USING btree (dept_id);


--
-- Name: idx_plans_pap; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plans_pap ON public.procurementplans USING btree (pap_id);


--
-- Name: idx_plans_procurement_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plans_procurement_source ON public.procurementplans USING btree (procurement_source);


--
-- Name: idx_plans_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plans_status ON public.procurementplans USING btree (status);


--
-- Name: idx_plans_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plans_year ON public.procurementplans USING btree (fiscal_year);


--
-- Name: idx_plc_property; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plc_property ON public.property_ledger_cards USING btree (property_number);


--
-- Name: idx_po_items_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_items_code ON public.po_items USING btree (item_code);


--
-- Name: idx_po_items_po; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_items_po ON public.po_items USING btree (po_id);


--
-- Name: idx_po_noa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_noa ON public.purchaseorders USING btree (noa_id);


--
-- Name: idx_po_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_number ON public.purchaseorders USING btree (po_number);


--
-- Name: idx_po_packets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_packets_status ON public.po_packets USING btree (status);


--
-- Name: idx_po_pr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_pr ON public.purchaseorders USING btree (pr_id);


--
-- Name: idx_po_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_status ON public.purchaseorders USING btree (status);


--
-- Name: idx_po_supplier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_supplier ON public.purchaseorders USING btree (supplier_id);


--
-- Name: idx_po_workflow_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_workflow_status ON public.purchaseorders USING btree (workflow_status);


--
-- Name: idx_postqual_abstract; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_postqual_abstract ON public.post_qualifications USING btree (abstract_id);


--
-- Name: idx_ppmp_categories_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ppmp_categories_active ON public.ppmp_categories USING btree (is_active);


--
-- Name: idx_ppmp_categories_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ppmp_categories_name ON public.ppmp_categories USING btree (name);


--
-- Name: idx_ppmp_categories_section; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ppmp_categories_section ON public.ppmp_categories USING btree (section_id);


--
-- Name: idx_ppmp_sections_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ppmp_sections_active ON public.ppmp_sections USING btree (is_active);


--
-- Name: idx_ppmp_sections_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ppmp_sections_name ON public.ppmp_sections USING btree (name);


--
-- Name: idx_pr_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pr_dept ON public.purchaserequests USING btree (dept_id);


--
-- Name: idx_pr_items_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pr_items_code ON public.pr_items USING btree (item_code);


--
-- Name: idx_pr_items_pr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pr_items_pr ON public.pr_items USING btree (pr_id);


--
-- Name: idx_pr_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pr_number ON public.purchaserequests USING btree (pr_number);


--
-- Name: idx_pr_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pr_status ON public.purchaserequests USING btree (status);


--
-- Name: idx_ptr_from; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ptr_from ON public.property_transfer_reports USING btree (from_accountable_officer_id);


--
-- Name: idx_ptr_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ptr_no ON public.property_transfer_reports USING btree (ptr_no);


--
-- Name: idx_ptr_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ptr_to ON public.property_transfer_reports USING btree (to_accountable_officer_id);


--
-- Name: idx_rcoi_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rcoi_item ON public.received_capital_outlay_items USING btree (item_id);


--
-- Name: idx_rcoi_ppe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rcoi_ppe ON public.received_capital_outlay_items USING btree (ppe_no);


--
-- Name: idx_rcoi_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rcoi_status ON public.received_capital_outlay_items USING btree (status);


--
-- Name: idx_rfq_items_rfq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rfq_items_rfq ON public.rfq_items USING btree (rfq_id);


--
-- Name: idx_rfq_suppliers_rfq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rfq_suppliers_rfq ON public.rfq_suppliers USING btree (rfq_id);


--
-- Name: idx_rfq_suppliers_supplier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rfq_suppliers_supplier ON public.rfq_suppliers USING btree (supplier_id);


--
-- Name: idx_rfqs_pr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rfqs_pr ON public.rfqs USING btree (pr_id);


--
-- Name: idx_rfqs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rfqs_status ON public.rfqs USING btree (status);


--
-- Name: idx_ris_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ris_category ON public.requisition_issue_slips USING btree (category);


--
-- Name: idx_ris_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ris_date ON public.requisition_issue_slips USING btree (ris_date);


--
-- Name: idx_ris_items_description; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ris_items_description ON public.ris_items USING btree (description);


--
-- Name: idx_ris_items_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ris_items_item ON public.ris_items USING btree (item_id);


--
-- Name: idx_ris_items_ris; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ris_items_ris ON public.ris_items USING btree (ris_id);


--
-- Name: idx_ris_items_uom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ris_items_uom ON public.ris_items USING btree (uom);


--
-- Name: idx_ris_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ris_no ON public.requisition_issue_slips USING btree (ris_no);


--
-- Name: idx_ris_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ris_priority ON public.requisition_issue_slips USING btree (is_priority);


--
-- Name: idx_ris_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ris_status ON public.requisition_issue_slips USING btree (status);


--
-- Name: idx_ris_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ris_type ON public.requisition_issue_slips USING btree (ris_type);


--
-- Name: idx_rsei_inventory; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rsei_inventory ON public.received_semi_expendable_items USING btree (inventory_no);


--
-- Name: idx_rsei_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rsei_item ON public.received_semi_expendable_items USING btree (item_id);


--
-- Name: idx_rsei_ppe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rsei_ppe ON public.received_semi_expendable_items USING btree (ppe_no);


--
-- Name: idx_rsei_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rsei_status ON public.received_semi_expendable_items USING btree (status);


--
-- Name: idx_sc_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sc_date ON public.stock_cards USING btree (date);


--
-- Name: idx_sc_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sc_item ON public.stock_cards USING btree (item_id);


--
-- Name: idx_slc_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slc_date ON public.supplies_ledger_cards USING btree (date);


--
-- Name: idx_slc_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slc_item ON public.supplies_ledger_cards USING btree (item_id);


--
-- Name: idx_suppliers_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_name ON public.suppliers USING btree (name);


--
-- Name: idx_trip_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trip_no ON public.trip_tickets USING btree (trip_ticket_no);


--
-- Name: idx_trip_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trip_status ON public.trip_tickets USING btree (status);


--
-- Name: idx_uacs_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_uacs_category ON public.uacs_codes USING btree (category);


--
-- Name: idx_uacs_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_uacs_code ON public.uacs_codes USING btree (code);


--
-- Name: idx_users_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_dept ON public.users USING btree (dept_id);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: abstract_quotations abstract_quotations_abstract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstract_quotations
    ADD CONSTRAINT abstract_quotations_abstract_id_fkey FOREIGN KEY (abstract_id) REFERENCES public.abstracts(id) ON DELETE CASCADE;


--
-- Name: abstract_quotations abstract_quotations_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstract_quotations
    ADD CONSTRAINT abstract_quotations_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: abstract_quote_items abstract_quote_items_abstract_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstract_quote_items
    ADD CONSTRAINT abstract_quote_items_abstract_quotation_id_fkey FOREIGN KEY (abstract_quotation_id) REFERENCES public.abstract_quotations(id) ON DELETE CASCADE;


--
-- Name: abstracts abstracts_bac_chairperson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_bac_chairperson_id_fkey FOREIGN KEY (bac_chairperson_id) REFERENCES public.employees(id);


--
-- Name: abstracts abstracts_bac_member1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_bac_member1_id_fkey FOREIGN KEY (bac_member1_id) REFERENCES public.employees(id);


--
-- Name: abstracts abstracts_bac_member2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_bac_member2_id_fkey FOREIGN KEY (bac_member2_id) REFERENCES public.employees(id);


--
-- Name: abstracts abstracts_bac_member3_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_bac_member3_id_fkey FOREIGN KEY (bac_member3_id) REFERENCES public.employees(id);


--
-- Name: abstracts abstracts_bac_secretariat2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_bac_secretariat2_id_fkey FOREIGN KEY (bac_secretariat2_id) REFERENCES public.employees(id);


--
-- Name: abstracts abstracts_bac_secretariat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_bac_secretariat_id_fkey FOREIGN KEY (bac_secretariat_id) REFERENCES public.employees(id);


--
-- Name: abstracts abstracts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: abstracts abstracts_recommended_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_recommended_supplier_id_fkey FOREIGN KEY (recommended_supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: abstracts abstracts_regional_director_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_regional_director_id_fkey FOREIGN KEY (regional_director_id) REFERENCES public.employees(id);


--
-- Name: abstracts abstracts_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE SET NULL;


--
-- Name: abstracts abstracts_vice_chairperson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_vice_chairperson_id_fkey FOREIGN KEY (vice_chairperson_id) REFERENCES public.employees(id);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: app_settings app_settings_set_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_set_by_fkey FOREIGN KEY (set_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: attachments attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: bac_resolutions bac_resolutions_abstract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_abstract_id_fkey FOREIGN KEY (abstract_id) REFERENCES public.abstracts(id) ON DELETE SET NULL;


--
-- Name: bac_resolutions bac_resolutions_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: bac_resolutions bac_resolutions_bac_chairperson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_bac_chairperson_id_fkey FOREIGN KEY (bac_chairperson_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: bac_resolutions bac_resolutions_bac_member1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_bac_member1_id_fkey FOREIGN KEY (bac_member1_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: bac_resolutions bac_resolutions_bac_member2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_bac_member2_id_fkey FOREIGN KEY (bac_member2_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: bac_resolutions bac_resolutions_bac_member3_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_bac_member3_id_fkey FOREIGN KEY (bac_member3_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: bac_resolutions bac_resolutions_bac_vice_chairperson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_bac_vice_chairperson_id_fkey FOREIGN KEY (bac_vice_chairperson_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: bac_resolutions bac_resolutions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: bac_resolutions bac_resolutions_hope_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_hope_id_fkey FOREIGN KEY (hope_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: bac_resolutions bac_resolutions_recommended_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bac_resolutions
    ADD CONSTRAINT bac_resolutions_recommended_supplier_id_fkey FOREIGN KEY (recommended_supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: coa_submissions coa_submissions_coa_packet_attachment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_submissions
    ADD CONSTRAINT coa_submissions_coa_packet_attachment_id_fkey FOREIGN KEY (coa_packet_attachment_id) REFERENCES public.attachments(id) ON DELETE SET NULL;


--
-- Name: coa_submissions coa_submissions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_submissions
    ADD CONSTRAINT coa_submissions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: coa_submissions coa_submissions_iar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_submissions
    ADD CONSTRAINT coa_submissions_iar_id_fkey FOREIGN KEY (iar_id) REFERENCES public.iars(id) ON DELETE SET NULL;


--
-- Name: coa_submissions coa_submissions_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_submissions
    ADD CONSTRAINT coa_submissions_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchaseorders(id) ON DELETE SET NULL;


--
-- Name: coa_submissions coa_submissions_po_packet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_submissions
    ADD CONSTRAINT coa_submissions_po_packet_id_fkey FOREIGN KEY (po_packet_id) REFERENCES public.po_packets(id) ON DELETE SET NULL;


--
-- Name: employees employees_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: employees employees_designation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_designation_id_fkey FOREIGN KEY (designation_id) REFERENCES public.designations(id) ON DELETE SET NULL;


--
-- Name: entity_attachments entity_attachments_attachment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_attachments
    ADD CONSTRAINT entity_attachments_attachment_id_fkey FOREIGN KEY (attachment_id) REFERENCES public.attachments(id) ON DELETE CASCADE;


--
-- Name: iar_items iar_items_iar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iar_items
    ADD CONSTRAINT iar_items_iar_id_fkey FOREIGN KEY (iar_id) REFERENCES public.iars(id) ON DELETE CASCADE;


--
-- Name: iar_items iar_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iar_items
    ADD CONSTRAINT iar_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- Name: iars iars_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iars
    ADD CONSTRAINT iars_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: iars iars_inspected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iars
    ADD CONSTRAINT iars_inspected_by_fkey FOREIGN KEY (inspected_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: iars iars_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iars
    ADD CONSTRAINT iars_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchaseorders(id) ON DELETE SET NULL;


--
-- Name: iars iars_received_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iars
    ADD CONSTRAINT iars_received_by_fkey FOREIGN KEY (received_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventory_custodian_slips inventory_custodian_slips_issued_to_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_custodian_slips
    ADD CONSTRAINT inventory_custodian_slips_issued_to_employee_id_fkey FOREIGN KEY (issued_to_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: inventory_custodian_slips inventory_custodian_slips_received_by_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_custodian_slips
    ADD CONSTRAINT inventory_custodian_slips_received_by_employee_id_fkey FOREIGN KEY (received_by_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: notices_of_award notices_of_award_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices_of_award
    ADD CONSTRAINT notices_of_award_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notices_of_award notices_of_award_bac_resolution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices_of_award
    ADD CONSTRAINT notices_of_award_bac_resolution_id_fkey FOREIGN KEY (bac_resolution_id) REFERENCES public.bac_resolutions(id) ON DELETE SET NULL;


--
-- Name: notices_of_award notices_of_award_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices_of_award
    ADD CONSTRAINT notices_of_award_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notices_of_award notices_of_award_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices_of_award
    ADD CONSTRAINT notices_of_award_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE SET NULL;


--
-- Name: notices_of_award notices_of_award_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices_of_award
    ADD CONSTRAINT notices_of_award_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pap_items pap_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pap_items
    ADD CONSTRAINT pap_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- Name: pap_items pap_items_pap_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pap_items
    ADD CONSTRAINT pap_items_pap_id_fkey FOREIGN KEY (pap_id) REFERENCES public.paps(id) ON DELETE CASCADE;


--
-- Name: paps paps_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paps
    ADD CONSTRAINT paps_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: paps paps_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paps
    ADD CONSTRAINT paps_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: plan_items plan_items_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_items
    ADD CONSTRAINT plan_items_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.procurementplans(id) ON DELETE CASCADE;


--
-- Name: po_items po_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_items
    ADD CONSTRAINT po_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- Name: po_items po_items_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_items
    ADD CONSTRAINT po_items_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchaseorders(id) ON DELETE CASCADE;


--
-- Name: po_packets po_packets_chief_signed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_packets
    ADD CONSTRAINT po_packets_chief_signed_by_fkey FOREIGN KEY (chief_signed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: po_packets po_packets_compiled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_packets
    ADD CONSTRAINT po_packets_compiled_by_fkey FOREIGN KEY (compiled_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: po_packets po_packets_director_signed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_packets
    ADD CONSTRAINT po_packets_director_signed_by_fkey FOREIGN KEY (director_signed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: po_packets po_packets_packet_attachment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_packets
    ADD CONSTRAINT po_packets_packet_attachment_id_fkey FOREIGN KEY (packet_attachment_id) REFERENCES public.attachments(id) ON DELETE SET NULL;


--
-- Name: po_packets po_packets_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_packets
    ADD CONSTRAINT po_packets_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchaseorders(id) ON DELETE CASCADE;


--
-- Name: post_qualifications post_qualifications_abstract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_abstract_id_fkey FOREIGN KEY (abstract_id) REFERENCES public.abstracts(id) ON DELETE SET NULL;


--
-- Name: post_qualifications post_qualifications_bidder1_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_bidder1_supplier_id_fkey FOREIGN KEY (bidder1_supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: post_qualifications post_qualifications_bidder2_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_bidder2_supplier_id_fkey FOREIGN KEY (bidder2_supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: post_qualifications post_qualifications_bidder3_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_bidder3_supplier_id_fkey FOREIGN KEY (bidder3_supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: post_qualifications post_qualifications_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: post_qualifications post_qualifications_twg_head_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_twg_head_id_fkey FOREIGN KEY (twg_head_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: post_qualifications post_qualifications_twg_member1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_twg_member1_id_fkey FOREIGN KEY (twg_member1_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: post_qualifications post_qualifications_twg_member2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_twg_member2_id_fkey FOREIGN KEY (twg_member2_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: post_qualifications post_qualifications_twg_member3_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_twg_member3_id_fkey FOREIGN KEY (twg_member3_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: post_qualifications post_qualifications_twg_member4_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_qualifications
    ADD CONSTRAINT post_qualifications_twg_member4_id_fkey FOREIGN KEY (twg_member4_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: ppmp_categories ppmp_categories_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppmp_categories
    ADD CONSTRAINT ppmp_categories_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.ppmp_sections(id) ON DELETE RESTRICT;


--
-- Name: pr_items pr_items_pr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_items
    ADD CONSTRAINT pr_items_pr_id_fkey FOREIGN KEY (pr_id) REFERENCES public.purchaserequests(id) ON DELETE CASCADE;


--
-- Name: procurementplans procurementplans_approved_by_budget_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans
    ADD CONSTRAINT procurementplans_approved_by_budget_fkey FOREIGN KEY (approved_by_budget) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: procurementplans procurementplans_approved_by_chief_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans
    ADD CONSTRAINT procurementplans_approved_by_chief_fkey FOREIGN KEY (approved_by_chief) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: procurementplans procurementplans_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans
    ADD CONSTRAINT procurementplans_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: procurementplans procurementplans_approved_by_hope_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans
    ADD CONSTRAINT procurementplans_approved_by_hope_fkey FOREIGN KEY (approved_by_hope) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: procurementplans procurementplans_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans
    ADD CONSTRAINT procurementplans_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: procurementplans procurementplans_declined_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans
    ADD CONSTRAINT procurementplans_declined_by_fkey FOREIGN KEY (declined_by) REFERENCES public.users(id);


--
-- Name: procurementplans procurementplans_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans
    ADD CONSTRAINT procurementplans_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: procurementplans procurementplans_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans
    ADD CONSTRAINT procurementplans_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- Name: procurementplans procurementplans_pap_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurementplans
    ADD CONSTRAINT procurementplans_pap_id_fkey FOREIGN KEY (pap_id) REFERENCES public.paps(id) ON DELETE SET NULL;


--
-- Name: property_acknowledgement_receipts property_acknowledgement_receipts_issued_to_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_acknowledgement_receipts
    ADD CONSTRAINT property_acknowledgement_receipts_issued_to_employee_id_fkey FOREIGN KEY (issued_to_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: property_acknowledgement_receipts property_acknowledgement_receipts_received_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_acknowledgement_receipts
    ADD CONSTRAINT property_acknowledgement_receipts_received_by_id_fkey FOREIGN KEY (received_by_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: property_acknowledgement_receipts property_acknowledgement_receipts_received_from_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_acknowledgement_receipts
    ADD CONSTRAINT property_acknowledgement_receipts_received_from_id_fkey FOREIGN KEY (received_from_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: property_cards property_cards_issued_to_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_cards
    ADD CONSTRAINT property_cards_issued_to_employee_id_fkey FOREIGN KEY (issued_to_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: property_cards property_cards_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_cards
    ADD CONSTRAINT property_cards_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- Name: property_transfer_reports property_transfer_reports_from_accountable_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_transfer_reports
    ADD CONSTRAINT property_transfer_reports_from_accountable_officer_id_fkey FOREIGN KEY (from_accountable_officer_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: property_transfer_reports property_transfer_reports_to_accountable_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_transfer_reports
    ADD CONSTRAINT property_transfer_reports_to_accountable_officer_id_fkey FOREIGN KEY (to_accountable_officer_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: purchaseorders purchaseorders_accepted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders
    ADD CONSTRAINT purchaseorders_accepted_by_fkey FOREIGN KEY (accepted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchaseorders purchaseorders_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders
    ADD CONSTRAINT purchaseorders_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchaseorders purchaseorders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders
    ADD CONSTRAINT purchaseorders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchaseorders purchaseorders_delivered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders
    ADD CONSTRAINT purchaseorders_delivered_by_fkey FOREIGN KEY (delivered_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchaseorders purchaseorders_noa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders
    ADD CONSTRAINT purchaseorders_noa_id_fkey FOREIGN KEY (noa_id) REFERENCES public.notices_of_award(id) ON DELETE SET NULL;


--
-- Name: purchaseorders purchaseorders_pr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders
    ADD CONSTRAINT purchaseorders_pr_id_fkey FOREIGN KEY (pr_id) REFERENCES public.purchaserequests(id) ON DELETE SET NULL;


--
-- Name: purchaseorders purchaseorders_supplier_conforme_attachment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders
    ADD CONSTRAINT purchaseorders_supplier_conforme_attachment_id_fkey FOREIGN KEY (supplier_conforme_attachment_id) REFERENCES public.attachments(id) ON DELETE SET NULL;


--
-- Name: purchaseorders purchaseorders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaseorders
    ADD CONSTRAINT purchaseorders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: purchaserequests purchaserequests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaserequests
    ADD CONSTRAINT purchaserequests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchaserequests purchaserequests_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaserequests
    ADD CONSTRAINT purchaserequests_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: purchaserequests purchaserequests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchaserequests
    ADD CONSTRAINT purchaserequests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: received_capital_outlay_items received_capital_outlay_items_issued_to_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.received_capital_outlay_items
    ADD CONSTRAINT received_capital_outlay_items_issued_to_employee_id_fkey FOREIGN KEY (issued_to_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: received_capital_outlay_items received_capital_outlay_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.received_capital_outlay_items
    ADD CONSTRAINT received_capital_outlay_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- Name: received_semi_expendable_items received_semi_expendable_items_issued_to_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.received_semi_expendable_items
    ADD CONSTRAINT received_semi_expendable_items_issued_to_employee_id_fkey FOREIGN KEY (issued_to_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: received_semi_expendable_items received_semi_expendable_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.received_semi_expendable_items
    ADD CONSTRAINT received_semi_expendable_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- Name: requisition_issue_slips requisition_issue_slips_approved_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_issue_slips
    ADD CONSTRAINT requisition_issue_slips_approved_by_id_fkey FOREIGN KEY (approved_by_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: requisition_issue_slips requisition_issue_slips_approved_by_supply_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_issue_slips
    ADD CONSTRAINT requisition_issue_slips_approved_by_supply_id_fkey FOREIGN KEY (approved_by_supply_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: requisition_issue_slips requisition_issue_slips_issued_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_issue_slips
    ADD CONSTRAINT requisition_issue_slips_issued_by_id_fkey FOREIGN KEY (issued_by_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: requisition_issue_slips requisition_issue_slips_received_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_issue_slips
    ADD CONSTRAINT requisition_issue_slips_received_by_id_fkey FOREIGN KEY (received_by_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: requisition_issue_slips requisition_issue_slips_requested_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_issue_slips
    ADD CONSTRAINT requisition_issue_slips_requested_by_id_fkey FOREIGN KEY (requested_by_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: rfq_items rfq_items_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_items
    ADD CONSTRAINT rfq_items_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE CASCADE;


--
-- Name: rfq_suppliers rfq_suppliers_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_suppliers
    ADD CONSTRAINT rfq_suppliers_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE CASCADE;


--
-- Name: rfq_suppliers rfq_suppliers_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_suppliers
    ADD CONSTRAINT rfq_suppliers_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: rfqs rfqs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: rfqs rfqs_pr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_pr_id_fkey FOREIGN KEY (pr_id) REFERENCES public.purchaserequests(id) ON DELETE SET NULL;


--
-- Name: ris_items ris_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ris_items
    ADD CONSTRAINT ris_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- Name: ris_items ris_items_ris_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ris_items
    ADD CONSTRAINT ris_items_ris_id_fkey FOREIGN KEY (ris_id) REFERENCES public.requisition_issue_slips(id) ON DELETE CASCADE;


--
-- Name: stock_cards stock_cards_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_cards
    ADD CONSTRAINT stock_cards_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: supplies_ledger_cards supplies_ledger_cards_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplies_ledger_cards
    ADD CONSTRAINT supplies_ledger_cards_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: user_department_access user_department_access_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_department_access
    ADD CONSTRAINT user_department_access_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: user_department_access user_department_access_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_department_access
    ADD CONSTRAINT user_department_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: users users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 9y85ff5Gz2LUV0zxk5XKleR9Heny3oKrzPMgDHqz19jLGmuftuqrRTyKQnOcrUD

