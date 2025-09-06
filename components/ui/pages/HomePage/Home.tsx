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

    return <div className="font-sans lg:flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-3xl font-bold max-lg:text-center mb-16">Fuzzy Vis: A Fuzzification Visualization</h1>
      <FuzzyCard crispValue={defaultCrispValue} onChange={(next) => setDefaultCrispValue(next)} />
    </div>;
}