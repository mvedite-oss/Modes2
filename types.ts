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
      contents: {
        Row: {
          banner_url: string | null
          category: Database["public"]["Enums"]["content_category"]
          cover_url: string | null
          created_at: string
          current_version: string
          description: string
          featured: boolean
          featured_description: string | null
          featured_title: string | null
          gallery: string[]
          id: string
          name: string
          published: boolean
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          category: Database["public"]["Enums"]["content_category"]
          cover_url?: string | null
          created_at?: string
          current_version?: string
          description?: string
          featured?: boolean
          featured_description?: string | null
          featured_title?: string | null
          gallery?: string[]
          id?: string
          name: string
          published?: boolean
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          category?: Database["public"]["Enums"]["content_category"]
          cover_url?: string | null
          created_at?: string
          current_version?: string
          description?: string
          featured?: boolean
          featured_description?: string | null
          featured_title?: string | null
          gallery?: string[]
          id?: string
          name?: string
          published?: boolean
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      download_history: {
        Row: {
          content_id: string
          created_at: string
          id: string
          user_id: string
          version: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          user_id: string
          version: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "download_history_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
      }
      downloads: {
        Row: {
          url: string
          version_id: string
        }
        Insert: {
          url: string
          version_id: string
        }
        Update: {
          url?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "downloads_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: true
            referencedRelation: "versions"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          content_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blocked: boolean
          created_at: string
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          blocked?: boolean
          created_at?: string
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          blocked?: boolean
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          background_url: string | null
          button_style: string
          card_size: string
          hero_banner_url: string | null
          hero_subtitle: string
          hero_title: string
          id: number
          primary_color: string
          sort_order: string
          theme: string
        }
        Insert: {
          background_url?: string | null
          button_style?: string
          card_size?: string
          hero_banner_url?: string | null
          hero_subtitle?: string
          hero_title?: string
          id?: number
          primary_color?: string
          sort_order?: string
          theme?: string
        }
        Update: {
          background_url?: string | null
          button_style?: string
          card_size?: string
          hero_banner_url?: string | null
          hero_subtitle?: string
          hero_title?: string
          id?: number
          primary_color?: string
          sort_order?: string
          theme?: string
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
      versions: {
        Row: {
          archived: boolean
          content_id: string
          created_at: string
          description: string
          features: string[]
          id: string
          images: string[]
          is_current: boolean
          version: string
        }
        Insert: {
          archived?: boolean
          content_id: string
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          images?: string[]
          is_current?: boolean
          version: string
        }
        Update: {
          archived?: boolean
          content_id?: string
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          images?: string[]
          is_current?: boolean
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "versions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email_exists: { Args: { _email: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_user: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      content_category: "jogo" | "skin" | "xite"
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
      app_role: ["admin", "user"],
      content_category: ["jogo", "skin", "xite"],
    },
  },
} as const
