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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: Json
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      batch_updates: {
        Row: {
          batch_id: string
          body_bn: string | null
          body_en: string | null
          created_at: string
          event_date: string
          id: string
          is_planned: boolean
          source_note: string | null
          title_bn: string
          title_en: string
        }
        Insert: {
          batch_id: string
          body_bn?: string | null
          body_en?: string | null
          created_at?: string
          event_date?: string
          id?: string
          is_planned?: boolean
          source_note?: string | null
          title_bn: string
          title_en: string
        }
        Update: {
          batch_id?: string
          body_bn?: string | null
          body_en?: string | null
          created_at?: string
          event_date?: string
          id?: string
          is_planned?: boolean
          source_note?: string | null
          title_bn?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_updates_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_subscriptions: {
        Row: {
          campaign_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_subscriptions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          community_featured: boolean
          created_at: string
          feature_goal_reached_at: string | null
          feature_vote_target: number
          id: string
          paused_reason_bn: string | null
          paused_reason_en: string | null
          product_id: string
          publish_vote_target: boolean
          reservation_account_target: number
          reservation_unit_target: number
          reserved_units: number
          reserving_accounts: number
          state: Database["public"]["Enums"]["campaign_state"]
          state_changed_at: string
          updated_at: string
          vote_count: number
        }
        Insert: {
          community_featured?: boolean
          created_at?: string
          feature_goal_reached_at?: string | null
          feature_vote_target?: number
          id?: string
          paused_reason_bn?: string | null
          paused_reason_en?: string | null
          product_id: string
          publish_vote_target?: boolean
          reservation_account_target?: number
          reservation_unit_target?: number
          reserved_units?: number
          reserving_accounts?: number
          state?: Database["public"]["Enums"]["campaign_state"]
          state_changed_at?: string
          updated_at?: string
          vote_count?: number
        }
        Update: {
          community_featured?: boolean
          created_at?: string
          feature_goal_reached_at?: string | null
          feature_vote_target?: number
          id?: string
          paused_reason_bn?: string | null
          paused_reason_en?: string | null
          product_id?: string
          publish_vote_target?: boolean
          reservation_account_target?: number
          reservation_unit_target?: number
          reserved_units?: number
          reserving_accounts?: number
          state?: Database["public"]["Enums"]["campaign_state"]
          state_changed_at?: string
          updated_at?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          name_bn: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          name_bn: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          name_bn?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          arrival_confidence: string | null
          created_at: string
          delay_note_bn: string | null
          delay_note_en: string | null
          delayed: boolean
          expected_arrival_from: string | null
          expected_arrival_to: string | null
          id: string
          product_id: string
          public_id: string
          quantity: number | null
          state: Database["public"]["Enums"]["batch_state"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          arrival_confidence?: string | null
          created_at?: string
          delay_note_bn?: string | null
          delay_note_en?: string | null
          delayed?: boolean
          expected_arrival_from?: string | null
          expected_arrival_to?: string | null
          id?: string
          product_id: string
          public_id: string
          quantity?: number | null
          state?: Database["public"]["Enums"]["batch_state"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          arrival_confidence?: string | null
          created_at?: string
          delay_note_bn?: string | null
          delay_note_en?: string | null
          delayed?: boolean
          expected_arrival_from?: string | null
          expected_arrival_to?: string | null
          id?: string
          product_id?: string
          public_id?: string
          quantity?: number | null
          state?: Database["public"]["Enums"]["batch_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          body: string
          created_at: string
          email: string | null
          error: string | null
          id: string
          kind: string
          sent_at: string | null
          subject: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          email?: string | null
          error?: string | null
          id?: string
          kind: string
          sent_at?: string | null
          subject: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          email?: string | null
          error?: string | null
          id?: string
          kind?: string
          sent_at?: string | null
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          title_snapshot: string
          unit_price_bdt: number
          variant_id: string
          variant_snapshot: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          title_snapshot: string
          unit_price_bdt: number
          variant_id: string
          variant_snapshot: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          title_snapshot?: string
          unit_price_bdt?: number
          variant_id?: string
          variant_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_fee_bdt: number
          delivery_from: string | null
          delivery_to: string | null
          district: string
          id: string
          instructions: string | null
          items_total_bdt: number
          landmark: string | null
          order_confirmed_at: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          public_id: string
          recipient_name: string
          status: Database["public"]["Enums"]["order_status"]
          street: string
          terms_version: string | null
          thana: string
          total_bdt: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_fee_bdt?: number
          delivery_from?: string | null
          delivery_to?: string | null
          district: string
          id?: string
          instructions?: string | null
          items_total_bdt?: number
          landmark?: string | null
          order_confirmed_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          public_id: string
          recipient_name: string
          status?: Database["public"]["Enums"]["order_status"]
          street: string
          terms_version?: string | null
          thana: string
          total_bdt?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_fee_bdt?: number
          delivery_from?: string | null
          delivery_to?: string | null
          district?: string
          id?: string
          instructions?: string | null
          items_total_bdt?: number
          landmark?: string | null
          order_confirmed_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          public_id?: string
          recipient_name?: string
          status?: Database["public"]["Enums"]["order_status"]
          street?: string
          terms_version?: string | null
          thana?: string
          total_bdt?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_bn: string | null
          alt_en: string | null
          id: string
          is_supplier_media: boolean
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_bn?: string | null
          alt_en?: string | null
          id?: string
          is_supplier_media?: boolean
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_bn?: string | null
          alt_en?: string | null
          id?: string
          is_supplier_media?: boolean
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          detail_bn: string | null
          detail_en: string | null
          id: string
          local_stock: number
          name_bn: string
          name_en: string
          price_bdt: number | null
          product_id: string
          sku: string
          sort_order: number
          unavailable_reason_bn: string | null
          unavailable_reason_en: string | null
        }
        Insert: {
          detail_bn?: string | null
          detail_en?: string | null
          id?: string
          local_stock?: number
          name_bn: string
          name_en: string
          price_bdt?: number | null
          product_id: string
          sku: string
          sort_order?: number
          unavailable_reason_bn?: string | null
          unavailable_reason_en?: string | null
        }
        Update: {
          detail_bn?: string | null
          detail_en?: string | null
          id?: string
          local_stock?: number
          name_bn?: string
          name_en?: string
          price_bdt?: number | null
          product_id?: string
          sku?: string
          sort_order?: number
          unavailable_reason_bn?: string | null
          unavailable_reason_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          estimated_price_bdt: number | null
          evidence: Database["public"]["Enums"]["evidence_level"]
          final_price_bdt: number | null
          hero_image_url: string | null
          id: string
          is_sample: boolean
          is_staff_pick: boolean
          local_stock: number
          price_note_bn: string | null
          price_note_en: string | null
          slug: string
          specs: Json
          status: Database["public"]["Enums"]["publication_status"]
          summary_bn: string | null
          summary_en: string | null
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          estimated_price_bdt?: number | null
          evidence?: Database["public"]["Enums"]["evidence_level"]
          final_price_bdt?: number | null
          hero_image_url?: string | null
          id?: string
          is_sample?: boolean
          is_staff_pick?: boolean
          local_stock?: number
          price_note_bn?: string | null
          price_note_en?: string | null
          slug: string
          specs?: Json
          status?: Database["public"]["Enums"]["publication_status"]
          summary_bn?: string | null
          summary_en?: string | null
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          estimated_price_bdt?: number | null
          evidence?: Database["public"]["Enums"]["evidence_level"]
          final_price_bdt?: number | null
          hero_image_url?: string | null
          id?: string
          is_sample?: boolean
          is_staff_pick?: boolean
          local_stock?: number
          price_note_bn?: string | null
          price_note_en?: string | null
          slug?: string
          specs?: Json
          status?: Database["public"]["Enums"]["publication_status"]
          summary_bn?: string | null
          summary_en?: string | null
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          district: string | null
          id: string
          locale: string
          marketing_consent: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          district?: string | null
          id: string
          locale?: string
          marketing_consent?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          district?: string | null
          id?: string
          locale?: string
          marketing_consent?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          acknowledged: boolean
          campaign_id: string
          created_at: string
          district: string | null
          id: string
          quantity: number
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          user_id: string
          variant_id: string
        }
        Insert: {
          acknowledged?: boolean
          campaign_id: string
          created_at?: string
          district?: string | null
          id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id: string
          variant_id: string
        }
        Update: {
          acknowledged?: boolean
          campaign_id?: string
          created_at?: string
          district?: string | null
          id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          conditions_bn: string | null
          conditions_en: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          kind: Database["public"]["Enums"]["review_kind"]
          limitations_bn: string | null
          limitations_en: string | null
          media_url: string | null
          poster_url: string | null
          product_id: string
          reviewed_on: string | null
          reviewer_name: string | null
          reviewer_role: string | null
          sample_variant: string | null
          source_note: string | null
          sponsored: boolean
          strengths_bn: string | null
          strengths_en: string | null
          transcript_url: string | null
        }
        Insert: {
          conditions_bn?: string | null
          conditions_en?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          kind: Database["public"]["Enums"]["review_kind"]
          limitations_bn?: string | null
          limitations_en?: string | null
          media_url?: string | null
          poster_url?: string | null
          product_id: string
          reviewed_on?: string | null
          reviewer_name?: string | null
          reviewer_role?: string | null
          sample_variant?: string | null
          source_note?: string | null
          sponsored?: boolean
          strengths_bn?: string | null
          strengths_en?: string | null
          transcript_url?: string | null
        }
        Update: {
          conditions_bn?: string | null
          conditions_en?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["review_kind"]
          limitations_bn?: string | null
          limitations_en?: string | null
          media_url?: string | null
          poster_url?: string | null
          product_id?: string
          reviewed_on?: string | null
          reviewer_name?: string | null
          reviewer_role?: string | null
          sample_variant?: string | null
          source_note?: string | null
          sponsored?: boolean
          strengths_bn?: string | null
          strengths_en?: string | null
          transcript_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_products: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
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
      votes: {
        Row: {
          active: boolean
          campaign_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          campaign_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          campaign_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
      batch_state:
        | "proposed"
        | "approved"
        | "purchased"
        | "international_transit"
        | "customs"
        | "receiving"
        | "available"
        | "completed"
        | "cancelled"
      campaign_state:
        | "collecting"
        | "procurement_review"
        | "closed"
        | "paused"
        | "cancelled"
      evidence_level:
        | "supplier_only"
        | "staff_demo"
        | "staff_unboxing"
        | "staff_tested"
      order_status:
        | "pending_payment"
        | "confirmation_pending"
        | "confirmed"
        | "packing"
        | "shipped"
        | "delivered"
        | "cancellation_requested"
        | "cancelled"
        | "closed"
      payment_status:
        | "not_started"
        | "pending"
        | "paid"
        | "failed"
        | "expired"
        | "cod_due"
        | "cod_collected"
      publication_status: "draft" | "published" | "hidden" | "archived"
      reservation_status: "active" | "withdrawn" | "expired" | "closed"
      review_kind:
        | "staff_demonstration"
        | "staff_unboxing"
        | "staff_tested"
        | "supplier_media"
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
      app_role: ["admin", "staff", "user"],
      batch_state: [
        "proposed",
        "approved",
        "purchased",
        "international_transit",
        "customs",
        "receiving",
        "available",
        "completed",
        "cancelled",
      ],
      campaign_state: [
        "collecting",
        "procurement_review",
        "closed",
        "paused",
        "cancelled",
      ],
      evidence_level: [
        "supplier_only",
        "staff_demo",
        "staff_unboxing",
        "staff_tested",
      ],
      order_status: [
        "pending_payment",
        "confirmation_pending",
        "confirmed",
        "packing",
        "shipped",
        "delivered",
        "cancellation_requested",
        "cancelled",
        "closed",
      ],
      payment_status: [
        "not_started",
        "pending",
        "paid",
        "failed",
        "expired",
        "cod_due",
        "cod_collected",
      ],
      publication_status: ["draft", "published", "hidden", "archived"],
      reservation_status: ["active", "withdrawn", "expired", "closed"],
      review_kind: [
        "staff_demonstration",
        "staff_unboxing",
        "staff_tested",
        "supplier_media",
      ],
    },
  },
} as const
