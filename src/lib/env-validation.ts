/**
 * Environment Variable Validation
 * 
 * Validates required environment variables at build time.
 * This runs during Next.js initialization.
 */

const requiredEnvVars = [
    'DATABASE_URL',
    'AUTH_SECRET',
] as const;

const optionalEnvVars = [
    'AUTH_GOOGLE_ID',
    'AUTH_GOOGLE_SECRET',
    'NEXTAUTH_URL',
] as const;

type EnvVarConfig = {
    name: string;
    required: boolean;
    validate?: (value: string) => boolean;
    errorMessage?: string;
};

const envVarConfigs: EnvVarConfig[] = [
    {
        name: 'DATABASE_URL',
        required: true,
        validate: (val) => val.startsWith('postgres'),
        errorMessage: 'DATABASE_URL must be a valid PostgreSQL connection string',
    },
    {
        name: 'AUTH_SECRET',
        required: true,
        validate: (val) => val.length >= 32,
        errorMessage: 'AUTH_SECRET must be at least 32 characters',
    },
    {
        name: 'AUTH_GOOGLE_ID',
        required: false,
    },
    {
        name: 'AUTH_GOOGLE_SECRET',
        required: false,
    },
    {
        name: 'NEXTAUTH_URL',
        required: false,
        validate: (val) => val.startsWith('http'),
        errorMessage: 'NEXTAUTH_URL must be a valid URL',
    },
];

export interface EnvValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validates all environment variables and returns a result
 */
export function validateEnv(): EnvValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const config of envVarConfigs) {
        const value = process.env[config.name];

        if (config.required && !value) {
            errors.push(`Missing required environment variable: ${config.name}`);
            continue;
        }

        if (!value) {
            if (requiredEnvVars.includes(config.name as typeof requiredEnvVars[number])) {
                // Skip optional vars that are empty
            } else {
                warnings.push(`Optional environment variable not set: ${config.name}`);
            }
            continue;
        }

        if (config.validate && !config.validate(value)) {
            errors.push(config.errorMessage || `Invalid value for ${config.name}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validates environment at startup and throws if invalid
 * Call this in your app's entry point
 */
export function ensureValidEnv(): void {
    const result = validateEnv();

    if (result.warnings.length > 0 && process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  Environment warnings:');
        result.warnings.forEach((w) => console.warn(`   - ${w}`));
    }

    if (!result.valid) {
        console.error('❌ Environment validation failed:');
        result.errors.forEach((e) => console.error(`   - ${e}`));

        if (process.env.NODE_ENV === 'production') {
            throw new Error('Environment validation failed. Check your .env configuration.');
        }
    }
}

// Export for type safety
export type RequiredEnvVar = typeof requiredEnvVars[number];
export type OptionalEnvVar = typeof optionalEnvVars[number];
