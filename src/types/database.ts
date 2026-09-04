export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  admin_api: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_practitioner_draft: { Args: never; Returns: string }
      delete_failed_admin_practitioner_draft: {
        Args: { p_practitioner_id: string }
        Returns: undefined
      }
      reorder_admin_featured: {
        Args: { p_practitioner_ids: string[] }
        Returns: undefined
      }
      save_admin_practitioner: {
        Args: {
          p_about?: string
          p_credentials?: string[]
          p_descriptor?: string
          p_featured_position?: number
          p_image_alt?: string
          p_image_focal_x?: number
          p_image_focal_y?: number
          p_image_path?: string
          p_instagram_url?: string
          p_name?: string
          p_offers_in_person?: boolean
          p_offers_online?: boolean
          p_practitioner_id?: string
          p_significant_training?: string[]
          p_slug?: string
          p_status?: string
          p_summary?: string
          p_term_ids?: string[]
          p_website_url?: string
          p_years_active?: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_enquiries: {
        Row: {
          archived_at: string | null
          consent_confirmed: boolean
          consent_given_at: string
          contact_preference: string
          created_at: string
          customer_confirmation_sent_at: string | null
          customer_confirmation_status: string
          email: string
          full_name: string
          id: string
          internal_notes: string | null
          internal_notification_sent_at: string | null
          internal_notification_status: string
          phone: string | null
          questionnaire_answers: Json
          source: Database["public"]["Enums"]["submission_source"]
          status: string
          submission_token: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          consent_confirmed: boolean
          consent_given_at?: string
          contact_preference?: string
          created_at?: string
          customer_confirmation_sent_at?: string | null
          customer_confirmation_status?: string
          email: string
          full_name: string
          id?: string
          internal_notes?: string | null
          internal_notification_sent_at?: string | null
          internal_notification_status?: string
          phone?: string | null
          questionnaire_answers?: Json
          source?: Database["public"]["Enums"]["submission_source"]
          status?: string
          submission_token?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          consent_confirmed?: boolean
          consent_given_at?: string
          contact_preference?: string
          created_at?: string
          customer_confirmation_sent_at?: string | null
          customer_confirmation_status?: string
          email?: string
          full_name?: string
          id?: string
          internal_notes?: string | null
          internal_notification_sent_at?: string | null
          internal_notification_status?: string
          phone?: string | null
          questionnaire_answers?: Json
          source?: Database["public"]["Enums"]["submission_source"]
          status?: string
          submission_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      practitioner_expressions_of_interest: {
        Row: {
          archived_at: string | null
          consent_confirmed: boolean
          consent_given_at: string
          contact_preference: string
          created_at: string
          customer_confirmation_sent_at: string | null
          email: string
          full_name: string
          id: string
          internal_notes: string | null
          internal_notification_sent_at: string | null
          location: string | null
          phone: string | null
          practice_name: string | null
          questionnaire_answers: Json
          source: Database["public"]["Enums"]["submission_source"]
          status: string
          submission_token: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          archived_at?: string | null
          consent_confirmed: boolean
          consent_given_at?: string
          contact_preference?: string
          created_at?: string
          customer_confirmation_sent_at?: string | null
          email: string
          full_name: string
          id?: string
          internal_notes?: string | null
          internal_notification_sent_at?: string | null
          location?: string | null
          phone?: string | null
          practice_name?: string | null
          questionnaire_answers?: Json
          source?: Database["public"]["Enums"]["submission_source"]
          status?: string
          submission_token?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          archived_at?: string | null
          consent_confirmed?: boolean
          consent_given_at?: string
          contact_preference?: string
          created_at?: string
          customer_confirmation_sent_at?: string | null
          email?: string
          full_name?: string
          id?: string
          internal_notes?: string | null
          internal_notification_sent_at?: string | null
          location?: string | null
          phone?: string | null
          practice_name?: string | null
          questionnaire_answers?: Json
          source?: Database["public"]["Enums"]["submission_source"]
          status?: string
          submission_token?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      practitioner_term_links: {
        Row: {
          display_order: number
          practitioner_id: string
          term_id: string
        }
        Insert: {
          display_order?: number
          practitioner_id: string
          term_id: string
        }
        Update: {
          display_order?: number
          practitioner_id?: string
          term_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_term_links_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_term_links_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "practitioner_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioner_terms: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          type: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      practitioners: {
        Row: {
          about: string | null
          archived_at: string | null
          created_at: string
          credentials: string[] | null
          descriptor: string | null
          featured_position: number | null
          id: string
          image_alt: string | null
          image_focal_x: number
          image_focal_y: number
          image_path: string | null
          instagram_url: string | null
          name: string
          offers_in_person: boolean
          offers_online: boolean
          published_at: string | null
          significant_training: string[] | null
          slug: string
          status: string
          summary: string | null
          updated_at: string
          website_url: string | null
          years_active: number | null
        }
        Insert: {
          about?: string | null
          archived_at?: string | null
          created_at?: string
          credentials?: string[] | null
          descriptor?: string | null
          featured_position?: number | null
          id?: string
          image_alt?: string | null
          image_focal_x?: number
          image_focal_y?: number
          image_path?: string | null
          instagram_url?: string | null
          name: string
          offers_in_person?: boolean
          offers_online?: boolean
          published_at?: string | null
          significant_training?: string[] | null
          slug: string
          status?: string
          summary?: string | null
          updated_at?: string
          website_url?: string | null
          years_active?: number | null
        }
        Update: {
          about?: string | null
          archived_at?: string | null
          created_at?: string
          credentials?: string[] | null
          descriptor?: string | null
          featured_position?: number | null
          id?: string
          image_alt?: string | null
          image_focal_x?: number
          image_focal_y?: number
          image_path?: string | null
          instagram_url?: string | null
          name?: string
          offers_in_person?: boolean
          offers_online?: boolean
          published_at?: string | null
          significant_training?: string[] | null
          slug?: string
          status?: string
          summary?: string | null
          updated_at?: string
          website_url?: string | null
          years_active?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assert_published_practitioner_has_location: {
        Args: { p_practitioner_id: string }
        Returns: undefined
      }
      claim_customer_enquiry_delivery: {
        Args: { p_enquiry_id: string }
        Returns: {
          send_customer: boolean
          send_internal: boolean
        }[]
      }
      get_active_practitioner_taxonomy_term: {
        Args: { p_slug: string; p_type: string }
        Returns: {
          id: string
          name: string
          slug: string
          type: string
        }[]
      }
      list_active_practitioner_taxonomy_terms: {
        Args: never
        Returns: {
          id: string
          name: string
          slug: string
          type: string
        }[]
      }
      search_published_practitioner_ids: {
        Args: {
          p_approach_slugs?: string[]
          p_area_slugs?: string[]
          p_format_values?: string[]
          p_language_slugs?: string[]
          p_location_slugs?: string[]
          p_query?: string
          p_works_with_slugs?: string[]
        }
        Returns: {
          practitioner_id: string
        }[]
      }
    }
    Enums: {
      submission_source: "website" | "admin"
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
  admin_api: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      submission_source: ["website", "admin"],
    },
  },
} as const
