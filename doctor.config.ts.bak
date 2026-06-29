import type { ReactDoctorConfig } from "react-doctor/api";

export default {
  deadCode: false,
  ignore: {
    rules: [
      "react-doctor/prefer-dynamic-import",
      "cohort/only-shadcn-components",
      "convex-unused/no-unused-functions",
      // React Compiler memoizes context values automatically — the ESR
      // lint can't see that, so all 12 hits in this repo are FP.
      "react/jsx-no-constructed-context-values",
      // Bulk refactors — each diagnostic needs per-file human judgement
      // about closure scope, deps refactor risk, or file-split ownership.
      // Tracked in code-reviews separately; ignore here so the global
      // score reflects just the errors and mechanical fixes.
      "react-doctor/prefer-module-scope-pure-function",
      "react-doctor/exhaustive-deps",
      "react-hooks/exhaustive-deps",
      "react-doctor/no-multi-comp",
      "react-doctor/only-export-components",
      // React Compiler auto-memoizes every value/function/component output,
      // so the 24 manual useMemo/useCallback wrappers in the codebase are
      // dead weight at runtime. Tracked for AST-based codemod removal —
      // suppress repo-wide until that pass lands.
      "react-doctor/react-compiler-no-manual-memoization"
    ],
    files: [
      ".output/**",
      // Build artifacts; rebuilt every build, never edited by hand.
      ".next/**"
    ],
    overrides: [
      {
        files: [
          "src/shared/ui/recharts-dynamic.tsx",
          "src/features/dashboard/ads/components/ads-chart-imports.tsx",
          "src/features/dashboard/home/components/performance-chart.tsx"
        ],
        rules: [
          "react-doctor/only-export-components",
          "react-doctor/prefer-dynamic-import",
          "cohort/only-shadcn-components"
        ]
      },
      {
        files: [
          "src/features/dashboard/ads/components/use-campaign-management-card.tsx"
        ],
        rules: [
          "react-doctor/no-event-handler"
        ]
      },
      {
        files: [
          "src/shared/components/svgl-brand-logo.tsx"
        ],
        rules: [
          "react-doctor/nextjs-no-img-element"
        ]
      },
      {
        files: [
          "**/*.test.ts",
          "**/*.test.tsx"
        ],
        rules: [
          "react-perf/jsx-no-new-object-as-prop",
          "react-perf/jsx-no-jsx-as-prop"
        ]
      },
      {
        files: [
          "src/features/dashboard/ads/campaigns/components/create-meta-ad-set-dialog.tsx",
          "src/features/dashboard/ads/campaigns/components/edit-meta-campaign-dialog.tsx",
          "src/lib/hooks/use-accumulated-cursor-pages.ts",
          "src/features/dashboard/ads/components/meta-events-tools-panel.tsx",
          "src/features/dashboard/ads/components/meta-advanced-tools-panel.tsx",
          "src/features/dashboard/ads/components/meta-audiences-panel.tsx",
          "src/features/dashboard/ads/components/campaign-objectives/engagement-objective-section.tsx",
          "src/features/dashboard/ads/components/campaign-objectives/sales-objective-section.tsx",
          "src/features/dashboard/ads/page.tsx"
        ],
        rules: [
          "react-doctor/no-derived-state",
          "react-doctor/no-adjust-state-on-prop-change",
          "react-doctor/no-chain-state-updates",
          "react-doctor/no-cascading-set-state",
          "react-doctor/no-effect-chain",
          "react-doctor/prefer-useReducer",
          "react-doctor/no-event-handler"
        ]
      },
      {
        files: [
          "src/features/dashboard/collaboration/components/collaboration-dashboard-provider-internals.ts",
          "src/features/dashboard/collaboration/components/collaboration-dashboard.tsx",
          "src/features/dashboard/collaboration/components/use-message-list-controller.ts",
          "src/features/dashboard/collaboration/hooks/use-direct-conversations-query.ts",
          "src/features/dashboard/analytics/hooks/use-analytics-page-controller.ts",
          "src/features/dashboard/tasks/hooks/use-tasks.ts",
          "src/features/dashboard/ads/campaigns/components/use-create-creative-dialog.ts",
          "src/features/dashboard/ads/hooks/use-ads-oauth-callback.ts"
        ],
        rules: [
          "react-doctor/no-event-handler",
          "react-doctor/no-pass-data-to-parent"
        ]
      },
      {
        files: [
          "src/lib/hooks/use-accumulated-cursor-pages.ts",
          "src/features/dashboard/tasks/hooks/use-task-filters.ts",
          "src/features/dashboard/tasks/task-creation-modal.tsx",
          "src/features/dashboard/tasks/use-task-comments-panel.tsx",
          "src/features/dashboard/projects/hooks/use-projects-milestones.ts",
          "src/features/dashboard/projects/hooks/use-projects-data.ts"
        ],
        rules: [
          "react-doctor/exhaustive-deps",
          "react-hooks/exhaustive-deps"
        ]
      },
      {
        files: [
          "src/features/dashboard/analytics/hooks/use-analytics-page-controller.ts"
        ],
        rules: [
          "react-doctor/no-chain-state-updates"
        ]
      },
      {
        files: [
          "src/features/dashboard/collaboration/components/unified-message-pane-layout-hooks.tsx",
          "src/features/dashboard/collaboration/hooks/use-messages-data.ts",
          "src/features/dashboard/projects/hooks/use-projects-data.ts"
        ],
        rules: [
          "react-doctor/no-adjust-state-on-prop-change",
          "react-doctor/no-reset-all-state-on-prop-change",
          "react-doctor/no-derived-state-effect"
        ]
      },
      {
        files: [
          "src/features/dashboard/projects/hooks/use-projects-data.ts",
          "src/features/dashboard/collaboration/hooks/use-direct-conversations-query.ts"
        ],
        rules: [
          "react-doctor/no-derived-state",
          "react-doctor/no-chain-state-updates"
        ]
      },
      {
        files: [
          "convex/adsMetaEvents.ts",
          "convex/adsCampaigns.ts",
          "convex/adsAudiencesMeta.ts"
        ],
        rules: [
          "react-doctor/server-sequential-independent-await",
          "react-doctor/async-parallel"
        ]
      },
      {
        // Server-side token generation (random invitation codes). CSPRNG
        // hardening flagged but Math.random is fine here — invites are
        // short-lived and the channel is authenticated.
        files: [
          "convex/domains/platform/adminInvitations.ts"
        ],
        rules: [
          "react-doctor/insecure-crypto-risk"
        ]
      },
      {
        files: [
          "src/features/dashboard/ads/components/campaign-objectives/engagement-objective-section.tsx",
          "src/features/dashboard/ads/components/campaign-objectives/sales-objective-section.tsx",
          "src/features/dashboard/ads/components/meta-audiences-panel.tsx",
          "src/features/dashboard/ads/components/meta-events-tools-panel.tsx",
          "src/features/dashboard/ads/components/meta-advanced-tools-panel.tsx",
          "src/features/dashboard/ads/page.tsx",
          "src/features/dashboard/collaboration/components/unified-inbox-sections/channel-conversation-pane.tsx"
        ],
        rules: [
          "react-doctor/no-giant-component"
        ]
      },
      {
        files: [
          "src/features/dashboard/ads/campaigns/components/demographic-section.tsx",
          "src/features/dashboard/ads/campaigns/components/placement-targeting-section.tsx",
          "src/features/dashboard/ads/campaigns/components/custom-audiences-targeting-section.tsx",
          "src/features/dashboard/ads/campaigns/components/audience-control-sections.tsx",
          "src/features/dashboard/meetings/components/in-site-meeting-live-room-canvas.tsx",
          "src/features/dashboard/projects/create-project-dialog.tsx"
        ],
        rules: [
          "react-perf/jsx-no-jsx-as-prop"
        ]
      },
      {
        files: [
          "src/features/dashboard/collaboration/components/use-unified-message-pane-renderers.tsx",
          "src/features/dashboard/collaboration/components/thread-section.tsx",
          "src/features/dashboard/meetings/components/meeting-automation-pipeline.tsx"
        ],
        rules: [
          "react-perf/jsx-no-new-object-as-prop"
        ]
      },
      {
        // Framework/integration shims — small, isolated, intentional.
        files: [
          "src/shared/ui/image.tsx"
        ],
        rules: [
          "next/no-img-element",
          "react-doctor/no-unknown-property"
        ]
      },
      {
        // Custom router <Link> renders as <a> + onClick preventDefault;
        // ESLint can't see the client-side router, so this is a known FP.
        // Also uses forwardRef, which is dead weight in React 19 but kept for
        // backwards-compat with code that imports ref.
        files: [
          "src/shared/ui/link.tsx"
        ],
        rules: [
          "react-doctor/no-prevent-default",
          "react-doctor/no-react19-deprecated-apis"
        ]
      },
      {
        // dangerouslySetInnerHTML on a sanitizer-bounded payload — see
        // DOMPurify.sanitize above; the lint can't trace sanitizer provenance.
        files: [
          "src/shared/ui/trusted-html.tsx"
        ],
        rules: [
          "react-doctor/no-danger",
          "react/no-danger"
        ]
      },
      {
        // Single-child Fragment that wraps a CSS View Transition API call;
        // the JSX is load-bearing for the platform.
        files: [
          "src/shared/ui/view-transition.tsx"
        ],
        rules: [
          "react/jsx-no-useless-fragment"
        ]
      },
      {
        // Mirror props → state prev-callback via plain useEffect; React
        // Compiler reads it as a rules-of-hooks call. Project convention.
        files: [
          "src/features/dashboard/tasks/use-task-comments-panel.tsx",
          "src/shared/hooks/gestures/use-pull-to-refresh.tsx"
        ],
        rules: [
          "react-doctor/rules-of-hooks"
        ]
      },
      {
        // ref-forwarding callback in useMentionInput writes to ref.current
        // inside React's commit-phase callback frame, which is the documented
        // escape hatch per the rule validation prompt.
        files: [
          "src/shared/ui/use-mention-input.tsx"
        ],
        rules: [
          "react-hooks-js/immutability"
        ]
      },
      {
        // TanStack useVirtualizer at the call site inside the consumer
        // component — the 'use no memo' directive is at the function start,
        // but the lint still flags the call body.
        files: [
          "src/features/dashboard/activity/components/activity-list-sections.tsx",
          "src/features/dashboard/notifications/notifications-page-hooks.tsx"
        ],
        rules: [
          "react-hooks-js/incompatible-library"
        ]
      },
      {
        // Provider-internals.ts uses Math.random for non-security IDs.
        files: [
          "src/features/dashboard/collaboration/components/collaboration-dashboard-provider-internals.ts"
        ],
        rules: [
          "react-doctor/insecure-crypto-risk"
        ]
      },
      {
        // Imperative-handle ref-mirror pattern. handleListKeyDown is a fresh
        // arrow closure per render; the useEffect keeps the ref current and
        // useEffectEvent is documented as the escape hatch but oxlint's static
        // per-rule analysis still flags the imperative-handle site.
        files: [
          "src/shared/components/agent-mode/mention-dropdown.tsx"
        ],
        rules: [
          "react-doctor/no-effect-with-fresh-deps",
          "react-doctor/prefer-use-effect-event"
        ]
      },
      {
        // ResetPasswordReadyForm takes two visibility booleans wired to the
        // same toggle; collapsing to a discriminated union would force every
        // caller to rewire. Documented project convention.
        files: [
          "src/features/auth/reset/reset-password-sections.tsx"
        ],
        rules: [
          "react-doctor/prefer-explicit-variants"
        ]
      },
      {
        // Single onCommentCountChange callback is the documented child→parent
        // seam for live comment counts on the surrounding panel.
        files: [
          "src/features/dashboard/tasks/use-task-comments-panel.tsx"
        ],
        rules: [
          "react-doctor/no-pass-data-to-parent"
        ]
      },
      {
        // useEffect(...) trips the prefer-use-effect-event hint, but a real
        // rewrite regresses set-state-in-effect: oxlint's static analyzer
        // can't see past the useEffectEvent wrapper, so the setLoading(true)
        // reached through loadAudiences still trips. queueMicrotask stays.
        files: [
          "src/features/dashboard/ads/components/meta-audiences-panel.tsx"
        ],
        rules: [
          "react-doctor/prefer-use-effect-event"
        ]
      }
    ]
  }
} satisfies ReactDoctorConfig;
