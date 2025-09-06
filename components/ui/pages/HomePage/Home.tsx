"use client";
import React from "react";
import FuzzyCard from "../../fuzzy-card";

export default function HomePage() {
    const [defaultCrispValue, setDefaultCrispValue] = React.useState({
        id: "example-id",
        name: "Example",
        min: 0,
        max: 100,
    });

    return (
        <div className="font-sans lg:flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <div className="max-w-lg mx-auto lg:mx-0">
                <h1 className="text-3xl font-bold max-lg:text-center">
                    Fuzzy Vis: A Fuzzification Visualization
                </h1>
                <p className="mt-3 text-muted-foreground max-lg:text-center">
                    Explore fuzzification: the process of mapping a crisp input
                    (a precise number) to fuzzy values—degrees of membership
                    between 0 and 1.
                </p>
                <p className="mt-3 text-muted-foreground max-lg:text-center">
                    In fuzzy logic, instead of hard true/false, a fuzzy value
                    expresses how strongly an input belongs to a concept (e.g.,
                    “warm”).
                </p>
                <p className="mt-3 text-muted-foreground max-lg:text-center">
                    Define a variable’s range, add membership functions, and see
                    how a chosen crisp value evaluates across them in real time.
                </p>
            </div>
            <FuzzyCard
                crispValue={defaultCrispValue}
                onChange={(next) => setDefaultCrispValue(next)}
            />
        </div>
    );
}
