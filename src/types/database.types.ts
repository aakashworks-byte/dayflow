export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      audit_logs: {
        Row: {
          action: string
          actor_employee_id: string | null
          actor_user_id: string | null
          after_state: Json | null
          before_state: Json | null
          created_at: string
          diff: Json | null
          id: string
          ip_address: string | null
          metadata: Json
          organization_id: string
          resource_id: string
          resource_type: string
          trace_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_employee_id?: string | null
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          diff?: Json | null
          id?: string
          ip_address?: string | null
          metadata?: Json
          organization_id: string
          resource_id: string
          resource_type: string
          trace_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_employee_id?: string | null
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          diff?: Json | null
          id?: string
          ip_address?: string | null
          metadata?: Json
          organization_id?: string
          resource_id?: string
          resource_type?: string
          trace_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_employee_id_fkey"
            columns: ["actor_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          cost_center_code: string | null
          created_at: string
          deleted_at: string | null
          head_employee_id: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          parent_department_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          cost_center_code?: string | null
          created_at?: string
          deleted_at?: string | null
          head_employee_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          parent_department_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          cost_center_code?: string | null
          created_at?: string
          deleted_at?: string | null
          head_employee_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          parent_department_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_departments_head_employee"
            columns: ["organization_id", "head_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "fk_departments_parent"
            columns: ["organization_id", "parent_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          custom_attributes: Json
          date_of_birth: string | null
          deleted_at: string | null
          department_id: string
          display_name: string | null
          employee_code: string
          employment_status: Database["public"]["Enums"]["employment_status"]
          employment_type: Database["public"]["Enums"]["employment_type"]
          exit_date: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          job_profile_id: string
          joining_date: string
          last_name: string
          location_id: string
          manager_id: string | null
          middle_name: string | null
          organization_id: string
          personal_email: string | null
          phone: string | null
          timezone: string
          updated_at: string
          user_id: string | null
          work_email: string
        }
        Insert: {
          created_at?: string
          custom_attributes?: Json
          date_of_birth?: string | null
          deleted_at?: string | null
          department_id: string
          display_name?: string | null
          employee_code: string
          employment_status?: Database["public"]["Enums"]["employment_status"]
          employment_type?: Database["public"]["Enums"]["employment_type"]
          exit_date?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          job_profile_id: string
          joining_date: string
          last_name: string
          location_id: string
          manager_id?: string | null
          middle_name?: string | null
          organization_id: string
          personal_email?: string | null
          phone?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string | null
          work_email: string
        }
        Update: {
          created_at?: string
          custom_attributes?: Json
          date_of_birth?: string | null
          deleted_at?: string | null
          department_id?: string
          display_name?: string | null
          employee_code?: string
          employment_status?: Database["public"]["Enums"]["employment_status"]
          employment_type?: Database["public"]["Enums"]["employment_type"]
          exit_date?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          job_profile_id?: string
          joining_date?: string
          last_name?: string
          location_id?: string
          manager_id?: string | null
          middle_name?: string | null
          organization_id?: string
          personal_email?: string | null
          phone?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string | null
          work_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employees_department"
            columns: ["organization_id", "department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "fk_employees_job_profile"
            columns: ["organization_id", "job_profile_id"]
            isOneToOne: false
            referencedRelation: "job_profiles"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "fk_employees_location"
            columns: ["organization_id", "location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "fk_employees_manager"
            columns: ["organization_id", "manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "fk_employees_user"
            columns: ["organization_id", "user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      job_profiles: {
        Row: {
          band_level: string | null
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          job_family: string | null
          organization_id: string
          title: string
          updated_at: string
        }
        Insert: {
          band_level?: string | null
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          job_family?: string | null
          organization_id: string
          title: string
          updated_at?: string
        }
        Update: {
          band_level?: string | null
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          job_family?: string | null
          organization_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string
          code: string
          country: string
          created_at: string
          deleted_at: string | null
          geofence_latitude: number | null
          geofence_longitude: number | null
          geofence_radius_meters: number | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          postal_code: string | null
          state: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city: string
          code: string
          country: string
          created_at?: string
          deleted_at?: string | null
          geofence_latitude?: number | null
          geofence_longitude?: number | null
          geofence_radius_meters?: number | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          postal_code?: string | null
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string
          code?: string
          country?: string
          created_at?: string
          deleted_at?: string | null
          geofence_latitude?: number | null
          geofence_longitude?: number | null
          geofence_radius_meters?: number | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          postal_code?: string | null
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          code: string
          created_at: string
          default_currency: string
          default_timezone: string
          deleted_at: string | null
          domain: string | null
          id: string
          is_active: boolean
          name: string
          settings: Json
          slug: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          default_currency?: string
          default_timezone?: string
          deleted_at?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean
          name: string
          settings?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          default_currency?: string
          default_timezone?: string
          deleted_at?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean
          name?: string
          settings?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          code: string
          created_at: string
          description: string | null
          id: string
          module: string
        }
        Insert: {
          action: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          module: string
        }
        Update: {
          action?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_system_role: boolean
          name: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_system_role?: boolean
          name: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_system_role?: boolean
          name?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          organization_id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          organization_id: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          organization_id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_user"
            columns: ["organization_id", "user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          is_active: boolean
          is_system_admin: boolean
          last_login_at: string | null
          metadata: Json
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          id: string
          is_active?: boolean
          is_system_admin?: boolean
          last_login_at?: string | null
          metadata?: Json
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          is_active?: boolean
          is_system_admin?: boolean
          last_login_at?: string | null
          metadata?: Json
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_employee_id: { Args: never; Returns: string }
      auth_has_permission: { Args: { required_perm: string }; Returns: boolean }
      auth_is_manager_of: { Args: { target_emp_id: string }; Returns: boolean }
      auth_org_id: { Args: never; Returns: string }
    }
    Enums: {
      employment_status:
        | "ACTIVE"
        | "PROBATION"
        | "NOTICE_PERIOD"
        | "ON_LEAVE"
        | "SUSPENDED"
        | "TERMINATED"
      employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN"
      gender_type: "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      employment_status: [
        "ACTIVE",
        "PROBATION",
        "NOTICE_PERIOD",
        "ON_LEAVE",
        "SUSPENDED",
        "TERMINATED",
      ],
      employment_type: ["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"],
      gender_type: ["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"],
    },
  },
} as const

