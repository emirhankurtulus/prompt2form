// ─── Field Types ─────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'paragraph'
  | 'email'
  | 'phone'
  | 'number'
  | 'url'
  | 'password'
  | 'date'
  | 'time'
  | 'datetime'
  | 'dropdown'
  | 'multi-select'
  | 'radio'
  | 'checkbox'
  | 'rating'
  | 'slider'
  | 'file-upload'
  | 'signature'
  | 'address'
  | 'country'
  | 'image'
  | 'heading'
  | 'divider'
  | 'rich-text'
  | 'html'
  | 'hidden'
  | 'captcha'
  | 'page-break'
  | 'group'
  | 'repeating-group';

// ─── Conditional Logic ────────────────────────────────────────────────────────

export interface ConditionalRule {
  fieldId: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'is_empty'
    | 'is_not_empty';
  value: string | number | boolean;
}

export interface ConditionalLogic {
  action: 'show' | 'hide' | 'require' | 'skip_to';
  condition: 'all' | 'any';
  rules: ConditionalRule[];
  skipToFieldId?: string;
}

// ─── Field Validation ─────────────────────────────────────────────────────────

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

// ─── Field Style ──────────────────────────────────────────────────────────────

export interface FieldStyle {
  width?: 'full' | 'half' | 'third' | 'quarter';
  labelPosition?: 'top' | 'left' | 'hidden';
  textAlign?: 'left' | 'center' | 'right';
  className?: string;
}

// ─── Field Option (for dropdowns, radio, etc.) ────────────────────────────────

export interface FieldOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
  description?: string;
  imageUrl?: string;
}

// ─── Form Field ───────────────────────────────────────────────────────────────

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  helpText?: string;
  defaultValue?: unknown;
  options?: FieldOption[];
  validation?: FieldValidation;
  logic?: ConditionalLogic;
  style?: FieldStyle;
  prefix?: string;
  suffix?: string;
  icon?: string;
  locked?: boolean;
  hidden?: boolean;
  autoFill?: string;
  // Rating
  ratingMax?: number;
  ratingShape?: 'star' | 'heart' | 'circle' | 'thumb';
  // Slider
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  // Layout fields
  headingLevel?: 1 | 2 | 3;
  content?: string;
  // Group / Section
  fields?: FormField[];
  collapsible?: boolean;
  collapsed?: boolean;
  repeatable?: boolean;
  maxRepeat?: number;
  // Page break
  pageTitle?: string;
  pageDescription?: string;
  // Calculations
  formula?: string;
  // Signature
  signatureType?: 'draw' | 'type' | 'upload';
}

// ─── Form Page ────────────────────────────────────────────────────────────────

export interface FormPage {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
}

// ─── Form Theme ───────────────────────────────────────────────────────────────

export interface FormTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
  inputBg: string;
  inputBorder: string;
  buttonBg: string;
  buttonText: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
  animation?: 'none' | 'fade' | 'slide' | 'bounce';
  darkMode?: boolean;
  spacing?: 'compact' | 'comfortable' | 'spacious';
}

// ─── Form Settings ────────────────────────────────────────────────────────────

export interface FormSettings {
  submitButtonText: string;
  successMessage?: string;
  successRedirectUrl?: string;
  progressBar?: boolean;
  progressStyle?: 'bar' | 'steps' | 'percentage';
  showPageNumbers?: boolean;
  allowDraft?: boolean;
  preventDuplicates?: boolean;
  sendConfirmationEmail?: boolean;
  confirmationEmailField?: string;
  notificationEmails?: string[];
  googleAnalyticsId?: string;
  language?: string;
  rtl?: boolean;
}

// ─── Form Schema (root) ───────────────────────────────────────────────────────

export interface FormSchema {
  version: string;
  title: string;
  description?: string;
  pages: FormPage[];
  multiStep: boolean;
  theme: FormTheme;
  settings: FormSettings;
  metadata?: {
    generatedBy?: 'ai' | 'manual' | 'template';
    prompt?: string;
    tags?: string[];
  };
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

// ─── Form limit ───────────────────────────────────────────────────────────────

export interface FormLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  resetDate: string; // First day of next month
}
