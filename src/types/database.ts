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
          airtable_test_record: boolean
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
          airtable_test_record?: boolean
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
          airtable_test_record?: boolean
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
          airtable_test_record: boolean
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
          airtable_test_record?: boolean
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
          airtable_test_record?: boolean
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
      airtable_sync_events: {
        Row: {
          attempt_count: number
          completed_at: string | null
          created_at: string
          id: string
          is_test_record: boolean
          last_error: string | null
          last_error_code: string | null
          operation: "upsert" | "delete"
          source: "customer_enquiry" | "practitioner_expression"
          source_id: string
          source_submission_id: string
          started_at: string | null
          status: "pending" | "processing" | "succeeded" | "failed"
          updated_at: string
          webhook_request_id: number | null
          workflow_run_id: string | null
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          is_test_record?: boolean
          last_error?: string | null
          last_error_code?: string | null
          operation: "upsert" | "delete"
          source: "customer_enquiry" | "practitioner_expression"
          source_id: string
          source_submission_id: string
          started_at?: string | null
          status?: "pending" | "processing" | "succeeded" | "failed"
          updated_at?: string
          webhook_request_id?: number | null
          workflow_run_id?: string | null
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          is_test_record?: boolean
          last_error?: string | null
          last_error_code?: string | null
          operation?: "upsert" | "delete"
          source?: "customer_enquiry" | "practitioner_expression"
          source_id?: string
          source_submission_id?: string
          started_at?: string | null
          status?: "pending" | "processing" | "succeeded" | "failed"
          updated_at?: string
          webhook_request_id?: number | null
          workflow_run_id?: string | null
        }
        Relationships: []
      }
      airtable_sync_leases: {
        Row: {
          event_id: string
          lease_expires_at: string
          source: "customer_enquiry" | "practitioner_expression"
          source_id: string
          updated_at: string
        }
        Insert: {
          event_id: string
          lease_expires_at: string
          source: "customer_enquiry" | "practitioner_expression"
          source_id: string
          updated_at?: string
        }
        Update: {
          event_id?: string
          lease_expires_at?: string
          source?: "customer_enquiry" | "practitioner_expression"
          source_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_customer_enquiry_delivery: {
        Args: { p_enquiry_id: string }
        Returns: {
          send_customer: boolean
          send_internal: boolean
        }[]
      }
      claim_airtable_sync_event: {
        Args: { p_event_id: string }
        Returns: {
          claimed: boolean
          current_status: "pending" | "processing" | "succeeded" | "failed" | null
          operation: "upsert" | "delete" | null
          is_test_record: boolean | null
          source: "customer_enquiry" | "practitioner_expression" | null
          source_id: string | null
          source_submission_id: string | null
        }[]
      }
      complete_airtable_sync_event: {
        Args: {
          p_error?: string | null
          p_error_code?: string | null
          p_event_id: string
          p_status: "succeeded" | "failed"
        }
        Returns: undefined
      }
      reset_airtable_sync_event: {
        Args: { p_event_id: string }
        Returns: boolean
      }
    }
    Enums: {
      airtable_sync_operation: "upsert" | "delete"
      airtable_sync_source: "customer_enquiry" | "practitioner_expression"
      airtable_sync_status: "pending" | "processing" | "succeeded" | "failed"
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
