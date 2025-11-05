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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          supplier_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          supplier_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          organization_id: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          created_at: string
          email: string | null
          estado: string | null
          id: string
          matriz_id: string | null
          name: string
          numero: string | null
          razao_social: string | null
          rua: string | null
          settings: Json | null
          telefone: string | null
          tipo: string | null
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          id?: string
          matriz_id?: string | null
          name: string
          numero?: string | null
          razao_social?: string | null
          rua?: string | null
          settings?: Json | null
          telefone?: string | null
          tipo?: string | null
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          id?: string
          matriz_id?: string | null
          name?: string
          numero?: string | null
          razao_social?: string | null
          rua?: string | null
          settings?: Json | null
          telefone?: string | null
          tipo?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_matriz_id_fkey"
            columns: ["matriz_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          allow_down_payment: boolean | null
          card_brands_config: Json | null
          created_at: string | null
          description: string | null
          fee_per_installment: Json | null
          fee_percentage: number | null
          id: string
          installments_config: Json | null
          interest_free_installments: number | null
          is_active: boolean | null
          max_installments: number | null
          name: string
          organization_id: string
          provider_name: string | null
          provider_type: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          allow_down_payment?: boolean | null
          card_brands_config?: Json | null
          created_at?: string | null
          description?: string | null
          fee_per_installment?: Json | null
          fee_percentage?: number | null
          id?: string
          installments_config?: Json | null
          interest_free_installments?: number | null
          is_active?: boolean | null
          max_installments?: number | null
          name: string
          organization_id: string
          provider_name?: string | null
          provider_type?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_down_payment?: boolean | null
          card_brands_config?: Json | null
          created_at?: string | null
          description?: string | null
          fee_per_installment?: Json | null
          fee_percentage?: number | null
          id?: string
          installments_config?: Json | null
          interest_free_installments?: number | null
          is_active?: boolean | null
          max_installments?: number | null
          name?: string
          organization_id?: string
          provider_name?: string | null
          provider_type?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          brand_ids: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          media_type: string | null
          media_urls: string[] | null
          organization_id: string
          product_ids: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          brand_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_urls?: string[] | null
          organization_id: string
          product_ids?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          brand_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_urls?: string[] | null
          organization_id?: string
          product_ids?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      price_tables: {
        Row: {
          brand_ids: string[] | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          pdf_url: string
          supplier_ids: string[] | null
          updated_at: string
        }
        Insert: {
          brand_ids?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          pdf_url: string
          supplier_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          brand_ids?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          pdf_url?: string
          supplier_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      product_discounts: {
        Row: {
          brand_ids: string[] | null
          category_ids: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          product_ids: string[] | null
          start_date: string
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand_ids?: string[] | null
          category_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage: number
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          product_ids?: string[] | null
          start_date: string
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_ids?: string[] | null
          category_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          product_ids?: string[] | null
          start_date?: string
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_discounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_discounts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string
          id: string
          product_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          brand_id: string | null
          category_id: string | null
          cost_price: number | null
          created_at: string
          full_description: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          name: string
          organization_id: string
          sell_price: number | null
          simple_description: string | null
          sku: string | null
          stock: number | null
          unit: string | null
          unit_id: string | null
          updated_at: string
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          brand?: string | null
          brand_id?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          full_description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          name: string
          organization_id: string
          sell_price?: number | null
          simple_description?: string | null
          sku?: string | null
          stock?: number | null
          unit?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          brand?: string | null
          brand_id?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          full_description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          name?: string
          organization_id?: string
          sell_price?: number | null
          simple_description?: string | null
          sku?: string | null
          stock?: number | null
          unit?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          organization_id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proposal_sales: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          product_id: string
          product_name: string
          proposal_id: string
          quantity: number
          sale_date: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          product_id: string
          product_name: string
          proposal_id: string
          quantity: number
          sale_date?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          product_id?: string
          product_name?: string
          proposal_id?: string
          quantity?: number
          sale_date?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_sales_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_sales_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          content: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          html_content: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          organization_id: string
          template_type: string | null
          updated_at: string | null
          visual_config: Json | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          organization_id: string
          template_type?: string | null
          updated_at?: string | null
          visual_config?: Json | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          organization_id?: string
          template_type?: string | null
          updated_at?: string | null
          visual_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          client_id: string | null
          client_name: string
          created_at: string
          created_by_name: string | null
          description: string | null
          id: string
          items: Json | null
          margin: number | null
          organization_id: string
          status: string
          title: string
          updated_at: string
          user_id: string
          value: number
          version: number
        }
        Insert: {
          client_id?: string | null
          client_name: string
          created_at?: string
          created_by_name?: string | null
          description?: string | null
          id?: string
          items?: Json | null
          margin?: number | null
          organization_id: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          value?: number
          version?: number
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          created_by_name?: string | null
          description?: string | null
          id?: string
          items?: Json | null
          margin?: number | null
          organization_id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          value?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          cnpj: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          razao_social: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          razao_social?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          razao_social?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
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
      can_manage_products: { Args: { _user_id: string }; Returns: boolean }
      can_manage_proposals: { Args: { _user_id: string }; Returns: boolean }
      can_manage_users: { Args: { _user_id: string }; Returns: boolean }
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_manager: { Args: { _user_id: string }; Returns: boolean }
      is_seller: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "administrador" | "gerente" | "vendedor"
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
      app_role: ["administrador", "gerente", "vendedor"],
    },
  },
} as const
