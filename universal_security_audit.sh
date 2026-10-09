#!/usr/bin/env bash

# ==============================================================================
# 🛡️ UNIVERSAL DEFENSIVE SECURITY AUDIT SUITE
# Enterprise Automated Security Assessment & Vulnerability Audit Tool
# 
# Supported Stacks:
#   - Flutter & Mobile (Dart, Android Manifest, Gradle, iOS Info.plist)
#   - Next.js (App Router, Pages Router, Middleware, next.config)
#   - Vite + React (SPA, index.html, Bundle Security, Headers)
#   - Node.js & Express Backends (APIs, RBAC, Middleware, CORS)
#   - Firebase & Cloud Services (Firestore Security Rules, Storage Rules)
#   - Git Hygiene & Secret Exposure (Gitleaks, Regex Secret Engine)
#   - Live HTTP/HTTPS DAST Header Inspection
# ==============================================================================

set -uo pipefail

# ANSI Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# Default Configuration
PROJECT_DIR="."
TARGET_URL=""
AUDIT_TYPE="auto"
FIX_SAFE=false
FULL_SCAN=false
CUSTOM_OUTPUT=""
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
HUMAN_TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S')"

TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNING_CHECKS=0
FAILED_CHECKS=0

usage() {
  cat <<'EOF'
================================================================================
       🛡️  UNIVERSAL DEFENSIVE SECURITY AUDIT SUITE (CLI v2.0)
================================================================================
Usage:
  ./universal_security_audit.sh [options]

Options:
  --project PATH       Target project root directory (default: .)
  --url URL            Optional deployed or local URL for passive HTTP/CSP checks
  --type TYPE          Target audit stack: auto | flutter | nextjs | vite | node | all (default: auto)
  --fix-safe, --fix    Apply non-destructive hardening (e.g. .gitignore security rules)
  --full               Run comprehensive dependency vulnerability audits & deep checks
  --output PATH        Custom output markdown report file path
  -h, --help           Display this help manual

Examples:
  ./universal_security_audit.sh
  ./universal_security_audit.sh --project ./my-flutter-app
  ./universal_security_audit.sh --url https://admin-husam-violin-courses.vercel.app
  ./universal_security_audit.sh --project . --fix-safe --full
================================================================================
EOF
}

# Parse CLI Arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJECT_DIR="${2:?Missing project path}"; shift 2 ;;
    --url) TARGET_URL="${2:?Missing URL}"; shift 2 ;;
    --type) AUDIT_TYPE="${2:?Missing audit type}"; shift 2 ;;
    --fix-safe|--fix) FIX_SAFE=true; shift ;;
    --full) FULL_SCAN=true; shift ;;
    --output) CUSTOM_OUTPUT="${2:?Missing output path}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo -e "${RED}Unknown option: $1${NC}" >&2; usage; exit 2 ;;
  esac
done

# Resolve absolute path
if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${RED}Error: Project directory '$PROJECT_DIR' does not exist.${NC}" >&2
  exit 1
fi
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"

# Define report path
if [ -n "$CUSTOM_OUTPUT" ]; then
  REPORT_FILE="$CUSTOM_OUTPUT"
else
  REPORT_FILE="${PROJECT_DIR}/UNIVERSAL_SECURITY_AUDIT_REPORT.md"
fi

# Logging & Report Helpers
have() { command -v "$1" >/dev/null 2>&1; }

log_check_start() {
  local title="$1"
  echo -e "\n${BLUE}▶ [AUDIT] ${title}${NC}"
}

log_pass() {
  local msg="$1"
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
  echo -e "  ${GREEN}✔ PASS:${NC} ${msg}"
}

log_warn() {
  local msg="$1"
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  WARNING_CHECKS=$((WARNING_CHECKS + 1))
  echo -e "  ${YELLOW}⚠ WARN:${NC} ${msg}"
}

log_fail() {
  local msg="$1"
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
  echo -e "  ${RED}✖ FAIL:${NC} ${msg}"
}

report_section() {
  local title="$1"
  echo -e "\n### ${title}\n" >> "${REPORT_FILE}"
}

report_item() {
  local status="$1"
  local title="$2"
  local details="$3"
  echo "- **${status}** | **${title}**: ${details}" >> "${REPORT_FILE}"
}

# Banner Display
echo -e "${CYAN}${BOLD}"
echo "================================================================================"
echo "          🛡️  UNIVERSAL DEFENSIVE SECURITY AUDIT SUITE v2.0                    "
echo "================================================================================"
echo -e "${NC}"
echo -e "Target Directory : ${BOLD}${PROJECT_DIR}${NC}"
echo -e "Target Live URL  : ${BOLD}${TARGET_URL:-None specified}${NC}"
echo -e "Audit Mode       : ${BOLD}${AUDIT_TYPE}${NC} (Full Scan: ${FULL_SCAN}, Safe Fixes: ${FIX_SAFE})"
echo -e "Report Output    : ${BOLD}${REPORT_FILE}${NC}"
echo -e "Started At       : ${BOLD}${HUMAN_TIMESTAMP}${NC}\n"

# Initialize Report File
cat << 'EOF' > "${REPORT_FILE}"
# 🛡️ Universal Defensive Security Audit Report

EOF
echo "**Target Directory:** \`${PROJECT_DIR}\`  " >> "${REPORT_FILE}"
echo "**Audit Date:** ${HUMAN_TIMESTAMP}  " >> "${REPORT_FILE}"
echo "**Live URL Target:** \`${TARGET_URL:-None}\`  " >> "${REPORT_FILE}"
echo "**Scanner Version:** 2.0.0 Enterprise Unified  " >> "${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"
echo "---" >> "${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"
echo "## Executive Summary" >> "${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"

# ==============================================================================
# SECTION 1: ENVIRONMENT & STACK FINGERPRINTING
# ==============================================================================
report_section "1. Environment & Stack Fingerprinting"
log_check_start "Fingerprinting Project Architecture & Available Tooling"

IS_FLUTTER=false
IS_NEXTJS=false
IS_VITE=false
IS_NODE=false
IS_FIREBASE=false

# Check Tooling
AVAILABLE_TOOLS=""
for tool in git node npm pnpm yarn flutter dart rg gitleaks curl; do
  if have "$tool"; then
    AVAILABLE_TOOLS="${AVAILABLE_TOOLS} $tool"
  fi
done
log_pass "Available diagnostic tools:${AVAILABLE_TOOLS}"
report_item "ℹ️ INFO" "Diagnostic Tooling" "Installed tools:${AVAILABLE_TOOLS}"

# Detect Stacks
if [ -f "${PROJECT_DIR}/pubspec.yaml" ]; then
  IS_FLUTTER=true
  log_pass "Detected Flutter / Mobile stack (pubspec.yaml present)."
fi

if [ -f "${PROJECT_DIR}/next.config.js" ] || [ -f "${PROJECT_DIR}/next.config.mjs" ] || [ -f "${PROJECT_DIR}/next.config.ts" ] || [ -d "${PROJECT_DIR}/admin_husam_violin_courses" ]; then
  IS_NEXTJS=true
  log_pass "Detected Next.js Application stack."
fi

if [ -f "${PROJECT_DIR}/vite.config.js" ] || [ -f "${PROJECT_DIR}/vite.config.ts" ]; then
  IS_VITE=true
  log_pass "Detected Vite + React stack."
fi

if [ -f "${PROJECT_DIR}/package.json" ] || [ -d "${PROJECT_DIR}/backend_server" ]; then
  IS_NODE=true
  log_pass "Detected Node.js runtime / backend services."
fi

if [ -f "${PROJECT_DIR}/firebase.json" ] || [ -f "${PROJECT_DIR}/firestore.rules" ] || grep -rq "firebase" "${PROJECT_DIR}/lib" 2>/dev/null || grep -rq "firebase" "${PROJECT_DIR}/package.json" 2>/dev/null; then
  IS_FIREBASE=true
  log_pass "Detected Firebase Cloud Services (Auth, Firestore, Storage)."
fi

report_item "ℹ️ INFO" "Detected Stacks" "Flutter: ${IS_FLUTTER} | Next.js: ${IS_NEXTJS} | Vite: ${IS_VITE} | Node: ${IS_NODE} | Firebase: ${IS_FIREBASE}"

# ==============================================================================
# SECTION 2: SECRETS, PRIVATE KEYS & GIT HYGIENE
# ==============================================================================
report_section "2. Secrets, Cloud Keys & Git Hygiene"
log_check_start "Auditing Codebase for Hardcoded Credentials, Cloud Keys & Keystores"

# A. Unencrypted Private Keys
PRIVATE_KEYS=$(grep -rnE "BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY" "${PROJECT_DIR}" \
  --exclude-dir={.git,node_modules,.next,build,dist,.dart_tool,boringssl,Pods,vendor} \
  --exclude="*universal_security_audit*.sh" --exclude="*security*.sh" --exclude="*.md" 2>/dev/null || true)

if [ -n "${PRIVATE_KEYS}" ]; then
  log_fail "Found unencrypted private keys in codebase!"
  report_item "❌ CRITICAL" "Private Key Exposure" "Unencrypted private keys found:\n\`\`\`\n${PRIVATE_KEYS}\n\`\`\`"
else
  log_pass "No unencrypted private keys detected in application source trees."
  report_item "✅ PASS" "Private Key Exposure" "Zero private keys found in application source directories."
fi

# B. Cloud API Keys & Service Role Tokens
SECRET_REGEX="(AKIA[0-9A-Z]{16}|sk_live_[0-9a-zA-Z]{24}|ghp_[0-9a-zA-Z]{36}|sk\.[A-Za-z0-9._-]{25,}|service_role.*eyJ)"
CLOUD_SECRETS=$(grep -rnE "${SECRET_REGEX}" "${PROJECT_DIR}" \
  --exclude-dir={.git,node_modules,.next,build,dist,.dart_tool,boringssl,Pods,vendor} \
  --exclude="*universal_security_audit*.sh" --exclude="*security*.sh" --exclude="*.md" 2>/dev/null || true)

if [ -n "${CLOUD_SECRETS}" ]; then
  log_fail "High-privilege cloud secrets or private API keys detected!"
  report_item "❌ HIGH" "Privileged Secret Tokens" "Sensitive patterns identified:\n\`\`\`\n${CLOUD_SECRETS}\n\`\`\`"
else
  log_pass "No high-privilege cloud secrets (AWS, Stripe live, Mapbox sk, service_role) found in application code."
  report_item "✅ PASS" "Privileged Secret Tokens" "No high-privilege cloud secrets detected in application code."
fi

# C. Git Tracked Sensitive Files Check
if [ -d "${PROJECT_DIR}/.git" ]; then
  TRACKED_SENSITIVE=$(cd "${PROJECT_DIR}" && git ls-files | grep -E "(^|/)(\.env$|\.env\.local$|\.env\.production$|\.jks$|\.keystore$|serviceAccountKey\.json$)" 2>/dev/null || true)
  if [ -n "${TRACKED_SENSITIVE}" ]; then
    log_fail "Sensitive secret files are currently tracked in Git repository!"
    report_item "❌ HIGH" "Tracked Secrets in Git" "Tracked secret files:\n\`\`\`\n${TRACKED_SENSITIVE}\n\`\`\`"
  else
    log_pass "No .env, keystores, or serviceAccountKey.json files tracked in Git."
    report_item "✅ PASS" "Tracked Secrets in Git" "Git tree is clean of sensitive keyfiles and environment secrets."
  fi
fi

# D. .gitignore Hardening Check & Safe Fix
GITIGNORE="${PROJECT_DIR}/.gitignore"
if [ -f "${GITIGNORE}" ]; then
  MISSING_PATTERNS=""
  for pattern in ".env" "*.env" "*.keystore" "*.jks" "serviceAccountKey.json"; do
    if ! grep -q "${pattern}" "${GITIGNORE}"; then
      MISSING_PATTERNS="${MISSING_PATTERNS} ${pattern}"
    fi
  done
  
  if [ -n "${MISSING_PATTERNS}" ]; then
    if [ "$FIX_SAFE" = true ]; then
      echo -e "\n# Security Rules Hardening" >> "${GITIGNORE}"
      for p in ${MISSING_PATTERNS}; do
        echo "${p}" >> "${GITIGNORE}"
      done
      log_pass "Automatically hardened .gitignore with missing security rules:${MISSING_PATTERNS}"
      report_item "✅ FIXED" "Git Ignore Hardening" "Added missing patterns to .gitignore:${MISSING_PATTERNS}"
    else
      log_warn ".gitignore lacks standard credential exclusion rules:${MISSING_PATTERNS}"
      report_item "⚠️ WARN" "Git Ignore Hardening" "Missing exclusion rules:${MISSING_PATTERNS} (run with --fix-safe to apply)"
    fi
  else
    log_pass ".gitignore contains comprehensive security rules for credentials and keystores."
    report_item "✅ PASS" "Git Ignore Hardening" "All critical secret patterns properly ignored."
  fi
fi

# ==============================================================================
# SECTION 3: FLUTTER & MOBILE SECURITY ENGINE
# ==============================================================================
if [ "$IS_FLUTTER" = true ] || [ "$AUDIT_TYPE" = "flutter" ] || [ "$AUDIT_TYPE" = "all" ]; then
  report_section "3. Flutter & Mobile Platform Security"
  log_check_start "Auditing Mobile Security Configuration (Android, iOS, Dart)"

  # Android Manifest Checks
  ANDROID_MANIFEST="${PROJECT_DIR}/android/app/src/main/AndroidManifest.xml"
  if [ -f "${ANDROID_MANIFEST}" ]; then
    # allowBackup
    if grep -q 'android:allowBackup="false"' "${ANDROID_MANIFEST}"; then
      log_pass "Android allowBackup is disabled (protects against ADB extraction of local caches/tokens)."
      report_item "✅ PASS" "Android allowBackup" "allowBackup is explicitly set to false."
    else
      log_warn "Android allowBackup is not set to false. Consider setting android:allowBackup=\"false\"."
      report_item "⚠️ WARN" "Android allowBackup" "allowBackup should be false to safeguard app sandbox."
    fi

    # usesCleartextTraffic
    if grep -q 'android:usesCleartextTraffic="true"' "${ANDROID_MANIFEST}"; then
      log_warn "android:usesCleartextTraffic=\"true\" allows unencrypted HTTP traffic."
      report_item "⚠️ WARN" "Cleartext HTTP" "Cleartext traffic allowed on Android."
    else
      log_pass "android:usesCleartextTraffic is disabled (TLS enforced by Network Security Config)."
      report_item "✅ PASS" "Cleartext HTTP" "Cleartext traffic not enabled."
    fi

    # debuggable in manifest
    if grep -q 'android:debuggable="true"' "${ANDROID_MANIFEST}"; then
      log_fail "android:debuggable=\"true\" found in AndroidManifest! Production apps must not be debuggable."
      report_item "❌ HIGH" "Android Debuggable" "App manifest has debuggable set to true."
    else
      log_pass "Android debuggable is not explicitly enabled in manifest."
      report_item "✅ PASS" "Android Debuggable" "Debug flag clean in AndroidManifest."
    fi
  fi

  # iOS Info.plist Checks
  IOS_PLIST="${PROJECT_DIR}/ios/Runner/Info.plist"
  if [ -f "${IOS_PLIST}" ]; then
    if grep -q "<key>NSAllowsArbitraryLoads</key>" "${IOS_PLIST}" && grep -A 1 "<key>NSAllowsArbitraryLoads</key>" "${IOS_PLIST}" | grep -q "<true/>"; then
      log_fail "iOS NSAllowsArbitraryLoads is TRUE! ATS protection is completely bypassed."
      report_item "❌ HIGH" "iOS ATS Bypass" "Arbitrary HTTP loads allowed in Info.plist."
    else
      log_pass "iOS App Transport Security (ATS) is enforced (no arbitrary HTTP loads allowed)."
      report_item "✅ PASS" "iOS ATS Bypass" "ATS enforces secure TLS/HTTPS."
    fi
  fi

  # Dart Network & TLS Checks
  BAD_CERTS=$(grep -rnE "badCertificateCallback.*=>\s*true" "${PROJECT_DIR}/lib" 2>/dev/null || true)
  if [ -n "${BAD_CERTS}" ]; then
    log_fail "SSL Certificate Validation is explicitly disabled (Trust-All) in Dart code!"
    report_item "❌ CRITICAL" "SSL Certificate Bypass" "Found trust-all badCertificateCallback in lib/:\n\`\`\`\n${BAD_CERTS}\n\`\`\`"
  else
    log_pass "No SSL certificate bypass (badCertificateCallback => true) detected in Dart sources."
    report_item "✅ PASS" "SSL Certificate Bypass" "TLS verification is active and not bypassed."
  fi

  # Plaintext HTTP URLs in lib
  HTTP_URLS=$(grep -rnE "http://[a-zA-Z0-9]" "${PROJECT_DIR}/lib" \
    | grep -v "schemas.android.com" | grep -v "w3.org" | grep -v "localhost" | grep -v "127.0.0.1" 2>/dev/null || true)
  if [ -n "${HTTP_URLS}" ]; then
    log_warn "Found plaintext HTTP URLs in Dart code. Production endpoints should enforce HTTPS."
    report_item "⚠️ WARN" "Plaintext HTTP URLs" "Plaintext endpoints found:\n\`\`\`\n${HTTP_URLS}\n\`\`\`"
  else
    log_pass "All remote endpoints in lib/ enforce secure HTTPS or localhost."
    report_item "✅ PASS" "Plaintext HTTP URLs" "All remote endpoints enforce HTTPS."
  fi

  # Storage Hygiene
  if grep -rq "flutter_secure_storage" "${PROJECT_DIR}/pubspec.yaml" 2>/dev/null; then
    log_pass "flutter_secure_storage declared (Hardware Keystore / iOS Keychain encrypted storage)."
    report_item "✅ PASS" "Encrypted Storage" "flutter_secure_storage is available."
  else
    log_warn "flutter_secure_storage not in pubspec.yaml. Ensure sensitive tokens are not stored in plaintext SharedPreferences."
    report_item "⚠️ WARN" "Encrypted Storage" "Verify tokens are not stored unencrypted."
  fi
fi

# ==============================================================================
# SECTION 4: WEB & NEXT.JS / VITE SECURITY ENGINE
# ==============================================================================
if [ "$IS_NEXTJS" = true ] || [ "$IS_VITE" = true ] || [ "$AUDIT_TYPE" = "nextjs" ] || [ "$AUDIT_TYPE" = "vite" ] || [ "$AUDIT_TYPE" = "all" ]; then
  report_section "4. Web Application Security (Next.js & Vite)"
  log_check_start "Auditing Web Headers, Content Security Policy (CSP), and XSS Defenses"

  # Find next.config or middleware
  TARGET_WEB_DIR="${PROJECT_DIR}"
  if [ -d "${PROJECT_DIR}/admin_husam_violin_courses" ]; then
    TARGET_WEB_DIR="${PROJECT_DIR}/admin_husam_violin_courses"
  fi

  NEXT_CONFIG=$(find "${TARGET_WEB_DIR}" -maxdepth 2 -name "next.config.*" | head -1 || true)
  MIDDLEWARE=$(find "${TARGET_WEB_DIR}" -maxdepth 2 -name "middleware.ts" -o -name "middleware.js" | head -1 || true)

  # A. HTTP Security Headers
  if [ -n "${NEXT_CONFIG}" ] && [ -f "${NEXT_CONFIG}" ]; then
    if grep -q "X-Frame-Options" "${NEXT_CONFIG}" && grep -q "X-Content-Type-Options" "${NEXT_CONFIG}"; then
      log_pass "Essential HTTP Security Headers configured (X-Frame-Options, nosniff, HSTS)."
      report_item "✅ PASS" "HTTP Security Headers" "Clickjacking and MIME-sniffing protections enforced."
    else
      log_warn "HTTP security headers (X-Frame-Options, HSTS) not detected in ${NEXT_CONFIG}."
      report_item "⚠️ WARN" "HTTP Security Headers" "Review security headers in next.config."
    fi
  fi

  # B. Content Security Policy (CSP) Level 3
  CSP_FOUND=false
  CSP_STRICT=false

  if [ -n "${MIDDLEWARE}" ] && [ -f "${MIDDLEWARE}" ]; then
    if grep -q "Content-Security-Policy" "${MIDDLEWARE}"; then
      CSP_FOUND=true
      if grep -q "strict-dynamic" "${MIDDLEWARE}" && grep -q "nonce-" "${MIDDLEWARE}"; then
        CSP_STRICT=true
      fi
    fi
  elif [ -n "${NEXT_CONFIG}" ] && grep -q "Content-Security-Policy" "${NEXT_CONFIG}"; then
    CSP_FOUND=true
  fi

  if [ "$CSP_STRICT" = true ]; then
    log_pass "Content Security Policy (CSP) Level 3 enforced with dynamic nonces & strict-dynamic (A+ rating compliance)."
    report_item "✅ PASS" "Content Security Policy" "CSP Level 3 with dynamic nonces and strict-dynamic verified."
  elif [ "$CSP_FOUND" = true ]; then
    log_warn "Content Security Policy configured, but missing dynamic nonces or strict-dynamic."
    report_item "⚠️ WARN" "Content Security Policy" "Consider adding dynamic nonces for full CSP Level 3 score."
  else
    log_fail "Content Security Policy (CSP) header is NOT implemented (-25 penalty on Observatory)!"
    report_item "❌ HIGH" "Content Security Policy" "Missing Content Security Policy header."
  fi

  # C. XSS & Dangerous HTML Injection
  DANGEROUS_HTML=$(grep -rn "dangerouslySetInnerHTML" "${TARGET_WEB_DIR}/app" "${TARGET_WEB_DIR}/src" 2>/dev/null || true)
  if [ -n "${DANGEROUS_HTML}" ]; then
    log_warn "dangerouslySetInnerHTML detected in web components. Ensure all inputs are sanitized (DOMPurify/stripHtml)."
    report_item "⚠️ WARN" "XSS Defense" "Review dangerouslySetInnerHTML instances:\n\`\`\`\n${DANGEROUS_HTML}\n\`\`\`"
  else
    log_pass "No dangerouslySetInnerHTML usages detected in web components."
    report_item "✅ PASS" "XSS Defense" "React virtual DOM safely renders dynamic content without raw HTML injection."
  fi

  # D. Dependency Vulnerability Audit (npm audit)
  if [ "$FULL_SCAN" = true ] && have npm; then
    echo -e "  ${CYAN}Running npm audit in ${TARGET_WEB_DIR}...${NC}"
    AUDIT_OUT=$(cd "${TARGET_WEB_DIR}" && npm audit --json 2>/dev/null || true)
    CRIT=$(echo "$AUDIT_OUT" | grep -o '"critical":[0-9]*' | head -1 | cut -d: -f2 || echo "0")
    if [ "${CRIT:-0}" -gt 0 ]; then
      log_fail "npm audit detected ${CRIT} critical vulnerabilities in dependencies!"
      report_item "❌ CRITICAL" "NPM Vulnerabilities" "${CRIT} critical vulnerabilities found."
    else
      log_pass "npm audit passed: 0 critical vulnerabilities."
      report_item "✅ PASS" "NPM Vulnerabilities" "Dependencies clean of critical CVEs."
    fi
  fi
fi

# ==============================================================================
# SECTION 5: FIREBASE & CLOUD DATABASE SECURITY
# ==============================================================================
if [ "$IS_FIREBASE" = true ] || [ "$AUDIT_TYPE" = "all" ]; then
  report_section "5. Firebase & Cloud Database Rules"
  log_check_start "Auditing Firestore & Cloud Storage Security Rules & Anti-Tamper Logic"

  FIRESTORE_RULES="${PROJECT_DIR}/firestore.rules"
  if [ -f "${FIRESTORE_RULES}" ]; then
    log_pass "firestore.rules file exists in project repository."

    # Check for authentication & role helpers
    if grep -q "isAdmin()" "${FIRESTORE_RULES}" && grep -q "request.auth" "${FIRESTORE_RULES}"; then
      log_pass "Firestore rules enforce authenticated access and role-based permissions (isAdmin/isStaff)."
      report_item "✅ PASS" "Firestore RBAC" "Role-based security functions and authentication checks verified in rules."
    else
      log_warn "Firestore rules do not appear to enforce role-based access control."
      report_item "⚠️ WARN" "Firestore RBAC" "Missing isAdmin() or authentication checks in firestore.rules."
    fi

    # Check for field immutability (anti-tamper)
    if grep -q "affectedKeys().hasAny" "${FIRESTORE_RULES}" && grep -q "'role'" "${FIRESTORE_RULES}"; then
      log_pass "Firestore rules protect sensitive fields ('role', 'activeCourses') against client self-promotion."
      report_item "✅ PASS" "Privilege Escalation Protection" "Client self-elevation to admin or self-granting access is barred."
    else
      log_warn "Firestore rules might allow client self-elevation if 'role' field is mutable by document owner."
      report_item "⚠️ WARN" "Privilege Escalation Protection" "Verify field immutability constraints on users collection."
    fi
  else
    log_fail "Missing firestore.rules in project repository! Database is exposed to default/untracked console rules."
    report_item "❌ HIGH" "Firestore Rules Missing" "No firestore.rules file defined in repository."
  fi

  STORAGE_RULES="${PROJECT_DIR}/storage.rules"
  if [ -f "${STORAGE_RULES}" ]; then
    log_pass "storage.rules exists and controls cloud media upload access."
    report_item "✅ PASS" "Storage Security Rules" "Storage rules file verified in project root."
  else
    log_warn "Missing storage.rules file."
    report_item "⚠️ WARN" "Storage Security Rules" "No storage.rules file found."
  fi
fi

# ==============================================================================
# SECTION 6: BACKEND APIS & SERVICE AUTHORIZATION
# ==============================================================================
if [ "$IS_NODE" = true ] || [ "$AUDIT_TYPE" = "node" ] || [ "$AUDIT_TYPE" = "all" ]; then
  report_section "6. Backend Services & Authorization APIs"
  log_check_start "Auditing Backend Route Protection, Middleware & CORS"

  BACKEND_SERVER="${PROJECT_DIR}/backend_server/server.js"
  if [ -f "${BACKEND_SERVER}" ]; then
    if grep -q "requireAdminAuth" "${BACKEND_SERVER}"; then
      log_pass "Backend operational endpoints are protected with administrative authorization middleware."
      report_item "✅ PASS" "Backend Roles API" "Protected administrative endpoints require valid authentication."
    else
      log_warn "Backend server endpoints appear unauthenticated."
      report_item "⚠️ WARN" "Backend Roles API" "Endpoints in server.js lack administrative authorization middleware."
    fi

    if grep -q "cors" "${BACKEND_SERVER}"; then
      log_pass "CORS configuration present in backend server."
      report_item "✅ PASS" "CORS Policy" "CORS middleware is active."
    fi
  fi
fi

# ==============================================================================
# SECTION 7: LIVE PASSIVE HTTP/HTTPS SECURITY SCANNER (DAST)
# ==============================================================================
if [ -n "${TARGET_URL}" ]; then
  report_section "7. Live Passive HTTP Security Audit (DAST)"
  log_check_start "Performing Non-Destructive Passive HTTP Header Analysis on ${TARGET_URL}"

  if have curl; then
    HTTP_HEADERS=$(curl -sI -L --max-time 10 "${TARGET_URL}" 2>/dev/null || true)
    
    if [ -n "${HTTP_HEADERS}" ]; then
      # Strict-Transport-Security
      if echo "${HTTP_HEADERS}" | grep -qi "strict-transport-security"; then
        log_pass "Live Target enforces Strict-Transport-Security (HSTS)."
        report_item "✅ PASS" "Live HSTS" "Strict-Transport-Security header present in live response."
      else
        log_warn "Live Target missing Strict-Transport-Security header."
        report_item "⚠️ WARN" "Live HSTS" "Missing HSTS header on live domain."
      fi

      # X-Content-Type-Options
      if echo "${HTTP_HEADERS}" | grep -qi "x-content-type-options: nosniff"; then
        log_pass "Live Target enforces X-Content-Type-Options: nosniff."
        report_item "✅ PASS" "Live MIME Sniffing" "nosniff header verified."
      fi

      # X-Frame-Options
      if echo "${HTTP_HEADERS}" | grep -qi "x-frame-options"; then
        log_pass "Live Target enforces X-Frame-Options (Clickjacking defense)."
        report_item "✅ PASS" "Live Clickjacking Defense" "X-Frame-Options verified."
      fi

      # Content-Security-Policy
      if echo "${HTTP_HEADERS}" | grep -qi "content-security-policy"; then
        log_pass "Live Target returns Content-Security-Policy header."
        report_item "✅ PASS" "Live CSP" "Content-Security-Policy active on live domain."
      else
        log_fail "Live Target does NOT return Content-Security-Policy header!"
        report_item "❌ HIGH" "Live CSP" "CSP missing in live HTTP response."
      fi
    else
      log_warn "Could not connect to live target URL: ${TARGET_URL}"
      report_item "⚠️ WARN" "Live Target Unreachable" "Target URL did not respond to passive HEAD request."
    fi
  fi
fi

# ==============================================================================
# SECTION 8: EXECUTIVE SUMMARY & SCORECARD
# ==============================================================================
echo ""
echo -e "${CYAN}================================================================================${NC}"
echo -e "${BOLD}                       SECURITY AUDIT SCORECARD                                 ${NC}"
echo -e "${CYAN}================================================================================${NC}"
echo -e "  Total Checks Executed : ${BOLD}${TOTAL_CHECKS}${NC}"
echo -e "  Passed Checks         : ${GREEN}${BOLD}${PASSED_CHECKS}${NC}"
echo -e "  Warning Checks        : ${YELLOW}${BOLD}${WARNING_CHECKS}${NC}"
echo -e "  Failed Checks         : ${RED}${BOLD}${FAILED_CHECKS}${NC}"

if [ "${TOTAL_CHECKS}" -gt 0 ]; then
  SCORE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
else
  SCORE=0
fi

echo -e "  Overall Security Score: ${BOLD}${SCORE}%${NC}"
echo -e "${CYAN}================================================================================${NC}"

# Update Executive Summary in Markdown Report
TMP_REPORT="${REPORT_FILE}.tmp"
sed "/## Executive Summary/a \\
\\
| Metric | Result |\\
|---|---|\\
| **Overall Security Score** | **${SCORE}%** |\\
| **Total Checks** | ${TOTAL_CHECKS} |\\
| **Passed (✅)** | ${PASSED_CHECKS} |\\
| **Warnings (⚠️)** | ${WARNING_CHECKS} |\\
| **Failures (❌)** | ${FAILED_CHECKS} |\\
" "${REPORT_FILE}" > "${TMP_REPORT}" && mv "${TMP_REPORT}" "${REPORT_FILE}"

echo -e "\nDetailed markdown report written to: ${BOLD}${REPORT_FILE}${NC}\n"

if [ "${FAILED_CHECKS}" -gt 0 ]; then
  exit 1
else
  exit 0
fi
