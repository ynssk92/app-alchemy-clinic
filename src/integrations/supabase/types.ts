export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          meta: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json
        }
        Relationships: []
      }
      admin_invites: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          email: string
          id: string
          invited_by: string | null
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          accent_hsl: string
          background_hsl: string
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_phone_secondary: string | null
          emergency_phone: string | null
          favicon_url: string | null
          foreground_hsl: string
          hours_saturday: string | null
          hours_sunday: string | null
          hours_weekdays: string | null
          id: boolean
          logo_url: string | null
          map_url: string | null
          mobile_logo_url: string | null
          primary_hsl: string
          radius: string
          secondary_hsl: string
          site_name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accent_hsl?: string
          background_hsl?: string
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_phone_secondary?: string | null
          emergency_phone?: string | null
          favicon_url?: string | null
          foreground_hsl?: string
          hours_saturday?: string | null
          hours_sunday?: string | null
          hours_weekdays?: string | null
          id?: boolean
          logo_url?: string | null
          map_url?: string | null
          mobile_logo_url?: string | null
          primary_hsl?: string
          radius?: string
          secondary_hsl?: string
          site_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accent_hsl?: string
          background_hsl?: string
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_phone_secondary?: string | null
          emergency_phone?: string | null
          favicon_url?: string | null
          foreground_hsl?: string
          hours_saturday?: string | null
          hours_sunday?: string | null
          hours_weekdays?: string | null
          id?: boolean
          logo_url?: string | null
          map_url?: string | null
          mobile_logo_url?: string | null
          primary_hsl?: string
          radius?: string
          secondary_hsl?: string
          site_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      appointment_history: {
        Row: {
          appointment_id: string
          changed_by: string | null
          created_at: string
          id: string
          note: string | null
          status: string
        }
        Insert: {
          appointment_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          status: string
        }
        Update: {
          appointment_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          custom_reason: string | null
          doctor_id: string
          id: string
          patient_id: string
          reason: string | null
          reason_id: string | null
          reference: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          custom_reason?: string | null
          doctor_id: string
          id?: string
          patient_id: string
          reason?: string | null
          reason_id?: string | null
          reference?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          custom_reason?: string | null
          doctor_id?: string
          id?: string
          patient_id?: string
          reason?: string | null
          reason_id?: string | null
          reference?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_reason_id_fkey"
            columns: ["reason_id"]
            isOneToOne: false
            referencedRelation: "consultation_reasons"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_verification_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          detail: string | null
          id: string
          kind: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          kind: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinic_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          changed_fields: string[] | null
          clinic_id: string | null
          clinic_name: string | null
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          changed_fields?: string[] | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          changed_fields?: string[] | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: []
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      consultation_reasons: {
        Row: {
          active: boolean
          category: string
          created_at: string
          icon: string | null
          id: string
          is_other: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          icon?: string | null
          id?: string
          is_other?: boolean
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_other?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean
        }
        Relationships: []
      }
      doctor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_holidays: {
        Row: {
          created_at: string
          doctor_id: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_holidays_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          clinic_id: string | null
          created_at: string
          experience_years: number | null
          full_name: string
          id: string
          is_available: boolean
          rating: number | null
          specialty_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          clinic_id?: string | null
          created_at?: string
          experience_years?: number | null
          full_name: string
          id?: string
          is_available?: boolean
          rating?: number | null
          specialty_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          clinic_id?: string | null
          created_at?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          is_available?: boolean
          rating?: number | null
          specialty_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      gallery_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          image_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          image_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          image_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_events_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "gallery_images"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          discount: number
          id: string
          invoice_id: string
          qty: number
          service_id: string | null
          tax: number
          total: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          discount?: number
          id?: string
          invoice_id: string
          qty?: number
          service_id?: string | null
          tax?: number
          total?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount?: number
          id?: string
          invoice_id?: string
          qty?: number
          service_id?: string | null
          tax?: number
          total?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_sequences: {
        Row: {
          last_number: number
          year: number
        }
        Insert: {
          last_number?: number
          year: number
        }
        Update: {
          last_number?: number
          year?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          appointment_id: string | null
          clinic_id: string | null
          created_at: string
          created_by: string | null
          discount: number
          doctor_id: string | null
          due: number
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid: number
          patient_id: string
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number
          doctor_id?: string | null
          due?: number
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          paid?: number
          patient_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number
          doctor_id?: string | null
          due?: number
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid?: number
          patient_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          appointment_id: string | null
          audience: string
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      page_blocks: {
        Row: {
          body: string | null
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          items: string[]
          kind: string
          page_slug: string
          published: boolean
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          items?: string[]
          kind?: string
          page_slug: string
          published?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          items?: string[]
          kind?: string
          page_slug?: string
          published?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_blocks_page_slug_fkey"
            columns: ["page_slug"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["slug"]
          },
        ]
      }
      patient_intake: {
        Row: {
          address_1: string | null
          address_2: string | null
          avatar_url: string | null
          blood_group: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          dob: string | null
          email: string
          first_name: string
          gender: string | null
          id: string
          last_name: string
          phone: string | null
          pincode: string | null
          primary_doctor_id: string | null
          state: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          avatar_url?: string | null
          blood_group?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          dob?: string | null
          email: string
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          phone?: string | null
          pincode?: string | null
          primary_doctor_id?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          avatar_url?: string | null
          blood_group?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          dob?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          pincode?: string | null
          primary_doctor_id?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_intake_primary_doctor_id_fkey"
            columns: ["primary_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          clinic_id: string | null
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          received_by: string | null
          reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          clinic_id?: string | null
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          received_by?: string | null
          reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          clinic_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          received_by?: string | null
          reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["profile_status"]
          status_reason: string | null
          status_updated_at: string | null
          status_updated_by: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          status_reason?: string | null
          status_updated_at?: string | null
          status_updated_by?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          status_reason?: string | null
          status_updated_at?: string | null
          status_updated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          id: string
          name: string
          permissions: Json
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          permissions?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          permissions?: Json
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          clinic_id: string | null
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category_id: string | null
          clinic_id: string | null
          code: string | null
          cost: number
          created_at: string
          description: string | null
          duration: number | null
          id: string
          name: string
          price: number
          tax_rate: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          clinic_id?: string | null
          code?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          name: string
          price?: number
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          clinic_id?: string | null
          code?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          name?: string
          price?: number
          tax_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      site_pages: {
        Row: {
          created_at: string
          eyebrow: string | null
          heading: string
          intro: string | null
          name: string
          seo_description: string
          seo_title: string
          slug: string
          subheading: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          eyebrow?: string | null
          heading: string
          intro?: string | null
          name: string
          seo_description: string
          seo_title: string
          slug: string
          subheading?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          eyebrow?: string | null
          heading?: string
          intro?: string | null
          name?: string
          seo_description?: string
          seo_title?: string
          slug?: string
          subheading?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_role_assignments: {
        Row: {
          created_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_guest_booking:
        | {
            Args: {
              _date: string
              _dob: string
              _doctor_id: string
              _email: string
              _first_name: string
              _gender: string
              _last_name: string
              _phone: string
              _reason: string
              _time: string
              _user_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              _custom_reason?: string
              _date: string
              _dob: string
              _doctor_id: string
              _email: string
              _first_name: string
              _gender: string
              _last_name: string
              _phone: string
              _reason: string
              _reason_id?: string
              _time: string
              _user_id: string
            }
            Returns: Json
          }
      has_permission: {
        Args: { _action: string; _module: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_invoice_number: { Args: never; Returns: string }
      recalc_invoice: { Args: { _invoice_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "doctor" | "patient" | "assistant"
      invoice_status:
        | "draft"
        | "pending"
        | "partially_paid"
        | "paid"
        | "cancelled"
      payment_method: "cash" | "card" | "insurance" | "transfer" | "online"
      profile_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "doctor", "patient", "assistant"],
      invoice_status: [
        "draft",
        "pending",
        "partially_paid",
        "paid",
        "cancelled",
      ],
      payment_method: ["cash", "card", "insurance", "transfer", "online"],
      profile_status: ["pending", "approved", "rejected"],
    },
  },
} as const
