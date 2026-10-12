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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      candidate_profiles: {
        Row: {
          bio: string
          display_name: string
          education: string
          experience: string
          experience_details: string
          headline: string
          is_visible: boolean
          job_title: string
          location: string
          professional_references: string
          resume_path: string | null
          sector: string
          skills: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string
          display_name?: string
          education?: string
          experience?: string
          experience_details?: string
          headline?: string
          is_visible?: boolean
          job_title?: string
          location?: string
          professional_references?: string
          resume_path?: string | null
          sector?: string
          skills?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string
          display_name?: string
          education?: string
          experience?: string
          experience_details?: string
          headline?: string
          is_visible?: boolean
          job_title?: string
          location?: string
          professional_references?: string
          resume_path?: string | null
          sector?: string
          skills?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_titles: {
        Row: {
          id: string
          name: string
          sector_slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          sector_slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          sector_slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_titles_sector_slug_fkey"
            columns: ["sector_slug"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["slug"]
          },
        ]
      }
      jobs: {
        Row: {
          company_name: string
          company_id: string | null
          contract: string
          contract_type: string
          created_at: string
          country: string
          city: string
          description: string
          education_level: string
          experience: string
          experience_level: string
          id: string
          is_featured: boolean
          is_remote: boolean
          job_title: string
          location: string
          remote: boolean
          required_degree: string
          recruiter_id: string
          salary_max: number | null
          salary_min: number | null
          salary_range: string | null
          sector: string
          sector_id: string | null
          status: string
          title: string
        }
        Insert: {
          company_name?: string
          company_id?: string | null
          contract?: string
          contract_type?: string
          created_at?: string
          country?: string
          city?: string
          description?: string
          education_level?: string
          experience?: string
          experience_level?: string
          id?: string
          is_featured?: boolean
          is_remote?: boolean
          job_title?: string
          location?: string
          remote?: boolean
          required_degree?: string
          recruiter_id: string
          salary_max?: number | null
          salary_min?: number | null
          salary_range?: string | null
          sector?: string
          sector_id?: string | null
          status?: string
          title: string
        }
        Update: {
          company_name?: string
          company_id?: string | null
          contract?: string
          contract_type?: string
          created_at?: string
          country?: string
          city?: string
          description?: string
          education_level?: string
          experience?: string
          experience_level?: string
          id?: string
          is_featured?: boolean
          is_remote?: boolean
          job_title?: string
          location?: string
          remote?: boolean
          required_degree?: string
          recruiter_id?: string
          salary_max?: number | null
          salary_min?: number | null
          salary_range?: string | null
          sector?: string
          sector_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          candidate_id: string
          cover_letter: string
          created_at: string
          cv_url: string | null
          id: string
          interview_at: string | null
          job_id: string
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          cover_letter?: string
          created_at?: string
          cv_url?: string | null
          id?: string
          interview_at?: string | null
          job_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          cover_letter?: string
          created_at?: string
          cv_url?: string | null
          id?: string
          interview_at?: string | null
          job_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_alerts: {
        Row: {
          active: boolean
          candidate_id: string
          city: string
          country: string
          created_at: string
          id: string
          job_title: string
          name: string
          sector: string
        }
        Insert: {
          active?: boolean
          candidate_id: string
          city?: string
          country?: string
          created_at?: string
          id?: string
          job_title?: string
          name?: string
          sector?: string
        }
        Update: {
          active?: boolean
          candidate_id?: string
          city?: string
          country?: string
          created_at?: string
          id?: string
          job_title?: string
          name?: string
          sector?: string
        }
        Relationships: []
      }
      candidate_shortlists: {
        Row: {
          candidate_id: string
          created_at: string
          recruiter_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          recruiter_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          recruiter_id?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          city: string
          company_name: string
          country: string
          description: string
          registration_number: string
          updated_at: string
          user_id: string
          verification_note: string
          verification_status: string
          verified_at: string | null
          website: string
        }
        Insert: {
          city?: string
          company_name?: string
          country?: string
          description?: string
          registration_number?: string
          updated_at?: string
          user_id: string
          verification_note?: string
          verification_status?: string
          verified_at?: string | null
          website?: string
        }
        Update: {
          city?: string
          company_name?: string
          country?: string
          description?: string
          registration_number?: string
          updated_at?: string
          user_id?: string
          verification_note?: string
          verification_status?: string
          verified_at?: string | null
          website?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          plan: string
          status: string
          user_id: string
          validated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          plan?: string
          status?: string
          user_id: string
          validated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          plan?: string
          status?: string
          user_id?: string
          validated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          role: Database["public"]["Enums"]["app_role"]
          suspended: boolean
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string
          role?: Database["public"]["Enums"]["app_role"]
          suspended?: boolean
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          role?: Database["public"]["Enums"]["app_role"]
          suspended?: boolean
        }
        Relationships: []
      }
      sectors: {
        Row: {
          created_at: string
          description: string
          id: string
          icon: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          icon?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          icon?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      companies: {
        Row: {
          city: string
          country: string
          created_at: string
          description: string
          id: string
          is_verified: boolean
          logo_url: string | null
          name: string
          owner_id: string
          sector_id: string | null
          subscription_plan: string
          website: string | null
        }
        Insert: {
          city?: string
          country?: string
          created_at?: string
          description?: string
          id?: string
          is_verified?: boolean
          logo_url?: string | null
          name: string
          owner_id: string
          sector_id?: string | null
          subscription_plan?: string
          website?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          description?: string
          id?: string
          is_verified?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string
          sector_id?: string | null
          subscription_plan?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      admin_list_resumes: {
        Args: never
        Returns: {
          created_at: string
          mimetype: string
          owner_id: string
          path: string
          size: number
        }[]
      }
      admin_set_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _target: string
        }
        Returns: undefined
      }
      admin_set_suspended: {
        Args: { _suspended: boolean; _target: string }
        Returns: undefined
      }
      admin_stats: { Args: never; Returns: Json }
      admin_validate_payment: {
        Args: {
          _amount: number
          _method: string
          _plan: string
          _target: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      admin_set_company_verification: {
        Args: { _note?: string; _status: string; _target: string }
        Returns: undefined
      }
      delete_my_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      request_company_verification: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "candidate" | "company" | "recruiter" | "institution" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["candidate", "company", "recruiter", "institution", "admin"],
    },
  },
} as const
