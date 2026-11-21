"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { profile } from "@/content/portfolio";
import s from "./contact.module.css";

const whatsapp = `https://wa.me/${profile.whatsapp.number}?text=${encodeURIComponent(profile.whatsapp.message)}`;

function copyWithSelection(text: string) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const ok = document.execCommand("copy");
  field.remove();
  return ok;
}

async function copyText(text: string) {
  if (!navigator.clipboard) return copyWithSelection(text);
  try {
    // The Clipboard API can stay pending (e.g. unfocused window); don't wait forever.
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 800)),
    ]);
    return true;
  } catch {
    return copyWithSelection(text);
  }
}

/** Contact buttons: e-mail and WhatsApp (open, or copy the address/number) and the CV. */
export function ContactActions() {
  return (
    <div className={s.actions}>
      <CopySplit
        primary
        href={`mailto:${profile.email}`}
        icon={<MailIcon />}
        label="Enviar e-mail"
        value={profile.email}
        copyLabel="Copiar e-mail"
        doneLabel="E-mail copiado"
      />
      <CopySplit
        href={whatsapp}
        external
        icon={<WhatsAppIcon />}
        label="WhatsApp"
        value={profile.whatsapp.display}
        copyLabel="Copiar número"
        doneLabel="Número copiado"
      />
      <a className={`${s.button} ${s.ghost}`} href={profile.resume} download>
        <DownloadIcon />
        {profile.ctaResume}
      </a>
    </div>
  );
}

/** A pill split in two: the main side opens the channel, the small side copies `value`. */
function CopySplit({
  href,
  external,
  primary,
  icon,
  label,
  value,
  copyLabel,
  doneLabel,
}: {
  href: string;
  external?: boolean;
  primary?: boolean;
  icon: ReactNode;
  label: string;
  value: string;
  copyLabel: string;
  doneLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    if (!(await copyText(value))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className={`${s.split} ${primary ? s.splitPrimary : ""}`} data-copied={copied || undefined}>
      <a className={s.splitMain} href={href} {...(external && { target: "_blank", rel: "noreferrer" })}>
        {icon}
        {label}
      </a>
      <button type="button" className={s.copy} onClick={copy} aria-label={`${copyLabel}: ${value}`}>
        <span className={s.copyIcons} aria-hidden="true">
          <CopyIcon />
          <CheckIcon />
        </span>
      </button>
      <span className={s.tip} aria-hidden="true">
        <span className={s.tipIdle}>{value}</span>
        <span className={s.tipDone}>{doneLabel}</span>
      </span>
      <span className={s.live} role="status">
        {copied ? doneLabel : ""}
      </span>
    </div>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg className={s.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function MailIcon() {
  return (
    <Icon>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 7 7.9 5.3a2 2 0 0 0 2.2 0L21 7" />
    </Icon>
  );
}

function WhatsAppIcon() {
  return (
    <Icon>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2.5 21.5Z" />
      <path d="M9.2 7.8c.3-.3.8-.3 1 .1l.8 1.6c.1.3.1.6-.1.8l-.6.6a6.6 6.6 0 0 0 2.9 2.9l.6-.6c.2-.2.5-.3.8-.1l1.6.8c.4.2.4.7.1 1l-.7.7c-.6.6-1.5.8-2.3.4a9.6 9.6 0 0 1-4.5-4.5c-.4-.8-.2-1.7.4-2.3Z" />
    </Icon>
  );
}

function CopyIcon() {
  return (
    <Icon>
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M5 15h-.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
    </Icon>
  );
}

function CheckIcon() {
  return (
    <Icon>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

function DownloadIcon() {
  return (
    <Icon>
      <path d="M12 3.5v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 18.5v.5A1.5 1.5 0 0 0 5.5 20.5h13A1.5 1.5 0 0 0 20 19v-.5" />
    </Icon>
  );
}
