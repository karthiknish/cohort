//#region src/lib/animation-system.ts
/**
* Central motion system: numeric tokens mirror `:root` in `src/app/globals.css`
* (`--motion-duration-*`, `--motion-ease-*`). Use composed classes below in components
* instead of one-off `transition-[...]` strings.
*/
var motionDurationMs = {
	fast: 160,
	normal: 220,
	slow: 280,
	xslow: 1e3,
	page: 220
};
var motionDurationSeconds = {
	fast: motionDurationMs.fast / 1e3,
	normal: motionDurationMs.normal / 1e3,
	slow: motionDurationMs.slow / 1e3,
	xslow: motionDurationMs.xslow / 1e3,
	page: motionDurationMs.page / 1e3
};
var motionEasing = {
	out: [
		.16,
		1,
		.3,
		1
	],
	inOut: [
		.65,
		0,
		.35,
		1
	],
	standard: [
		.4,
		0,
		.2,
		1
	],
	linear: "linear"
};
var motionLoopSeconds = {
	pulse: 2,
	pulseSlow: 3,
	shimmer: 1.5,
	heroOrbit: 12,
	glowA: 14,
	glowB: 15,
	glowC: 16,
	glowD: 17,
	glowE: 18,
	blob: 20,
	blobSlow: 25,
	trackLong: 60
};
var motionDurationClasses = {
	fast: "duration-[var(--motion-duration-fast)]",
	normal: "duration-[var(--motion-duration-normal)]",
	slow: "duration-[var(--motion-duration-slow)]",
	xslow: "duration-[var(--motion-duration-xslow)]",
	page: "duration-[var(--motion-duration-page)]"
};
var motionEasingClasses = {
	out: "ease-[var(--motion-ease-out)]",
	inOut: "ease-[var(--motion-ease-in-out)]",
	standard: "ease-[var(--motion-ease-standard)]"
};
var interactiveTransitionClass = [
	"transition-[color,background-color,border-color,box-shadow,transform,opacity]",
	motionDurationClasses.fast,
	motionEasingClasses.standard,
	"motion-reduce:transition-none"
].join(" ");
/** Full chrome transition — see `.motion-chromatic` in `globals.css`. */
var chromaticTransitionClass = "motion-chromatic";
/** Normal duration + in-out (sidebar width, FAB). */
var chromaticTransitionNormalClass = "motion-chromatic-layout";
/** List / message row entrance (tailwind `animate-in`). */
var listRowEnterAnimationClass = [
	"animate-in fade-in-0 slide-in-from-bottom-1",
	motionDurationClasses.fast,
	"ease-[var(--motion-ease-standard)]",
	"motion-reduce:animate-none"
].join(" ");
var pressableScaleClass = "active:scale-[0.98] motion-reduce:active:scale-100";
/** Subtle lift on hover for clickable cards. */
var hoverLiftClass = ["hover:-translate-y-0.5 hover:shadow-md", "motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-sm"].join(" ");
var switchMotionClass = [
	"transition-[background-color,box-shadow,transform]",
	motionDurationClasses.fast,
	motionEasingClasses.standard,
	"motion-reduce:transition-none"
].join(" ");
/** Table row hover background. */
var tableRowHoverClass = [
	"transition-colors",
	motionDurationClasses.fast,
	motionEasingClasses.standard,
	"motion-reduce:transition-none"
].join(" ");
/** Link underline / opacity. */
var linkMotionClass = [
	"transition-[color,opacity,text-decoration-color]",
	motionDurationClasses.fast,
	motionEasingClasses.standard,
	"motion-reduce:transition-none"
].join(" ");
/** Empty state / panel entrance (tailwind `animate-in`). */
var emptyStateEnterClass = [
	"animate-in fade-in-0 slide-in-from-bottom-2",
	motionDurationClasses.normal,
	motionEasingClasses.out,
	"motion-reduce:animate-none"
].join(" ");
var surfaceMotionClasses = {
	overlay: [
		"data-[state=open]:animate-in",
		"data-[state=closed]:animate-out",
		"data-[state=closed]:fade-out-0",
		"data-[state=open]:fade-in-0",
		motionDurationClasses.normal,
		motionEasingClasses.out,
		"motion-reduce:animate-none"
	].join(" "),
	modalContent: [
		"data-[state=open]:animate-in",
		"data-[state=closed]:animate-out",
		"data-[state=closed]:fade-out-0",
		"data-[state=open]:fade-in-0",
		"data-[state=closed]:zoom-out-95",
		"data-[state=open]:zoom-in-95",
		"data-[state=closed]:slide-out-to-left-1/2",
		"data-[state=closed]:slide-out-to-top-[48%]",
		"data-[state=open]:slide-in-from-left-1/2",
		"data-[state=open]:slide-in-from-top-[48%]",
		motionDurationClasses.normal,
		motionEasingClasses.out,
		"motion-reduce:animate-none"
	].join(" "),
	popoverContent: [
		"data-[state=open]:animate-in",
		"data-[state=closed]:animate-out",
		"data-[state=closed]:fade-out-0",
		"data-[state=open]:fade-in-0",
		"data-[state=closed]:zoom-out-95",
		"data-[state=open]:zoom-in-95",
		"data-[side=bottom]:slide-in-from-top-2",
		"data-[side=left]:slide-in-from-right-2",
		"data-[side=right]:slide-in-from-left-2",
		"data-[side=top]:slide-in-from-bottom-2",
		motionDurationClasses.fast,
		motionEasingClasses.out,
		"motion-reduce:animate-none"
	].join(" "),
	sheetContent: [
		"data-[state=open]:animate-in",
		"data-[state=closed]:animate-out",
		motionDurationClasses.slow,
		motionEasingClasses.out,
		"motion-reduce:animate-none"
	].join(" "),
	navigationViewport: [
		"data-[state=open]:animate-in",
		"data-[state=closed]:animate-out",
		"data-[state=closed]:zoom-out-95",
		"data-[state=open]:zoom-in-90",
		motionDurationClasses.fast,
		motionEasingClasses.out,
		"motion-reduce:animate-none"
	].join(" "),
	navigationIndicator: [
		"data-[state=visible]:animate-in",
		"data-[state=hidden]:animate-out",
		"data-[state=hidden]:fade-out",
		"data-[state=visible]:fade-in",
		motionDurationClasses.fast,
		motionEasingClasses.out,
		"motion-reduce:animate-none"
	].join(" ")
};
//#endregion
//#region src/lib/micro-interactions.ts
var clickableCardClass = [
	interactiveTransitionClass,
	pressableScaleClass,
	hoverLiftClass
].join(" ");
var listItemEnterClass = listRowEnterAnimationClass;
var easings = {
	easeOut: motionEasing.out,
	easeInOut: motionEasing.inOut,
	standard: motionEasing.standard,
	spring: {
		type: "spring",
		stiffness: 300,
		damping: 30
	}
};
var durations = {
	fast: motionDurationSeconds.fast,
	normal: motionDurationSeconds.normal,
	slow: motionDurationSeconds.slow,
	slower: .36,
	page: motionDurationSeconds.page
};
var transitions = {
	fast: {
		duration: durations.fast,
		ease: easings.easeOut
	},
	normal: {
		duration: durations.normal,
		ease: easings.easeOut
	},
	slow: {
		duration: durations.slow,
		ease: easings.easeOut
	},
	slower: {
		duration: durations.slower,
		ease: easings.easeOut
	},
	spring: easings.spring,
	pulse: {
		duration: motionLoopSeconds.pulseSlow,
		repeat: Infinity,
		ease: easings.easeInOut
	},
	blob: {
		duration: motionLoopSeconds.blob,
		repeat: Infinity,
		ease: motionEasing.linear
	},
	blobSlow: {
		duration: motionLoopSeconds.blobSlow,
		repeat: Infinity,
		ease: motionEasing.linear
	},
	shimmer: {
		duration: motionLoopSeconds.shimmer,
		repeat: Infinity,
		ease: easings.easeInOut
	}
};
var fadeVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: transitions.normal
	},
	exit: {
		opacity: 0,
		transition: transitions.fast
	}
};
var fadeInUpVariants = {
	hidden: {
		opacity: 0,
		y: 20
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: transitions.slower
	},
	exit: {
		opacity: 0,
		y: -10,
		transition: transitions.fast
	}
};
var fadeInDownVariants = {
	hidden: {
		opacity: 0,
		y: -20
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: transitions.slow
	},
	exit: {
		opacity: 0,
		y: 10,
		transition: transitions.fast
	}
};
var slideInLeftVariants = {
	hidden: {
		opacity: 0,
		x: -20
	},
	visible: {
		opacity: 1,
		x: 0,
		transition: transitions.slow
	},
	exit: {
		opacity: 0,
		x: 10,
		transition: transitions.fast
	}
};
var slideInRightVariants = {
	hidden: {
		opacity: 0,
		x: 20
	},
	visible: {
		opacity: 1,
		x: 0,
		transition: transitions.slow
	},
	exit: {
		opacity: 0,
		x: -10,
		transition: transitions.fast
	}
};
var scaleVariants = {
	hidden: {
		opacity: 0,
		scale: .95
	},
	visible: {
		opacity: 1,
		scale: 1,
		transition: transitions.normal
	},
	exit: {
		opacity: 0,
		scale: .95,
		transition: transitions.fast
	}
};
transitions.pulse;
var subtlePulseVariants = {
	initial: {
		scale: 1,
		opacity: .2
	},
	animate: {
		scale: [
			1,
			1.1,
			1
		],
		opacity: [
			.2,
			.4,
			.2
		],
		transition: {
			duration: motionLoopSeconds.pulse,
			repeat: Infinity,
			ease: easings.easeInOut
		}
	}
};
var blobVariants = { animate: {
	x: [
		0,
		100,
		0
	],
	y: [
		0,
		50,
		0
	],
	scale: [
		1,
		1.2,
		1
	],
	transition: transitions.blob
} };
var blobVariantsSlow = { animate: {
	x: [
		0,
		-80,
		0
	],
	y: [
		0,
		100,
		0
	],
	scale: [
		1,
		1.1,
		1
	],
	transition: transitions.blobSlow
} };
transitions.shimmer;
motionDurationSeconds.fast / 2;
transitions.normal;
durations.page, easings.easeOut, durations.fast, easings.easeOut;
/** Subtle card hover — small lift, minimal scale. */
var cardHoverVariants = {
	rest: {
		scale: 1,
		y: 0
	},
	hover: {
		scale: 1.01,
		y: -2,
		transition: {
			duration: durations.fast,
			ease: easings.easeOut
		}
	}
};
var buttonPressVariants = {
	rest: { scale: 1 },
	tap: {
		scale: .98,
		transition: {
			duration: motionDurationSeconds.fast / 2,
			ease: easings.standard
		}
	}
};
//#endregion
export { motionEasing as C, switchMotionClass as D, surfaceMotionClasses as E, tableRowHoverClass as O, motionDurationSeconds as S, pressableScaleClass as T, chromaticTransitionNormalClass as _, clickableCardClass as a, linkMotionClass as b, fadeInUpVariants as c, scaleVariants as d, slideInLeftVariants as f, chromaticTransitionClass as g, transitions as h, cardHoverVariants as i, fadeVariants as l, subtlePulseVariants as m, blobVariantsSlow as n, easings as o, slideInRightVariants as p, buttonPressVariants as r, fadeInDownVariants as s, blobVariants as t, listItemEnterClass as u, emptyStateEnterClass as v, motionLoopSeconds as w, listRowEnterAnimationClass as x, interactiveTransitionClass as y };
