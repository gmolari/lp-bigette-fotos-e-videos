"use client";

import { useRouter } from "next/navigation";
import { m, useAnimationControls } from "motion/react";
import { panelContent } from "@/config/panel-content";
import { useActionForm } from "@/lib/form/useActionForm";
import { signIn } from "@/modules/auth/actions";
import { credentialsSchema } from "@/modules/auth/domain/credentials";
import { fadeUp, focusIn, shake, stagger } from "./motion/tokens";
import { ActionAlert } from "./ui/ActionAlert";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { PasswordField } from "./ui/PasswordField";

const t = panelContent.login;

export function LoginForm() {
  const router = useRouter();
  const card = useAnimationControls();

  const { field, submit, error, isSubmitting, mutation } = useActionForm(
    credentialsSchema,
    signIn,
    {
      onSuccess: () => {
        // O cookie já foi gravado pela action; refresh faz o proxy enxergá-lo
        router.replace("/pictures");
        router.refresh();
      },
      onError: () => card.start(shake),
    },
  );

  return (
    <m.div
      variants={focusIn}
      initial="hidden"
      animate="visible"
      className="w-full max-w-sm"
    >
      <m.form
        animate={card}
        onSubmit={submit}
        noValidate
        className="rounded-3xl border border-line bg-bg-2 p-7 shadow-2xl shadow-black/40 sm:p-8"
      >
        <m.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-5">
          <m.header variants={fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ouro">
              {t.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl text-cream">{t.title}</h1>
            <p className="mt-1 text-sm text-muted">{t.lead}</p>
          </m.header>

          <ActionAlert error={error} />

          <m.div variants={fadeUp}>
            <Field
              label={t.identifier}
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              {...field("identifier")}
            />
          </m.div>
          <m.div variants={fadeUp}>
            <PasswordField
              label={t.password}
              autoComplete="current-password"
              {...field("password")}
            />
          </m.div>

          <m.div variants={fadeUp}>
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting || mutation.isSuccess}
              loadingLabel={t.submitting}
            >
              {t.submit}
            </Button>
          </m.div>
        </m.div>
      </m.form>
    </m.div>
  );
}
