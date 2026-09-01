export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer_enquiries: {
        Row: {
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
          source: string
          status: string
          submission_token: string
          updated_at: string
        }
        Insert: {
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
          source?: string
          status?: string
          submission_token?: string
          updated_at?: string
        }
        Update: {
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
          source?: string
          status?: string
          submission_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      practitioner_expressions_of_interest: {
        Row: {
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
          source: string
          status: string
          submission_token: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
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
          source?: string
          status?: string
          submission_token?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
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
          source?: string
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
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          type: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          type: string
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          type?: string
        }
        Relationships: []
      }
      practitioners: {
        Row: {
          about: string | null
          created_at: string
          credentials: string[] | null
          descriptor: string | null
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
          created_at?: string
          credentials?: string[] | null
          descriptor?: string | null
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
          created_at?: string
          credentials?: string[] | null
          descriptor?: string | null
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
