import React, { useState } from 'react';
import {
  Link2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Globe,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

export interface ValidatedLinkResult {
  isValid: boolean;
  isGoogleDrive: boolean;
  normalizedUrl: string;
  error?: string;
}

/**
 * Validates that a user-submitted string is a valid HTTP/HTTPS link (no local file uploads allowed)
 * and checks whether it is a Google Drive / Google Workspace link.
 */
export function validateShareableLink(rawInput: string): ValidatedLinkResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      isValid: false,
      isGoogleDrive: false,
      normalizedUrl: '',
      error: 'Please paste a shareable link (e.g., Google Drive link). Direct file uploads are disabled.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      isGoogleDrive: false,
      normalizedUrl: trimmed,
      error: 'Please enter a valid URL starting with https:// (e.g., https://drive.google.com/...).',
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      isValid: false,
      isGoogleDrive: false,
      normalizedUrl: trimmed,
      error: 'Only HTTP/HTTPS web links are allowed. Local files cannot be uploaded.',
    };
  }

  const host = parsed.hostname.toLowerCase();
  const isGoogleDrive =
    host === 'drive.google.com' ||
    host === 'docs.google.com' ||
    host.endsWith('.drive.google.com');

  return {
    isValid: true,
    isGoogleDrive,
    normalizedUrl: parsed.toString(),
  };
}

/**
 * Sanitizes an external link URL so javascript:, data:, or vbscript: payloads
 * injected into stored records can never execute when rendered inside anchor tags.
 */
export function sanitizeSafeHttpUrl(rawUrl?: string | null): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

interface DriveLinkInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  accessConfirmed: boolean;
  onAccessConfirmedChange: (confirmed: boolean) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  compact?: boolean;
}

export const DriveLinkInput: React.FC<DriveLinkInputProps> = ({
  label = 'Google Drive / Shareable File Link',
  value,
  onChange,
  accessConfirmed,
  onAccessConfirmedChange,
  placeholder = 'https://drive.google.com/file/d/.../view?usp=sharing',
  required = true,
  helperText,
  compact = false,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const validation = value.trim() ? validateShareableLink(value) : null;

  return (
    <div className="space-y-2.5 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </label>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Globe className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Link Only • No File Upload
          </span>
          <button
            type="button"
            onClick={() => setShowGuide((prev) => !prev)}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            {showGuide ? 'Hide Drive Guide' : 'How to enable Open-to-View?'}
          </button>
        </div>
      </div>

      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-3.5 pr-9 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
          {validation && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {validation.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>

        {validation?.isValid && (
          <a
            href={validation.normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shrink-0 transition-colors"
            title="Test opening link in new tab"
          >
            <span>Test Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {validation && !validation.isValid && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{validation.error}</span>
        </p>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {helperText}
        </p>
      )}

      {/* Open-to-View Permission Confirmation Box */}
      <div
        className={`rounded-xl border transition-colors ${
          compact ? 'p-2.5' : 'p-3'
        } ${
          accessConfirmed
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
            : 'bg-blue-50/60 dark:bg-blue-950/25 border-blue-200 dark:border-blue-800/60'
        }`}
      >
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={accessConfirmed}
            onChange={(e) => onAccessConfirmedChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Open-to-View Access Enabled (&ldquo;Anyone with the link can view&rdquo;)
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              Direct file uploads are disabled. I confirm this Google Drive / cloud link is set to{' '}
              <strong>Anyone with the link &rarr; Viewer</strong> so reviewers can open it without requesting access.
            </p>
          </div>
        </label>

        {showGuide && (
          <div className="mt-2.5 pt-2.5 border-t border-blue-200/70 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">
              How to make your Google Drive link Open to View:
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
              <li>Upload your file to Google Drive and right-click the file &rarr; <strong>Share</strong>.</li>
              <li>
                Under <strong>General access</strong>, change <em>Restricted</em> to{' '}
                <strong>Anyone with the link</strong>.
              </li>
              <li>
                Ensure the permission role on the right is set to <strong>Viewer</strong> (Open to View).
              </li>
              <li>
                Click <strong>Copy link</strong> and paste it into the field above.
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
