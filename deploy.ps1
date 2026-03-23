# Script para desplegar automáticamente en Vercel
Set-Location "d:\Ary\la-parrilla-app"

# Responder los prompts esperados de Vercel CLI
$responses = @(
    "y",                           # Set up and deploy?
    "",                            # Which scope (Enter para default)
    "n",                           # Link to existing project?
    "la-parrilla-app",            # Project name
    ".",                           # Root directory
    "Next.js",                     # Framework (Next.js)
    "n"                            # Override settings?
) -join "`n"

$responses | npx vercel --prod 2>&1
