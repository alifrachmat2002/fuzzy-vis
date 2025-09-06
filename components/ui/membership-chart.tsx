"use client";

import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
} from "recharts";
import type { FuzzySet } from "@/types/types";

type Props = {
    min: number;
    max: number;
    sets: FuzzySet[];
    currentX: number;
    resolution?: number;
};

function computeMembership(set: FuzzySet, x: number): number {
    // functionType is a concrete function; parameters can vary in length
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return (set.functionType as any)(x, ...(set.parameters ?? [])) as number;
}

export default function MembershipChart({
    min,
    max,
    sets,
    currentX,
    resolution = 120,
}: Props) {
    const step = Math.max(1, Math.floor(resolution));
    const range = max - min || 1;
    const points = Array.from(
        { length: step + 1 },
        (_, i) => min + (i / step) * range
    );

    const data = points.map((x) => {
        const row: Record<string, number> = { x };
        for (const s of sets) {
            try {
                row[s.id] = computeMembership(s, x);
            } catch {
                row[s.id] = 0;
            }
        }
        return row;
    });

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="x"
                        type="number"
                        domain={[min, max]}
                        allowDataOverflow
                        tickCount={7}
                    />
                    <YAxis domain={[0, 1]} tickCount={6} />
                    <Tooltip formatter={(v: number) => v.toFixed(3)} />
                    {sets.length > 1 && <Legend />}
                    {sets.map((s) => (
                        <Line
                            key={s.id}
                            dataKey={s.id}
                            type="monotone"
                            dot={false}
                            isAnimationActive={false}
                            stroke={s.color}
                            name={s.label}
                            strokeWidth={2}
                        />
                    ))}
                    <ReferenceLine
                        x={currentX}
                        stroke="#ff7300"
                        strokeDasharray="4 4"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
