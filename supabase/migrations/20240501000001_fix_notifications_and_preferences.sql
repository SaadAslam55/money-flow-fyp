-- Fix notifications table RLS policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- Corrected select policy
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR (user_id IS NULL AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() 
            AND organization_id = notifications.organization_id
        ))
    );

-- Corrected update policy
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email_notifications JSONB DEFAULT '{"invoices": true, "payments": true, "low_stock": true, "weekly_report": false, "monthly_report": true}'::JSONB,
    sms_notifications JSONB DEFAULT '{"invoices": false, "payments": false}'::JSONB,
    in_app_notifications JSONB DEFAULT '{"invoices": true, "payments": true, "low_stock": true, "sound": true}'::JSONB,
    digest_frequency TEXT DEFAULT 'realtime',
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS for preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Preferences policies
CREATE POLICY "Users can view their own preferences" ON public.notification_preferences
    FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own preferences" ON public.notification_preferences
    FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own preferences" ON public.notification_preferences
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
