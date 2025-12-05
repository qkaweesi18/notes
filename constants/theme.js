export const themes = {
    light: {
        // Core background colors
        background: '#F8FAFC', // Soft cool gray
        backgroundSecondary: '#F1F5F9', // Slightly darker for depth
        surface: '#FFFFFF',
        surfaceElevated: '#FFFFFF',

        // Text hierarchy
        text: '#0F172A', // Rich dark slate
        textSecondary: '#64748B', // Muted slate
        textTertiary: '#94A3B8', // Even more muted

        // Primary brand color
        primary: '#6366F1', // Modern indigo/violet
        primaryHover: '#4F46E5',
        primaryLight: 'rgba(99, 102, 241, 0.12)',
        primaryGlow: 'rgba(99, 102, 241, 0.25)',

        // Accent colors for variety
        accent1: '#8B5CF6', // Purple
        accent1Light: 'rgba(139, 92, 246, 0.12)',
        accent2: '#14B8A6', // Teal
        accent2Light: 'rgba(20, 184, 166, 0.12)',
        accent3: '#F59E0B', // Amber
        accent3Light: 'rgba(245, 158, 11, 0.12)',
        accent4: '#EC4899', // Pink
        accent4Light: 'rgba(236, 72, 153, 0.12)',

        // Status colors
        danger: '#EF4444',
        dangerLight: 'rgba(239, 68, 68, 0.12)',
        success: '#22C55E',
        successLight: 'rgba(34, 197, 94, 0.12)',
        warning: '#F59E0B',
        warningLight: 'rgba(245, 158, 11, 0.12)',
        info: '#3B82F6',
        infoLight: 'rgba(59, 130, 246, 0.12)',

        // Borders & dividers
        border: '#E2E8F0',
        borderLight: '#F1F5F9',
        divider: 'rgba(15, 23, 42, 0.06)',

        // Shadows & effects
        shadow: 'rgba(15, 23, 42, 0.08)',
        shadowMedium: 'rgba(15, 23, 42, 0.12)',
        shadowStrong: 'rgba(15, 23, 42, 0.16)',

        // Gradient endpoints
        gradientStart: '#6366F1',
        gradientEnd: '#8B5CF6',

        // Timeline line
        timelineLine: '#E2E8F0',
        timelineDot: '#6366F1',
    },
    dark: {
        // Core background colors
        background: '#0F172A', // Deep slate
        backgroundSecondary: '#1E293B', // Slightly lighter for depth
        surface: '#1E293B',
        surfaceElevated: '#334155',

        // Text hierarchy
        text: '#F8FAFC', // Near white
        textSecondary: '#94A3B8', // Muted
        textTertiary: '#64748B', // Even more muted

        // Primary brand color
        primary: '#818CF8', // Lighter indigo for dark mode
        primaryHover: '#A5B4FC',
        primaryLight: 'rgba(129, 140, 248, 0.15)',
        primaryGlow: 'rgba(129, 140, 248, 0.25)',

        // Accent colors for variety
        accent1: '#A78BFA', // Purple
        accent1Light: 'rgba(167, 139, 250, 0.15)',
        accent2: '#2DD4BF', // Teal
        accent2Light: 'rgba(45, 212, 191, 0.15)',
        accent3: '#FBBF24', // Amber
        accent3Light: 'rgba(251, 191, 36, 0.15)',
        accent4: '#F472B6', // Pink
        accent4Light: 'rgba(244, 114, 182, 0.15)',

        // Status colors
        danger: '#F87171',
        dangerLight: 'rgba(248, 113, 113, 0.15)',
        success: '#4ADE80',
        successLight: 'rgba(74, 222, 128, 0.15)',
        warning: '#FBBF24',
        warningLight: 'rgba(251, 191, 36, 0.15)',
        info: '#60A5FA',
        infoLight: 'rgba(96, 165, 250, 0.15)',

        // Borders & dividers
        border: '#334155',
        borderLight: '#475569',
        divider: 'rgba(248, 250, 252, 0.06)',

        // Shadows & effects
        shadow: 'rgba(0, 0, 0, 0.3)',
        shadowMedium: 'rgba(0, 0, 0, 0.4)',
        shadowStrong: 'rgba(0, 0, 0, 0.5)',

        // Gradient endpoints
        gradientStart: '#818CF8',
        gradientEnd: '#A78BFA',

        // Timeline line
        timelineLine: '#334155',
        timelineDot: '#818CF8',
    }
};
