export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          education: Json[] | null
          email: string
          experience_years: number | null
          full_name: string | null
          id: string
          interests: string[] | null
          level: number | null
          location: string | null
          phone: string | null
          points: number | null
          position: string | null
          rating: number | null
          role: string | null
          skills: string[] | null
          social_links: Json | null
          status: string | null
          title: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          education?: Json[] | null
          email: string
          experience_years?: number | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          level?: number | null
          location?: string | null
          phone?: string | null
          points?: number | null
          position?: string | null
          rating?: number | null
          role?: string | null
          skills?: string[] | null
          social_links?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          education?: Json[] | null
          email?: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          level?: number | null
          location?: string | null
          phone?: string | null
          points?: number | null
          position?: string | null
          rating?: number | null
          role?: string | null
          skills?: string[] | null
          social_links?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      project_applications: {
        Row: {
          applicant_id: string | null
          created_at: string | null
          id: string
          message: string | null
          project_id: string | null
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          project_id?: string | null
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          project_id?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_bookmarks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_likes: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string | null
          permissions: string[] | null
          project_id: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          permissions?: string[] | null
          project_id?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          permissions?: string[] | null
          project_id?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          is_public: boolean | null
          project_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          project_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          project_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          bookmarks: number | null
          category: string
          city: string | null
          comments_count: number | null
          contact_email: string | null
          contact_phone: string | null
          content: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          demo_url: string | null
          description: string
          founder_id: string | null
          founder_name: string
          funding_raised: number | null
          funding_stage: string | null
          funding_target: number | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_published: boolean | null
          latitude: number | null
          likes: number | null
          location: string | null
          logo_url: string | null
          longitude: number | null
          max_team_size: number | null
          moderation_status: string | null
          progress_percentage: number | null
          province: string | null
          published_at: string | null
          seeking_roles: string[] | null
          skills: string[] | null
          social_links: Json | null
          stage: string
          status: string | null
          tags: string[] | null
          team_size: number | null
          title: string
          type: string
          updated_at: string | null
          video_url: string | null
          views: number | null
          website_url: string | null
        }
        Insert: {
          bookmarks?: number | null
          category: string
          city?: string | null
          comments_count?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          content?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          demo_url?: string | null
          description: string
          founder_id?: string | null
          founder_name: string
          funding_raised?: number | null
          funding_stage?: string | null
          funding_target?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          latitude?: number | null
          likes?: number | null
          location?: string | null
          logo_url?: string | null
          longitude?: number | null
          max_team_size?: number | null
          moderation_status?: string | null
          progress_percentage?: number | null
          province?: string | null
          published_at?: string | null
          seeking_roles?: string[] | null
          skills?: string[] | null
          social_links?: Json | null
          stage?: string
          status?: string | null
          tags?: string[] | null
          team_size?: number | null
          title: string
          type?: string
          updated_at?: string | null
          video_url?: string | null
          views?: number | null
          website_url?: string | null
        }
        Update: {
          bookmarks?: number | null
          category?: string
          city?: string | null
          comments_count?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          content?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string
          founder_id?: string | null
          founder_name?: string
          funding_raised?: number | null
          funding_stage?: string | null
          funding_target?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          latitude?: number | null
          likes?: number | null
          location?: string | null
          logo_url?: string | null
          longitude?: number | null
          max_team_size?: number | null
          moderation_status?: string | null
          progress_percentage?: number | null
          province?: string | null
          published_at?: string | null
          seeking_roles?: string[] | null
          skills?: string[] | null
          social_links?: Json | null
          stage?: string
          status?: string | null
          tags?: string[] | null
          team_size?: number | null
          title?: string
          type?: string
          updated_at?: string | null
          video_url?: string | null
          views?: number | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points_history: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          points_change: number
          reference_id: string | null
          reference_type: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          points_change: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          points_change?: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_points_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_project_bookmarks: {
        Args: { project_id: string }
        Returns: undefined
      }
      decrement_project_likes: {
        Args: { project_id: string }
        Returns: undefined
      }
      get_email_by_username: {
        Args: { input_username: string }
        Returns: string
      }
      increment_project_bookmarks: {
        Args: { project_id: string }
        Returns: undefined
      }
      increment_project_likes: {
        Args: { project_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const