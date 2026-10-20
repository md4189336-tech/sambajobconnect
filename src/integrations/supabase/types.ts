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
      applications: {
        Row: {
          candidate_email: string
          candidate_id: string
          candidate_name: string
           candidate_phone: string
          cover_letter: string
          created_at: string
          id: string
          interview_at: string | null
          interview_note: string
          job_id: string
          resume_path: string | null
          status: string
          updated_at: string
        }
        Insert: {
          candidate_email?: string
          candidate_id: string
          candidate_name?: string
          cover_letter?: string
          created_at?: string
          id?: string
          interview_at?: string | null
          interview_note?: string
          job_id: string
          resume_path?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_email?: string
          candidate_id?: string
          candidate_name?: string
          cover_letter?: string
          created_at?: string
          id?: string
          interview_at?: string | null
          interview_note?: string
          job_id?: string
          resume_path?: string | null
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
      candidate_entries: {
        Row: {
          created_at: string
          details: string
          id: string
          kind: string
          organization: string
          period: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: string
          id?: string
          kind: string
          organization?: string
          period?: string
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          kind?: string
          organization?: string
          period?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      candidate_profiles: {
        Row: {
          bio: string
          display_name: string
          experience: string
          headline: string
          is_visible: boolean
          job_title: string
          location: string
          resume_path: string | null
          sector: string
          skills: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string
          display_name?: string
          experience?: string
          headline?: string
          is_visible?: boolean
          job_title?: string
          location?: string
          resume_path?: string | null
          sector?: string
          skills?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string
          display_name?: string
          experience?: string
          headline?: string
          is_visible?: boolean
          job_title?: string
          location?: string
          resume_path?: string | null
          sector?: string
          skills?: string
          updated_at?: string
          user_id?: string
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
          name: string
          owner_id: string
          phone: string
          website: string
        }
        Insert: {
          city?: string
          country?: string
          created_at?: string
          description?: string
          id?: string
          is_verified?: boolean
          name?: string
          owner_id: string
          phone?: string
          website?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          description?: string
          id?: string
          is_verified?: boolean
          name?: string
          owner_id?: string
          phone?: string
          website?: string
        }
        Relationships: []
      }
      job_alerts: {
        Row: {
          city: string
          contract: string
          created_at: string
          id: string
          is_active: boolean
          job_title: string
          sector: string
          user_id: string
        }
        Insert: {
          city?: string
          contract?: string
          created_at?: string
          id?: string
          is_active?: boolean
          job_title?: string
          sector?: string
          user_id: string
        }
        Update: {
          city?: string
          contract?: string
          created_at?: string
          id?: string
          is_active?: boolean
          job_title?: string
          sector?: string
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
          city: string
          company_id: string | null
          company_name: string
          contract: string
          country: string
          created_at: string
          description: string
          education_level: string
          experience_level: string
          id: string
          is_remote: boolean
          job_title: string
          location: string
          recruiter_id: string
          salary_max: number | null
          salary_min: number | null
          sector: string
          sector_id: string | null
          status: string
          title: string
        }
        Insert: {
          city?: string
          company_id?: string | null
          company_name?: string
          contract?: string
          country?: string
          created_at?: string
          description?: string
          education_level?: string
          experience_level?: string
          id?: string
          is_remote?: boolean
          job_title?: string
          location?: string
          recruiter_id: string
          salary_max?: number | null
          salary_min?: number | null
          sector?: string
          sector_id?: string | null
          status?: string
          title: string
        }
        Update: {
          city?: string
          company_id?: string | null
          company_name?: string
          contract?: string
          country?: string
          created_at?: string
          description?: string
          education_level?: string
          experience_level?: string
          id?: string
          is_remote?: boolean
          job_title?: string
          location?: string
          recruiter_id?: string
          salary_max?: number | null
          salary_min?: number | null
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
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          suspended: boolean
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          suspended?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          suspended?: boolean
        }
        Relationships: []
      }
      sectors: {
        Row: {
          description: string
          icon: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          description?: string
          icon?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
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
      is_job_owner: { Args: { _job_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "candidate" | "recruiter" | "institution" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

      trainings: {
        Row: {
          award: string
          closing_date: string
          created_at: string
          description: string
          duration: string
          id: string
          institution_id: string
          institution_name: string
          location: string
          opening_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          award: string
          closing_date: string
          created_at?: string
          description: string
          duration: string
          id?: string
          institution_id: string
          institution_name: string
          location: string
          opening_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          award?: string
          closing_date?: string
          created_at?: string
          description?: string
          duration?: string
          id?: string
          institution_id?: string
          institution_name?: string
          location?: string
          opening_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      app_role: ["candidate", "recruiter", "institution", "admin"],
    },
  },
} as const
