"use client";

import * as React from "react";
import { CrispValue, FuzzySet } from "@/types/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Slider } from "./slider";
import { Button } from "./button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select";
import MembershipChart from "./membership-chart";
import {
    generalizedBell,
    gaussian,
    leftShoulder,
    piCurve,
    rightShoulder,
    sigmoid,
    trapezoidal,
    triangular,
    sCurve,
    zCurve,
    type MembershipFunction,
} from "@/lib/membership-function";

type PropsType = {
    crispValue: CrispValue;
    onChange?: (next: CrispValue) => void;
};

const FUNCTION_PRESETS: Array<{
    key: string;
    label: string;
    fn: MembershipFunction;
    // names for params for basic guidance
    paramLabels: string[];
    defaultParams: (min: number, max: number) => number[];
}> = [
    {
        key: "triangular",
        label: "Triangular(a,b,c)",
        fn: triangular,
        paramLabels: ["a", "b", "c"],
        defaultParams: (min, max) => [min, (min + max) / 2, max],
    },
    {
        key: "trapezoidal",
        label: "Trapezoid(a,b,c,d)",
        fn: trapezoidal,
        paramLabels: ["a", "b", "c", "d"],
        defaultParams: (min, max) => [
            min,
            min + (max - min) * 0.25,
            min + (max - min) * 0.75,
            max,
        ],
    },
    {
        key: "gaussian",
        label: "Gaussian(μ,σ)",
        fn: gaussian,
        paramLabels: ["mu", "sigma"],
        defaultParams: (min, max) => [(min + max) / 2, (max - min) / 6],
    },
    {
        key: "bell",
        label: "Generalized Bell(a,b,c)",
        fn: generalizedBell,
        paramLabels: ["a", "b", "c"],
        defaultParams: (min, max) => [
            Math.max(1e-6, (max - min) / 6),
            2,
            (min + max) / 2,
        ],
    },
    {
        key: "sigmoid",
        label: "Sigmoid(a,c)",
        fn: sigmoid,
        paramLabels: ["a", "c"],
        defaultParams: (min, max) => [1, (min + max) / 2],
    },
    {
        key: "sCurve",
        label: "S-Curve(a,b)",
        fn: sCurve,
        paramLabels: ["a", "b"],
        defaultParams: (min, max) => [
            min + (max - min) * 0.25,
            min + (max - min) * 0.75,
        ],
    },
    {
        key: "zCurve",
        label: "Z-Curve(a,b)",
        fn: zCurve,
        paramLabels: ["a", "b"],
        defaultParams: (min, max) => [
            min + (max - min) * 0.25,
            min + (max - min) * 0.75,
        ],
    },
    {
        key: "leftShoulder",
        label: "Left Shoulder(a,b)",
        fn: leftShoulder,
        paramLabels: ["a", "b"],
        defaultParams: (min, max) => [
            min + (max - min) * 0.25,
            min + (max - min) * 0.75,
        ],
    },
    {
        key: "rightShoulder",
        label: "Right Shoulder(a,b)",
        fn: rightShoulder,
        paramLabels: ["a", "b"],
        defaultParams: (min, max) => [
            min + (max - min) * 0.25,
            min + (max - min) * 0.75,
        ],
    },
    {
        key: "piCurve",
        label: "Pi Curve(a,b,c,d)",
        fn: piCurve,
        paramLabels: ["a", "b", "c", "d"],
        defaultParams: (min, max) => [
            min,
            min + (max - min) * 0.3,
            min + (max - min) * 0.7,
            max,
        ],
    },
];

export default function FuzzyCard({ crispValue, onChange }: PropsType) {
    const [state, setState] = React.useState<CrispValue>(() => ({
        ...crispValue,
        fuzzySet: crispValue.fuzzySet ?? [],
    }));

    // local editing helpers
    const setField = <K extends keyof CrispValue>(
        key: K,
        value: CrispValue[K]
    ) => {
        const next = { ...state, [key]: value };
        setState(next);
        onChange?.(next);
    };

    const [value, setValue] = React.useState<number>(
        () => state.min + (state.max - state.min) / 2
    );
    const sets = React.useMemo<FuzzySet[]>(
        () => state.fuzzySet ?? [],
        [state.fuzzySet]
    );

    // add a new set using a selected preset
    const [selectedKey, setSelectedKey] = React.useState<string>(
        FUNCTION_PRESETS[0].key
    );
    const selected =
        FUNCTION_PRESETS.find((f) => f.key === selectedKey) ??
        FUNCTION_PRESETS[0];

    const addSet = () => {
        const id = `${selected.key}-${Math.random().toString(36).slice(2, 8)}`;
        const newSet: FuzzySet = {
            id,
            label: selected.label,
            color: randomColor(),
            functionType: selected.fn,
            parameters: selected.defaultParams(state.min, state.max),
        };
        const next = { ...state, fuzzySet: [...sets, newSet] };
        setState(next);
        onChange?.(next);
    };

    const updateSet = (id: string, patch: Partial<FuzzySet>) => {
        const nextSets = sets.map((s) =>
            s.id === id ? { ...s, ...patch } : s
        );
        const next = { ...state, fuzzySet: nextSets };
        setState(next);
        onChange?.(next);
    };

    const removeSet = (id: string) => {
        const nextSets = sets.filter((s) => s.id !== id);
        const next = { ...state, fuzzySet: nextSets };
        setState(next);
        onChange?.(next);
    };

    // ensure slider value stays within bounds when min/max change
    React.useEffect(() => {
        setValue((v) => Math.min(state.max, Math.max(state.min, v)));
    }, [state.min, state.max]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fuzzy Input</CardTitle>
                <CardDescription>
                    Follow these steps to define your crisp input, add
                    membership functions, and see how a crisp value maps to
                    fuzzy degrees in real time.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Properties: name, min, max */}
                <div className="space-y-1">
                    <div className="font-medium">
                        1. Define the input domain
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Give your variable a name and set its numeric range
                        using minimum and maximum values.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor={`${state.id}-name`}>Name</Label>
                        <Input
                            id={`${state.id}-name`}
                            value={state.name}
                            onChange={(e) => setField("name", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor={`${state.id}-min`}>Min</Label>
                        <Input
                            id={`${state.id}-min`}
                            type="number"
                            value={state.min}
                            onChange={(e) =>
                                setField("min", parseFloat(e.target.value))
                            }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor={`${state.id}-max`}>Max</Label>
                        <Input
                            id={`${state.id}-max`}
                            type="number"
                            value={state.max}
                            onChange={(e) =>
                                setField("max", parseFloat(e.target.value))
                            }
                        />
                    </div>
                </div>

                {/* Slider for crisp value */}
                <div>
                    <div className="space-y-1 mb-1">
                        <div className="font-medium">
                            2. Set the crisp value
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Drag the slider to choose a specific input value
                            within the domain. The chart will highlight this
                            value.
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor={`${state.id}-slider`}>
                            {state.name} value
                        </Label>
                        <div className="text-sm text-muted-foreground">
                            {value.toFixed(2)}
                        </div>
                    </div>
                    <Slider
                        id={`${state.id}-slider`}
                        className="mt-2"
                        value={[value]}
                        min={state.min}
                        max={state.max}
                        step={(state.max - state.min) / 100}
                        onValueChange={(v) => setValue(v[0] ?? value)}
                    />
                </div>

                {/* Membership function manager */}
                <div className="space-y-2">
                    <div className="space-y-1">
                        <div className="font-medium">
                            3. Add membership functions
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Pick a function type, add it, then tweak its
                            parameters and label. You can add multiple sets to
                            cover the domain.
                        </p>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                            <Label>Select membership function</Label>
                            <Select
                                value={selectedKey}
                                onValueChange={(v) => setSelectedKey(v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose a function" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FUNCTION_PRESETS.map((p) => (
                                        <SelectItem key={p.key} value={p.key}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={addSet}>Add</Button>
                    </div>

                    {/* List of current sets with inline param editors */}
                    <div className="space-y-3">
                        {sets.map((s) => {
                            const preset = FUNCTION_PRESETS.find(
                                (p) => p.fn === s.functionType
                            );
                            const labels =
                                preset?.paramLabels ??
                                s.parameters.map((_, i) => `p${i + 1}`);
                            return (
                                <div
                                    key={s.id}
                                    className="rounded-md border p-3"
                                >
                                    <div className="flex flex-wrap items-center gap-2 justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-sm"
                                                style={{
                                                    backgroundColor: s.color,
                                                }}
                                            />
                                            <Input
                                                className="w-56"
                                                value={s.label}
                                                onChange={(e) =>
                                                    updateSet(s.id, {
                                                        label: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <Button
                                            variant="destructive"
                                            onClick={() => removeSet(s.id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {s.parameters.map((val, idx) => (
                                            <div
                                                key={idx}
                                                className="space-y-1"
                                            >
                                                <Label>
                                                    {labels[idx] ??
                                                        `p${idx + 1}`}
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={val}
                                                    onChange={(e) => {
                                                        const num = parseFloat(
                                                            e.target.value
                                                        );
                                                        const next = [
                                                            ...s.parameters,
                                                        ];
                                                        next[idx] =
                                                            Number.isFinite(num)
                                                                ? num
                                                                : 0;
                                                        updateSet(s.id, {
                                                            parameters: next,
                                                        });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chart */}
                <div className="space-y-1">
                    <div className="font-medium">4. Visualize memberships</div>
                    <p className="text-sm text-muted-foreground">
                        Each line shows a membership function across the domain.
                        The dashed line marks the current crisp value.
                    </p>
                </div>
                <MembershipChart
                    min={state.min}
                    max={state.max}
                    sets={sets}
                    currentX={value}
                />
            </CardContent>
            <CardFooter className="justify-between">
                <div className="text-sm">
                    Sets: <span className="font-mono">{sets.length}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    Domain [{state.min}, {state.max}]
                </div>
            </CardFooter>
        </Card>
    );
}

function randomColor() {
    const h = Math.floor(Math.random() * 360);
    const s = 70;
    const l = 50;
    return `hsl(${h} ${s}% ${l}%)`;
}
