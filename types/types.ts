import { MembershipFunction } from "@/lib/membership-function";

export interface CrispValue {
    id: string;
    name: string;
    min: number;
    max: number;
    fuzzySet?: FuzzySet[];
}

export interface FuzzySet {
    id: string;
    label: string;
    color: string;
    functionType: MembershipFunction;
    parameters: number[];
}